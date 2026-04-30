/**
 * Chatbot Page Content Constants
 */
//Temp Demo Changes
export const CHATBOT_PAGE_CONTENT = {
	title: "AI Chatbot",
	subtitle: "Ask questions and get intelligent responses",
	inputPlaceholder: "Type your question here...",
	sendButton: "Send",
	searchModeLabel: "Search Mode",
	quickMode: "Quick",
	deepDiveMode: "Deep Dive",
	roleLabel: "Role",
	rolePlaceholder: "Select a role",
	roles: [
		{ value: "default", label: "Default" },
		{ value: "employee", label: "Employee" },
		{ value: "coach", label: "Coach" },
		{ value: "superadmin", label: "Super Admin" },
	] as const,
	clientIdLabel: "Client",
	clientPlaceholder: "Select a client",
	loadingMessage: "Thinking...",
	errorMessage: "Something went wrong. Please try again.",
	emptyResponseMessage: "No response received. Please try again.",
	roleResetNotice: "Role changed — conversation reset.",
} as const;

/**
 * Chatbot Search Modes
 */
export const CHATBOT_SEARCH_MODES = {
	quick: "quick",
	deepDive: "deep_dive",
} as const;

export type ChatbotSearchMode =
	(typeof CHATBOT_SEARCH_MODES)[keyof typeof CHATBOT_SEARCH_MODES];

export type ChatbotRole = "default" | "employee" | "coach" | "superadmin";

export const CHATBOT_BOT_NAME = "Bispy Bot";

/**
 * Mock coach clients — maps display name to the client_id expected by the
 * chatbot backend. Replace with an API-backed list once the backend has a
 * GET /api/coach/clients endpoint.
 */
export const COACH_CLIENTS = [
	{ value: "client_0042", label: "Sarah Mitchell" },
	{ value: "client_0091", label: "James Okafor" },
] as const;
