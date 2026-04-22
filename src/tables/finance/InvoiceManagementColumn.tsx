import { Download, Eye, MoreVertical, Send } from "lucide-react";
import { BSPBadge } from "@/components";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	INVOICE_MANAGEMENT_UI,
	INVOICE_PAYMENT_TYPE_LABELS,
	INVOICE_ROW_ACTIONS,
	INVOICE_STATUS_BADGE_LABELS,
	INVOICE_TABLE_LABELS,
} from "@/const";
import { cn } from "@/lib/utils";
import type {
	ColumnDef,
	InvoiceColumnSelection,
	InvoiceManagementRow,
	InvoiceRowActions,
} from "@/types";
import { formatDateShort, formatMoneyFromMinorUnits } from "@/utils";

/** Plan column badge — design: 140×16px */
const planBadgePill =
	"inline-flex h-[16px] w-[140px] max-w-[140px] shrink-0 items-center justify-center overflow-hidden rounded-lg px-1.5 text-xs font-medium leading-none";

function formatInvoiceDate(createdUnixSec: number): string {
	return formatDateShort(new Date(createdUnixSec * 1000));
}

function StatusBadge({ row }: { row: InvoiceManagementRow }) {
	const label =
		row.uiStatus === "paid"
			? INVOICE_STATUS_BADGE_LABELS.paid
			: row.uiStatus === "failed"
				? INVOICE_STATUS_BADGE_LABELS.failed
				: INVOICE_STATUS_BADGE_LABELS.pending;
	return <BSPBadge type={row.uiStatus}>{label}</BSPBadge>;
}

function planBadgeClass(label: string): string {
	const l = label.toLowerCase();
	if (l.includes("monthly")) {
		return "bg-[color:var(--bspBlue50)] text-[color:var(--bspBlueBase)]";
	}
	if (l.includes("annual")) {
		return "bg-[color:var(--bspGreen50)] text-[color:var(--bspGreenBase)]";
	}
	if (l.includes("assessment")) {
		return "bg-[color:var(--bspYellow50)] text-[color:var(--bspYellow700)]";
	}
	return "bg-[color:var(--bspGray100)] text-[color:var(--bspGray700)]";
}

function PlanBadge({ row }: { row: InvoiceManagementRow }) {
	if (!row.planLabel?.trim()) {
		return (
			<span className="text-muted-foreground">
				{INVOICE_MANAGEMENT_UI.emptyCell}
			</span>
		);
	}
	return (
		<span
			className={cn(planBadgePill, planBadgeClass(row.planLabel), "truncate")}
			title={row.planLabel}
		>
			{row.planLabel}
		</span>
	);
}

function PaymentBadge({ row }: { row: InvoiceManagementRow }) {
	if (!row.paymentType) {
		return (
			<span className="text-muted-foreground">
				{INVOICE_MANAGEMENT_UI.emptyCell}
			</span>
		);
	}
	const label = INVOICE_PAYMENT_TYPE_LABELS[row.paymentType];
	return <BSPBadge type={row.paymentType}>{label}</BSPBadge>;
}

