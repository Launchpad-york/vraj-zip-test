import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { COMPANY_ADMIN_ONBOARDING } from "@/const";
import type { CompanyAdminCompanyOverviewProps } from "@/types";
import { CompanyBasicDetailsReview } from "./CompanyBasicDetailsReview";

/**
 * Dashboard for company admins with an active subscription: company profile only (no payment flow).
 */
export function CompanyAdminCompanyOverview({
	review,
	onBackToList,
}: CompanyAdminCompanyOverviewProps) {
	const C = COMPANY_ADMIN_ONBOARDING;

	return (
		<div className="flex min-h-[calc(100vh-8rem)] w-full flex-col items-center px-0 sm:px-2">
			<div className="w-full max-w-4xl space-y-6">
				{onBackToList ? (
					<div>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="gap-1 -ml-2 px-2 text-muted-foreground"
							onClick={onBackToList}
						>
							<ArrowLeft className="h-4 w-4" aria-hidden />
							{C.backToCompanies}
						</Button>
					</div>
				) : null}
				<div>
					<h1 className="text-heading-4 font-semibold text-text-foreground">
						{C.overviewPageTitle}
					</h1>
					<p className="text-small text-text-secondary mt-1">
						{C.overviewPageSubtitle}
					</p>
					{review.subscriptionStatus ? (
						<p className="mt-2 text-xs text-muted-foreground">
							{C.subscriptionStatusLabel}{" "}
							<span className="font-medium capitalize text-foreground">
								{review.subscriptionStatus}
								{review.planSummary?.planTypeName
									? ` (${review.planSummary.planTypeName})`
									: ""}
							</span>
						</p>
					) : null}
				</div>

				<Card className="border bg-background rounded-xl border-border shadow-md">
					<CardHeader className="space-y-1 text-center">
						<CardTitle className="text-heading-4 font-semibold text-text-foreground">
							{C.overviewCardTitle}
						</CardTitle>
						<CardDescription className="text-small font-normal text-text-secondary">
							{C.overviewCardSubtitle}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<CompanyBasicDetailsReview
							corporation={review.corporation}
							company={review.company}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
