import { API_ENDPOINTS } from "@/const";

/**
 * API Response type
 */
export type ApiResponse<T = unknown> = {
	data: T;
	status: number;
	ok: true;
};

/**
 * API Error type
 */
export type ApiError = {
	message: string;
	status: number;
	ok: false;
};

export async function getBearerToken(): Promise<string | undefined> {
	const email = sessionStorage.getItem("prototype-user-email");
	if (!email) return undefined;
	const role = sessionStorage.getItem("prototype-user-role") ?? "SuperAdmin";
	const payload = btoa(
		JSON.stringify({
			email,
			"cognito:groups": [role],
		}),
	)
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/g, "");
	return `proto.${payload}.sig`;
}

type MockMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type MockResponse = { status: number; data: unknown };

const nowIso = () => new Date().toISOString();
const randomId = () => crypto.randomUUID().slice(0, 8);

const db: any = {
	corporations: [
		{
			id: "corp-001",
			corporationCode: "1001",
			legalName: "Acme Health Group",
			dbaName: "Acme Health",
			website: "https://acme.example",
			ownershipType: "Private",
			dataResidencyRegion: "US East",
			industry: "Healthcare",
			phoneNo: "+1-555-1200",
			status: "active",
			mode: "quick",
			submittedSteps: ["basicInfo", "company"],
			noOfCompanies: 2,
			corporationAdminName: "Taylor Smith",
			corporationAdminEmail: "taylor@acme.example",
			address: {
				addressLine: "1 Main Street",
				state: "NY",
				city: "New York",
				country: "USA",
				zip: "10001",
				timezone: "America/New_York",
			},
			executiveSponsor: null,
			corporationAdmin: {
				firstName: "Taylor",
				lastName: "Smith",
				nickname: "Tay",
				role: "Corporate Admin",
				email: "taylor@acme.example",
				workPhone: "+1-555-1201",
				cellPhone: "+1-555-1202",
			},
			keyContact: null,
			complianceContact: null,
			createdAt: nowIso(),
			updatedAt: nowIso(),
		},
	],
	companies: [
		{
			id: "cmp-001",
			companyId: "C-001",
			corporationId: "corp-001",
			name: "Acme Dental",
			legalName: "Acme Dental LLC",
			companyType: "Practice",
			officeType: "Single",
			location: "New York",
			industry: "Dental",
			region: "US East",
			status: "active",
			plan: { id: "plan-pro", name: "Pro", planTypeId: "P1" },
			submittedSteps: ["basicInfo", "keyContacts", "planSeats"],
			assignedCorporation: { name: "Acme Health Group", corporationCode: "1001" },
			createdAt: nowIso(),
			updatedAt: nowIso(),
		},
	],
	roles: [
		{
			id: "role-001",
			name: "Super Admin",
			description: "Full access",
			categoryId: "cat-admin",
			isPrivate: false,
			isExternal: false,
			permissionIds: ["perm-view-dashboard", "perm-manage-users"],
			userCount: 3,
		},
	],
	invoices: [
		{
			id: "inv-001",
			displayId: "INV-1001",
			companyId: "cmp-001",
			status: "open",
			amountDue: 12900,
			currency: "usd",
			created: Math.floor(Date.now() / 1000),
			paymentMethods: ["CC"],
		},
	],
	users: [
		{
			cognitoSub: "usr-001",
			firstName: "Alex",
			lastName: "Johnson",
			email: "alex@acme.example",
			status: "active",
			categoryId: "cat-admin",
			companyId: "cmp-001",
			corporationId: "corp-001",
			createdAt: nowIso(),
			timezone: "America/New_York",
		},
	],
	keyContacts: [
		{
			id: "kc-001",
			contactCode: "KC-1001",
			contactType: "primary",
			firstName: "Jamie",
			lastName: "Lee",
			email: "jamie@acme.example",
			workPhone: "+1-555-3001",
			cellPhone: "+1-555-3002",
			corporationId: "corp-001",
			companyId: "cmp-001",
			timezone: "America/New_York",
		},
	],
};

