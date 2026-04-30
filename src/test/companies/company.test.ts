import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "@/api";
import {
	buildCompanyPlanSeatsPayload,
	buildPlanSeatsPrefillFromCompanyDetail,
	computeTrialEndDate,
	normalizeTrialStartDate,
	trialEndIsoFromStart,
} from "@/components/company-directory/add-company-steps/PlanAndSeatsStep";
import { useCompaniesStore, useCompanyDirectoryStore } from "@/store";
import type {
	CompanyDetailData,
	CompanyDirectoryItem,
	CompanyFilterOptions,
	KeyContactsPayload,
} from "@/types";
import type { PricingPlanType } from "@/types/common/pricing.types";

vi.mock("sonner", () => ({
	toast: { error: vi.fn() },
}));

vi.mock("@/api", () => ({
	getCompanies: vi.fn(),
	getCompanyFilterOptions: vi.fn(),
	createCompanyNew: vi.fn(),
	getCompanyById: vi.fn(),
	getCorporationsList: vi.fn(),
	patchCompanyBasicInfo: vi.fn(),
	postKeyContacts: vi.fn(),
	putCompanyPlanSeats: vi.fn(),
}));

const mockGetCompanies = vi.mocked(api.getCompanies);
const mockGetCompanyFilterOptions = vi.mocked(api.getCompanyFilterOptions);
const mockPostKeyContacts = vi.mocked(api.postKeyContacts);
const mockPutCompanyPlanSeats = vi.mocked(api.putCompanyPlanSeats);

const mockCompanyItem: CompanyDirectoryItem = {
	id: "comp-1",
	companyId: "COMP-001",
	companyName: "Acme Inc",
	region: "US",
	status: "active",
	assignedCorporation: { name: "Corp A", corporationCode: "CA-1" },
	plan: "BSP Annual",
	planName: "BSP",
	planTypeId: "annual",
	createdOn: "2025-01-01",
	lastUpdatedOn: "2025-01-02",
};

const mockFilterOptions: CompanyFilterOptions = {
	statuses: [
		{ value: "active", label: "Active" },
		{ value: "incomplete", label: "Incomplete" },
	],
	corporations: [{ id: "corp-1", label: "Corporation A" }],
	plans: [
		{ value: "annual", label: "Annual" },
		{ value: "monthly", label: "Monthly" },
	],
};

const mockKeyContactsPayload: KeyContactsPayload = {
	keyContacts: [
		{
			type: "finance",
			available: true,
			firstName: "Jane",
			lastName: "Doe",
			nickname: "JD",
			role: "Compliance Officer",
			email: "jane.doe@example.com",
			workPhone: "+1-555-123-4567",
			cellPhone: "+1-555-987-6543",
		},
		{
			type: "technical",
			available: false,
			firstName: "",
			lastName: "",
			email: "",
			workPhone: "",
		},
	],
};

