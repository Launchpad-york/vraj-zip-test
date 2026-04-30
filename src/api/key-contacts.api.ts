import { API_ENDPOINTS } from "@/const";
import { apiClient, isApiError } from "@/lib/apiClient";
import type {
	ContactDirectoryItem,
	KeyContactsListApiData,
	ListKeyContactsParams,
} from "@/types";

function appendCsvParam(
	search: URLSearchParams,
	key: string,
	values: string[] | undefined,
) {
	if (values && values.length > 0) {
		search.set(key, values.join(","));
	}
}

/**
 * Paginated key contacts (directory contacts tab).
 * GET /key-contacts?page=&limit=&search=&contactType=&corporationIds=&companyIds=&timezones=&sortBy=&sortOrder=
 */
export async function getKeyContacts(params: ListKeyContactsParams) {
	const {
		page,
		limit,
		sortBy,
		sortOrder,
		search: searchQuery,
		contactType,
		corporationIds,
		companyIds,
		timezones,
	} = params;
	const search = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});
	if (sortBy) search.set("sortBy", sortBy);
	if (sortOrder) search.set("sortOrder", sortOrder);
	if (searchQuery?.trim()) search.set("search", searchQuery.trim());
	if (contactType?.trim()) search.set("contactType", contactType.trim());
	appendCsvParam(search, "corporationIds", corporationIds);
	appendCsvParam(search, "companyIds", companyIds);
	appendCsvParam(search, "timezones", timezones);
	const url = `${API_ENDPOINTS.keyContacts.root}?${search.toString()}`;
	const result = await apiClient.get<{
		success: boolean;
		message: string;
		data: KeyContactsListApiData;
	}>(url);
	if (isApiError(result)) return result;
	const data = result.data?.data;
	if (!data)
		return { ok: false as const, message: "Invalid response", status: 0 };
	const items: ContactDirectoryItem[] = data.items;
	return {
		ok: true as const,
		data: {
			items,
			total: data.pagination.total,
			page: data.pagination.page,
			limit: data.pagination.pageSize,
			totalPages: data.pagination.totalPages,
		},
	};
}