function ok<T>(data: T, status = 200): ApiResponse<T> {
	return { data, status, ok: true };
}

function fail(message: string, status = 400): ApiError {
	return { message, status, ok: false };
}

function paginate(items: any[], page = 1, limit = 10) {
	const total = items.length;
	const p = Math.max(1, page);
	const l = Math.max(1, limit);
	const start = (p - 1) * l;
	return {
		items: items.slice(start, start + l),
		total,
		page: p,
		limit: l,
		totalPages: Math.max(1, Math.ceil(total / l)),
	};
}

async function mockRequest(
	method: MockMethod,
	endpoint: string,
	body?: unknown,
): Promise<MockResponse> {
	const [path, query = ""] = endpoint.split("?");
	const qs = new URLSearchParams(query);

	if (path === API_ENDPOINTS.auth.passwordReset.request) {
		return { status: 200, data: { success: true, message: "Reset code sent." } };
	}
	if (path === API_ENDPOINTS.auth.passwordReset.validate) {
		return { status: 200, data: { success: true, message: "Code validated." } };
	}
	if (path === API_ENDPOINTS.auth.passwordReset.resend) {
		return { status: 200, data: { success: true, message: "New code sent." } };
	}
	if (path === API_ENDPOINTS.auth.passwordReset.confirm) {
		return { status: 200, data: { success: true, message: "Password updated." } };
	}

	if (path === API_ENDPOINTS.corporations.list) {
		return {
			status: 200,
			data: {
				success: true,
				data: db.corporations.map((c: any) => ({ id: c.id, name: c.legalName })),
			},
		};
	}

	if (path === API_ENDPOINTS.corporations.activeCompanies) {
		return { status: 200, data: { success: true, data: { items: db.companies } } };
	}

	if (path === API_ENDPOINTS.corporations.root && method === "GET") {
		const page = Number(qs.get("page") ?? "1");
		const limit = Number(qs.get("limit") ?? "10");
		const p = paginate(db.corporations, page, limit);
		return { status: 200, data: { success: true, message: "ok", data: p } };
	}

	if (path === API_ENDPOINTS.corporations.root && method === "POST") {
		const payload = (body ?? {}) as Record<string, unknown>;
		const id = `corp-${randomId()}`;
		const item = {
			id,
			corporationCode: `${Math.floor(Math.random() * 9000) + 1000}`,
			legalName: String(payload.legalName ?? "New Corporation"),
			dbaName: String(payload.dbaName ?? ""),
			website: String(payload.website ?? ""),
			ownershipType: String(payload.ownershipType ?? "Private"),
			dataResidencyRegion: String(payload.dataResidencyRegion ?? "US East"),
			industry: String(payload.industry ?? ""),
			phoneNo: String(payload.phoneNo ?? ""),
			status: "incomplete",
			mode: String(payload.mode ?? "quick"),
			submittedSteps: [],
			noOfCompanies: 0,
			corporationAdminName: "Prototype Admin",
			corporationAdminEmail: "prototype@bsp.com",
			address: null,
			executiveSponsor: null,
			corporationAdmin: null,
			keyContact: null,
			complianceContact: null,
			createdAt: nowIso(),
			updatedAt: nowIso(),
		};
		db.corporations.unshift(item);
		return { status: 201, data: { success: true, message: "Created", data: { id } } };
	}

	if (path.startsWith("/corporations/") && !path.includes("/companies")) {
		const id = path.split("/")[2];
		const corp = db.corporations.find((c: any) => c.id === id);
		if (!corp) return { status: 404, data: { message: "Corporation not found" } };
		if (method === "GET") return { status: 200, data: { success: true, message: "ok", data: corp } };
		if (method === "PATCH") {
			Object.assign(corp, body ?? {}, { updatedAt: nowIso() });
			return { status: 200, data: { success: true, message: "Updated", data: corp } };
		}
	}

	if (path.match(/^\/corporations\/[^/]+\/companies$/) && method === "GET") {
		const corpId = path.split("/")[2];
		const items = db.companies.filter((c: any) => c.corporationId === corpId);
		return { status: 200, data: { success: true, message: "ok", data: { items } } };
	}

	if (path.match(/^\/corporations\/[^/]+\/companies$/) && method === "POST") {
		const corpId = path.split("/")[2];
		const corp = db.corporations.find((c: any) => c.id === corpId);
		if (!corp) return { status: 404, data: { message: "Corporation not found" } };
		const payload = (body ?? {}) as Record<string, unknown>;
		const id = `cmp-${randomId()}`;
		db.companies.unshift({
			id,
			companyId: `C-${Math.floor(Math.random() * 9000) + 1000}`,
			corporationId: corpId,
			name: String(payload.legalName ?? "New Company"),
			legalName: String(payload.legalName ?? "New Company"),
			companyType: String(payload.companyType ?? "Practice"),
			officeType: String(payload.officeType ?? "Single"),
			location: String(payload.city ?? "Unknown"),
			industry: String(payload.industry ?? ""),
			region: String(payload.region ?? "US East"),
			status: "incomplete",
			plan: { id: "plan-basic", name: "Basic", planTypeId: "P1" },
			submittedSteps: [],
			assignedCorporation: { name: corp.legalName, corporationCode: corp.corporationCode },
			createdAt: nowIso(),
			updatedAt: nowIso(),
		});
		corp.noOfCompanies += 1;
		return { status: 201, data: { success: true, message: "Created", data: { id } } };
	}

	if (path.match(/^\/corporations\/[^/]+\/companies\/[^/]+$/)) {
		const [, , corpId, , companyId] = path.split("/");
		const company = db.companies.find((c: any) => c.corporationId === corpId && c.id === companyId);
		if (!company) return { status: 404, data: { message: "Company not found" } };
		if (method === "PATCH") {
			Object.assign(company, body ?? {}, { updatedAt: nowIso() });
			return { status: 200, data: { success: true, message: "Updated", data: company } };
		}
		if (method === "DELETE") {
			db.companies = db.companies.filter((c: any) => c.id !== companyId);
			return { status: 200, data: { success: true, message: "Deleted", data: { id: companyId } } };
		}
	}

	if (path === API_ENDPOINTS.companies.root && method === "GET") {
		const page = Number(qs.get("page") ?? "1");
		const limit = Number(qs.get("limit") ?? "10");
		const p = paginate(db.companies, page, limit);
		return {
			status: 200,
			data: {
				success: true,
				message: "ok",
				data: {
					items: p.items.map((c: any) => ({
						id: c.id,
						companyId: c.companyId,
						name: c.name,
						location: c.location,
						status: c.status,
						submittedSteps: c.submittedSteps,
						assignedCorporation: c.assignedCorporation,
						plan: c.plan,
						createdAt: c.createdAt,
						updatedAt: c.updatedAt,
					})),
					pagination: { total: p.total, page: p.page, pageSize: p.limit, totalPages: p.totalPages },
				},
			},
		};
	}

	if (path === API_ENDPOINTS.companies.filterOptions && method === "GET") {
		return { status: 200, data: { success: true, message: "ok", data: { statuses: ["active", "incomplete"], corporations: db.corporations.map((c: any) => ({ id: c.id, name: c.legalName })), plans: [{ id: "plan-basic", name: "Basic", planTypeId: "P1" }] } } };
	}

	if (path === API_ENDPOINTS.users.root && method === "GET") {
		const page = Number(qs.get("page") ?? "1");
		const limit = Number(qs.get("limit") ?? "10");
		const p = paginate(db.users, page, limit);
		return { status: 200, data: { success: true, message: "ok", data: { items: p.items, pagination: { total: p.total, page: p.page, pageSize: p.limit, totalPages: p.totalPages } } } };
	}

	if (path === API_ENDPOINTS.keyContacts.root && method === "GET") {
		const page = Number(qs.get("page") ?? "1");
		const limit = Number(qs.get("limit") ?? "10");
		const p = paginate(db.keyContacts, page, limit);
		return { status: 200, data: { success: true, message: "ok", data: { items: p.items, pagination: { total: p.total, page: p.page, pageSize: p.limit, totalPages: p.totalPages } } } };
	}

	if (path === API_ENDPOINTS.pricing.plans && method === "GET") {
		return { status: 200, data: { success: true, message: "ok", data: [{ id: "plan-basic", name: "Basic", planTypes: [{ id: "P1", name: "Starter" }] }] } };
	}

	if (path === API_ENDPOINTS.roles.categories && method === "GET") {
		return { status: 200, data: { success: true, message: "ok", data: [{ id: "cat-admin", name: "Admin" }, { id: "cat-staff", name: "Staff" }] } };
	}

	if (path === API_ENDPOINTS.permissions.modulesWithPermissions && method === "GET") {
		return { status: 200, data: { success: true, message: "ok", data: [{ id: "mod-1", name: "Dashboard", permissions: { add: "perm-add-dashboard", update: "perm-update-dashboard", view: "perm-view-dashboard", remove: null } }] } };
	}

	if (path === API_ENDPOINTS.roles.root && method === "GET") {
		const page = Number(qs.get("page") ?? "1");
		const limit = Number(qs.get("limit") ?? "10");
		const p = paginate(db.roles, page, limit);
		return { status: 200, data: { success: true, message: "ok", data: { items: p.items, total: p.total, page: p.page, limit: p.limit, totalPages: p.totalPages } } };
	}

	if (path === API_ENDPOINTS.roles.root && method === "POST") {
		const payload = (body ?? {}) as Record<string, unknown>;
		const item = { id: `role-${randomId()}`, userCount: 0, ...payload };
		db.roles.unshift(item);
		return { status: 201, data: { success: true, message: "Created", data: item } };
	}

	if (path.startsWith("/roles/")) {
		const roleId = path.split("/")[2];
		const role = db.roles.find((r: any) => r.id === roleId);
		if (!role) return { status: 404, data: { message: "Role not found" } };
		if (method === "GET") return { status: 200, data: { success: true, message: "ok", data: role } };
		if (method === "PATCH") {
			Object.assign(role, body ?? {});
			return { status: 200, data: { success: true, message: "Updated", data: role } };
		}
		if (method === "DELETE") {
			db.roles = db.roles.filter((r: any) => r.id !== roleId);
			return { status: 200, data: { success: true, message: "Deleted", data: { id: roleId } } };
		}
	}

	if (path === API_ENDPOINTS.companyAdmin.onboardingReview && method === "GET") {
		return {
			status: 200,
			data: {
				success: true,
				message: "ok",
				data: {
					companies: db.companies.map((c: any) => {
						const corporation = db.corporations.find(
							(corp: any) => corp.id === c.corporationId,
						);
						return {
							companyId: c.id,
							corporationId: c.corporationId,
							hasActiveSubscription: false,
							subscriptionStatus: null,
							corporation: {
								legalName: corporation?.legalName ?? "Unknown Corporation",
								ownershipType: corporation?.ownershipType ?? "Private",
								dataResidencyRegion:
									corporation?.dataResidencyRegion ?? "US East",
							},
							company: {
								legalName: c.legalName ?? c.name ?? "Unknown Company",
								dbaName: null,
								website: null,
								companyType: c.companyType ?? "Practice",
								officeType: c.officeType ?? "Single",
								industry: c.industry ?? "General",
								phoneNo: null,
								addressFormatted: `${c.location ?? "Unknown"}, ${
									c.region ?? "US East"
								}`,
							},
							planSummary: {
								pricingPlanId: c.plan?.id ?? "plan-basic",
								planTypeId: c.plan?.planTypeId ?? "P1",
								planTypeName: c.plan?.name ?? "Basic",
								stripePriceConfigured: true,
								customerType: "company",
								employeeRangeLabel: "1-50",
								listPrice: "99.00",
								trial: {
									zeroTrial: false,
									trialLengthDays: 14,
									trialStartDate: nowIso(),
									trialEndDate: nowIso(),
									autoConvertTrial: true,
								},
								pricing: {
									planPrice: "99.00",
									discount: "0.00",
									invoiceAmount: "99.00",
									billingCurrency: "USD ($)",
									promoCode: null,
								},
							},
							canCheckout: true,
						};
					}),
				},
			},
		};
	}
	if (path === API_ENDPOINTS.companyAdmin.checkoutSession && method === "POST") {
		return { status: 200, data: { success: true, message: "ok", data: { url: "https://example.com/mock-checkout" } } };
	}
	if (path === API_ENDPOINTS.finance.invoices && method === "GET") {
		return { status: 200, data: { success: true, message: "ok", data: { items: db.invoices, hasMore: false } } };
	}
	if (path === API_ENDPOINTS.finance.invoiceCompanyOptions && method === "GET") {
		return { status: 200, data: { success: true, message: "ok", data: db.companies.map((c: any) => ({ id: c.id, name: c.name })) } };
	}
	if (path.includes("/finance/invoices/") && path.endsWith("/send") && method === "POST") {
		return { status: 200, data: { success: true, message: "Sent", data: { sent: true } } };
	}
	if (path === API_ENDPOINTS.finance.bulkSendInvoices && method === "POST") {
		return { status: 200, data: { success: true, message: "Sent", data: { sent: true } } };
	}

	return { status: 200, data: { success: true, message: "ok", data: {} } };
}

