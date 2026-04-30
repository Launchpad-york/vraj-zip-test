import { getBearerToken } from "@/lib/apiClient";

/** Must match Cognito group name (see backend `COGNITO_GROUP_NAMES.SUPER_ADMIN`). */
export const COGNITO_SUPER_ADMIN_GROUP = "SuperAdmin";

/**
 * Decodes JWT payload (no signature verification; same pattern as API Gateway after Cognito).
 */
export function decodeJwtPayload(token: string): Record<string, unknown> {
	try {
		const parts = token.split(".");
		if (parts.length < 2) return {};
		const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
		const padded = base64.padEnd(
			base64.length + ((4 - (base64.length % 4)) % 4),
			"=",
		);
		const json = decodeURIComponent(
			atob(padded)
				.split("")
				.map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
				.join(""),
		);
		return JSON.parse(json) as Record<string, unknown>;
	} catch {
		return {};
	}
}

export async function getIsSuperAdminFromSession(): Promise<boolean> {
	const token = await getBearerToken();
	if (!token) return false;
	const payload = decodeJwtPayload(token);
	const groups = payload["cognito:groups"];
	if (!Array.isArray(groups)) return false;
	return groups.some(
		(g) => typeof g === "string" && g === COGNITO_SUPER_ADMIN_GROUP,
	);
}