export function getInvoiceManagementColumns(
	selection?: InvoiceColumnSelection,
	actions?: InvoiceRowActions,
): ColumnDef<InvoiceManagementRow>[] {
	const allSelected =
		selection !== undefined &&
		selection.pageRowIds.length > 0 &&
		selection.pageRowIds.every((id) => selection.selectedIds.has(id));
	const someSelected =
		selection?.pageRowIds.some((id) => selection.selectedIds.has(id)) &&
		!allSelected;

	return [
		{
			id: "select",
			header: "",
			minWidth: "4rem",
			headerClassName: "w-16 max-w-16 px-2",
			renderHeader:
				selection !== undefined
					? () => (
							<div className="flex items-center justify-center">
								<Checkbox
									checked={
										allSelected ? true : someSelected ? "indeterminate" : false
									}
									onCheckedChange={(v) => selection.onToggleAll(v === true)}
									aria-label="Select all invoices on this page"
								/>
							</div>
						)
					: undefined,
			cell: (row) =>
				selection ? (
					<div className="flex items-center justify-center">
						<Checkbox
							checked={selection.selectedIds.has(row.id)}
							onCheckedChange={(v) => selection.onToggleRow(row.id, v === true)}
							aria-label={`Select invoice ${row.displayId}`}
						/>
					</div>
				) : null,
		},
		{
			id: "displayId",
			header: INVOICE_TABLE_LABELS.invoiceId,
			accessorKey: "displayId",
			sortable: true,
			minWidth: "180px",
		},
		{
			id: "amount",
			header: INVOICE_TABLE_LABELS.amount,
			accessorKey: "amountCents",
			sortable: true,
			minWidth: "130px",
			cell: (row) => formatMoneyFromMinorUnits(row.amountCents, row.currency),
		},
		{
			id: "uiStatus",
			header: INVOICE_TABLE_LABELS.status,
			accessorKey: "uiStatus",
			sortable: true,
			minWidth: "140px",
			cell: (row) => <StatusBadge row={row} />,
		},
		{
			id: "created",
			header: INVOICE_TABLE_LABELS.invoiceDate,
			accessorKey: "created",
			sortable: true,
			minWidth: "180px",
			cell: (row) => formatInvoiceDate(row.created),
		},
		{
			id: "paymentType",
			header: INVOICE_TABLE_LABELS.paymentType,
			accessorKey: "paymentType",
			sortable: true,
			minWidth: "160px",
			cell: (row) => <PaymentBadge row={row} />,
		},
		{
			id: "company",
			header: INVOICE_TABLE_LABELS.company,
			accessorKey: "companyOfficeName",
			sortable: true,
			minWidth: "210px",
			cell: (row) => {
				if (!row.companyOfficeName) {
					return (
						<span className="text-muted-foreground">
							{INVOICE_MANAGEMENT_UI.emptyCell}
						</span>
					);
				}
				return (
					<div className="min-w-0">
						<div className="truncate text-sm font-normal text-text-foreground">
							{row.companyOfficeName}
						</div>
						{row.companyRegion ? (
							<div className="truncate text-xs font-normal leading-snug text-muted-foreground">
								{row.companyRegion}
							</div>
						) : null}
					</div>
				);
			},
		},
		{
			id: "planLabel",
			header: INVOICE_TABLE_LABELS.plan,
			accessorKey: "planLabel",
			sortable: true,
			minWidth: "220px",
			cell: (row) => <PlanBadge row={row} />,
		},
		...(actions
			? [
					{
						id: "actions",
						header: INVOICE_TABLE_LABELS.actions,
						minWidth: "92px",
						cell: (row: InvoiceManagementRow) => (
							<div className="flex gap-1">
								<Button
									type="button"
									variant="ghost"
									size="icon-sm"
									className="text-muted-foreground hover:text-foreground"
									aria-label={`${INVOICE_ROW_ACTIONS.viewAriaLabel} ${row.displayId}`}
									onClick={() => actions.onView(row)}
								>
									<Eye className="size-4" aria-hidden />
								</Button>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											type="button"
											variant="ghost"
											size="icon-sm"
											className="text-muted-foreground hover:text-foreground"
											aria-label={`${INVOICE_ROW_ACTIONS.moreActionsAriaLabel} ${row.displayId}`}
										>
											<MoreVertical className="size-4" aria-hidden />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="end"
										className="min-w-40 border-border/60 shadow-md"
									>
										<DropdownMenuItem onSelect={() => actions.onSend(row)}>
											<Send className="size-4" aria-hidden />
											{INVOICE_ROW_ACTIONS.menuSendInvoice}
										</DropdownMenuItem>
										<DropdownMenuItem onSelect={() => actions.onDownload(row)}>
											<Download className="size-4" aria-hidden />
											{INVOICE_ROW_ACTIONS.menuDownload}
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						),
					},
				]
			: []),
	];
}
