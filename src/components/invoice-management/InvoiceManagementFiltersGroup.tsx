import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	INVOICE_MANAGEMENT_PAGE_CONTENT,
	INVOICE_MANAGEMENT_UI,
	INVOICE_STATUS_FILTER_OPTIONS,
} from "@/const";
import { cn } from "@/lib/utils";
import type { InvoiceManagementFiltersGroupProps } from "@/types";

/** Status, company, and “Filters” controls in one row (design: 516.25×36px, 10px gap). */
export function InvoiceManagementFiltersGroup({
	statusFilter,
	onStatusChange,
	companyId,
	onCompanyChange,
	companyOptions,
	optionsLoading,
	onOpenMoreFilters,
	className,
}: InvoiceManagementFiltersGroupProps) {
	return (
		<div
			className={cn(
				"flex h-9 w-full max-w-[516.25px] shrink-0 items-center gap-[10px]",
				className,
			)}
		>
			<Select
				value={statusFilter}
				onValueChange={onStatusChange}
				disabled={optionsLoading}
			>
				<SelectTrigger
					className="h-9 min-w-0 w-full flex-1 rounded-lg"
					aria-label={INVOICE_MANAGEMENT_UI.statusFilterAriaLabel}
				>
					<SelectValue
						placeholder={INVOICE_MANAGEMENT_PAGE_CONTENT.statusAll}
					/>
				</SelectTrigger>
				<SelectContent>
					{INVOICE_STATUS_FILTER_OPTIONS.map((o) => (
						<SelectItem key={o.value} value={o.value}>
							{o.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<Select
				value={companyId ?? "all"}
				onValueChange={(v) => onCompanyChange(v === "all" ? undefined : v)}
				disabled={optionsLoading}
			>
				<SelectTrigger
					className="h-9 min-w-0 w-full flex-1 rounded-lg"
					aria-label={INVOICE_MANAGEMENT_UI.companyFilterAriaLabel}
				>
					<SelectValue
						placeholder={INVOICE_MANAGEMENT_PAGE_CONTENT.companyAll}
					/>
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">
						{INVOICE_MANAGEMENT_PAGE_CONTENT.companyAll}
					</SelectItem>
					{companyOptions.map((c) => (
						<SelectItem key={c.value} value={c.value}>
							{c.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<Button
				type="button"
				variant="outline"
				size="default"
				disabled={optionsLoading}
				className="h-9 shrink-0 rounded-lg px-3"
				aria-label={INVOICE_MANAGEMENT_UI.filtersButtonAriaLabel}
				onClick={onOpenMoreFilters}
			>
				<Filter className="h-4 w-4" aria-hidden />
				{INVOICE_MANAGEMENT_PAGE_CONTENT.filtersButton}
			</Button>
		</div>
	);
}
