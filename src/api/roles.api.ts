import { API_ENDPOINTS } from "@/const";
import { apiClient, isApiError } from "@/lib/apiClient";
import type {
	ListRolesParams,
	ModuleWithPermissions,
	RoleCategoryOption,
	RoleDetailResponse,
	RoleFormPayload,
	RoleListData,
	RoleListItem,
} from "@/types";

/** Normalize permissions to { add, update, view, remove } in case API shape differs */
function normalizeModulePermissions(
	permissions:
		| ModuleWithPermissions["permissions"]
		| Array<{ id: string; action: string }>,
): ModuleWithPermissions["permissions"] {
	if (Array.isArray(permissions)) {
		const out: ModuleWithPermissions["permissions"] = {
			add: null,
			update: null,
			view: null,
			remove: null,
		};
		for (const p of permissions) {
			const action = String(p.action).toUpperCase();
			if (action === "ADD") out.add = p.id;
			else if (action === "UPDATE") out.update = p.id;
			else if (action === "VIEW") out.view = p.id;
			else if (action === "REMOVE") out.remove = p.id;
		}
		return out;
	}
	return permissions;
}

export async function getModulesWithPermissions() {
	const result = await apiClient.get<{
		success: boolean;
		message: string;
		data:
			| ModuleWithPermissions[]
			| Array<{
					id: string;
					name: string;
					permissions:
						| ModuleWithPermissions["permissions"]
						| Array<{ id: string; action: string }>;
			  }>;
	}>(API_ENDPOINTS.permissions.modulesWithPermissions);
	if (isApiError(result)) return result;
	const raw = result.data?.data;
	if (!raw || !Array.isArray(raw))
		return { ok: false as const, message: "Invalid response", status: 0 };
	const data: ModuleWithPermissions[] = raw.map((m) => ({
		id: m.id,
		name: m.name,
		permissions: normalizeModulePermissions(m.permissions),
	}));
	return { ok: true as const, data };
}

export async function getRoleById(roleId: string) {
	const result = await apiClient.get<{
		success: boolean;
		message: string;
		data: RoleDetailResponse;
	}>(API_ENDPOINTS.roles.byId(roleId));
	if (isApiError(result)) return result;
	const data = result.data?.data;
	if (!data)
		return { ok: false as const, message: "Invalid response", status: 0 };
	return { ok: true as const, data };
}

export async function createRole(payload: RoleFormPayload) {
	const result = await apiClient.post<{
		success: boolean;
		message: string;
		data: RoleListItem;
	}>(API_ENDPOINTS.roles.root, payload);
	if (isApiError(result)) return result;
	const data = result.data?.data;
	if (!data)
		return { ok: false as const, message: "Invalid response", status: 0 };
	return { ok: true as const, data };
}

export async function updateRole(roleId: string, payload: RoleFormPayload) {
	const result = await apiClient.patch<{
		success: boolean;
		message: string;
		data: RoleListItem;
	}>(API_ENDPOINTS.roles.byId(roleId), payload);
	if (isApiError(result)) return result;
	const data = result.data?.data;
	if (!data)
		return { ok: false as const, message: "Invalid response", status: 0 };
	return { ok: true as const, data };
}

export async function deleteRole(roleId: string) {
	const result = await apiClient.delete<{
		success: boolean;
		message: string;
		data: { id: string };
	}>(API_ENDPOINTS.roles.byId(roleId));
	if (isApiError(result)) return result;
	const data = result.data?.data;
	if (!data)
		return { ok: false as const, message: "Invalid response", status: 0 };
	return { ok: true as const, data };
}

export async function getRoles(params: ListRolesParams) {
	const { page, limit, sortBy, sortOrder, search, categoryId } = params;
	const searchParams = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});
	if (sortBy) searchParams.set("sortBy", sortBy);
	if (sortOrder) searchParams.set("sortOrder", sortOrder);
	if (search?.trim()) searchParams.set("search", search.trim());
	if (categoryId?.trim()) searchParams.set("categoryId", categoryId.trim());
	const url = `${API_ENDPOINTS.roles.root}?${searchParams.toString()}`;
	const result = await apiClient.get<{
		success: boolean;
		message: string;
		data: RoleListData;
	}>(url);
	if (isApiError(result)) return result;
	const data = result.data?.data;
	if (!data)
		return { ok: false as const, message: "Invalid response", status: 0 };
	return {
		ok: true as const,
		data: {
			items: data.items as RoleListItem[],
			total: data.total,
			page: data.page,
			limit: data.limit,
			totalPages: data.totalPages,
		},
	};
}

export async function getRoleCategories() {
	const result = await apiClient.get<{
		success: boolean;
		message: string;
		data: RoleCategoryOption[];
	}>(API_ENDPOINTS.roles.categories);
	if (isApiError(result)) return result;
	const data = result.data?.data;
	if (!data)
		return { ok: false as const, message: "Invalid response", status: 0 };
	return { ok: true as const, data };
}
