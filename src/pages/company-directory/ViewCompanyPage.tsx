import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ViewCompanyContent } from "@/components/company-directory";
import { Button } from "@/components/ui/button";
import { COMPANIES_DIRECTORY_PAGE_CONTENT as C, ROUTES } from "@/const";
import { AppLayout } from "@/layout";
import { useCompanyDirectoryStore } from "@/store";

export function ViewCompanyPage() {
	const { companyId } = useParams<{ companyId: string }>();
	const navigate = useNavigate();

	const {
		companyDetail,
		companyDetailLoading,
		companyDetailError,
		fetchCompanyById,
		clearCompanyDetail,
	} = useCompanyDirectoryStore();

	useEffect(() => {
		if (companyId) fetchCompanyById(companyId);
		return () => clearCompanyDetail();
	}, [companyId, fetchCompanyById, clearCompanyDetail]);

	const breadcrumbs = [
		{ label: C.breadcrumbsTitle, path: ROUTES.companyDirectory.root },
		...(companyDetail
			? [
					{
						label:
							companyDetail.legalName?.trim() ||
							companyDetail.dbaName?.trim() ||
							"Company",
						path: ROUTES.companyDirectory.viewWithIdPath(companyDetail.id),
					},
				]
			: []),
	];

	const isLoading = companyDetailLoading && !companyDetail;
	const isError = companyDetailError || !companyDetail || !companyId;

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			{isLoading && (
				<div className="flex items-center justify-center py-12">
					<Loader2
						className="h-8 w-8 shrink-0 animate-spin text-primary"
						aria-hidden
					/>
				</div>
			)}
			{!isLoading && isError && (
				<>
					<div className="rounded-lg bg-error-bg p-4 text-error-text">
						{companyDetailError ?? C.viewCompanyNotFound}
					</div>
					<Button
						variant="link"
						className="mt-4"
						onClick={() => navigate(ROUTES.companyDirectory.root)}
					>
						{C.backToCompanyDirectory}
					</Button>
				</>
			)}
			{!isLoading && !isError && companyDetail && (
				<ViewCompanyContent company={companyDetail} />
			)}
		</AppLayout>
	);
}
