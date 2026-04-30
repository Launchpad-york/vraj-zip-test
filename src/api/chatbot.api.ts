import type { ChatbotRole, ChatbotSearchMode } from "@/const/chatbot.const";
import { getBearerToken } from "@/lib/apiClient";

//Temp Demo Changes
const CHATBOT_STREAM_URL = "mock://chatbot-stream";

/** Wire-format message shape expected by the backend conversation_history field. */
export type ConversationMessage = {
	role: "user" | "assistant";
	content: string;
};

/**
 * Chatbot Request Types
 */
export type ChatbotRequest = {
	question: string;
	searchMode: ChatbotSearchMode;
	role: ChatbotRole;
	/** Prior turns of the current conversation, sent so the LLM has multi-turn context. */
	conversationHistory?: ConversationMessage[];
	/**
	 * Coach persona only: the client's unique identifier.
	 * When provided, the backend injects an ACTIVE SESSION directive into the
	 * system prompt so the LLM calls get_client_snapshot autonomously on its
	 * first turn.
	 */
	clientId?: string;
	/**
	 * Stable UUID for the current conversation, generated once on the first
	 * message and reused for every subsequent turn. Allows the audit log to
	 * group all turns of a single conversation under one session_id.
	 * Omitting it causes the backend to generate a fresh UUID per request,
	 * making each turn appear as a separate conversation in audit records.
	 */
	sessionId?: string;
};

/**
 * Chatbot Response Types
 */
export type ChatbotResponse = {
	answer: string;
	sources?: string[];
};

/**
 * Chatbot API Response wrapper
 */
export type ChatbotApiResponse<T> = {
	data: T;
	status: number;
	ok: true;
};

export type ChatbotApiError = {
	message: string;
	status: number;
	ok: false;
};

//  SSE event types
// Mirror the backend app/utils/sse.py schema exactly so the frontend parser
// produces fully-typed events without manual casting.

/** Incremental text token from the final LLM response turn. */
export type SSETokenEvent = {
	event: "token";
	data: { text: string };
};

/**
 * Progress signal emitted while the agentic loop executes a tool.
 * When reset_stream is true the UI should discard any partial text that was
 * being streamed before this event (LLM preamble, not the final answer).
 */
export type SSEToolActivityEvent = {
	event: "tool_activity";
	data: {
		action: string;
		tool_name: string | null;
		reset_stream: boolean;
	};
};

/** Terminal success event — stream complete; carries model + usage metadata. */
export type SSEDoneEvent = {
	event: "done";
	data: {
		model: string;
		usage: { input_tokens: number; output_tokens: number };
	};
};

/** Terminal failure event — stream ending due to an error. */
export type SSEErrorEvent = {
	event: "error";
	data: { message: string; code: string };
};

export type SSEEvent =
	| SSETokenEvent
	| SSEToolActivityEvent
	| SSEDoneEvent
	| SSEErrorEvent;

/**
 * Async generator that reads a fetch() Response body as a text/event-stream
 * and yields fully-typed SSEEvent objects.
 *
 * Handles partial-chunk reads — the SSE frame boundary (\n\n) may arrive
 * split across TCP packets, so raw bytes are buffered until a complete
 * frame is available before parsing.
 *
 * Usage (Day 4 implementation will wire this into ChatbotPage.tsx):
 *   const res = await fetch(url, { method: "POST", ... });
 *   for await (const event of parseSSEStream(res)) { ... }
 */
export async function* parseSSEStream(
	response: Response,
): AsyncGenerator<SSEEvent, void, unknown> {
	if (!response.body) return;

	const reader = response.body.getReader();
	const decoder = new TextDecoder("utf-8");
	let buffer = "";

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			buffer += decoder.decode(value, { stream: true });

			// SSE frames are delimited by \n\n
			const frames = buffer.split("\n\n");
			// Keep the last (potentially incomplete) fragment in the buffer
			buffer = frames.pop() ?? "";

			for (const frame of frames) {
				if (!frame.trim()) continue;

				let eventType = "message";
				let dataLine = "";

				for (const line of frame.split("\n")) {
					if (line.startsWith("event:")) {
						eventType = line.slice(6).trim();
					} else if (line.startsWith("data:")) {
						dataLine = line.slice(5).trim();
					}
				}

				if (!dataLine) continue;

				try {
					const parsed = JSON.parse(dataLine);
					yield { event: eventType, data: parsed } as SSEEvent;
					// Yield a macro-task turn between frames so that React can
					// commit the preceding setMessages() call before processing
					// the next frame.  Without this, when multiple SSE frames
					// arrive in a single reader.read() chunk (TCP burst), React 18
					// automatic batching collapses all the setMessages() calls in
					// the same synchronous loop into one render — so the user sees
					// a whole block appear at once instead of token-by-token.
					await new Promise<void>((r) => setTimeout(r, 0));
				} catch {
					// Malformed data line — skip silently
				}
			}
		}
	} finally {
		reader.releaseLock();
	}
}

/**
 * Chatbot API Functions
 */
export const chatbotApi = {
	/**
	 * Send a question to the chatbot and stream the response via SSE.
	 *
	 * Yields typed SSEEvent objects as they arrive. The caller should iterate
	 * with `for await (const event of chatbotApi.streamQuestion(req)) { ... }`
	 * and handle each event type (token, tool_activity, done, error).
	 *
	 * Uses native fetch() + ReadableStream — NOT Axios — because Axios buffers
	 * the full response before resolving, defeating the purpose of streaming.
	 */
	async *streamQuestion(
		request: ChatbotRequest,
	): AsyncGenerator<SSEEvent, void, unknown> {
		await getBearerToken();
		const answer = `Prototype response for "${request.question}" (${request.searchMode}/${request.role}).`;
		yield {
			event: "tool_activity",
			data: { action: "searching", tool_name: "mock-retriever", reset_stream: true },
		};
		for (const token of answer.split(" ")) {
			yield { event: "token", data: { text: `${token} ` } };
			await new Promise<void>((resolve) => setTimeout(resolve, 35));
		}
		yield {
			event: "done",
			data: { model: "prototype-mock", usage: { input_tokens: 15, output_tokens: 25 } },
		};
	},

	/**
	 * Send a question to the chatbot
	 */
	askQuestion: async (
		request: ChatbotRequest,
	): Promise<ChatbotApiResponse<ChatbotResponse> | ChatbotApiError> => {
		try {
			await getBearerToken();
			return {
				data: {
					answer: `Prototype answer for "${request.question}"`,
					sources: ["Prototype datasource"],
				},
				status: 200,
				ok: true,
			};
		} catch {
			return {
				message: "An unexpected error occurred",
				status: 0,
				ok: false,
			};
		}
	},
};

/** Re-export so callers can reference the streaming URL without coupling to env vars. */
export { CHATBOT_STREAM_URL };

/**
 * Type guard to check if response is an error
 */
export function isChatbotApiError(
	response: ChatbotApiResponse<ChatbotResponse> | ChatbotApiError,
): response is ChatbotApiError {
	return !response.ok;
}
