import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockAxiosGet = vi.fn();

vi.mock("@/lib/apiClient", async (importOriginal) => {
	const mod = await importOriginal<typeof import("@/lib/apiClient")>();
	return {
		...mod,
		axiosInstance: {
			...mod.axiosInstance,
			get: mockAxiosGet,
		},
	};
});

describe("finance.api", () => {
	beforeEach(() => {
		mockAxiosGet.mockReset();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("fetchInvoicePdfBlob", () => {
		it("returns ok with blob when response is application/pdf", async () => {
			const blob = new Blob(["%PDF-1.1"], { type: "application/pdf" });
			mockAxiosGet.mockResolvedValue({
				data: blob,
				headers: { "content-type": "application/pdf" },
				status: 200,
			});

			const { fetchInvoicePdfBlob } = await import("@/api/finance.api");
			const result = await fetchInvoicePdfBlob("in_123");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.blob).toBe(blob);
			}
			expect(mockAxiosGet).toHaveBeenCalledWith(
				expect.stringContaining("/finance/invoices/in_123/pdf"),
				expect.objectContaining({ responseType: "blob" }),
			);
		});

		it("returns error when 200 body is JSON (error envelope)", async () => {
			const jsonBlob = new Blob([JSON.stringify({ message: "Not found" })], {
				type: "application/json",
			});
			mockAxiosGet.mockResolvedValue({
				data: jsonBlob,
				headers: { "content-type": "application/json" },
				status: 200,
			});

			const { fetchInvoicePdfBlob } = await import("@/api/finance.api");
			const result = await fetchInvoicePdfBlob("in_missing");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.message).toBe("Not found");
			}
		});

		it("parses JSON error from failed blob response", async () => {
			const errBlob = new Blob([JSON.stringify({ message: "Forbidden" })], {
				type: "application/json",
			});
			mockAxiosGet.mockRejectedValue({
				isAxiosError: true,
				response: {
					status: 403,
					data: errBlob,
				},
				message: "Request failed",
			});

			const { fetchInvoicePdfBlob } = await import("@/api/finance.api");
			const result = await fetchInvoicePdfBlob("in_x");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.message).toBe("Forbidden");
				expect(result.status).toBe(403);
			}
		});
	});

	describe("downloadInvoicePdfBlob", () => {
		it("creates object URL, triggers download with sanitized filename, revokes URL", async () => {
			const createObjectURL = vi
				.spyOn(URL, "createObjectURL")
				.mockReturnValue("blob:mock-url");
			const revokeObjectURL = vi
				.spyOn(URL, "revokeObjectURL")
				.mockImplementation(() => {});

			const click = vi.fn();
			const anchor = {
				href: "",
				download: "",
				rel: "",
				click,
			};
			vi.stubGlobal("document", {
				createElement: (tag: string) => {
					if (tag === "a") return anchor as unknown as HTMLAnchorElement;
					throw new Error(`unexpected tag: ${tag}`);
				},
			} as unknown as Document);

			const { downloadInvoicePdfBlob } = await import("@/api/finance.api");
			const blob = new Blob(["x"], { type: "application/pdf" });
			downloadInvoicePdfBlob(blob, "INV-2026/001");

			expect(createObjectURL).toHaveBeenCalledWith(blob);
			expect(anchor.download).toBe("invoice-INV-2026_001.pdf");
			expect(click).toHaveBeenCalled();
			expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");

			vi.unstubAllGlobals();
			createObjectURL.mockRestore();
			revokeObjectURL.mockRestore();
		});
	});
});
