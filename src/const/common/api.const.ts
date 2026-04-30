/**
 * API Configuration Constants
 */

export const API_CONFIG = {
	baseUrl: import.meta.env.VITE_API_BASE_URL,
	timeout: 30000,
} as const;

/**
 * API Endpoints - Following RESTful conventions
 */
export const API_ENDPOINTS = {
	auth: {
		passwordReset: {
			request: "/auth/password-reset/request",
			confirm: "/auth/password-reset/confirm",
			validate: "/auth/password-reset/validate",
			resend: "/auth/password-reset/resend",
		},
	},
	corporations: {
		root: "/corporations",
		list: "/corporations/list",
		byId: (corporationId: string) => `/corporations/${corporationId}`,
		companies: (corporationId: string) =>
			`/corporations/${corporationId}/companies`,
		companyById: (corporationId: string, companyId: string) =>
			`/corporations/${corporationId}/companies/${companyId}`,
		createCompanyNew: (corporationId: string) =>
			`/corporations/${corporationId}/companies/companynew`,
		activeCompanies: "/corporations/companies/active",
		companyByCompanyId: (companyId: string) =>
			`/corporations/companies/${companyId}`,
		keyContacts: (companyId: string) =>
			`/corporations/companies/${companyId}/key-contacts`,
		planSeats: (companyId: string) =>
			`/corporations/companies/${companyId}/plan-seats`,
		companyConfiguration: (companyId: string) =>
			`/corporations/companies/${companyId}/configuration`,
		companyBrandLogo: (companyId: string) =>
			`/corporations/companies/${companyId}/brand-logo`,
		companyConfirmation: (companyId: string) =>
			`/corporations/companies/${companyId}/confirmation`,
		steps: (corporationId: string) => `/corporations/${corporationId}/steps`,
		brandLogo: (corporationId: string) =>
			`/corporations/${corporationId}/brand-logo`,
		keyContact: (corporationId: string) =>
			`/corporations/${corporationId}/key-contact`,
		status: (corporationId: string) => `/corporations/${corporationId}/status`,
		reinstate: (corporationId: string) =>
			`/corporations/${corporationId}/reinstate`,
	},
	pricing: {
		plans: "/pricing/plans",
	},
	roles: {
		root: "/roles",
		categories: "/roles/categories",
		byId: (id: string) => `/roles/${id}`,
	},
	permissions: {
		modulesWithPermissions: "/permissions/modules-with-permissions",
	},
	companies: {
		root: "/companies",
		filterOptions: "/companies/filter-options",
	},
	companyAdmin: {
		onboardingReview: "/company-admin/me/onboarding-review",
		checkoutSession: "/company-admin/me/checkout-session",
	},
	finance: {
		invoices: "/finance/invoices",
		invoiceCompanyOptions: "/finance/invoices/company-options",
		bulkDownloadInvoices: "/finance/invoices/bulk-download",
		bulkSendInvoices: "/finance/invoices/bulk-send",
		invoicePdf: (invoiceId: string) =>
			`/finance/invoices/${encodeURIComponent(invoiceId)}/pdf`,
		invoiceSend: (invoiceId: string) =>
			`/finance/invoices/${encodeURIComponent(invoiceId)}/send`,
	},
	users: {
		root: "/users",
	},
	keyContacts: {
		root: "/key-contacts",
	},
} as const;

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
	OK: 200,
	CREATED: 201,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	INTERNAL_SERVER_ERROR: 500,
} as const;
