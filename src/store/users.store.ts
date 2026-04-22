import { toast } from "sonner";
import { create } from "zustand";
import { getUsers as getUsersApi } from "@/api/users.api";
import type { UsersStore } from "@/types";

const emptyMoreFilters = {
	corporationIds: [] as string[],
	companyIds: [] as string[],
	timeZones: [] as string[],
};

const initialState = {
	listItems: [] as UsersStore["listItems"],
	listTotal: 0,
	listPage: 1,
	listLoading: false,
	listError: null as string | null,
	listSortBy: "createdAt" as UsersStore["listSortBy"],
	listSortOrder: "desc" as UsersStore["listSortOrder"],
	listStatusFilter: undefined as UsersStore["listStatusFilter"],
	listCategoryIdFilter: undefined as UsersStore["listCategoryIdFilter"],
	listSearch: "",
	moreFilters: { ...emptyMoreFilters },
};

export const useUsersStore = create<UsersStore>()((set, get) => ({
	...initialState,

	fetchUsers: async (
		page: number,
		limit: number,
		params?: {
			sortBy?: UsersStore["listSortBy"];
			sortOrder?: UsersStore["listSortOrder"];
			status?: string;
			categoryId?: string;
			corporationIds?: string[];
			companyIds?: string[];
			timezones?: string[];
			search?: string;
		},
	) => {
		const {
			listSortBy,
			listSortOrder,
			listStatusFilter,
			listCategoryIdFilter,
			moreFilters,
		} = get();
		const sortBy = params?.sortBy ?? listSortBy;
		const sortOrder = params?.sortOrder ?? listSortOrder;
		const status = params?.status ?? listStatusFilter;
		const categoryId = params?.categoryId ?? listCategoryIdFilter;
		const corporationIds = params?.corporationIds ?? moreFilters.corporationIds;
		const companyIds = params?.companyIds ?? moreFilters.companyIds;
		const timezones = params?.timezones ?? moreFilters.timeZones;
		const search = params?.search;
		set({ listLoading: true, listError: null });
		const result = await getUsersApi({
			page,
			limit,
			sortBy,
			sortOrder,
			status: status?.trim() ? status.trim().toLowerCase() : undefined,
			categoryId: categoryId?.trim() || undefined,
			corporationIds: corporationIds.length > 0 ? corporationIds : undefined,
			companyIds: companyIds.length > 0 ? companyIds : undefined,
			timezones: timezones.length > 0 ? timezones : undefined,
			search,
		});
		set({ listLoading: false });
		if (!result.ok) {
			set({ listError: result.message });
			toast.error(result.message);
			return;
		}
		if (result.data) {
			set({
				listItems: result.data.items,
				listTotal: result.data.total,
				listPage: result.data.page,
				listError: null,
			});
		}
	},

	setListPage: (page: number) => set({ listPage: page, listLoading: true }),

	setListSort: (sortBy, sortOrder) =>
		set({ listSortBy: sortBy, listSortOrder: sortOrder }),

	setListStatusFilter: (status) => set({ listStatusFilter: status }),

	setListCategoryIdFilter: (categoryId) =>
		set({ listCategoryIdFilter: categoryId }),

	setListSearch: (search) => set({ listSearch: search }),

	setMoreFilters: (filters) => set({ moreFilters: filters }),

	clearListError: () => set({ listError: null }),

	reset: () => set(initialState),
}));
