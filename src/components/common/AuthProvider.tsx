import type { ReactNode } from "react";
import { useEffect } from "react";
import { useAuthStore } from "@/store";

type AuthProviderProps = {
	children: ReactNode;
};

/**
 * AuthProvider - Checks for existing auth session on app load
 * Wraps the app and initializes authentication state
 */
export function AuthProvider({ children }: AuthProviderProps) {
	const { checkAuth, isInitialized } = useAuthStore();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	if (!isInitialized) {
		return (
			<div className="flex h-screen w-screen items-center justify-center bg-background">
				<div className="flex flex-col items-center gap-4">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					<p className="text-sm text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}
