import { useMemo } from "react";
import { DataTable } from "@/components/common";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { COMPANY_ADMIN_ONBOARDING, DATA_TABLE_TEXT } from "@/const";
import type {
	ColumnDef,
	CompanyAdminCompaniesListProps,
	CompanyAdminCompanyItem,
} from "@/types";

type CompanyAdminTableRow = CompanyAdminCompanyItem & { id: string };

function statusLabel(
	c: CompanyAdminCompanyItem,
	C: typeof COMPANY_ADMIN_ONBOARDING,
) {
	if (c.hasActiveSubscription) return C.statusActive;
	if (c.canCheckout) return C.statusPaymentDue;
	return C.statusPending;
}

export function CompanyAdminCompaniesList({
	companies,
	onProceedToPayment,
	onViewCompany,
}: CompanyAdminCompaniesListProps) {
	const C = COMPANY_ADMIN_ONBOARDING;

	const tableData = useMemo<CompanyAdminTableRow[]>(
		() => companies.map((c) => ({ ...c, id: c.companyId })),
		[companies],
	);

	const columns = useMemo<ColumnDef<CompanyAdminTableRow>[]>(
		() => [
			{
				id: "company",
				header: C.colCompany,
				minWidth: "160px",
				cell: (row) => (
					<span className="whitespace-normal font-medium text-foreground">
						{row.company.legalName}
					</span>
				),
			},
			{
				id: "corporation",
				header: C.colCorporation,
				minWidth: "160px",
				cell: (row) => (
					<span className="whitespace-normal text-muted-foreground">
						{row.corporation.legalName}
					</span>
				),
			},
			{
				id: "status",
				header: C.colStatus,
				cell: (row) => (
					<span className="text-muted-foreground">{statusLabel(row, C)}</span>
				),
			},
			{
				id: "action",
				header: C.colAction,
				minWidth: "200px",
				cellClassName: "text-right",
				cell: (row) => (
					<div className="flex justify-end">
						{row.canCheckout ? (
							<Button
								type="button"
								size="sm"
								onClick={() => onProceedToPayment(row)}
							>
								{C.proceedToPayment}
							</Button>
						) : row.hasActiveSubscription ? (
							<Button
								type="button"
								size="sm"
								variant="outline"
								onClick={() => onViewCompany(row)}
							>
								{C.viewCompany}
							</Button>
						) : (
							<span className="text-xs text-muted-foreground">
								{C.statusPending}
							</span>
						)}
					</div>
				),
			},
		],
		[C, onProceedToPayment, onViewCompany],
	);

	return (
		<div className="flex min-h-[calc(100vh-8rem)] w-full flex-col items-center px-0 sm:px-2">
			<div className="w-full max-w-5xl space-y-6">
				<div>
					<h1 className="text-heading-4 font-semibold text-text-foreground">
						{C.multiCompanyTitle}
					</h1>
					<p className="text-small text-text-secondary mt-1">
						{C.multiCompanySubtitle}
					</p>
				</div>

				<Card className="border bg-background rounded-xl border-border shadow-md">
					<CardHeader className="space-y-1">
						<CardTitle className="text-base font-semibold text-text-foreground">
							{C.companiesListCardTitle}
						</CardTitle>
						<CardDescription className="text-small">
							{companies.length}
							{companies.length === 1 ? " company" : " companies"}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<DataTable<CompanyAdminTableRow>
							data={tableData}
							columns={columns}
							pageSize={Math.max(tableData.length, 1)}
							showPagination={false}
							emptyMessage={DATA_TABLE_TEXT.noData}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