export const apiClient = {
	get: async <T>(
		endpoint: string,
		_headers?: Record<string, string>,
	): Promise<ApiResponse<T> | ApiError> => {
		try {
			const response = await mockRequest("GET", endpoint);
			return ok(response.data as T, response.status);
		} catch {
			return fail("An unexpected error occurred", 500);
		}
	},

	post: async <T>(
		endpoint: string,
		body?: unknown,
		_headers?: Record<string, string>,
	): Promise<ApiResponse<T> | ApiError> => {
		try {
			const response = await mockRequest("POST", endpoint, body);
			return ok(response.data as T, response.status);
		} catch {
			return fail("An unexpected error occurred", 500);
		}
	},

	put: async <T>(
		endpoint: string,
		body?: unknown,
		_headers?: Record<string, string>,
	): Promise<ApiResponse<T> | ApiError> => {
		try {
			const response = await mockRequest("PUT", endpoint, body);
			return ok(response.data as T, response.status);
		} catch {
			return fail("An unexpected error occurred", 500);
		}
	},

	patch: async <T>(
		endpoint: string,
		body?: unknown,
		_headers?: Record<string, string>,
	): Promise<ApiResponse<T> | ApiError> => {
		try {
			const response = await mockRequest("PATCH", endpoint, body);
			return ok(response.data as T, response.status);
		} catch {
			return fail("An unexpected error occurred", 500);
		}
	},

	delete: async <T>(
		endpoint: string,
		_headers?: Record<string, string>,
	): Promise<ApiResponse<T> | ApiError> => {
		try {
			const response = await mockRequest("DELETE", endpoint);
			return ok(response.data as T, response.status);
		} catch {
			return fail("An unexpected error occurred", 500);
		}
	},
};

/**
 * Type guard to check if response is an error
 */
export function isApiError(
	response: ApiResponse | ApiError,
): response is ApiError {
	return !response.ok;
}

export const axiosInstance = {
	async get<T>(endpoint: string, _config?: { responseType?: string }) {
		if (endpoint.includes("/pdf")) {
			const blob = new Blob(["Prototype PDF content"], {
				type: "application/pdf",
			});
			return { data: blob as T, status: 200, headers: { "content-type": "application/pdf" } };
		}
		const response = await mockRequest("GET", endpoint);
		return { data: response.data as T, status: response.status, headers: { "content-type": "application/json" } };
	},
	async post<T>(
		endpoint: string,
		_body?: unknown,
		_config?: { responseType?: string },
	) {
		if (endpoint === API_ENDPOINTS.finance.bulkDownloadInvoices) {
			const blob = new Blob(["Prototype ZIP content"], {
				type: "application/zip",
			});
			return { data: blob as T, status: 200, headers: { "content-type": "application/zip" } };
		}
		const response = await mockRequest("POST", endpoint, _body);
		return { data: response.data as T, status: response.status, headers: { "content-type": "application/json" } };
	},
};
