/** Shared filter labels (also used in `INVOICE_MANAGEMENT_PAGE_CONTENT`). */
export const INVOICE_FILTER_LABELS = {
	allStatus: "All status",
	allCompanies: "All companies",
} as const;

export const INVOICE_MANAGEMENT_PAGE_CONTENT = {
	breadcrumbsTitle: "Invoice Management",
	title: "Invoice Management",
	subtitle: "Manage all the system-wide invoices in one place.",
	searchPlaceholder: "Search here…",
	statusAll: INVOICE_FILTER_LABELS.allStatus,
	companyAll: INVOICE_FILTER_LABELS.allCompanies,
	filtersButton: "Filters",
	loadError:
		"Could not load invoices. Try again or check Stripe configuration.",
	noData: "No invoices found.",
} as const;

/** Table column headers (DataTable). */
export const INVOICE_TABLE_LABELS = {
	invoiceId: "Invoice ID",
	amount: "Amount",
	status: "Status",
	invoiceDate: "Invoice Date",
	paymentType: "Payment Type",
	company: "Company",
	plan: "Plan",
	actions: "Actions",
} as const;

export const INVOICE_DETAILS_MODAL = {
	title: "Invoice Details",
	description: "Complete invoice breakdown and line items.",
	cancel: "Cancel",
	sendInvoice: "Send Invoice",
	downloadInvoice: "Download Invoice",
	noPdf: "PDF preview is not available for this invoice yet.",
} as const;

export const INVOICE_ROW_ACTIONS = {
	menuSendInvoice: "Send Invoice",
	menuDownload: "Download",
	viewAriaLabel: "View invoice PDF",
	moreActionsAriaLabel: "More actions",
} as const;

/** Keep in sync with backend `FINANCE_BULK_MAX_*` in `stripe.constants.ts`. */
export const INVOICE_BULK_SEND_LIMITS = {
	maxInvoices: 50,
	maxExtraEmails: 20,
} as const;

export const INVOICE_BULK_ACTIONS = {
	itemsSelected: (count: number) =>
		count === 1 ? "1 item selected" : `${count} items selected`,
	bulkSendInvoice: "Bulk Send Invoice",
	downloadAll: "Download All",
	/** Shown while the ZIP is being built and downloaded. */
	downloadAllLoading: "Preparing download…",
} as const;

export const INVOICE_BULK_SEND_PROGRESS = {
	completedOfTotal: (done: number, total: number) =>
		`${done} of ${total} complete`,
	sending: "Sending…",
	failuresHeading: "Some sends failed",
	failureLine: (target: string, message: string) => `${target}: ${message}`,
	closeAfterFailures: "Close",
	allSent: "All invoices sent.",
	partialFailed: (failCount: number) =>
		`${failCount} send${failCount === 1 ? "" : "s"} failed. See details below.`,
} as const;

export const INVOICE_BULK_SEND_MODAL = {
	title: "Bulk Send Invoice",
	noteTitle: "Note",
	/** Sentence parts around bold “Send Invoice” (matches design). */
	noteBeforeBold: "Clicking the ",
	noteBoldPhrase: "Send Invoice",
	noteAfterBold:
		" button will send invoices to the respective Company Admins. If you need to send an invoice to specific individuals, enter their email IDs in the fields provided below.",
	recipientsLabel: "Recipients",
	recipientsPlaceholder: "Fill in email ids of recipients and hit enter",
	recipientsCount: (count: number) =>
		count === 1 ? "1 recipient" : `${count} recipients`,
	removeRecipientAriaLabel: "Remove recipient",
	cancel: "Cancel",
	sendInvoice: "Send Invoice",
	invalidEmail: "Enter a valid email address.",
} as const;

/** Stripe invoice status labels (filters and API values). */
export const INVOICE_STRIPE_STATUS_OPTION_LABELS = {
	paid: "Paid",
	open: "Open",
	draft: "Draft",
	uncollectible: "Uncollectible",
	void: "Void",
} as const;

/** Aggregated UI status badge copy (maps to `uiStatus`). */
export const INVOICE_STATUS_BADGE_LABELS = {
	paid: INVOICE_STRIPE_STATUS_OPTION_LABELS.paid,
	pending: "Pending",
	failed: "Failed",
} as const;

/** Payment type badge labels (Stripe-derived types). */
export const INVOICE_PAYMENT_TYPE_LABELS = {
	ACH: "ACH",
	CC: "CC",
	Offline: "Offline",
} as const;

/** Accessible names and secondary UI copy for invoice management. */
export const INVOICE_MANAGEMENT_UI = {
	searchAriaLabel: "Search invoices by invoice ID or company name",
	statusFilterAriaLabel: "Filter by invoice status",
	companyFilterAriaLabel: "Filter by company",
	filtersButtonAriaLabel: "More filters",
	moreAvailableSuffix: "(more available)",
	emptyCell: "—",
} as const;

export const INVOICE_MORE_FILTERS_CONTENT = {
	title: "More Filters",
	noFiltersApplied: "No filters applied",
	clearAll: "Clear All",
	apply: "Apply Filters",
	timePeriod: "Time Period",
	paymentMethods: "Payment Methods",
} as const;

/** Time range options (single selection in state, or parent “all time” via internal id `all`). */
export const INVOICE_TIME_PERIOD_OPTIONS = [
	{ id: "1h", label: "Last hour" },
	{ id: "7d", label: "Last 7 days" },
	{ id: "30d", label: "Last 30 days" },
	{ id: "3m", label: "Last 3 months" },
	{ id: "6m", label: "Last 6 months" },
	{ id: "1y", label: "Last year" },
] as const;

export const INVOICE_PAYMENT_FILTER_OPTIONS = [
	{ id: "ACH" as const, label: "ACH (Bank Transfer)" },
	{ id: "Offline" as const, label: "Offline" },
	{ id: "CC" as const, label: "CC (Credit Card)" },
] as const;

export const INVOICE_STATUS_FILTER_OPTIONS = [
	{ value: "all", label: INVOICE_FILTER_LABELS.allStatus },
	{ value: "paid", label: INVOICE_STRIPE_STATUS_OPTION_LABELS.paid },
	{ value: "open", label: INVOICE_STRIPE_STATUS_OPTION_LABELS.open },
	{ value: "draft", label: INVOICE_STRIPE_STATUS_OPTION_LABELS.draft },
	{
		value: "uncollectible",
		label: INVOICE_STRIPE_STATUS_OPTION_LABELS.uncollectible,
	},
	{ value: "void", label: INVOICE_STRIPE_STATUS_OPTION_LABELS.void },
] as const;
