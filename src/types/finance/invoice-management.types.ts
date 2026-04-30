export type InvoiceUiStatus = "paid" | "pending" | "failed";

export type InvoicePaymentType = "ACH" | "CC" | "Offline";

export type InvoiceManagementRow = {
	id: string;
	displayId: string;
	amountCents: number;
	currency: string;
	uiStatus: InvoiceUiStatus;
	created: number;
	paymentType: InvoicePaymentType | null;
	companyOfficeName: string | null;
	companyRegion: string | null;
	planLabel: string | null;
	invoicePdf: string | null;
};

export type InvoiceColumnSelection = {
	pageRowIds: string[];
	selectedIds: Set<string>;
	onToggleRow: (id: string, checked: boolean) => void;
	onToggleAll: (checked: boolean) => void;
};

export type InvoiceRowActions = {
	onView: (row: InvoiceManagementRow) => void;
	onSend: (row: InvoiceManagementRow) => void;
	onDownload: (row: InvoiceManagementRow) => void;
};

export type InvoiceListApiData = {
	items: InvoiceManagementRow[];
	hasMore: boolean;
	nextStartingAfter: string | null;
	nextSearchPage: string | null;
	usedSearch: boolean;
};

export type InvoiceCompanyOption = {
	value: string;
	label: string;
};

export type InvoiceManagementFiltersGroupProps = {
	statusFilter: string;
	onStatusChange: (value: string) => void;
	companyId: string | undefined;
	onCompanyChange: (companyId: string | undefined) => void;
	companyOptions: InvoiceCompanyOption[];
	optionsLoading: boolean;
	onOpenMoreFilters: () => void;
	className?: string;
};

/** One failed step when sending to a recipient email or company admin for an invoice. */
export type BulkSendFailure = {
	target: string;
	message: string;
};

export type InvoiceMoreFiltersDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Applied values when the dialog opens (synced into draft). */
	appliedTimePeriodId: string | null;
	appliedPaymentTypes: InvoicePaymentType[];
	onApply: (
		timePeriodId: string | null,
		paymentTypes: InvoicePaymentType[],
	) => void;
};

/** Cursor for Stripe invoice list pagination (`startingAfter`). */
export type PageCursor = {
	startingAfter?: string;
};

/** Radix checkbox tri-state (includes indeterminate). */
export type CheckedState = boolean | "indeterminate";

export type BulkSendInvoiceModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSend: (additionalEmails: string[]) => Promise<void>;
	isSending: boolean;
	/** When non-empty, modal shows failure details only (form and note hidden). */
	sendFailures: BulkSendFailure[] | null;
};
