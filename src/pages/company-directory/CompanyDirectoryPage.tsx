import { PlusIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CompanyDirectoryContent } from "@/components";
import { Button } from "@/components/ui/button";
import { COMPANIES_DIRECTORY_PAGE_CONTENT, ROUTES } from "@/const";
import { AppLayout } from "@/layout";

export const CompanyDirectoryPage = () => {
	const navigate = useNavigate();
	const breadcrumbs = [
		{
			label: COMPANIES_DIRECTORY_PAGE_CONTENT.breadcrumbsTitle,
			path: ROUTES.companyDirectory.root,
		},
	];

	const handleAddCompany = () => {
		navigate(ROUTES.companyDirectory.add);
	};

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-heading-4 font-semibold text-text-foreground">
						{COMPANIES_DIRECTORY_PAGE_CONTENT.title}
					</h1>
					<p className="text-small text-text-secondary">
						{COMPANIES_DIRECTORY_PAGE_CONTENT.subtitle}
					</p>
				</div>
				<div>
					<Button onClick={handleAddCompany}>
						<PlusIcon className="w-4 h-4" aria-hidden />
						{COMPANIES_DIRECTORY_PAGE_CONTENT.addNewCompanyButton}
					</Button>
				</div>
			</div>
			<CompanyDirectoryContent />
		</AppLayout>
	);
};
