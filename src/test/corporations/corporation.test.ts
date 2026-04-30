import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "@/api";
import { useCorporationsStore } from "@/store";
import type {
	CompanyListItem,
	CorporationCreated,
	CorporationDetail,
	CorporationDetailCompany,
	CorporationStepsUpdated,
	CreateCompanyBody,
	CreateCorporationBody,
} from "@/types";

vi.mock("sonner", () => ({
	toast: { error: vi.fn() },
}));

vi.mock("@/api", () => ({
	createCompany: vi.fn(),
	createCorporation: vi.fn(),
	getCorporationById: vi.fn(),
	getCorporationCompanies: vi.fn(),
	getCorporations: vi.fn(),
	submitCorporationStep: vi.fn(),
	updateCompany: vi.fn(),
	updateCorporation: vi.fn(),
}));

const mockSubmitCorporationStep = vi.mocked(api.submitCorporationStep);
const mockCreateCompany = vi.mocked(api.createCompany);
const mockCreateCorporation = vi.mocked(api.createCorporation);
const mockGetCorporationById = vi.mocked(api.getCorporationById);
const mockGetCorporationCompanies = vi.mocked(api.getCorporationCompanies);
const mockGetCorporations = vi.mocked(api.getCorporations);
const mockUpdateCompany = vi.mocked(api.updateCompany);
const mockUpdateCorporation = vi.mocked(api.updateCorporation);

