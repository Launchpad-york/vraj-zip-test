import { useEffect, useState } from "react";
import { getIsSuperAdminFromSession } from "@/lib/cognitoGroups";
import { useAuthStore } from "@/store";

export function useIsSuperAdmin() {
	const { isAuthenticated } = useAuthStore();
	const [isSuperAdmin, setIsSuperAdmin] = useState(false);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			if (!isAuthenticated) {
				setIsSuperAdmin(false);
				setReady(true);
				return;
			}
			const v = await getIsSuperAdminFromSession();
			if (!cancelled) {
				setIsSuperAdmin(v);
				setReady(true);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [isAuthenticated]);

	return { isSuperAdmin, ready };
}
