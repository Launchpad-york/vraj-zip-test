import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { APP_LOADING_ACCESSIBLE_LABEL, ROUTES } from "@/const";
import { useIsSuperAdmin } from "@/hooks/useIsSuperAdmin";

type SuperAdminRouteProps = {
	children: ReactNode;
};

export function SuperAdminRoute({ children }: SuperAdminRouteProps) {
	const location = useLocation();
	const { isSuperAdmin, ready } = useIsSuperAdmin();

	if (!ready) {
		return (
			<div
				className="flex min-h-[40vh] items-center justify-center"
				role="status"
				aria-live="polite"
			>
				<Loader2
					className="h-6 w-6 animate-spin text-muted-foreground"
					aria-hidden
				/>
				<span className="sr-only">{APP_LOADING_ACCESSIBLE_LABEL}</span>
			</div>
		);
	}

	if (!isSuperAdmin) {
		return (
			<Navigate to={ROUTES.dashboard.root} state={{ from: location }} replace />
		);
	}

	return <>{children}</>;
}
