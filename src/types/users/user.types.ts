export interface UserDirectoryCompany {
	companyName: string;
	region: string;
}

export interface UserDirectoryListItem {
	id: string;
	cognitoSub: string;
	userCode: number;
	firstName: string;
	lastName: string;
	email: string;
	status: string;
	corporationName: string | null;
	corporationCode: number | null;
	roleName: string | null;
	categoryName: string | null;
	workPhone: string | null;
	timezone: string | null;
	createdAt: string;
	company: UserDirectoryCompany | null;
}

export type UserApiSortBy =
	| "userCode"
	| "name"
	| "status"
	| "corporationName"
	| "companyName"
	| "roleName"
	| "categoryName"
	| "timezone"
	| "createdAt";

export type UserApiSortOrder = "asc" | "desc";

export type ListUsersParams = {
	page: number;
	limit: number;
	sortBy?: UserApiSortBy;
	sortOrder?: UserApiSortOrder;
	status?: string;
	categoryId?: string;
	corporationIds?: string[];
	companyIds?: string[];
	timezones?: string[];
	search?: string;
};

export type UserDirectoryApiItem = Omit<UserDirectoryListItem, "id">;

export type UsersListApiData = {
	items: UserDirectoryApiItem[];
	pagination: {
		total: number;
		page: number;
		pageSize: number;
		totalPages: number;
	};
};

export type UserDirectoryFilterOption = { id: string; label: string };

export type UserMoreFiltersState = {
	corporationIds: string[];
	companyIds: string[];
	timeZones: string[];
};

export type MoreFiltersDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	filters: UserMoreFiltersState;
	onApply: (filters: UserMoreFiltersState) => void;
	corporationOptions: UserDirectoryFilterOption[];
	companyOptions: UserDirectoryFilterOption[];
	optionsLoading?: boolean;
};

export type UsersState = {
	listItems: UserDirectoryListItem[];
	listTotal: number;
	listPage: number;
	listLoading: boolean;
	listError: string | null;
	listSortBy: UserApiSortBy;
	listSortOrder: UserApiSortOrder;
	listStatusFilter: string | undefined;
	listCategoryIdFilter: string | undefined;
	listSearch: string;
	moreFilters: UserMoreFiltersState;
};

export type UsersActions = {
	fetchUsers: (
		page: number,
		limit: number,
		params?: {
			sortBy?: UserApiSortBy;
			sortOrder?: UserApiSortOrder;
			status?: string;
			categoryId?: string;
			corporationIds?: string[];
			companyIds?: string[];
			timezones?: string[];
			search?: string;
		},
	) => Promise<void>;
	setListPage: (page: number) => void;
	setListSort: (sortBy: UserApiSortBy, sortOrder: UserApiSortOrder) => void;
	setListStatusFilter: (status: string | undefined) => void;
	setListCategoryIdFilter: (categoryId: string | undefined) => void;
	setListSearch: (search: string) => void;
	setMoreFilters: (filters: UserMoreFiltersState) => void;
	clearListError: () => void;
	reset: () => void;
};

export type UsersStore = UsersState & UsersActions;

export type UserStatusFilter = "active" | "pending" | "expired" | "blocked";

/** Key contact list row — aligned with GET /key-contacts items. */
export interface ContactDirectoryItem {
	id: string;
	contactCode: number;
	firstName: string | null;
	lastName: string | null;
	email: string | null;
	corporationName: string | null;
	corporationCode: number | null;
	companyName: string | null;
	corporationRegion: string | null;
	/** Display label from API (stored key resolved server-side). */
	contactType: string | null;
	jobRole: string | null;
	workPhone: string | null;
	timezone: string | null;
	createdAt: string;
}

export type ContactDirectoryColumnOptions = {
	onViewClick?: (row: ContactDirectoryItem) => void;
	onEditClick?: (row: ContactDirectoryItem) => void;
	onSendInviteClick?: (row: ContactDirectoryItem) => void;
	onRemoveClick?: (row: ContactDirectoryItem) => void;
};

/** Allowed `sortBy` for GET /key-contacts (backend DTO). */
export type KeyContactApiSortBy =
	| "contactCode"
	| "name"
	| "corporationName"
	| "companyName"
	| "contactType"
	| "jobRole"
	| "timezone"
	| "createdAt";

export type KeyContactApiSortOrder = "asc" | "desc";

export type ListKeyContactsParams = {
	page: number;
	limit: number;
	sortBy?: KeyContactApiSortBy;
	sortOrder?: KeyContactApiSortOrder;
	search?: string;
	contactType?: string;
	corporationIds?: string[];
	companyIds?: string[];
	timezones?: string[];
};

export type KeyContactsListApiData = {
	items: ContactDirectoryItem[];
	pagination: {
		total: number;
		page: number;
		pageSize: number;
		totalPages: number;
	};
};

export type KeyContactsState = {
	listItems: ContactDirectoryItem[];
	listTotal: number;
	listPage: number;
	listLoading: boolean;
	listError: string | null;
	listSortBy: KeyContactApiSortBy;
	listSortOrder: KeyContactApiSortOrder;
	listSearch: string;
	listContactTypeFilter: string | undefined;
	moreFilters: UserMoreFiltersState;
};

export type KeyContactsActions = {
	fetchKeyContacts: (
		page: number,
		limit: number,
		params?: {
			sortBy?: KeyContactApiSortBy;
			sortOrder?: KeyContactApiSortOrder;
			search?: string;
			contactType?: string;
			corporationIds?: string[];
			companyIds?: string[];
			timezones?: string[];
		},
	) => Promise<void>;
	setListPage: (page: number) => void;
	setListSort: (
		sortBy: KeyContactApiSortBy,
		sortOrder: KeyContactApiSortOrder,
	) => void;
	setListSearch: (search: string) => void;
	setListContactTypeFilter: (contactType: string | undefined) => void;
	setMoreFilters: (filters: UserMoreFiltersState) => void;
	clearListError: () => void;
	reset: () => void;
};

export type KeyContactsStore = KeyContactsState & KeyContactsActions;

export type UserDirectoryTabId = "users" | "contacts";
