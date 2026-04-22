import { Filter, PlusIcon, Search, Send, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
	getActiveCompanies,
	getCorporationsList,
	getRoleCategories,
} from "@/api";
import {
	ConfirmationModal,
	DataTable,
	MoreFiltersDialog,
	TableSkeleton,
	WhiteBox,
} from "@/components";
import { Button } from "@/components/ui/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	CONTACT_DIRECTORY_PAGE_CONTENT,
	CONTACT_TYPE_FILTER_OPTIONS,
	DATA_TABLE_CONFIG,
	SEND_INVITE_DIALOG_CONTENT,
	USER_DIRECTORY_PAGE_CONTENT,
	USER_DIRECTORY_TABS,
	USER_STATUS_FILTER_OPTIONS,
} from "@/const";
import { useDebounce } from "@/hooks";
import { cn } from "@/lib/utils";
import { useKeyContactsStore, useUsersStore } from "@/store";
import { getContactDirectoryColumns, getUserDirectoryColumns } from "@/tables";
import type {
	ContactDirectoryItem,
	KeyContactApiSortBy,
	RoleCategoryOption,
	UserApiSortBy,
	UserDirectoryFilterOption,
	UserDirectoryListItem,
	UserDirectoryTabId,
	UserMoreFiltersState,
	UserStatusFilter,
} from "@/types";

const PAGE_SIZE = DATA_TABLE_CONFIG.defaultPageSize;

