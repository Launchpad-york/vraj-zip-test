import { API_ENDPOINTS } from "@/const";
import { apiClient, isApiError } from "@/lib/apiClient";
import type { PricingPlanType } from "@/types/common/pricing.types";

/**
 * Fetch pricing plans (Plan and Plan Level dropdowns).
 * GET /pricing/plans (with auth)
 */
export async function getPricingPlans() {
	const result = await apiClient.get<{
		success: boolean;
		message: string;
		data: PricingPlanType[];
	}>(API_ENDPOINTS.pricing.plans);
	if (isApiError(result)) return result;
	const data = result.data?.data;
	if (!data)
		return { ok: false as const, message: "Invalid response", status: 0 };
	return { ok: true as const, data };
}
