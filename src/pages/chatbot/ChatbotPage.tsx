import { Bot, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { chatbotApi } from "@/api/chatbot.api";
import { MarkdownRenderer, WhiteBox } from "@/components";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
	CHATBOT_PAGE_CONTENT,
	CHATBOT_SEARCH_MODES,
	COACH_CLIENTS,
	ROUTES,
} from "@/const";
import type { ChatbotRole, ChatbotSearchMode } from "@/const/chatbot.const";
import { AppLayout } from "@/layout";

type Message = {
	id: string;
	role: "user" | "assistant";
	content: string;
};
//Temp Demo Changes
export function ChatbotPage() {
	const [question, setQuestion] = useState("");
	const [searchMode, setSearchMode] = useState<ChatbotSearchMode>(
		CHATBOT_SEARCH_MODES.quick,
	);
	const [role, setRole] = useState<ChatbotRole>("default");
	const [clientId, setClientId] = useState("");
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	/**
	 * Stable UUID for the active conversation
	 */
	const [sessionId, setSessionId] = useState<string | undefined>(undefined);
	/**
	 * ID of the assistant message bubble currently being streamed into
	 */
	const streamingIdRef = useRef<string | null>(null);
	/**
	 * True once the first token has been appended to the streaming bubble
	 */
	const [streamingStarted, setStreamingStarted] = useState(false);
	/**
	 * Human-readable label for the tool currently executing in the agentic
	 * loop (e.g. "Searching knowledge base…"). Null when no tool is active.
	 */
	const [streamingStatus, setStreamingStatus] = useState<string | null>(null);

	// Scroll to the bottom of the message list whenever messages update or loading state changes.
	const messagesEndRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, isLoading]);

	/**
	 * Handle role changes: reset the conversation, client ID, and session ID
	 * so that history from a previous persona never bleeds into the new one.
	 */
	const handleRoleChange = (value: string) => {
		setRole(value as ChatbotRole);
		setClientId("");
		setMessages([]);
		setSessionId(undefined);
		streamingIdRef.current = null;
		setStreamingStarted(false);
		setStreamingStatus(null);
	};

	const breadcrumbs = [
		{ label: CHATBOT_PAGE_CONTENT.title, path: ROUTES.chatbot.root },
	];

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!question.trim()) return;

		// Lazily generate session ID on the first message of a new conversation.
		let currentSessionId = sessionId;
		if (!currentSessionId) {
			currentSessionId = crypto.randomUUID();
			setSessionId(currentSessionId);
		}

		const userMessage: Message = {
			id: crypto.randomUUID(),
			role: "user",
			content: question,
		};

		setMessages((prev) => [...prev, userMessage]);
		setQuestion("");

		// Reset streaming state for this new turn
		streamingIdRef.current = null;
		setStreamingStarted(false);
		setStreamingStatus(null);
		setIsLoading(true);

		// `messages` here is the pre-update closure value — all turns before this
		// one — which is the correct conversation_history to send to the backend.
		// Trim to the last 5 complete turns (10 messages) before sending so the
		// payload stays bounded; the backend enforces the same window server-side.
		const MAX_HISTORY_ITEMS = 10; // 5 turns × 2 messages each
		const history = messages
			.slice(-MAX_HISTORY_ITEMS)
			.map(({ role: r, content }: Message) => ({ role: r, content }));

		// Local tracker for tool status: avoid stale closure reads of the
		// `streamingStatus` state inside the async generator loop.
		let localStatus: string | null = null;

		try {
			for await (const event of chatbotApi.streamQuestion({
				question: question.trim(),
				searchMode,
				role,
				conversationHistory: history.length > 0 ? history : undefined,
				clientId: clientId.trim() || undefined,
				sessionId: currentSessionId,
			})) {
				if (event.event === "token") {
					// Clear any active tool status when text resumes
					if (localStatus !== null) {
						localStatus = null;
						setStreamingStatus(null);
					}

					const { text } = event.data;

					if (!streamingIdRef.current) {
						// First token — create the assistant bubble and start streaming
						const id = crypto.randomUUID();
						streamingIdRef.current = id;
						setStreamingStarted(true);
						setMessages((prev) => [
							...prev,
							{ id, role: "assistant", content: text },
						]);
					} else {
						const id = streamingIdRef.current;
						setMessages((prev) =>
							prev.map((m) =>
								m.id === id ? { ...m, content: m.content + text } : m,
							),
						);
					}
				} else if (event.event === "tool_activity") {
					const { action, reset_stream } = event.data;

					// When reset_stream is true the LLM emitted a preamble before
					// deciding to call a tool: discard that incomplete text so the
					// bubble stays clean.
					if (reset_stream && streamingIdRef.current) {
						const id = streamingIdRef.current;
						setMessages((prev) =>
							prev.map((m) => (m.id === id ? { ...m, content: "" } : m)),
						);
					}

					localStatus = action;
					setStreamingStatus(action);
				} else if (event.event === "done") {
					// Stream finished cleanly: the message is already fully in state
				} else if (event.event === "error") {
					const errorText =
						event.data.message || CHATBOT_PAGE_CONTENT.errorMessage;
					if (streamingIdRef.current) {
						const id = streamingIdRef.current;
						setMessages((prev) =>
							prev.map((m) => (m.id === id ? { ...m, content: errorText } : m)),
						);
					} else {
						setMessages((prev) => [
							...prev,
							{
								id: crypto.randomUUID(),
								role: "assistant",
								content: errorText,
							},
						]);
					}
				}
			}
		} catch {
			// Network-level failure (fetch threw before any SSE frames)
			const errorText = CHATBOT_PAGE_CONTENT.errorMessage;
			if (streamingIdRef.current) {
				const id = streamingIdRef.current;
				setMessages((prev) =>
					prev.map((m) => (m.id === id ? { ...m, content: errorText } : m)),
				);
			} else {
				setMessages((prev) => [
					...prev,
					{ id: crypto.randomUUID(), role: "assistant", content: errorText },
				]);
			}
		} finally {
			setIsLoading(false);
			setStreamingStatus(null);
			setStreamingStarted(false);
			streamingIdRef.current = null;
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			{/* Page Header */}
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-heading-4 font-semibold text-text-foreground">
						{CHATBOT_PAGE_CONTENT.title}
					</h1>
					<p className="text-small text-text-secondary mt-1">
						{CHATBOT_PAGE_CONTENT.subtitle}
					</p>
				</div>
			</div>

			{/* Main Chat Container */}
			<WhiteBox>
				{/* Options Bar */}
				<div className="border-b border-border p-4">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-start">
						{/* Search Mode Radio Buttons */}
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
							<Label className="text-sm font-medium text-text-secondary shrink-0">
								{CHATBOT_PAGE_CONTENT.searchModeLabel}:
							</Label>
							<div className="flex gap-4">
								<label className="flex items-center gap-2 cursor-pointer">
									<input
										type="radio"
										name="searchMode"
										value={CHATBOT_SEARCH_MODES.quick}
										checked={searchMode === CHATBOT_SEARCH_MODES.quick}
										onChange={(e) =>
											setSearchMode(e.target.value as ChatbotSearchMode)
										}
										className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2 accent-primary"
									/>
									<span className="text-sm text-text-foreground">
										{CHATBOT_PAGE_CONTENT.quickMode}
									</span>
								</label>
								<label className="flex items-center gap-2 cursor-pointer">
									<input
										type="radio"
										name="searchMode"
										value={CHATBOT_SEARCH_MODES.deepDive}
										checked={searchMode === CHATBOT_SEARCH_MODES.deepDive}
										onChange={(e) =>
											setSearchMode(e.target.value as ChatbotSearchMode)
										}
										className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2 accent-primary"
									/>
									<span className="text-sm text-text-foreground">
										{CHATBOT_PAGE_CONTENT.deepDiveMode}
									</span>
								</label>
							</div>
						</div>

						{/* Role Select */}
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
							<Label className="text-sm font-medium text-text-foreground shrink-0">
								{CHATBOT_PAGE_CONTENT.roleLabel}:
							</Label>
							<Select value={role} onValueChange={handleRoleChange}>
								<SelectTrigger className="w-full sm:w-[150px] text-text-foreground">
									<SelectValue
										placeholder={CHATBOT_PAGE_CONTENT.rolePlaceholder}
									/>
								</SelectTrigger>
								<SelectContent>
									{CHATBOT_PAGE_CONTENT.roles.map((roleOption) => (
										<SelectItem key={roleOption.value} value={roleOption.value}>
											{roleOption.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Client selector — only visible in Coach mode */}
						{role === "coach" && (
							<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
								<Label className="text-sm font-medium text-text-foreground shrink-0">
									{CHATBOT_PAGE_CONTENT.clientIdLabel}:
								</Label>
								<Select
									value={clientId}
									onValueChange={setClientId}
									disabled={isLoading}
								>
									<SelectTrigger className="w-full sm:w-[160px] text-text-foreground">
										<SelectValue
											placeholder={CHATBOT_PAGE_CONTENT.clientPlaceholder}
										/>
									</SelectTrigger>
									<SelectContent>
										{COACH_CLIENTS.map((client) => (
											<SelectItem key={client.value} value={client.value}>
												{client.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
					</div>
				</div>

				{/* Messages Area */}
				<div className="h-[400px] overflow-y-auto p-4 space-y-4">
					{messages.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-full text-center">
							<Bot className="w-16 h-16 text-muted-foreground mb-4" />
							<p className="text-muted-foreground">
								Start a conversation by typing a question below.
							</p>
						</div>
					) : (
						messages.map((message) => {
							// isAnimating tells Streamdown which message is actively streaming.
							const isAnimating =
								isLoading && message.id === streamingIdRef.current;
							return (
								<div
									key={message.id}
									className={`flex gap-3 ${
										message.role === "user" ? "justify-end" : "justify-start"
									}`}
								>
									{message.role === "assistant" && (
										<div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
											<Bot className="w-5 h-5 text-primary" />
										</div>
									)}
									<div
										className={`max-w-[80%] sm:max-w-[70%] rounded-lg px-4 py-3 ${
											message.role === "user"
												? "bg-primary text-light-same"
												: "bg-muted text-text-foreground"
										}`}
									>
										<MarkdownRenderer
											content={message.content}
											isAnimating={isAnimating}
										/>
									</div>
									{message.role === "user" && (
										<div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
											<User className="w-5 h-5 text-light-same" />
										</div>
									)}
								</div>
							);
						})
					)}
					{/* Thinking / tool-activity bubble — visible before first token */}
					{isLoading && !streamingStarted && (
						<div className="flex gap-3 justify-start">
							<div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
								<Bot className="w-5 h-5 text-primary animate-pulse" />
							</div>
							<div className="bg-muted rounded-lg px-4 py-3">
								<p className="text-sm text-text-foreground italic animate-pulse">
									{streamingStatus ?? CHATBOT_PAGE_CONTENT.loadingMessage}
								</p>
							</div>
						</div>
					)}
					{/* Tool-activity indicator — shown for mid-stream tool calls (after tokens started) */}
					{isLoading && streamingStarted && streamingStatus && (
						<div className="flex items-center gap-2 pl-11 py-0.5">
							<Bot className="w-3.5 h-3.5 text-primary/50 animate-pulse shrink-0" />
							<span className="text-xs text-text-secondary italic animate-pulse">
								{streamingStatus}
							</span>
						</div>
					)}
					<div ref={messagesEndRef} />
				</div>

				{/* Input Area */}
				<div className="border-t border-border p-4">
					<form onSubmit={handleSubmit} className="flex gap-3">
						<Textarea
							value={question}
							onChange={(e) => setQuestion(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder={CHATBOT_PAGE_CONTENT.inputPlaceholder}
							className="flex-1 min-h-[44px] max-h-[120px] resize-none text-text-foreground"
							disabled={isLoading}
						/>
						<Button
							type="submit"
							disabled={isLoading || !question.trim()}
							className="self-end"
						>
							<Send className="w-4 h-4" />
							<span className="hidden sm:inline ml-2">
								{CHATBOT_PAGE_CONTENT.sendButton}
							</span>
						</Button>
					</form>
				</div>
			</WhiteBox>
		</AppLayout>
	);
}
