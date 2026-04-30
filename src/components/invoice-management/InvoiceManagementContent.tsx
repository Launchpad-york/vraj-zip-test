import {
	ChevronLeft,
	ChevronRight,
	Download,
	Loader2,
	Search,
	Send,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
	bulkDownloadInvoicesZip,
	bulkSendInvoices,
	downloadBlobAsFile,
	downloadInvoicePdfBlob,
	fetchInvoiceCompanyOptions,
	fetchInvoicePdfBlob,
	fetchInvoices,
	sendInvoiceEmail,
} from "@/api/finance.api";
import { DataTable, TableSkeleton, WhiteBox } from "@/components";
import { Button } from "@/components/ui/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import {
	DATA_TABLE_CONFIG,
	DATA_TABLE_TEXT,
	INVOICE_BULK_ACTIONS,
	INVOICE_BULK_SEND_PROGRESS,
	INVOICE_MANAGEMENT_PAGE_CONTENT,
	INVOICE_MANAGEMENT_UI,
} from "@/const";
import { getInvoiceManagementColumns } from "@/tables";
import type {
	BulkSendFailure,
	InvoiceCompanyOption,
	InvoiceManagementRow,
	InvoicePaymentType,
	PageCursor,
} from "@/types";
import { BulkSendInvoiceModal } from "./BulkSendInvoiceModal";
import { InvoiceDetailsModal } from "./InvoiceDetailsModal";
import { InvoiceManagementFiltersGroup } from "./InvoiceManagementFiltersGroup";
import { InvoiceMoreFiltersDialog } from "./InvoiceMoreFiltersDialog";

const PAGE_SIZE = DATA_TABLE_CONFIG.defaultPageSize;

function createdGteFromTimePeriodId(id: string | null): number | undefined {
	if (!id || id === "all") return undefined;
	const now = Math.floor(Date.now() / 1000);
	const day = 86400;
	switch (id) {
		case "1h":
			return now - 3600;
		case "7d":
			return now - 7 * day;
		case "30d":
			return now - 30 * day;
		case "3m":
			return now - 90 * day;
		case "6m":
			return now - 180 * day;
		case "1y":
			return now - 365 * day;
		default:
			return undefined;
	}
}

