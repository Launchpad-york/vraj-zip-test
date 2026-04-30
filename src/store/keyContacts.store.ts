import { toast } from "sonner";
import { create } from "zustand";
import { getKeyContacts as getKeyContactsApi } from "@/api";
import type { KeyContactsStore } from "@/types";

const emptyMoreFilters = {
	corporationIds: [] as string[],
	companyIds: [] as string[],
	timeZones: [] as string[],
};

const initialState = {
	listItems: [] as KeyContactsStore["listItems"],
	listTotal: 0,
	listPage: 1,
	listLoading: false,
	listError: null as string | null,
	listSortBy: "contactCode" as KeyContactsStore["listSortBy"],
	listSortOrder: "asc" as KeyContactsStore["listSortOrder"],
	listSearch: "",
	listContactTypeFilter: undefined as KeyContactsStore["listContactTypeFilter"],
	moreFilters: { ...emptyMoreFilters },
};

export const useKeyContactsStore = create<KeyContactsStore>()((set, get) => ({
	...initialState,

	fetchKeyContacts: async (
		page: number,
		limit: number,
		params?: {
			sortBy?: KeyContactsStore["listSortBy"];
			sortOrder?: KeyContactsStore["listSortOrder"];
			search?: string;
			contactType?: string;
			corporationIds?: string[];
			companyIds?: string[];
			timezones?: string[];
		},
	) => {
		const {
			listSortBy,
			listSortOrder,
			listSearch,
			listContactTypeFilter,
			moreFilters,
		} = get();
		const sortBy = params?.sortBy ?? listSortBy;
		const sortOrder = params?.sortOrder ?? listSortOrder;
		const search = params?.search ?? listSearch;
		const contactType = params?.contactType ?? listContactTypeFilter;
		const corporationIds = params?.corporationIds ?? moreFilters.corporationIds;
		const companyIds = params?.companyIds ?? moreFilters.companyIds;
		const timezones = params?.timezones ?? moreFilters.timeZones;
		set({ listLoading: true, listError: null });
		const result = await getKeyContactsApi({
			page,
			limit,
			sortBy,
			sortOrder,
			search: search?.trim() ? search.trim() : undefined,
			contactType: contactType?.trim() || undefined,
			corporationIds: corporationIds.length > 0 ? corporationIds : undefined,
			companyIds: companyIds.length > 0 ? companyIds : undefined,
			timezones: timezones.length > 0 ? timezones : undefined,
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

	setListSearch: (search) => set({ listSearch: search }),

	setListContactTypeFilter: (contactType) =>
		set({ listContactTypeFilter: contactType }),

	setMoreFilters: (filters) => set({ moreFilters: filters }),

	clearListError: () => set({ listError: null }),

	reset: () => set(initialState),
}));