describe("submitStep", () => {
	beforeEach(() => {
		useCorporationsStore.getState().reset();
		mockSubmitCorporationStep.mockReset();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("returns error when corporationId is missing", async () => {
		const result = await useCorporationsStore
			.getState()
			.submitStep("confirmation");
		expect(result).toEqual({ ok: false, error: "Corporation ID is missing." });
		expect(mockSubmitCorporationStep).not.toHaveBeenCalled();
	});

	it("calls API with type and returns success when API succeeds", async () => {
		useCorporationsStore.setState({ corporationId: "corp-1" });
		mockSubmitCorporationStep.mockResolvedValue({
			ok: true,
			data: {
				success: true,
				message: "ok",
				data: {} as CorporationStepsUpdated,
			},
			status: 200,
		});

		const result = await useCorporationsStore.getState().submitStep("company");

		expect(mockSubmitCorporationStep).toHaveBeenCalledWith("corp-1", "company");
		expect(result).toEqual({ ok: true });
		expect(useCorporationsStore.getState().isLoading).toBe(false);
		expect(useCorporationsStore.getState().error).toBeNull();
	});

	it("returns error and sets state when API returns error", async () => {
		useCorporationsStore.setState({ corporationId: "corp-1" });
		mockSubmitCorporationStep.mockResolvedValue({
			ok: false,
			message: "Server error",
			status: 500,
		});

		const result = await useCorporationsStore
			.getState()
			.submitStep("confirmation");

		expect(result).toEqual({ ok: false, error: "Server error" });
		expect(useCorporationsStore.getState().isLoading).toBe(false);
		expect(useCorporationsStore.getState().error).toBe("Server error");
	});
});

describe("fetchCorporations", () => {
	beforeEach(() => {
		useCorporationsStore.getState().reset();
		mockGetCorporations.mockReset();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("sets listItems, listTotal, listPage and clears listError on success", async () => {
		const items = [
			{
				id: "1",
				corpId: "100",
				name: "Corp A",
				region: "US",
				status: "active" as const,
				corporationAdmin: { name: "J", email: "j@x.com" },
				companies: 1,
				createdOn: "2025-01-01",
			},
		];
		mockGetCorporations.mockResolvedValue({
			ok: true,
			data: {
				items,
				total: 1,
				page: 1,
				limit: 10,
				totalPages: 1,
			},
		});

		await useCorporationsStore.getState().fetchCorporations(1, 10);

		expect(mockGetCorporations).toHaveBeenCalledWith({
			page: 1,
			limit: 10,
			sortBy: "createdAt",
			sortOrder: "desc",
			createdFilter: undefined,
			status: undefined,
		});
		expect(useCorporationsStore.getState().listLoading).toBe(false);
		expect(useCorporationsStore.getState().listItems).toEqual(items);
		expect(useCorporationsStore.getState().listTotal).toBe(1);
		expect(useCorporationsStore.getState().listPage).toBe(1);
		expect(useCorporationsStore.getState().listError).toBeNull();
	});

	it("sets listError and does not update list when API fails", async () => {
		mockGetCorporations.mockResolvedValue({
			ok: false,
			message: "Network error",
			status: 0,
		});

		await useCorporationsStore.getState().fetchCorporations(1, 10);

		expect(useCorporationsStore.getState().listLoading).toBe(false);
		expect(useCorporationsStore.getState().listError).toBe("Network error");
		expect(useCorporationsStore.getState().listItems).toEqual([]);
	});
});

describe("createCorporation", () => {
	beforeEach(() => {
		useCorporationsStore.getState().reset();
		mockCreateCorporation.mockReset();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("sets loading, calls API with body, and on success sets corporationId and returns id", async () => {
		const body = {
			legalName: "Acme Corp",
			dbaName: "Acme",
			website: "https://acme.com",
			dataResidencyRegion: "US",
			industry: "Tech",
			phoneNo: "+1234567890",
		} as CreateCorporationBody;
		mockCreateCorporation.mockResolvedValue({
			ok: true,
			data: {
				success: true,
				message: "Created",
				data: { id: "corp-new-1", ...body } as unknown as CorporationCreated,
			},
			status: 201,
		});

		const result = await useCorporationsStore
			.getState()
			.createCorporation(body);

		expect(mockCreateCorporation).toHaveBeenCalledWith(body);
		expect(result).toEqual({ ok: true, id: "corp-new-1" });
		expect(useCorporationsStore.getState().corporationId).toBe("corp-new-1");
		expect(useCorporationsStore.getState().isLoading).toBe(false);
		expect(useCorporationsStore.getState().error).toBeNull();
	});

	it("returns error and sets state when API returns error", async () => {
		const body = {
			legalName: "Acme",
			dbaName: "Acme",
			website: "",
			dataResidencyRegion: "US",
			industry: "Tech",
			phoneNo: "",
		} as CreateCorporationBody;
		mockCreateCorporation.mockResolvedValue({
			ok: false,
			message: "Validation failed",
			status: 400,
		});

		const result = await useCorporationsStore
			.getState()
			.createCorporation(body);

		expect(result).toEqual({ ok: false, error: "Validation failed" });
		expect(useCorporationsStore.getState().isLoading).toBe(false);
		expect(useCorporationsStore.getState().error).toBe("Validation failed");
		expect(useCorporationsStore.getState().corporationId).toBeNull();
	});

	it("returns error when API success response has no id", async () => {
		const body = {
			legalName: "Acme",
			dbaName: "Acme",
			website: "",
			dataResidencyRegion: "US",
			industry: "Tech",
			phoneNo: "",
		} as CreateCorporationBody;
		mockCreateCorporation.mockResolvedValue({
			ok: true,
			data: {
				success: true,
				message: "Created",
				data: {} as CorporationCreated,
			},
			status: 201,
		});

		const result = await useCorporationsStore
			.getState()
			.createCorporation(body);

		expect(result).toEqual({ ok: false, error: "Invalid response" });
		expect(useCorporationsStore.getState().isLoading).toBe(false);
		expect(useCorporationsStore.getState().error).toBe("Invalid response");
	});
});

describe("createCompany", () => {
	beforeEach(() => {
		useCorporationsStore.getState().reset();
		mockCreateCompany.mockReset();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("returns error when corporationId is missing", async () => {
		const body = {
			legalName: "Acme Co",
			companyType: "LLC",
			officeType: "HQ",
			sameAsCorpAdmin: false,
			planTypeId: "",
			planId: "plan-1",
			firstName: "Admin",
			lastName: "User",
			nickname: "",
			role: "Manager",
			email: "a@b.com",
			workPhone: "+15551234567",
			addressLine: "123 Main St",
			state: "CA",
			city: "LA",
			country: "US",
			zip: "90001",
			securityPosture: "High",
		} as CreateCompanyBody;
		const result = await useCorporationsStore.getState().createCompany(body);

		expect(result).toEqual({ ok: false, error: "Corporation ID is missing." });
		expect(mockCreateCompany).not.toHaveBeenCalled();
	});

	it("calls API with corporationId and body, clears loading and error on success", async () => {
		useCorporationsStore.setState({ corporationId: "corp-1" });
		const body = {
			legalName: "Acme Co",
			companyType: "LLC",
			officeType: "HQ",
			sameAsCorpAdmin: false,
			planTypeId: "",
			planId: "plan-1",
			firstName: "Admin",
			lastName: "User",
			nickname: "",
			role: "Manager",
			email: "a@b.com",
			workPhone: "+15551234567",
			addressLine: "123 Main St",
			state: "CA",
			city: "LA",
			country: "US",
			zip: "90001",
			securityPosture: "High",
		} as CreateCompanyBody;
		mockCreateCompany.mockResolvedValue({
			ok: true,
			data: { success: true, message: "Created", data: { id: "company-1" } },
			status: 201,
		});
		mockGetCorporationById.mockResolvedValue({
			ok: true,
			data: {
				id: "corp-1",
				corporationCode: 1,
				legalName: "Corp",
				dbaName: "",
				website: "",
				dataResidencyRegion: "",
				industry: "",
				phoneNo: "",
				brandLogo: null,
				status: "active",
				mode: "quick",
				submittedSteps: 0,
				createdAt: "",
				updatedAt: "",
				companies: [],
			},
			status: 200,
		} as Awaited<ReturnType<typeof api.getCorporationById>>);

		const result = await useCorporationsStore.getState().createCompany(body);

		expect(mockCreateCompany).toHaveBeenCalledWith("corp-1", body);
		expect(result).toEqual({ ok: true });
		expect(useCorporationsStore.getState().isLoading).toBe(false);
		expect(useCorporationsStore.getState().error).toBeNull();
	});

	it("returns error and sets state when API fails", async () => {
		useCorporationsStore.setState({ corporationId: "corp-1" });
		const body = {
			legalName: "Acme Co",
			companyType: "LLC",
			officeType: "HQ",
			sameAsCorpAdmin: false,
			planTypeId: "",
			planId: "plan-1",
			firstName: "Admin",
			lastName: "User",
			nickname: "",
			role: "Manager",
			email: "a@b.com",
			workPhone: "+15551234567",
			addressLine: "123 Main St",
			state: "CA",
			city: "LA",
			country: "US",
			zip: "90001",
			securityPosture: "High",
		} as CreateCompanyBody;
		mockCreateCompany.mockResolvedValue({
			ok: false,
			message: "Conflict",
			status: 409,
		});

		const result = await useCorporationsStore.getState().createCompany(body);

		expect(result).toEqual({ ok: false, error: "Conflict" });
		expect(useCorporationsStore.getState().isLoading).toBe(false);
		expect(useCorporationsStore.getState().error).toBe("Conflict");
	});
});

describe("updateCorporation", () => {
	beforeEach(() => {
		useCorporationsStore.getState().reset();
		mockUpdateCorporation.mockReset();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("calls API and on success updates corporationDetail and returns ok", async () => {
		const corporationId = "corp-1";
		const body = { legalName: "Updated Corp" };
		const updatedDetail: CorporationDetail = {
			id: corporationId,
			legalName: "Updated Corp",
			corporationCode: 1,
			dbaName: "",
			website: "",
			dataResidencyRegion: "",
			industry: "",
			phoneNo: "",
			brandLogo: null,
			status: "active",
			mode: "quick",
			submittedSteps: 0,
			createdAt: "",
			updatedAt: "",
		};
		mockUpdateCorporation.mockResolvedValue({
			ok: true,
			data: { success: true, message: "Updated", data: updatedDetail },
			status: 200,
		});

		const result = await useCorporationsStore
			.getState()
			.updateCorporation(corporationId, body);

		expect(mockUpdateCorporation).toHaveBeenCalledWith(corporationId, body);
		expect(result).toEqual({ ok: true });
		expect(useCorporationsStore.getState().corporationDetail).toEqual(
			updatedDetail,
		);
		expect(useCorporationsStore.getState().isLoading).toBe(false);
		expect(useCorporationsStore.getState().error).toBeNull();
	});

	it("returns ok without setting corporationDetail when API returns no data", async () => {
		const corporationId = "corp-1";
		const body = { legalName: "Updated" };
		mockUpdateCorporation.mockResolvedValue({
			ok: true,
			data: { success: true, message: "Updated", data: undefined },
			status: 200,
		} as unknown as Awaited<ReturnType<typeof api.updateCorporation>>);

		const result = await useCorporationsStore
			.getState()
			.updateCorporation(corporationId, body);

		expect(result).toEqual({ ok: true });
		expect(useCorporationsStore.getState().corporationDetail).toBeNull();
		expect(useCorporationsStore.getState().isLoading).toBe(false);
	});

	it("returns error and sets state when API fails", async () => {
		const corporationId = "corp-1";
		const body = { legalName: "Updated" };
		mockUpdateCorporation.mockResolvedValue({
			ok: false,
			message: "Not found",
			status: 404,
		});

		const result = await useCorporationsStore
			.getState()
			.updateCorporation(corporationId, body);

		expect(result).toEqual({ ok: false, error: "Not found" });
		expect(useCorporationsStore.getState().isLoading).toBe(false);
		expect(useCorporationsStore.getState().error).toBe("Not found");
	});
});

describe("updateCompany", () => {
	beforeEach(() => {
		useCorporationsStore.getState().reset();
		mockUpdateCompany.mockReset();
		mockGetCorporationById.mockReset();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("calls API and on success refetches corporation by id then returns ok", async () => {
		const corporationId = "corp-1";
		const companyId = "company-1";
		const body = { legalName: "Updated Company" };
		const corporationDetail: CorporationDetail = {
			id: corporationId,
			corporationCode: 1,
			legalName: "Corp",
			dbaName: "",
			website: "",
			dataResidencyRegion: "",
			industry: "",
			phoneNo: "",
			brandLogo: null,
			status: "active",
			mode: "quick",
			submittedSteps: 0,
			createdAt: "",
			updatedAt: "",
			companies: [],
		};
		mockUpdateCompany.mockResolvedValue({
			ok: true,
			data: {
				success: true,
				message: "Updated",
				data: { id: companyId } as CorporationDetailCompany,
			},
			status: 200,
		});
		mockGetCorporationById.mockResolvedValue({
			ok: true,
			data: corporationDetail,
			status: 200,
		} as Awaited<ReturnType<typeof api.getCorporationById>>);

		const result = await useCorporationsStore
			.getState()
			.updateCompany(corporationId, companyId, body);

		expect(mockUpdateCompany).toHaveBeenCalledWith(
			corporationId,
			companyId,
			body,
		);
		expect(mockGetCorporationById).toHaveBeenCalledWith(corporationId);
		expect(result).toEqual({ ok: true });
		expect(useCorporationsStore.getState().isLoading).toBe(false);
		expect(useCorporationsStore.getState().error).toBeNull();
	});

	it("returns error and sets state when API fails", async () => {
		const corporationId = "corp-1";
		const companyId = "company-1";
		const body = { legalName: "Updated" };
		mockUpdateCompany.mockResolvedValue({
			ok: false,
			message: "Not found",
			status: 404,
		});

		const result = await useCorporationsStore
			.getState()
			.updateCompany(corporationId, companyId, body);

		expect(result).toEqual({ ok: false, error: "Not found" });
		expect(mockGetCorporationById).not.toHaveBeenCalled();
		expect(useCorporationsStore.getState().isLoading).toBe(false);
		expect(useCorporationsStore.getState().error).toBe("Not found");
	});
});

describe("getCorporationCompanies", () => {
	beforeEach(() => {
		mockGetCorporationCompanies.mockReset();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("calls API with corporationId and returns items on success", async () => {
		const corporationId = "corp-123";
		const items: CompanyListItem[] = [
			{
				id: "company-1",
				corporationId,
				companyCode: 1,
				legalName: "Acme Co",
				companyType: "Operating Company",
				officeType: "HQ",
				firstName: "Jane",
				lastName: "Doe",
				nickname: null,
				role: "Admin",
				email: "jane@acme.com",
				workPhone: null,
				cellPhone: null,
				addressLine: null,
				state: null,
				city: null,
				country: "US",
				zip: null,
				region: "North America",
				industry: null,
				planName: "BSP Assessment (Annual)",
				plan: {
					id: "plan-1",
					planTypeId: "annual",
					employeeRangeMin: 25,
					employeeRangeMax: 50,
				},
			},
		];
		mockGetCorporationCompanies.mockResolvedValue({
			ok: true,
			data: { items },
		});

		const result = await api.getCorporationCompanies(corporationId);

		expect(mockGetCorporationCompanies).toHaveBeenCalledWith(corporationId);
		expect(result).toEqual({ ok: true, data: { items } });
	});

	it("calls API with corporationId and params when provided", async () => {
		const corporationId = "corp-456";
		const params = {
			search: "acme",
			companyType: "Operating Company",
			region: "North America",
			planTypeId: "annual",
		};
		mockGetCorporationCompanies.mockResolvedValue({
			ok: true,
			data: { items: [] },
		});

		const result = await api.getCorporationCompanies(corporationId, params);

		expect(mockGetCorporationCompanies).toHaveBeenCalledWith(
			corporationId,
			params,
		);
		expect(result).toEqual({ ok: true, data: { items: [] } });
	});

	it("returns API error when API fails", async () => {
		const corporationId = "corp-789";
		mockGetCorporationCompanies.mockResolvedValue({
			ok: false,
			message: "Forbidden",
			status: 403,
		});

		const result = await api.getCorporationCompanies(corporationId);

		expect(mockGetCorporationCompanies).toHaveBeenCalledWith(corporationId);
		expect(result).toEqual({
			ok: false,
			message: "Forbidden",
			status: 403,
		});
	});
});
