import { Loader2 } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { RoleForm } from "@/components/roles-permissions/RoleForm";
import { Button } from "@/components/ui/button";
import { ROLES_PAGE_CONTENT, ROUTES } from "@/const";
import { AppLayout } from "@/layout/AppLayout";
import { useRolesStore } from "@/store";
import type { RoleFormPayload } from "@/types";

const breadcrumbs = [
	{ label: ROLES_PAGE_CONTENT.title, path: ROUTES.roles.root },
	{ label: ROLES_PAGE_CONTENT.addNewRoleTitle, path: ROUTES.roles.add },
];

export function AddRolePage() {
	const navigate = useNavigate();
	const {
		categories,
		modules,
		categoriesLoading,
		modulesLoading,
		formDataError: permissionError,
		fetchRoleFormData,
		createRole,
		createRoleLoading: isSubmitting,
	} = useRolesStore();

	useEffect(() => {
		fetchRoleFormData();
	}, [fetchRoleFormData]);

	const loading = categoriesLoading || modulesLoading;

	const handleSubmit = useCallback(
		async (payload: RoleFormPayload) => {
			const success = await createRole(payload);
			if (success) navigate(ROUTES.roles.root);
		},
		[navigate, createRole],
	);

	const formId = "add-role-form";

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<div className="flex flex-col gap-6">
				<PageHeader
					title={ROLES_PAGE_CONTENT.addNewRoleTitle}
					backLabel={ROLES_PAGE_CONTENT.back}
					onBack={() => navigate(ROUTES.roles.root)}
				>
					{!loading && (
						<Button type="submit" form={formId} disabled={isSubmitting}>
							{isSubmitting && (
								<Loader2
									className="h-4 w-4 animate-spin shrink-0"
									aria-hidden
								/>
							)}
							<span className={isSubmitting ? "ml-2" : ""}>
								{ROLES_PAGE_CONTENT.saveAndAddRole}
							</span>
						</Button>
					)}
				</PageHeader>
				{loading ? (
					<div className="flex items-center justify-center py-12">
						<Loader2
							className="h-8 w-8 animate-spin shrink-0 text-primary"
							aria-hidden
						/>
					</div>
				) : (
					<>
						{permissionError && (
							<p className="text-small text-destructive">{permissionError}</p>
						)}
						<RoleForm
							formId={formId}
							modules={modules}
							categories={categories}
							onSubmit={handleSubmit}
							submitLabel={ROLES_PAGE_CONTENT.saveAndAddRole}
							isSubmitting={isSubmitting}
						/>
					</>
				)}
			</div>
		</AppLayout>
	);
}
