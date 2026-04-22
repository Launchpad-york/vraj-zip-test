import { Ban, ChevronLeft, RotateCcw, SquarePen } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BSPBadge } from "@/components";
import { Button } from "@/components/ui/button";
import {
	COMPANIES_DIRECTORY_PAGE_CONTENT as CD,
	ROUTES,
	VIEW_COMPANY_TABS,
} from "@/const";
import { cn } from "@/lib/utils";
import type {
	CompanyStatus,
	ViewCompanyContentProps,
	ViewCompanyTabId,
} from "@/types";
import { formatCode } from "@/utils";
import { CompanyDetailsContent } from "./CompanyDetailsContent";

function toCompanyStatus(status: string | undefined): CompanyStatus {
	const s = status?.toLowerCase() ?? "";
	if (s === "active" || s === "suspended" || s === "incomplete") return s;
	return "incomplete";
}

export function ViewCompanyContent({ company }: ViewCompanyContentProps) {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<ViewCompanyTabId>("basic");

	const status = toCompanyStatus(company.status);
	const planName = company.plan?.planType?.name ?? "";

	const handleEdit = () => {
		navigate(`${ROUTES.companyDirectory.addWithIdPath(company.id)}?flow=edit`);
	};

	const title =
		company.legalName?.trim() || company.dbaName?.trim() || "Company";

	return (
		<div className="-m-6 flex min-h-full flex-col bg-content-bg p-6 pt-3">
			<div className="flex shrink-0 flex-col gap-4">
				<div className="flex min-h-[52px] w-full flex-wrap items-center justify-between gap-4">
					<div className="flex flex-wrap items-center gap-3">
						<Button
							variant="outline"
							size="sm"
							type="button"
							onClick={() => navigate(ROUTES.companyDirectory.root)}
							className="h-9 min-h-9 shrink-0 gap-2 rounded-lg border border-border bg-background px-4 py-2 text-small font-medium text-text-foreground shadow-none hover:bg-muted hover:text-text-foreground"
						>
							<ChevronLeft className="h-4 w-4" aria-hidden />
							{CD.backButton}
						</Button>
						<div className="flex min-h-9 min-w-0 flex-1 flex-wrap items-center gap-2">
							<h1 className="min-w-0 max-w-full truncate text-heading-4 font-semibold text-text-foreground capitalize">
								{title}
							</h1>
							{company.companyCode != null && (
								<BSPBadge type="default">
									{formatCode(company.companyCode, "COMP")}
								</BSPBadge>
							)}
							<BSPBadge type={`${status}_filled`} className="capitalize">
								{status}
							</BSPBadge>
							{planName ? (
								<BSPBadge type={`${company.plan?.planTypeId}_filled`}>
									{planName}
								</BSPBadge>
							) : null}
						</div>
					</div>
					<div className="flex shrink-0 flex-wrap items-center gap-2">
						{status === "suspended" ? (
							<Button
								variant="default"
								size="sm"
								type="button"
								className="h-9 min-h-9 shrink-0 gap-2 rounded-lg px-4 py-2 text-small font-medium"
								disabled
							>
								<RotateCcw className="h-4 w-4" aria-hidden />
								{CD.viewReinstateButton}
							</Button>
						) : (
							<Button
								variant="outline"
								size="sm"
								type="button"
								className="h-9 min-h-9 shrink-0 gap-2 rounded-lg border border-destructive bg-background px-4 py-2 text-small font-medium text-destructive shadow-none hover:bg-destructive/10 hover:text-destructive"
								disabled
							>
								<Ban className="h-4 w-4" aria-hidden />
								{CD.viewSuspendButton}
							</Button>
						)}
						<Button
							variant="default"
							size="sm"
							type="button"
							className="h-9 min-h-9 shrink-0 gap-2 rounded-lg px-4 py-2 text-small font-medium"
							onClick={handleEdit}
						>
							<SquarePen className="h-4 w-4" aria-hidden />
							{CD.viewEditCompanyButton}
						</Button>
					</div>
				</div>

				<div className="flex h-11 min-h-11 w-full items-center rounded-xl bg-card-foreground p-1">
					<nav
						className="flex flex-1 flex-wrap items-center gap-4"
						aria-label="Company sections"
					>
						{VIEW_COMPANY_TABS.map((tab) => (
							<button
								key={tab.id}
								type="button"
								onClick={() => setActiveTab(tab.id)}
								className={cn(
									"inline-flex h-8 min-h-8 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 px-2.5 py-1.5 text-small font-semibold transition-colors",
									activeTab === tab.id
										? "bg-background text-brand-primary"
										: "bg-transparent text-text-secondary hover:text-text-foreground",
								)}
							>
								{tab.label}
							</button>
						))}
					</nav>
				</div>
			</div>

			<div className="mt-6 flex min-h-0 flex-1 flex-col">
				<CompanyDetailsContent company={company} activeTab={activeTab} />
			</div>
		</div>
	);
}
