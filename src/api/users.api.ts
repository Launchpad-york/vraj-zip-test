import { API_ENDPOINTS } from "@/const";
import { apiClient, isApiError } from "@/lib/apiClient";
import type {
	ListUsersParams,
	UserDirectoryListItem,
	UsersListApiData,
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
 * Fetch user directory list with pagination, sorting, and filters.
 * GET /users?page=&limit=&status=&categoryId=&corporationIds=&companyIds=&timezones=&sortBy=&sortOrder=&search=
 */
export async function getUsers(params: ListUsersParams) {
	const {
		page,
		limit,
		sortBy,
		sortOrder,
		status,
		categoryId,
		corporationIds,
		companyIds,
		timezones,
		search: searchQuery,
	} = params;
	const search = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});
	if (sortBy) search.set("sortBy", sortBy);
	if (sortOrder) search.set("sortOrder", sortOrder);
	if (status?.trim()) search.set("status", status.trim().toLowerCase());
	if (categoryId?.trim()) search.set("categoryId", categoryId.trim());
	appendCsvParam(search, "corporationIds", corporationIds);
	appendCsvParam(search, "companyIds", companyIds);
	appendCsvParam(search, "timezones", timezones);
	if (searchQuery?.trim()) search.set("search", searchQuery.trim());
	const url = `${API_ENDPOINTS.users.root}?${search.toString()}`;
	const result = await apiClient.get<{
		success: boolean;
		message: string;
		data: UsersListApiData;
	}>(url);
	if (isApiError(result)) return result;
	const data = result.data?.data;
	if (!data)
		return { ok: false as const, message: "Invalid response", status: 0 };
	const items: UserDirectoryListItem[] = data.items.map((item) => ({
		...item,
		id: item.cognitoSub,
	}));
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