describe("fetchCompanies", () => {
	beforeEach(() => {
		useCompaniesStore.getState().reset();
		mockGetCompanies.mockReset();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("calls API with page, limit and store defaults, sets listItems and listTotal on success", async () => {
		mockGetCompanies.mockResolvedValue({
			ok: true,
			data: {
				items: [mockCompanyItem],
				total: 1,
				page: 1,
				limit: 10,
				totalPages: 1,
			},
		});

		await useCompaniesStore.getState().fetchCompanies(1, 10);

		expect(mockGetCompanies).toHaveBeenCalledWith({
			page: 1,
			limit: 10,
			sortBy: "createdAt",
			sortOrder: "desc",
			createdFilter: undefined,
			status: undefined,
			corporationId: undefined,
			planId: undefined,
			planTypeId: undefined,
			search: undefined,
		});
		expect(useCompaniesStore.getState().listLoading).toBe(false);
		expect(useCompaniesStore.getState().listItems).toEqual([mockCompanyItem]);
		expect(useCompaniesStore.getState().listTotal).toBe(1);
		expect(useCompaniesStore.getState().listPage).toBe(1);
		expect(useCompaniesStore.getState().listError).toBeNull();
	});

	it("passes store filter state to API when set", async () => {
		useCompaniesStore.setState({
			listSortBy: "legalName",
			listSortOrder: "asc",
			listCreatedFilter: "last30Days",
			listStatusFilter: "ACTIVE",
			listCorporationFilter: "corp-1",
			listPlanFilter: "plan-1",
			listPlanTypeFilter: "annual",
		});
		mockGetCompanies.mockResolvedValue({
			ok: true,
			data: { items: [], total: 0, page: 1, limit: 10, totalPages: 0 },
		});

		await useCompaniesStore.getState().fetchCompanies(2, 20);

		expect(mockGetCompanies).toHaveBeenCalledWith({
			page: 2,
			limit: 20,
			sortBy: "legalName",
			sortOrder: "asc",
			createdFilter: "last30Days",
			status: "active",
			corporationId: "corp-1",
			planId: "plan-1",
			planTypeId: "annual",
			search: undefined,
		});
	});

	it("overrides store state with params when provided", async () => {
		useCompaniesStore.setState({
			listSortBy: "companyCode",
			listStatusFilter: "incomplete",
		});
		mockGetCompanies.mockResolvedValue({
			ok: true,
			data: { items: [], total: 0, page: 1, limit: 10, totalPages: 0 },
		});

		await useCompaniesStore.getState().fetchCompanies(1, 10, {
			sortBy: "status",
			sortOrder: "asc",
			createdFilter: "last7Days",
			status: "active",
			corporationId: "corp-2",
			planId: "plan-2",
			planTypeId: "monthly",
			search: "test",
		});

		expect(mockGetCompanies).toHaveBeenCalledWith({
			page: 1,
			limit: 10,
			sortBy: "status",
			sortOrder: "asc",
			createdFilter: "last7Days",
			status: "active",
			corporationId: "corp-2",
			planId: "plan-2",
			planTypeId: "monthly",
			search: "test",
		});
	});

	it("sets listError and does not update list when API fails", async () => {
		mockGetCompanies.mockResolvedValue({
			ok: false,
			message: "Network error",
			status: 0,
		});

		await useCompaniesStore.getState().fetchCompanies(1, 10);

		expect(useCompaniesStore.getState().listLoading).toBe(false);
		expect(useCompaniesStore.getState().listError).toBe("Network error");
		expect(useCompaniesStore.getState().listItems).toEqual([]);
	});
});

describe("fetchFilterOptions", () => {
	beforeEach(() => {
		useCompaniesStore.getState().reset();
		mockGetCompanyFilterOptions.mockReset();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("sets filterOptionsLoading true then false, and sets filterOptions on success", async () => {
		mockGetCompanyFilterOptions.mockResolvedValue({
			ok: true,
			data: mockFilterOptions,
		});

		const promise = useCompaniesStore.getState().fetchFilterOptions();
		expect(useCompaniesStore.getState().filterOptionsLoading).toBe(true);

		await promise;

		expect(mockGetCompanyFilterOptions).toHaveBeenCalled();
		expect(useCompaniesStore.getState().filterOptionsLoading).toBe(false);
		expect(useCompaniesStore.getState().filterOptions).toEqual(
			mockFilterOptions,
		);
	});

	it("keeps filterOptions null and shows toast on API error", async () => {
		mockGetCompanyFilterOptions.mockResolvedValue({
			ok: false,
			message: "Server error",
			status: 500,
		});

		await useCompaniesStore.getState().fetchFilterOptions();

		expect(useCompaniesStore.getState().filterOptionsLoading).toBe(false);
		expect(useCompaniesStore.getState().filterOptions).toBeNull();
		const { toast } = await import("sonner");
		expect(toast.error).toHaveBeenCalledWith("Server error");
	});
});

describe("reset", () => {
	beforeEach(() => {
		useCompaniesStore.setState({
			listItems: [mockCompanyItem],
			listTotal: 10,
			listPage: 2,
			listError: "error",
			listSortBy: "legalName",
			listSortOrder: "asc",
			listCreatedFilter: "last7Days",
			listStatusFilter: "active",
			listCorporationFilter: "corp-1",
			listPlanFilter: "plan-1",
			listPlanTypeFilter: "annual",
			listSearch: "query",
			filterOptions: mockFilterOptions,
		});
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("restores initial list and filter state", () => {
		useCompaniesStore.getState().reset();

		expect(useCompaniesStore.getState().listItems).toEqual([]);
		expect(useCompaniesStore.getState().listTotal).toBe(0);
		expect(useCompaniesStore.getState().listPage).toBe(1);
		expect(useCompaniesStore.getState().listError).toBeNull();
		expect(useCompaniesStore.getState().listSortBy).toBe("createdAt");
		expect(useCompaniesStore.getState().listSortOrder).toBe("desc");
		expect(useCompaniesStore.getState().listCreatedFilter).toBeUndefined();
		expect(useCompaniesStore.getState().listStatusFilter).toBeUndefined();
		expect(useCompaniesStore.getState().listCorporationFilter).toBeUndefined();
		expect(useCompaniesStore.getState().listPlanFilter).toBeUndefined();
		expect(useCompaniesStore.getState().listPlanTypeFilter).toBeUndefined();
		expect(useCompaniesStore.getState().listSearch).toBe("");
		expect(useCompaniesStore.getState().filterOptions).toBeNull();
		expect(useCompaniesStore.getState().filterOptionsLoading).toBe(false);
	});
});

describe("setters and clearListError", () => {
	beforeEach(() => {
		useCompaniesStore.getState().reset();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("setListPage updates listPage and sets listLoading true when page changes", () => {
		useCompaniesStore.getState().setListPage(3);
		expect(useCompaniesStore.getState().listPage).toBe(3);
		expect(useCompaniesStore.getState().listLoading).toBe(true);
	});

	it("setListPage does not set listLoading when page is unchanged", () => {
		useCompaniesStore.getState().reset();
		expect(useCompaniesStore.getState().listPage).toBe(1);
		expect(useCompaniesStore.getState().listLoading).toBe(false);
		useCompaniesStore.getState().setListPage(1);
		expect(useCompaniesStore.getState().listPage).toBe(1);
		expect(useCompaniesStore.getState().listLoading).toBe(false);
	});

	it("setListSort updates listSortBy and listSortOrder", () => {
		useCompaniesStore.getState().setListSort("legalName", "asc");
		expect(useCompaniesStore.getState().listSortBy).toBe("legalName");
		expect(useCompaniesStore.getState().listSortOrder).toBe("asc");
	});

	it("setListCreatedFilter updates listCreatedFilter", () => {
		useCompaniesStore.getState().setListCreatedFilter("last30Days");
		expect(useCompaniesStore.getState().listCreatedFilter).toBe("last30Days");
		useCompaniesStore.getState().setListCreatedFilter(undefined);
		expect(useCompaniesStore.getState().listCreatedFilter).toBeUndefined();
	});

	it("setListStatusFilter updates listStatusFilter", () => {
		useCompaniesStore.getState().setListStatusFilter("ACTIVE");
		expect(useCompaniesStore.getState().listStatusFilter).toBe("ACTIVE");
		useCompaniesStore.getState().setListStatusFilter(undefined);
		expect(useCompaniesStore.getState().listStatusFilter).toBeUndefined();
	});

	it("setListCorporationFilter updates listCorporationFilter", () => {
		useCompaniesStore.getState().setListCorporationFilter("corp-1");
		expect(useCompaniesStore.getState().listCorporationFilter).toBe("corp-1");
		useCompaniesStore.getState().setListCorporationFilter(undefined);
		expect(useCompaniesStore.getState().listCorporationFilter).toBeUndefined();
	});

	it("setListPlanFilter and setListPlanTypeFilter update state", () => {
		useCompaniesStore.getState().setListPlanFilter("plan-1");
		useCompaniesStore.getState().setListPlanTypeFilter("annual");
		expect(useCompaniesStore.getState().listPlanFilter).toBe("plan-1");
		expect(useCompaniesStore.getState().listPlanTypeFilter).toBe("annual");
	});

	it("setListSearch updates listSearch", () => {
		useCompaniesStore.getState().setListSearch("acme");
		expect(useCompaniesStore.getState().listSearch).toBe("acme");
	});

	it("clearListError sets listError to null", () => {
		useCompaniesStore.setState({ listError: "Something failed" });
		useCompaniesStore.getState().clearListError();
		expect(useCompaniesStore.getState().listError).toBeNull();
	});
});

describe("getCompanies (API)", () => {
	beforeEach(() => {
		mockGetCompanies.mockReset();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("is called with correct params by store fetchCompanies", async () => {
		mockGetCompanies.mockResolvedValue({
			ok: true,
			data: { items: [], total: 0, page: 1, limit: 10, totalPages: 0 },
		});

		await useCompaniesStore.getState().fetchCompanies(1, 5, {
			sortBy: "companyCode",
			sortOrder: "asc",
			search: "test",
		});

		expect(mockGetCompanies).toHaveBeenCalledWith({
			page: 1,
			limit: 5,
			sortBy: "companyCode",
			sortOrder: "asc",
			createdFilter: undefined,
			status: undefined,
			corporationId: undefined,
			planId: undefined,
			planTypeId: undefined,
			search: "test",
		});
	});
});

describe("getCompanyFilterOptions (API)", () => {
	beforeEach(() => {
		mockGetCompanyFilterOptions.mockReset();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("is called when store fetchFilterOptions runs", async () => {
		mockGetCompanyFilterOptions.mockResolvedValue({
			ok: true,
			data: mockFilterOptions,
		});

		await useCompaniesStore.getState().fetchFilterOptions();

		expect(mockGetCompanyFilterOptions).toHaveBeenCalled();
	});
});

describe("postKeyContacts (API)", () => {
	beforeEach(() => {
		mockPostKeyContacts.mockReset();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("POSTs key contacts payload for the given company id", async () => {
		mockPostKeyContacts.mockResolvedValue({
			ok: true,
			data: { success: true, message: "Saved" },
			status: 200,
		});

		const companyId = "0c7b291f-5c07-45a4-9457-4e9b6077c464";
		const result = await api.postKeyContacts(companyId, mockKeyContactsPayload);

		expect(mockPostKeyContacts).toHaveBeenCalledTimes(1);
		expect(mockPostKeyContacts).toHaveBeenCalledWith(
			companyId,
			mockKeyContactsPayload,
		);
		expect(result.ok).toBe(true);
	});
});

describe("submitKeyContacts (company directory store)", () => {
	beforeEach(() => {
		useCompanyDirectoryStore.getState().reset();
		mockPostKeyContacts.mockReset();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("sets companyActionLoading true then false, calls postKeyContacts, returns ok true on success", async () => {
		mockPostKeyContacts.mockResolvedValue({
			ok: true,
			data: { success: true, message: "Key contacts saved" },
			status: 200,
		});

		const companyId = "comp-id-1";
		const promise = useCompanyDirectoryStore
			.getState()
			.submitKeyContacts(companyId, mockKeyContactsPayload);

		expect(useCompanyDirectoryStore.getState().companyActionLoading).toBe(true);

		const result = await promise;

		expect(useCompanyDirectoryStore.getState().companyActionLoading).toBe(
			false,
		);
		expect(mockPostKeyContacts).toHaveBeenCalledWith(
			companyId,
			mockKeyContactsPayload,
		);
		expect(result).toEqual({ ok: true });
	});

	it("returns ok false and shows toast on API error", async () => {
		mockPostKeyContacts.mockResolvedValue({
			ok: false,
			message: "Bad request",
			status: 400,
		});

		const result = await useCompanyDirectoryStore
			.getState()
			.submitKeyContacts("comp-id-1", mockKeyContactsPayload);

		expect(useCompanyDirectoryStore.getState().companyActionLoading).toBe(
			false,
		);
		expect(result).toEqual({ ok: false, error: "Bad request" });
		const { toast } = await import("sonner");
		expect(toast.error).toHaveBeenCalledWith("Bad request");
	});
});

const planSeatsPayloadMonthly = {
	zeroTrial: true,
	trialStartDate: "",
	trialEndDate: "",
	planLevel: "tier-monthly",
	planPrice: 120,
	discount: 12,
	invoiceAmount: 108,
};

describe("PlanAndSeatsStep helpers — computeTrialEndDate", () => {
	it("returns empty string when start is empty", () => {
		expect(computeTrialEndDate("", 14)).toBe("");
	});

	it("returns empty string for invalid date input", () => {
		expect(computeTrialEndDate("not-a-date", 14)).toBe("");
	});

	it("uses inclusive trial length and returns MM-DD-YYYY", () => {
		expect(computeTrialEndDate("2024-01-01", 13)).toBe("01-13-2024");
	});
});

describe("PlanAndSeatsStep helpers — trialEndIsoFromStart", () => {
	it("returns trial end as YYYY-MM-DD (inclusive length)", () => {
		expect(trialEndIsoFromStart("2024-01-01", 14)).toBe("2024-01-14");
	});

	it("returns empty string when start is not a valid date", () => {
		expect(trialEndIsoFromStart("invalid", 14)).toBe("");
	});
});

describe("PlanAndSeatsStep helpers — normalizeTrialStartDate", () => {
	it("returns empty for null or undefined", () => {
		expect(normalizeTrialStartDate(null)).toBe("");
		expect(normalizeTrialStartDate(undefined)).toBe("");
	});

	it("trims and keeps first 10 characters for ISO datetimes", () => {
		expect(normalizeTrialStartDate("  2024-03-20T12:00:00.000Z  ")).toBe(
			"2024-03-20",
		);
	});
});

describe("PlanAndSeatsStep helpers — buildCompanyPlanSeatsPayload", () => {
	const baseInput = {
		activePlanTypeId: "monthly",
		zeroTrial: true,
		trialLengthDays: 14,
		trialStartDate: "",
		selectedPlanId: "tier-monthly",
		discount: "12",
		planPrice: 120,
		invoiceAmount: 108,
		oneTimePlanLevelId: "one-time-tier",
		oneTimePlanPrice: 499,
	};

	it("throws when recurring path has empty selectedPlanId", () => {
		expect(() =>
			buildCompanyPlanSeatsPayload({ ...baseInput, selectedPlanId: "" }),
		).toThrow("Plan level is required.");
	});

	it("monthly with zero trial clears trial dates and parses discount", () => {
		const result = buildCompanyPlanSeatsPayload(baseInput);
		expect(result).toEqual(planSeatsPayloadMonthly);
	});

	it("monthly with trial sets ISO trial range when start date is provided", () => {
		const result = buildCompanyPlanSeatsPayload({
			...baseInput,
			zeroTrial: false,
			trialStartDate: "2024-06-01",
			trialLengthDays: 14,
		});
		expect(result).toMatchObject({
			zeroTrial: false,
			trialStartDate: "2024-06-01",
			trialEndDate: "2024-06-14",
			planLevel: "tier-monthly",
			discount: 12,
		});
	});

	it("one_time uses one-time tier and price with zero discount in payload", () => {
		const result = buildCompanyPlanSeatsPayload({
			...baseInput,
			activePlanTypeId: "one_time",
			oneTimePlanLevelId: "one-time-tier",
			oneTimePlanPrice: 499,
		});
		expect(result).toEqual({
			zeroTrial: true,
			trialStartDate: "",
			trialEndDate: "",
			planLevel: "one-time-tier",
			planPrice: 499,
			discount: 0,
			invoiceAmount: 499,
		});
	});

	it("one_time throws when oneTimePlanLevelId is missing", () => {
		expect(() =>
			buildCompanyPlanSeatsPayload({
				...baseInput,
				activePlanTypeId: "one_time",
				oneTimePlanLevelId: "",
				oneTimePlanPrice: 100,
			}),
		).toThrow("Individual plan level is missing");
	});

	it("non-monthly plan type forces zeroTrial true and clears trial window", () => {
		const result = buildCompanyPlanSeatsPayload({
			...baseInput,
			activePlanTypeId: "annual",
			zeroTrial: false,
			trialStartDate: "2024-01-01",
		});
		expect(result.zeroTrial).toBe(true);
		expect(result.trialStartDate).toBe("");
		expect(result.trialEndDate).toBe("");
		expect(result.planLevel).toBe("tier-monthly");
	});
});

describe("PlanAndSeatsStep helpers — buildPlanSeatsPrefillFromCompanyDetail", () => {
	const pricingPlanTypes: PricingPlanType[] = [
		{
			id: "monthly",
			name: "Monthly",
			plans: [
				{
					id: "tier-monthly",
					planTypeId: "monthly",
					customerType: "company",
					employeeRangeMin: 1,
					employeeRangeMax: 50,
					price: 120,
					isCustomPricing: false,
				},
			],
		},
		{ id: "annual", name: "Annual", plans: [] },
	];

	const companyDetailBase: CompanyDetailData = {
		id: "comp-1",
		corporationId: "corp-1",
		companyCode: 1,
		legalName: "Acme",
		dbaName: "",
		website: "",
		phoneNo: "",
		companyType: "",
		officeType: "",
		industry: "",
		sameAsCorpAdmin: false,
		planId: "tier-monthly",
		securityPosture: "Standard",
		firstName: "",
		lastName: "",
		nickname: "",
		role: "",
		email: "",
		workPhone: "",
		cellPhone: "",
		addressLine: "",
		state: "",
		city: "",
		country: "",
		zip: "",
	};

	it("returns null when planSeat is missing", () => {
		expect(
			buildPlanSeatsPrefillFromCompanyDetail(
				{
					...companyDetailBase,
					plan: { id: "tier-monthly", planTypeId: "monthly" },
					planSeat: undefined,
				},
				pricingPlanTypes,
			),
		).toBeNull();
	});

	it("returns null when plan level id cannot be resolved", () => {
		expect(
			buildPlanSeatsPrefillFromCompanyDetail(
				{
					...companyDetailBase,
					planId: null,
					plan: null,
					planSeat: {
						id: "ps1",
						zeroTrial: true,
						trialStartDate: null,
						trialEndDate: null,
						planPrice: "0",
						discount: "",
						invoiceAmount: "0",
						billingCurrency: "usd",
					},
				},
				pricingPlanTypes,
			),
		).toBeNull();
	});

	it("builds form defaults and ref snapshot from plan + planSeat", () => {
		const prefill = buildPlanSeatsPrefillFromCompanyDetail(
			{
				...companyDetailBase,
				plan: { id: "tier-monthly", planTypeId: "monthly" },
				planSeat: {
					id: "ps1",
					zeroTrial: false,
					trialLengthDuration: 30,
					trialStartDate: "2024-05-01T00:00:00.000Z",
					trialEndDate: null,
					planPrice: "100",
					discount: "5",
					invoiceAmount: "95",
					billingCurrency: "usd",
				},
			},
			pricingPlanTypes,
		);
		expect(prefill).not.toBeNull();
		expect(prefill!.formValues.activePlanTypeId).toBe("monthly");
		expect(prefill!.formValues.selectedPlanId).toBe("tier-monthly");
		expect(prefill!.formValues.zeroTrial).toBe(false);
		expect(prefill!.formValues.trialLength).toBe("30");
		expect(prefill!.formValues.trialStartDate).toBe("2024-05-01");
		expect(prefill!.formValues.discount).toBe("5");
		expect(prefill!.refSnapshots.monthly).toEqual({
			selectedPlanId: "tier-monthly",
			discount: "5",
			hasPromoCode: false,
			promoCode: "",
		});
	});

	it("falls back to first pricing tab when planTypeId is unknown", () => {
		const prefill = buildPlanSeatsPrefillFromCompanyDetail(
			{
				...companyDetailBase,
				planId: "tier-monthly",
				plan: { id: "tier-monthly", planTypeId: "unknown-type" },
				planSeat: {
					id: "ps1",
					zeroTrial: true,
					trialStartDate: null,
					trialEndDate: null,
					planPrice: "0",
					discount: "",
					invoiceAmount: "0",
					billingCurrency: "usd",
				},
			},
			pricingPlanTypes,
		);
		expect(prefill?.formValues.activePlanTypeId).toBe("monthly");
	});
});

describe("submitPlanSeats (company directory store)", () => {
	beforeEach(() => {
		useCompanyDirectoryStore.getState().reset();
		mockPutCompanyPlanSeats.mockReset();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("sets companyActionLoading true then false and calls putCompanyPlanSeats on success", async () => {
		mockPutCompanyPlanSeats.mockResolvedValue({
			ok: true,
			data: { success: true, message: "OK" },
			status: 200,
		});

		const companyId = "company-uuid-1";
		const promise = useCompanyDirectoryStore
			.getState()
			.submitPlanSeats(companyId, planSeatsPayloadMonthly);

		expect(useCompanyDirectoryStore.getState().companyActionLoading).toBe(true);

		const result = await promise;

		expect(useCompanyDirectoryStore.getState().companyActionLoading).toBe(
			false,
		);
		expect(mockPutCompanyPlanSeats).toHaveBeenCalledWith(
			companyId,
			planSeatsPayloadMonthly,
		);
		expect(result).toEqual({ ok: true });
	});

	it("returns ok false and shows toast on API error", async () => {
		mockPutCompanyPlanSeats.mockResolvedValue({
			ok: false,
			message: "Plan seats failed",
			status: 422,
		});

		const result = await useCompanyDirectoryStore
			.getState()
			.submitPlanSeats("company-uuid-1", planSeatsPayloadMonthly);

		expect(useCompanyDirectoryStore.getState().companyActionLoading).toBe(
			false,
		);
		expect(result).toEqual({ ok: false, error: "Plan seats failed" });
		const { toast } = await import("sonner");
		expect(toast.error).toHaveBeenCalledWith("Plan seats failed");
	});
});
