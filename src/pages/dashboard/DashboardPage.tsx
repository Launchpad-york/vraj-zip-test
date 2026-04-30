import { useEffect, useState } from "react";
import { getCompanyAdminOnboardingReview } from "@/api";
import {
	CompanyAdminCompaniesList,
	CompanyAdminCompanyOverview,
	CompanyAdminOnboardingFlow,
} from "@/components";
import { Card, CardContent } from "@/components/ui/card";
import { DASHBOARD_PAGE_CONTENT, HTTP_STATUS, ROUTES } from "@/const";
import { AppLayout } from "@/layout";
import type {
	CompanyAdminCompanyItem,
	CompanyAdminDashboardDetail,
} from "@/types";

export function DashboardPage() {
	const breadcrumbs = [
		{ label: DASHBOARD_PAGE_CONTENT.title, path: ROUTES.dashboard.root },
	];

	const [loading, setLoading] = useState(true);
	const [companyAdminCompanies, setCompanyAdminCompanies] = useState<
		CompanyAdminCompanyItem[] | null
	>(null);
	const [detail, setDetail] = useState<CompanyAdminDashboardDetail | null>(
		null,
	);
	const [loadError, setLoadError] = useState(false);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			setLoading(true);
			setLoadError(false);
			setCompanyAdminCompanies(null);
			setDetail(null);
			const r = await getCompanyAdminOnboardingReview();
			if (cancelled) return;
			if (!r.ok) {
				if (
					r.status === HTTP_STATUS.FORBIDDEN ||
					r.status === HTTP_STATUS.NOT_FOUND
				) {
					setCompanyAdminCompanies(null);
				} else {
					setLoadError(true);
				}
				setLoading(false);
				return;
			}
			setCompanyAdminCompanies(r.data.companies);
			setLoading(false);
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	if (loading) {
		return (
			<AppLayout breadcrumbs={breadcrumbs}>
				<div className="flex min-h-[320px] items-center justify-center text-text-secondary text-sm">
					Loading…
				</div>
			</AppLayout>
		);
	}

	if (companyAdminCompanies != null) {
		const multi = companyAdminCompanies.length > 1;

		if (detail?.kind === "onboarding") {
			return (
				<AppLayout breadcrumbs={breadcrumbs}>
					<CompanyAdminOnboardingFlow
						review={detail.company}
						onBackToList={multi ? () => setDetail(null) : undefined}
					/>
				</AppLayout>
			);
		}

		if (detail?.kind === "overview") {
			return (
				<AppLayout breadcrumbs={breadcrumbs}>
					<CompanyAdminCompanyOverview
						review={detail.company}
						onBackToList={multi ? () => setDetail(null) : undefined}
					/>
				</AppLayout>
			);
		}

		if (companyAdminCompanies.length === 0) {
			return (
				<AppLayout breadcrumbs={breadcrumbs}>
					<p className="text-sm text-muted-foreground">
						No companies are linked to this account.
					</p>
				</AppLayout>
			);
		}

		if (companyAdminCompanies.length === 1) {
			const c = companyAdminCompanies[0];
			if (c.hasActiveSubscription) {
				return (
					<AppLayout breadcrumbs={breadcrumbs}>
						<CompanyAdminCompanyOverview review={c} />
					</AppLayout>
				);
			}
			return (
				<AppLayout breadcrumbs={breadcrumbs}>
					<CompanyAdminOnboardingFlow review={c} />
				</AppLayout>
			);
		}

		return (
			<AppLayout breadcrumbs={breadcrumbs}>
				<CompanyAdminCompaniesList
					companies={companyAdminCompanies}
					onProceedToPayment={(company) =>
						setDetail({ kind: "onboarding", company })
					}
					onViewCompany={(company) => setDetail({ kind: "overview", company })}
				/>
			</AppLayout>
		);
	}

	if (loadError) {
		return (
			<AppLayout breadcrumbs={breadcrumbs}>
				<p className="text-sm text-destructive">
					We couldn&apos;t load your dashboard. Please refresh or try again
					later.
				</p>
			</AppLayout>
		);
	}

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-heading-4 font-semibold text-text-foreground">
						{DASHBOARD_PAGE_CONTENT.title}
					</h1>
					<p className="text-small text-text-secondary mt-1">
						{DASHBOARD_PAGE_CONTENT.subtitle}
					</p>
				</div>
			</div>

			<Card className="border bg-background rounded-xl border-border">
				<CardContent className="flex min-h-[500px] flex-col items-center justify-center text-center">
					<h2 className="text-lg font-semibold text-text-foreground">
						{DASHBOARD_PAGE_CONTENT.noMetrics}
					</h2>
					<p className="mt-2 text-sm text-primary">
						{DASHBOARD_PAGE_CONTENT.noMetricsDescription}
					</p>
				</CardContent>
			</Card>
		</AppLayout>
	);
}