export function InvoiceManagementContent() {
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [companyId, setCompanyId] = useState<string | undefined>(undefined);
	const [searchInput, setSearchInput] = useState("");

	const [appliedTimePeriodId, setAppliedTimePeriodId] = useState<string | null>(
		null,
	);
	const [appliedPaymentTypes, setAppliedPaymentTypes] = useState<
		InvoicePaymentType[]
	>([]);
	const [filtersOpen, setFiltersOpen] = useState(false);

	const [companyOptions, setCompanyOptions] = useState<InvoiceCompanyOption[]>(
		[],
	);
	const [optionsLoading, setOptionsLoading] = useState(true);

	const [rows, setRows] = useState<InvoiceManagementRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [hasMore, setHasMore] = useState(false);
	const [nextStartingAfter, setNextStartingAfter] = useState<string | null>(
		null,
	);

	const [pageStack, setPageStack] = useState<PageCursor[]>([{}]);
	const pageIndex = pageStack.length - 1;

	const filterResetKey = useRef<string>("");

	const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

	const [previewInvoice, setPreviewInvoice] =
		useState<InvoiceManagementRow | null>(null);
	const [sendingInvoiceId, setSendingInvoiceId] = useState<string | null>(null);

	const [bulkSendOpen, setBulkSendOpen] = useState(false);
	const [bulkDownloading, setBulkDownloading] = useState(false);
	const [bulkSending, setBulkSending] = useState(false);
	const [bulkSendFailures, setBulkSendFailures] = useState<
		BulkSendFailure[] | null
	>(null);

	const invoiceIdToDisplayId = useMemo(() => {
		const m = new Map<string, string>();
		for (const r of rows) {
			m.set(r.id, r.displayId);
		}
		return m;
	}, [rows]);

	const filteredRows = useMemo(() => {
		const q = searchInput.trim().toLowerCase();
		if (!q) return rows;
		return rows.filter((r) => {
			const id = r.displayId.toLowerCase();
			const office = (r.companyOfficeName ?? "").toLowerCase();
			return id.includes(q) || office.includes(q);
		});
	}, [rows, searchInput]);

	const pageRowIds = useMemo(
		() => filteredRows.map((r) => r.id),
		[filteredRows],
	);

	const onToggleRow = useCallback((id: string, checked: boolean) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (checked) next.add(id);
			else next.delete(id);
			return next;
		});
	}, []);

	const onToggleAll = useCallback(
		(checked: boolean) => {
			setSelectedIds((prev) => {
				const next = new Set(prev);
				if (checked) {
					for (const id of pageRowIds) next.add(id);
				} else {
					for (const id of pageRowIds) next.delete(id);
				}
				return next;
			});
		},
		[pageRowIds],
	);

	const handleViewInvoice = useCallback((row: InvoiceManagementRow) => {
		setPreviewInvoice(row);
	}, []);

	const handleDownloadInvoice = useCallback(
		async (row: InvoiceManagementRow) => {
			const res = await fetchInvoicePdfBlob(row.id);
			if (!res.ok) {
				toast.error(res.message);
				return;
			}
			downloadInvoicePdfBlob(res.blob, row.displayId);
		},
		[],
	);

	const handleSendInvoice = useCallback(async (row: InvoiceManagementRow) => {
		setSendingInvoiceId(row.id);
		try {
			const res = await sendInvoiceEmail(row.id);
			if (res.ok) {
				toast.success("Invoice sent.");
			} else {
				toast.error(res.message);
			}
		} finally {
			setSendingInvoiceId(null);
		}
	}, []);

	const selectedInvoiceIds = useMemo(
		() => Array.from(selectedIds),
		[selectedIds],
	);

	const handleBulkDownload = useCallback(async () => {
		if (selectedInvoiceIds.length === 0) {
			return;
		}
		setBulkDownloading(true);
		try {
			const res = await bulkDownloadInvoicesZip(selectedInvoiceIds);
			if (res.ok) {
				downloadBlobAsFile(res.blob, "invoices.zip");
			} else {
				toast.error(res.message);
			}
		} finally {
			setBulkDownloading(false);
		}
	}, [selectedInvoiceIds]);

	const handleBulkSendConfirm = useCallback(
		async (additionalEmails: string[]) => {
			if (selectedInvoiceIds.length === 0) {
				return;
			}
			setBulkSending(true);
			const failures: BulkSendFailure[] = [];

			try {
				if (additionalEmails.length > 0) {
					for (const email of additionalEmails) {
						const res = await bulkSendInvoices(selectedInvoiceIds, [email]);
						if (!res.ok) {
							failures.push({ target: email, message: res.message });
						}
					}
				} else {
					for (const invoiceId of selectedInvoiceIds) {
						const res = await bulkSendInvoices([invoiceId], []);
						if (!res.ok) {
							failures.push({
								target: invoiceIdToDisplayId.get(invoiceId) ?? invoiceId,
								message: res.message,
							});
						}
					}
				}
			} finally {
				setBulkSending(false);
			}

			if (failures.length === 0) {
				toast.success(INVOICE_BULK_SEND_PROGRESS.allSent);
				setBulkSendOpen(false);
				setBulkSendFailures(null);
			} else {
				setBulkSendFailures(failures);
			}
		},
		[selectedInvoiceIds, invoiceIdToDisplayId],
	);

	const handleBulkSendOpenChange = useCallback((open: boolean) => {
		setBulkSendOpen(open);
		if (!open) {
			setBulkSendFailures(null);
		}
	}, []);

	const columns = useMemo(
		() =>
			getInvoiceManagementColumns(
				{
					pageRowIds,
					selectedIds,
					onToggleRow,
					onToggleAll,
				},
				{
					onView: handleViewInvoice,
					onSend: handleSendInvoice,
					onDownload: handleDownloadInvoice,
				},
			),
		[
			pageRowIds,
			selectedIds,
			onToggleRow,
			onToggleAll,
			handleViewInvoice,
			handleSendInvoice,
			handleDownloadInvoice,
		],
	);

	useEffect(() => {
		setSelectedIds((prev) => {
			const next = new Set<string>();
			for (const id of prev) {
				if (pageRowIds.includes(id)) next.add(id);
			}
			return next;
		});
	}, [pageRowIds]);

	const pageStackSerialized = JSON.stringify(pageStack);

	const appliedPaymentKey = useMemo(
		() => [...appliedPaymentTypes].sort().join(","),
		[appliedPaymentTypes],
	);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			setOptionsLoading(true);
			const res = await fetchInvoiceCompanyOptions();
			if (cancelled) return;
			if (res.ok) {
				setCompanyOptions(res.data);
			}
			setOptionsLoading(false);
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	const resetPagination = useCallback(() => {
		setPageStack([{}]);
	}, []);

	const filterKey = `${statusFilter}|${companyId ?? ""}|${appliedTimePeriodId ?? ""}|${appliedPaymentKey}`;
	useEffect(() => {
		if (filterResetKey.current === "") {
			filterResetKey.current = filterKey;
			return;
		}
		if (filterResetKey.current !== filterKey) {
			filterResetKey.current = filterKey;
			resetPagination();
		}
	}, [filterKey, resetPagination]);

	/** Snap to apply time only — do not recompute from `Date.now()` every render (would change every second and retrigger fetch). */
	const createdGte = useMemo(
		() => createdGteFromTimePeriodId(appliedTimePeriodId),
		[appliedTimePeriodId],
	);

	const paymentMethodsParam =
		appliedPaymentTypes.length > 0 ? appliedPaymentTypes.join(",") : undefined;

	useEffect(() => {
		let cancelled = false;
		(async () => {
			setLoading(true);
			setError(null);

			const cursor = pageStack[pageStack.length - 1];
			const res = await fetchInvoices({
				limit: PAGE_SIZE,
				status: statusFilter,
				companyId,
				startingAfter: cursor.startingAfter,
				createdGte,
				paymentMethods: paymentMethodsParam,
			});

			if (cancelled) return;

			if (!res.ok) {
				setError(res.message);
				setRows([]);
				setHasMore(false);
				setLoading(false);
				return;
			}

			const data = res.data;
			const mapped: InvoiceManagementRow[] = data.items.map((item) => ({
				id: item.id,
				displayId: item.displayId,
				amountCents: item.amountCents,
				currency: item.currency,
				uiStatus: item.uiStatus,
				created: item.created,
				paymentType: item.paymentType,
				companyOfficeName: item.companyOfficeName,
				companyRegion: item.companyRegion,
				planLabel: item.planLabel,
				invoicePdf: item.invoicePdf,
			}));

			setRows(mapped);
			setHasMore(data.hasMore);
			setNextStartingAfter(data.nextStartingAfter);
			setLoading(false);
		})();

		return () => {
			cancelled = true;
		};
	}, [
		pageStackSerialized,
		statusFilter,
		companyId,
		createdGte,
		paymentMethodsParam,
	]);

	const handlePrev = () => {
		if (pageIndex <= 0) return;
		setPageStack((prev) => prev.slice(0, -1));
	};

	const handleNext = () => {
		if (!hasMore || !nextStartingAfter) return;
		setPageStack((prev) => [...prev, { startingAfter: nextStartingAfter }]);
	};

	const canGoPrev = pageIndex > 0;
	const canGoNext = hasMore && Boolean(nextStartingAfter);

	/** Client-side search filters the current page; counts reflect visible rows. */
	const paginationStart =
		filteredRows.length === 0 ? 0 : pageIndex * PAGE_SIZE + 1;
	const paginationEnd = pageIndex * PAGE_SIZE + filteredRows.length;
	const serverPageEnd = pageIndex * PAGE_SIZE + rows.length;

	const handleApplyMoreFilters = useCallback(
		(timeId: string | null, payments: InvoicePaymentType[]) => {
			setAppliedTimePeriodId(timeId);
			setAppliedPaymentTypes(payments);
		},
		[],
	);

	return (
		<WhiteBox>
			<div className="flex flex-col gap-6">
				<div className="flex w-full min-w-0 flex-wrap items-center gap-2.5">
					<InputGroup className="min-w-48 flex-1 rounded-lg sm:min-w-64 sm:max-w-80">
						<InputGroupAddon align="inline-start">
							<Search className="size-3.5 text-muted-foreground" aria-hidden />
						</InputGroupAddon>
						<InputGroupInput
							type="search"
							placeholder={INVOICE_MANAGEMENT_PAGE_CONTENT.searchPlaceholder}
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							disabled={optionsLoading}
							aria-label={INVOICE_MANAGEMENT_UI.searchAriaLabel}
						/>
					</InputGroup>
					{selectedIds.size > 0 && !loading && !error ? (
						<div className="ml-auto flex min-w-0 max-w-full flex-wrap items-center justify-end gap-3 sm:gap-4">
							<p className="text-sm whitespace-nowrap text-text-secondary">
								{INVOICE_BULK_ACTIONS.itemsSelected(selectedIds.size)}
							</p>
							<div className="flex flex-wrap items-center gap-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="h-9 gap-1.5 rounded-lg"
									onClick={() => handleBulkSendOpenChange(true)}
									disabled={bulkDownloading}
								>
									<Send className="size-4 shrink-0" aria-hidden />
									{INVOICE_BULK_ACTIONS.bulkSendInvoice}
								</Button>
								<Button
									type="button"
									size="sm"
									className="h-9 gap-1.5 rounded-lg"
									onClick={handleBulkDownload}
									disabled={bulkDownloading}
									aria-busy={bulkDownloading}
								>
									{bulkDownloading ? (
										<Loader2
											className="size-4 shrink-0 animate-spin"
											aria-hidden
										/>
									) : (
										<Download className="size-4 shrink-0" aria-hidden />
									)}
									{bulkDownloading
										? INVOICE_BULK_ACTIONS.downloadAllLoading
										: INVOICE_BULK_ACTIONS.downloadAll}
								</Button>
							</div>
						</div>
					) : (
						<InvoiceManagementFiltersGroup
							className="ml-auto"
							statusFilter={statusFilter}
							onStatusChange={setStatusFilter}
							companyId={companyId}
							onCompanyChange={setCompanyId}
							companyOptions={companyOptions}
							optionsLoading={optionsLoading}
							onOpenMoreFilters={() => setFiltersOpen(true)}
						/>
					)}
				</div>

				<InvoiceMoreFiltersDialog
					open={filtersOpen}
					onOpenChange={setFiltersOpen}
					appliedTimePeriodId={appliedTimePeriodId}
					appliedPaymentTypes={appliedPaymentTypes}
					onApply={handleApplyMoreFilters}
				/>

				<BulkSendInvoiceModal
					open={bulkSendOpen}
					onOpenChange={handleBulkSendOpenChange}
					onSend={handleBulkSendConfirm}
					isSending={bulkSending}
					sendFailures={bulkSendFailures}
				/>

				<InvoiceDetailsModal
					open={previewInvoice !== null}
					onOpenChange={(open) => {
						if (!open) setPreviewInvoice(null);
					}}
					invoice={previewInvoice}
					sendPending={
						previewInvoice ? sendingInvoiceId === previewInvoice.id : false
					}
					onSend={async () => {
						if (previewInvoice) {
							await handleSendInvoice(previewInvoice);
						}
					}}
				/>

				<div className="min-w-0">
					{loading ? (
						<TableSkeleton
							columns={columns}
							rowCount={PAGE_SIZE}
							showPagination={false}
							fixedHeight
						/>
					) : error ? (
						<p className="text-sm text-destructive" role="alert">
							{error}
						</p>
					) : (
						<>
							<DataTable<InvoiceManagementRow>
								data={filteredRows}
								columns={columns}
								pageSize={PAGE_SIZE}
								showPagination={false}
								emptyMessage={INVOICE_MANAGEMENT_PAGE_CONTENT.noData}
								fixedHeight
								initialSort={{
									column: "created",
									direction: "desc",
								}}
							/>
							{rows.length > 0 && (
								<div className="flex shrink-0 flex-col items-stretch justify-between gap-4 border-t border-border pt-4 sm:flex-row sm:items-center">
									<p className="text-small text-text-secondary">
										{searchInput.trim() && filteredRows.length === 0 ? (
											<>No invoices match your search on this page.</>
										) : hasMore ? (
											<>
												{DATA_TABLE_TEXT.showing} {paginationStart} to{" "}
												{paginationEnd} results{" "}
												{INVOICE_MANAGEMENT_UI.moreAvailableSuffix}
											</>
										) : (
											<>
												{DATA_TABLE_TEXT.showing} {paginationStart} to{" "}
												{paginationEnd} of {serverPageEnd} results
											</>
										)}
									</p>
									<div className="flex items-center gap-2">
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={handlePrev}
											disabled={!canGoPrev}
											className="gap-1 text-small text-text-secondary hover:text-text-foreground"
										>
											<ChevronLeft className="h-4 w-4" aria-hidden />
											{DATA_TABLE_TEXT.previous}
										</Button>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={handleNext}
											disabled={!canGoNext}
											className="gap-1 text-small text-text-secondary hover:text-text-foreground"
										>
											{DATA_TABLE_TEXT.next}
											<ChevronRight className="h-4 w-4" aria-hidden />
										</Button>
									</div>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</WhiteBox>
	);
}
