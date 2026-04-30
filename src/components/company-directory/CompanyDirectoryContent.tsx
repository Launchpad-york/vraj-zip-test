import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable, TableSkeleton, WhiteBox } from "@/components/common";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "@/components/ui/combobox";
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
	COMPANIES_DIRECTORY_PAGE_CONTENT,
	COMPANY_DATE_FILTER_OPTIONS,
	DATA_TABLE_CONFIG,
} from "@/const";
import { useDebounce } from "@/hooks";
import { useCompaniesStore } from "@/store";
import { getCompanyDirectoryColumns } from "@/tables";
import type {
	CompanyApiCreatedFilter,
	CompanyApiSortBy,
	CompanyApiStatusFilter,
} from "@/types";

const PAGE_SIZE = DATA_TABLE_CONFIG.defaultPageSize;

export function CompanyDirectoryContent() {
	const navigate = useNavigate();
	const {
		listItems,
		listTotal,
		listPage,
		listLoading,
		listSortBy,
		listSortOrder,
		listCreatedFilter,
		listStatusFilter,
		listCorporationFilter,
		listPlanTypeFilter,
		listSearch,
		filterOptions,
		filterOptionsLoading,
		fetchCompanies,
		fetchFilterOptions,
		setListPage,
		setListSort,
		setListCreatedFilter,
		setListStatusFilter,
		setListCorporationFilter,
		setListPlanTypeFilter,
		setListSearch,
	} = useCompaniesStore();

	useEffect(() => {
		fetchFilterOptions();
	}, [fetchFilterOptions]);

	const debouncedSearch = useDebounce(listSearch.trim());
	const searchForApi =
		debouncedSearch.length >= 3 || debouncedSearch === ""
			? debouncedSearch
			: "";

	const columns = useMemo(
		() => getCompanyDirectoryColumns(navigate),
		[navigate],
	);

	const lastFetched = useRef<{
		page: number;
		limit: number;
		sortBy: string;
		sortOrder: string;
		createdFilter: string | undefined;
		status: string | undefined;
		corporationId: string | undefined;
		planTypeId: string | undefined;
		search: string;
	} | null>(null);

	const planTypeId = listPlanTypeFilter ?? undefined;

	useEffect(() => {
		const key = {
			page: listPage,
			limit: PAGE_SIZE,
			sortBy: listSortBy,
			sortOrder: listSortOrder,
			createdFilter: listCreatedFilter,
			status: listStatusFilter,
			corporationId: listCorporationFilter,
			planTypeId,
			search: searchForApi,
		};
		if (
			lastFetched.current?.page === key.page &&
			lastFetched.current?.limit === key.limit &&
			lastFetched.current?.sortBy === key.sortBy &&
			lastFetched.current?.sortOrder === key.sortOrder &&
			lastFetched.current?.createdFilter === key.createdFilter &&
			lastFetched.current?.status === key.status &&
			lastFetched.current?.corporationId === key.corporationId &&
			lastFetched.current?.planTypeId === key.planTypeId &&
			lastFetched.current?.search === key.search
		) {
			return;
		}
		lastFetched.current = key;
		fetchCompanies(listPage, PAGE_SIZE, {
			search: searchForApi || undefined,
			sortBy: listSortBy,
			sortOrder: listSortOrder,
			createdFilter: listCreatedFilter,
			status: listStatusFilter?.toLowerCase() as
				| CompanyApiStatusFilter
				| undefined,
			corporationId: listCorporationFilter,
			planTypeId,
		});
	}, [
		listPage,
		listSortBy,
		listSortOrder,
		listCreatedFilter,
		listStatusFilter,
		listCorporationFilter,
		planTypeId,
		searchForApi,
		fetchCompanies,
	]);

	useEffect(() => {
		setListPage(1);
	}, [searchForApi, setListPage]);

	const handleSort = useCallback(
		(columnId: string) => {
			if (columnId === "actions") return;
			// Map UI column IDs to API sortBy values
			const sortByMap: Record<string, CompanyApiSortBy> = {
				companyId: "companyCode",
				companyName: "legalName",
				status: "status",
				assignedCorporation: "corporationName",
				plan: "plan",
				createdOn: "createdAt",
				lastUpdatedOn: "updatedAt",
			};
			const sortBy = sortByMap[columnId] ?? "createdAt";
			const nextOrder =
				listSortBy === sortBy && listSortOrder === "asc" ? "desc" : "asc";
			setListSort(sortBy, nextOrder);
			setListPage(1);
		},
		[listSortBy, listSortOrder, setListSort, setListPage],
	);

	const handleStatusFilterChange = useCallback(
		(value: string) => {
			// Store as-is from API (ACTIVE); list API expects lowercase - convert in fetchCompanies
			setListStatusFilter(value === "all" ? undefined : value);
			setListPage(1);
		},
		[setListStatusFilter, setListPage],
	);

	const handleCreatedFilterChange = useCallback(
		(value: string) => {
			const filter =
				value === "all" ? undefined : (value as CompanyApiCreatedFilter);
			setListCreatedFilter(filter);
			setListPage(1);
		},
		[setListCreatedFilter, setListPage],
	);

	const handlePlanFilterChange = useCallback(
		(value: string) => {
			setListPlanTypeFilter(value === "all" ? undefined : value);
			setListPage(1);
		},
		[setListPlanTypeFilter, setListPage],
	);

	const handleCorporationFilterChange = useCallback(
		(value: string | null) => {
			const normalized = value == null || value === "" ? undefined : value;
			const prev = useCompaniesStore.getState().listCorporationFilter;
			const prevNorm = prev === "" ? undefined : prev;
			if (normalized === prevNorm) return;
			setListCorporationFilter(normalized);
			setListPage(1);
		},
		[setListCorporationFilter, setListPage],
	);

	const pageIndex = listPage - 1;
	const sortColumnId = useMemo(() => {
		// Map API sortBy back to UI column IDs
		const reverseMap: Record<CompanyApiSortBy, string> = {
			companyCode: "companyId",
			legalName: "companyName",
			status: "status",
			corporationName: "assignedCorporation",
			plan: "plan",
			createdAt: "createdOn",
			updatedAt: "lastUpdatedOn",
		};
		return reverseMap[listSortBy] ?? "createdOn";
	}, [listSortBy]);

	const corporationItemIds = useMemo(
		() => filterOptions?.corporations.map((c) => c.id) ?? [],
		[filterOptions],
	);

	const corporationLabelById = useMemo(() => {
		const map = new Map<string, string>();
		for (const c of filterOptions?.corporations ?? []) {
			map.set(c.id, c.label);
		}
		return map;
	}, [filterOptions]);

	const corporationItemToStringLabel = useCallback(
		(id: string) => corporationLabelById.get(id) ?? id,
		[corporationLabelById],
	);

	return (
		<WhiteBox>
			<div className="flex flex-col gap-6">
				<div className="flex w-full min-w-0 flex-wrap items-center gap-2.5">
					<InputGroup className="min-w-48 flex-1 rounded-lg sm:min-w-64 sm:max-w-80">
						<InputGroupAddon align="inline-start">
							<Search className="size-3.5 text-muted-foreground" />
						</InputGroupAddon>
						<InputGroupInput
							type="search"
							placeholder={COMPANIES_DIRECTORY_PAGE_CONTENT.searchPlaceholder}
							value={listSearch}
							onChange={(e) => setListSearch(e.target.value)}
							disabled={filterOptionsLoading}
							aria-label={COMPANIES_DIRECTORY_PAGE_CONTENT.searchAriaLabel}
						/>
					</InputGroup>
					<Select
						value={listStatusFilter ?? "all"}
						onValueChange={handleStatusFilterChange}
						disabled={filterOptionsLoading}
					>
						<SelectTrigger
							className="min-w-36 flex-1 shrink-0"
							aria-label={
								COMPANIES_DIRECTORY_PAGE_CONTENT.statusFilterAriaLabel
							}
						>
							<SelectValue
								placeholder={
									COMPANIES_DIRECTORY_PAGE_CONTENT.statusFilterAllLabel
								}
							/>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">
								{COMPANIES_DIRECTORY_PAGE_CONTENT.statusFilterAllLabel}
							</SelectItem>
							{filterOptions?.statuses.map((opt) => (
								<SelectItem key={opt.value} value={opt.value}>
									{opt.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Combobox
						items={corporationItemIds}
						value={listCorporationFilter ?? null}
						onValueChange={(v) => handleCorporationFilterChange(v)}
						itemToStringLabel={corporationItemToStringLabel}
						disabled={filterOptionsLoading}
					>
						<ComboboxInput
							className="min-w-36 flex-1 shrink-0"
							showClear
							placeholder={
								COMPANIES_DIRECTORY_PAGE_CONTENT.corporationFilterAllLabel
							}
							aria-label={
								COMPANIES_DIRECTORY_PAGE_CONTENT.corporationFilterAriaLabel
							}
						/>
						<ComboboxContent>
							<ComboboxList>
								{(item: string) => (
									<ComboboxItem key={item} value={item}>
										{corporationLabelById.get(item) ?? item}
									</ComboboxItem>
								)}
							</ComboboxList>
							<ComboboxEmpty>
								{
									COMPANIES_DIRECTORY_PAGE_CONTENT.corporationFilterNoResultsLabel
								}
							</ComboboxEmpty>
						</ComboboxContent>
					</Combobox>
					<Select
						value={listPlanTypeFilter ?? "all"}
						onValueChange={handlePlanFilterChange}
						disabled={filterOptionsLoading}
					>
						<SelectTrigger
							className="min-w-36 flex-1 shrink-0"
							aria-label={COMPANIES_DIRECTORY_PAGE_CONTENT.planFilterAriaLabel}
						>
							<SelectValue
								placeholder={
									COMPANIES_DIRECTORY_PAGE_CONTENT.planFilterAllLabel
								}
							/>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">
								{COMPANIES_DIRECTORY_PAGE_CONTENT.planFilterAllLabel}
							</SelectItem>
							{(filterOptions?.plans ?? []).map((opt) => (
								<SelectItem key={opt.value} value={opt.value}>
									{opt.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select
						value={listCreatedFilter ?? "all"}
						onValueChange={handleCreatedFilterChange}
						disabled={filterOptionsLoading}
					>
						<SelectTrigger
							className="min-w-36 flex-1 shrink-0"
							aria-label={COMPANIES_DIRECTORY_PAGE_CONTENT.dateFilterAriaLabel}
						>
							<SelectValue
								placeholder={
									COMPANY_DATE_FILTER_OPTIONS.find((opt) => opt.value === "all")
										?.label
								}
							/>
						</SelectTrigger>
						<SelectContent>
							{COMPANY_DATE_FILTER_OPTIONS.map((opt) => (
								<SelectItem key={opt.value} value={opt.value}>
									{opt.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="min-w-0">
					{listLoading ? (
						<TableSkeleton
							columns={columns}
							rowCount={PAGE_SIZE}
							showPagination
							fixedHeight
						/>
					) : (
						<DataTable
							data={listItems}
							columns={columns}
							pageSize={PAGE_SIZE}
							emptyMessage={COMPANIES_DIRECTORY_PAGE_CONTENT.noData}
							serverPagination={{
								totalCount: listTotal,
								pageIndex,
								onPageChange: (idx) => setListPage(idx + 1),
							}}
							serverSort={{
								sortColumnId,
								sortDirection: listSortOrder,
								onSort: handleSort,
							}}
							fixedHeight
						/>
					)}
				</div>
			</div>
		</WhiteBox>
	);
}
