import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { ROUTES } from "@/const";
import { useAuthStore } from "@/store";

type PublicRouteProps = {
	children: ReactNode;
};

/**
 * PublicRoute - Prevents authenticated users from accessing public auth routes
 * Redirects authenticated users to the dashboard
 */
export function PublicRoute({ children }: PublicRouteProps) {
	const { isAuthenticated } = useAuthStore();

	if (isAuthenticated) {
		return <Navigate to={ROUTES.dashboard.root} replace />;
	}

	return <>{children}</>;
}