export function UserDirectoryContent() {
	const [activeTab, setActiveTab] = useState<UserDirectoryTabId>("users");
	const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
	const [contactMoreFiltersOpen, setContactMoreFiltersOpen] = useState(false);
	const [sendInviteOpen, setSendInviteOpen] = useState(false);
	const [_sendInviteContact, setSendInviteContact] =
		useState<ContactDirectoryItem | null>(null);
	const [roleCategories, setRoleCategories] = useState<RoleCategoryOption[]>(
		[],
	);
	const [roleCategoriesLoading, setRoleCategoriesLoading] = useState(false);
	const [
		corporationOptionsForMoreFilters,
		setCorporationOptionsForMoreFilters,
	] = useState<UserDirectoryFilterOption[]>([]);
	const [
		corporationsForMoreFiltersLoading,
		setCorporationsForMoreFiltersLoading,
	] = useState(false);
	const [companiesForMoreFilters, setCompaniesForMoreFilters] = useState<
		UserDirectoryFilterOption[]
	>([]);
	const [companiesForMoreFiltersLoading, setCompaniesForMoreFiltersLoading] =
		useState(false);

	const {
		listItems,
		listTotal,
		listPage,
		listLoading,
		listSortBy,
		listSortOrder,
		listStatusFilter,
		listCategoryIdFilter,
		listSearch,
		moreFilters,
		fetchUsers,
		setListPage,
		setListSort,
		setListStatusFilter,
		setListCategoryIdFilter,
		setListSearch,
		setMoreFilters,
	} = useUsersStore();

	const {
		listItems: contactListItems,
		listTotal: contactListTotal,
		listPage: contactListPage,
		listLoading: contactsListLoading,
		listSortBy: contactListSortBy,
		listSortOrder: contactListSortOrder,
		listSearch: contactListSearch,
		listContactTypeFilter,
		moreFilters: contactMoreFilters,
		fetchKeyContacts,
		setListPage: setContactListPage,
		setListSort: setContactListSort,
		setListSearch: setContactListSearch,
		setListContactTypeFilter,
		setMoreFilters: setContactMoreFilters,
		reset: resetKeyContactsStore,
	} = useKeyContactsStore();

	const userFiltersBusy =
		corporationsForMoreFiltersLoading ||
		roleCategoriesLoading ||
		companiesForMoreFiltersLoading;

	const isContactsTab = activeTab === "contacts";

	const debouncedUserSearch = useDebounce(listSearch.trim());
	const searchForUsersApi =
		debouncedUserSearch.length >= 3 || debouncedUserSearch === ""
			? debouncedUserSearch
			: "";

	const moreFiltersAppliedCount = useMemo(() => {
		let count = 0;
		if (moreFilters.corporationIds.length > 0) count++;
		if (moreFilters.companyIds.length > 0) count++;
		if (moreFilters.timeZones.length > 0) count++;
		return count;
	}, [moreFilters]);

	const debouncedContactSearch = useDebounce(contactListSearch.trim());
	const searchForContactsApi =
		debouncedContactSearch.length >= 3 || debouncedContactSearch === ""
			? debouncedContactSearch
			: "";

	const contactMoreFiltersAppliedCount = useMemo(() => {
		let count = 0;
		if (contactMoreFilters.corporationIds.length > 0) count++;
		if (contactMoreFilters.companyIds.length > 0) count++;
		if (contactMoreFilters.timeZones.length > 0) count++;
		return count;
	}, [contactMoreFilters]);

	useEffect(() => {
		let cancelled = false;
		setCorporationsForMoreFiltersLoading(true);
		void getCorporationsList().then((result) => {
			if (cancelled) return;
			setCorporationsForMoreFiltersLoading(false);
			if (!result.ok) {
				toast.error(result.message);
				return;
			}
			setCorporationOptionsForMoreFilters(
				result.data.map((c) => ({ id: c.id, label: c.legalName })),
			);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		let cancelled = false;
		setRoleCategoriesLoading(true);
		void getRoleCategories().then((result) => {
			if (cancelled) return;
			setRoleCategoriesLoading(false);
			if (!result.ok) {
				toast.error(result.message);
				return;
			}
			if (result.data) setRoleCategories(result.data);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		let cancelled = false;
		setCompaniesForMoreFiltersLoading(true);
		void getActiveCompanies().then((result) => {
			if (cancelled) return;
			setCompaniesForMoreFiltersLoading(false);
			if (!result.ok) {
				toast.error(result.message);
				return;
			}
			setCompaniesForMoreFilters(
				result.data.map((c) => ({ id: c.id, label: c.legalName })),
			);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	const lastFetched = useRef<{
		page: number;
		limit: number;
		sortBy: string;
		sortOrder: string;
		status: string | undefined;
		categoryId: string | undefined;
		corpIds: string;
		compIds: string;
		tzs: string;
		search: string;
	} | null>(null);

	const lastFetchedContacts = useRef<{
		page: number;
		limit: number;
		sortBy: string;
		sortOrder: string;
		contactType: string | undefined;
		corpIds: string;
		compIds: string;
		tzs: string;
		search: string;
	} | null>(null);

	useEffect(() => {
		if (isContactsTab) return;
		const corpKey = [...moreFilters.corporationIds].sort().join(",");
		const compKey = [...moreFilters.companyIds].sort().join(",");
		const tzKey = [...moreFilters.timeZones].sort().join(",");
		const key = {
			page: listPage,
			limit: PAGE_SIZE,
			sortBy: listSortBy,
			sortOrder: listSortOrder,
			status: listStatusFilter,
			categoryId: listCategoryIdFilter,
			corpIds: corpKey,
			compIds: compKey,
			tzs: tzKey,
			search: searchForUsersApi,
		};
		if (
			lastFetched.current?.page === key.page &&
			lastFetched.current?.limit === key.limit &&
			lastFetched.current?.sortBy === key.sortBy &&
			lastFetched.current?.sortOrder === key.sortOrder &&
			lastFetched.current?.status === key.status &&
			lastFetched.current?.categoryId === key.categoryId &&
			lastFetched.current?.corpIds === key.corpIds &&
			lastFetched.current?.compIds === key.compIds &&
			lastFetched.current?.tzs === key.tzs &&
			lastFetched.current?.search === key.search
		) {
			return;
		}
		lastFetched.current = key;
		void fetchUsers(listPage, PAGE_SIZE, {
			search: searchForUsersApi || undefined,
			sortBy: listSortBy,
			sortOrder: listSortOrder,
			status: listStatusFilter,
			categoryId: listCategoryIdFilter,
			corporationIds:
				moreFilters.corporationIds.length > 0
					? moreFilters.corporationIds
					: undefined,
			companyIds:
				moreFilters.companyIds.length > 0 ? moreFilters.companyIds : undefined,
			timezones:
				moreFilters.timeZones.length > 0 ? moreFilters.timeZones : undefined,
		});
	}, [
		isContactsTab,
		listPage,
		listSortBy,
		listSortOrder,
		listStatusFilter,
		listCategoryIdFilter,
		moreFilters.corporationIds,
		moreFilters.companyIds,
		moreFilters.timeZones,
		searchForUsersApi,
		fetchUsers,
	]);

	useEffect(() => {
		if (isContactsTab) return;
		setListPage(1);
	}, [isContactsTab, searchForUsersApi, setListPage]);

	useEffect(() => {
		if (!isContactsTab) return;
		const corpKey = [...contactMoreFilters.corporationIds].sort().join(",");
		const compKey = [...contactMoreFilters.companyIds].sort().join(",");
		const tzKey = [...contactMoreFilters.timeZones].sort().join(",");
		const key = {
			page: contactListPage,
			limit: PAGE_SIZE,
			sortBy: contactListSortBy,
			sortOrder: contactListSortOrder,
			contactType: listContactTypeFilter,
			corpIds: corpKey,
			compIds: compKey,
			tzs: tzKey,
			search: searchForContactsApi,
		};
		if (
			lastFetchedContacts.current?.page === key.page &&
			lastFetchedContacts.current?.limit === key.limit &&
			lastFetchedContacts.current?.sortBy === key.sortBy &&
			lastFetchedContacts.current?.sortOrder === key.sortOrder &&
			lastFetchedContacts.current?.contactType === key.contactType &&
			lastFetchedContacts.current?.corpIds === key.corpIds &&
			lastFetchedContacts.current?.compIds === key.compIds &&
			lastFetchedContacts.current?.tzs === key.tzs &&
			lastFetchedContacts.current?.search === key.search
		) {
			return;
		}
		lastFetchedContacts.current = key;
		void fetchKeyContacts(contactListPage, PAGE_SIZE, {
			search: searchForContactsApi || undefined,
			sortBy: contactListSortBy,
			sortOrder: contactListSortOrder,
			contactType: listContactTypeFilter,
			corporationIds:
				contactMoreFilters.corporationIds.length > 0
					? contactMoreFilters.corporationIds
					: undefined,
			companyIds:
				contactMoreFilters.companyIds.length > 0
					? contactMoreFilters.companyIds
					: undefined,
			timezones:
				contactMoreFilters.timeZones.length > 0
					? contactMoreFilters.timeZones
					: undefined,
		});
	}, [
		isContactsTab,
		contactListPage,
		contactListSortBy,
		contactListSortOrder,
		listContactTypeFilter,
		contactMoreFilters.corporationIds,
		contactMoreFilters.companyIds,
		contactMoreFilters.timeZones,
		searchForContactsApi,
		fetchKeyContacts,
	]);

	useEffect(() => {
		if (!isContactsTab) return;
		setContactListPage(1);
	}, [isContactsTab, searchForContactsApi, setContactListPage]);

	const userPageIndex = listPage - 1;
	const contactPageIndex = contactListPage - 1;

	const handleSort = useCallback(
		(columnId: string) => {
			if (columnId === "actions") return;
			const sortBy = columnId as UserApiSortBy;
			const nextOrder =
				listSortBy === sortBy && listSortOrder === "asc" ? "desc" : "asc";
			setListSort(sortBy, nextOrder);
			setListPage(1);
		},
		[listSortBy, listSortOrder, setListSort, setListPage],
	);

	const handleContactSort = useCallback(
		(columnId: string) => {
			if (columnId === "actions") return;
			const sortBy = columnId as KeyContactApiSortBy;
			const nextOrder =
				contactListSortBy === sortBy && contactListSortOrder === "asc"
					? "desc"
					: "asc";
			setContactListSort(sortBy, nextOrder);
			setContactListPage(1);
		},
		[
			contactListSortBy,
			contactListSortOrder,
			setContactListSort,
			setContactListPage,
		],
	);

	const handleViewClick = useCallback((_row: UserDirectoryListItem) => {}, []);
	const handleEditClick = useCallback((_row: UserDirectoryListItem) => {}, []);
	const handleBlockClick = useCallback((_row: UserDirectoryListItem) => {}, []);
	const handleUnblockClick = useCallback(
		(_row: UserDirectoryListItem) => {},
		[],
	);
	const handleResendInviteClick = useCallback(
		(_row: UserDirectoryListItem) => {},
		[],
	);
	const handleCancelInvitationClick = useCallback(
		(_row: UserDirectoryListItem) => {},
		[],
	);
	const handleRemoveClick = useCallback(
		(_row: UserDirectoryListItem) => {},
		[],
	);

	const handleContactViewClick = useCallback(
		(_row: ContactDirectoryItem) => {},
		[],
	);
	const handleContactEditClick = useCallback(
		(_row: ContactDirectoryItem) => {},
		[],
	);
	const handleContactSendInviteClick = useCallback(
		(row: ContactDirectoryItem) => {
			setSendInviteContact(row);
			setSendInviteOpen(true);
		},
		[],
	);
	const handleContactRemoveClick = useCallback(
		(_row: ContactDirectoryItem) => {},
		[],
	);

	const userColumns = useMemo(
		() =>
			getUserDirectoryColumns({
				onViewClick: handleViewClick,
				onEditClick: handleEditClick,
				onBlockClick: handleBlockClick,
				onUnblockClick: handleUnblockClick,
				onResendInviteClick: handleResendInviteClick,
				onCancelInvitationClick: handleCancelInvitationClick,
				onRemoveClick: handleRemoveClick,
			}),
		[
			handleViewClick,
			handleEditClick,
			handleBlockClick,
			handleUnblockClick,
			handleResendInviteClick,
			handleCancelInvitationClick,
			handleRemoveClick,
		],
	);

	const contactColumns = useMemo(
		() =>
			getContactDirectoryColumns({
				onViewClick: handleContactViewClick,
				onEditClick: handleContactEditClick,
				onSendInviteClick: handleContactSendInviteClick,
				onRemoveClick: handleContactRemoveClick,
			}),
		[
			handleContactViewClick,
			handleContactEditClick,
			handleContactSendInviteClick,
			handleContactRemoveClick,
		],
	);

	const handleTabChange = useCallback(
		(tabId: UserDirectoryTabId) => {
			setActiveTab(tabId);
			setListSearch("");
			setListStatusFilter(undefined);
			setListCategoryIdFilter(undefined);
			setMoreFilters({
				corporationIds: [],
				companyIds: [],
				timeZones: [],
			});
			setListPage(1);
			lastFetched.current = null;
			resetKeyContactsStore();
			lastFetchedContacts.current = null;
			setContactMoreFiltersOpen(false);
			setMoreFiltersOpen(false);
		},
		[
			setListSearch,
			setListStatusFilter,
			setListCategoryIdFilter,
			setMoreFilters,
			setListPage,
			resetKeyContactsStore,
		],
	);

	const handleApplyMoreFilters = useCallback(
		(newFilters: UserMoreFiltersState) => {
			setMoreFilters(newFilters);
			setListPage(1);
			lastFetched.current = null;
		},
		[setMoreFilters, setListPage],
	);

	const handleApplyContactMoreFilters = useCallback(
		(newFilters: UserMoreFiltersState) => {
			setContactMoreFilters(newFilters);
			setContactListPage(1);
			lastFetchedContacts.current = null;
		},
		[setContactMoreFilters, setContactListPage],
	);

	const handleStatusFilterChange = useCallback(
		(value: string) => {
			const status = value === "all" ? undefined : (value as UserStatusFilter);
			setListStatusFilter(status);
			setListPage(1);
			lastFetched.current = null;
		},
		[setListStatusFilter, setListPage],
	);

	const handleCategoryFilterChange = useCallback(
		(value: string) => {
			setListCategoryIdFilter(value === "all" ? undefined : value);
			setListPage(1);
			lastFetched.current = null;
		},
		[setListCategoryIdFilter, setListPage],
	);

	const handleContactTypeFilterChange = useCallback(
		(value: string) => {
			setListContactTypeFilter(value === "all" ? undefined : value);
			setContactListPage(1);
			lastFetchedContacts.current = null;
		},
		[setListContactTypeFilter, setContactListPage],
	);

	const handleConfirmSendInvite = useCallback(() => {
		setSendInviteContact(null);
		setSendInviteOpen(false);
	}, []);

	return (
		<>
			<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex h-11 min-h-11 items-center rounded-xl bg-card-foreground p-1">
					<nav
						className="flex flex-1 flex-wrap items-center gap-4"
						aria-label="User directory tabs"
					>
						{USER_DIRECTORY_TABS.map((tab) => (
							<button
								key={tab.id}
								type="button"
								onClick={() => handleTabChange(tab.id)}
								className={cn(
									"inline-flex h-9 min-h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 px-2.5 py-1.5 text-small font-semibold transition-colors",
									activeTab === tab.id
										? "bg-background text-brand-primary"
										: "bg-transparent text-text-secondary hover:text-text-foreground",
								)}
							>
								{tab.label}
							</button>
						))}
					</nav>
				</div>

				<div className="flex items-center gap-2.5">
					<Button variant="outline" className="h-9 gap-2">
						<Upload className="size-3.5" />
						{USER_DIRECTORY_PAGE_CONTENT.bulkUploadButton}
					</Button>
					{isContactsTab ? (
						<Button className="h-9 gap-2">
							<PlusIcon className="size-3.5" />
							{CONTACT_DIRECTORY_PAGE_CONTENT.addContactButton}
						</Button>
					) : (
						<Button className="h-9 gap-2">
							<Send className="size-3.5" />
							{USER_DIRECTORY_PAGE_CONTENT.inviteUserButton}
						</Button>
					)}
				</div>
			</div>

			<WhiteBox padding="md">
				<div className="flex flex-col gap-6">
					<div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
						<InputGroup className="h-9 w-full min-w-0 rounded-lg lg:max-w-80 lg:flex-1">
							<InputGroupAddon align="inline-start">
								<Search className="size-3.5 text-muted-foreground" />
							</InputGroupAddon>
							<InputGroupInput
								type="search"
								placeholder={
									isContactsTab
										? USER_DIRECTORY_PAGE_CONTENT.searchPlaceholderContacts
										: USER_DIRECTORY_PAGE_CONTENT.searchPlaceholder
								}
								value={isContactsTab ? contactListSearch : listSearch}
								onChange={(e) => {
									if (isContactsTab) {
										setContactListSearch(e.target.value);
									} else {
										setListSearch(e.target.value);
									}
								}}
								aria-label={USER_DIRECTORY_PAGE_CONTENT.searchAriaLabel}
								disabled={userFiltersBusy}
							/>
						</InputGroup>

						<div className="flex w-full flex-col gap-2.5 sm:flex-row sm:gap-2.5 lg:w-auto lg:shrink-0">
							{isContactsTab ? (
								<>
									<Select
										value={listContactTypeFilter ?? "all"}
										onValueChange={handleContactTypeFilterChange}
										disabled={userFiltersBusy}
									>
										<SelectTrigger
											className="h-9 w-full min-w-0 sm:w-44"
											aria-label={
												CONTACT_DIRECTORY_PAGE_CONTENT.contactTypesFilterAriaLabel
											}
										>
											<SelectValue
												placeholder={
													CONTACT_DIRECTORY_PAGE_CONTENT.contactTypesFilterAllLabel
												}
											/>
										</SelectTrigger>
										<SelectContent>
											{CONTACT_TYPE_FILTER_OPTIONS.map((opt) => (
												<SelectItem key={opt.value} value={opt.value}>
													{opt.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>

									<Button
										variant="outline"
										className={
											contactMoreFiltersAppliedCount > 0
												? "font-semibold text-link"
												: ""
										}
										onClick={() => setContactMoreFiltersOpen(true)}
										disabled={userFiltersBusy}
									>
										<Filter className="size-3.5" />
										{USER_DIRECTORY_PAGE_CONTENT.moreFiltersButton}
										{contactMoreFiltersAppliedCount > 0 &&
											` (${contactMoreFiltersAppliedCount})`}
									</Button>
								</>
							) : (
								<>
									<Select
										value={listStatusFilter ?? "all"}
										onValueChange={handleStatusFilterChange}
										disabled={userFiltersBusy}
									>
										<SelectTrigger
											className="h-9 w-full min-w-0 sm:w-44"
											aria-label={
												USER_DIRECTORY_PAGE_CONTENT.statusFilterAriaLabel
											}
										>
											<SelectValue
												placeholder={
													USER_DIRECTORY_PAGE_CONTENT.statusFilterAllLabel
												}
											/>
										</SelectTrigger>
										<SelectContent>
											{USER_STATUS_FILTER_OPTIONS.map((opt) => (
												<SelectItem key={opt.value} value={opt.value}>
													{opt.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>

									<Select
										value={listCategoryIdFilter ?? "all"}
										onValueChange={handleCategoryFilterChange}
										disabled={userFiltersBusy}
									>
										<SelectTrigger
											className="h-9 w-full min-w-0 sm:w-44"
											aria-label={
												USER_DIRECTORY_PAGE_CONTENT.categoriesFilterAriaLabel
											}
										>
											<SelectValue
												placeholder={
													USER_DIRECTORY_PAGE_CONTENT.categoriesFilterAllLabel
												}
											/>
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">
												{USER_DIRECTORY_PAGE_CONTENT.categoriesFilterAllLabel}
											</SelectItem>
											{roleCategories.map((cat) => (
												<SelectItem key={cat.id} value={cat.id}>
													{cat.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</>
							)}

							{!isContactsTab && (
								<Button
									variant="outline"
									className={
										moreFiltersAppliedCount > 0 ? "font-semibold text-link" : ""
									}
									onClick={() => setMoreFiltersOpen(true)}
									disabled={userFiltersBusy}
								>
									<Filter className="size-3.5" />
									{USER_DIRECTORY_PAGE_CONTENT.moreFiltersButton}
									{moreFiltersAppliedCount > 0 &&
										` (${moreFiltersAppliedCount})`}
								</Button>
							)}
						</div>
					</div>

					<div className="min-w-0">
						{isContactsTab ? (
							contactsListLoading ? (
								<TableSkeleton
									columns={contactColumns}
									rowCount={PAGE_SIZE}
									showPagination
									fixedHeight
								/>
							) : (
								<DataTable
									data={contactListItems}
									columns={contactColumns}
									pageSize={PAGE_SIZE}
									emptyMessage={CONTACT_DIRECTORY_PAGE_CONTENT.noData}
									serverPagination={{
										totalCount: contactListTotal,
										pageIndex: contactPageIndex,
										onPageChange: (idx) => setContactListPage(idx + 1),
									}}
									serverSort={{
										sortColumnId: contactListSortBy,
										sortDirection: contactListSortOrder,
										onSort: handleContactSort,
									}}
									fixedHeight
								/>
							)
						) : listLoading ? (
							<TableSkeleton
								columns={userColumns}
								rowCount={PAGE_SIZE}
								showPagination
								fixedHeight
							/>
						) : (
							<DataTable
								data={listItems}
								columns={userColumns}
								pageSize={PAGE_SIZE}
								emptyMessage={USER_DIRECTORY_PAGE_CONTENT.noData}
								serverPagination={{
									totalCount: listTotal,
									pageIndex: userPageIndex,
									onPageChange: (idx) => setListPage(idx + 1),
								}}
								serverSort={{
									sortColumnId: listSortBy,
									sortDirection: listSortOrder,
									onSort: handleSort,
								}}
								fixedHeight
							/>
						)}
					</div>
				</div>
			</WhiteBox>

			<MoreFiltersDialog
				open={moreFiltersOpen}
				onOpenChange={setMoreFiltersOpen}
				filters={moreFilters}
				onApply={handleApplyMoreFilters}
				corporationOptions={corporationOptionsForMoreFilters}
				companyOptions={companiesForMoreFilters}
				optionsLoading={userFiltersBusy}
			/>

			<MoreFiltersDialog
				open={contactMoreFiltersOpen}
				onOpenChange={setContactMoreFiltersOpen}
				filters={contactMoreFilters}
				onApply={handleApplyContactMoreFilters}
				corporationOptions={corporationOptionsForMoreFilters}
				companyOptions={companiesForMoreFilters}
				optionsLoading={userFiltersBusy}
			/>

			<ConfirmationModal
				open={sendInviteOpen}
				onOpenChange={setSendInviteOpen}
				title={SEND_INVITE_DIALOG_CONTENT.title}
				description={SEND_INVITE_DIALOG_CONTENT.description}
				icon={
					<Send
						className="size-8 text-brand-info"
						strokeWidth={2}
						aria-hidden
					/>
				}
				confirmLabel={SEND_INVITE_DIALOG_CONTENT.sendInviteButton}
				cancelLabel={SEND_INVITE_DIALOG_CONTENT.cancelButton}
				onConfirm={handleConfirmSendInvite}
				confirmIcon={<Send className="size-3.5" aria-hidden />}
			/>
		</>
	);
}
