import { Search, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { MORE_FILTERS_CONTENT, MORE_FILTERS_TIMEZONE_OPTIONS } from "@/const";
import { cn } from "@/lib/utils";
import type { MoreFiltersDialogProps, UserMoreFiltersState } from "@/types";

export function MoreFiltersDialog({
	open,
	onOpenChange,
	filters,
	onApply,
	corporationOptions,
	companyOptions,
	optionsLoading = false,
}: MoreFiltersDialogProps) {
	const [localFilters, setLocalFilters] =
		useState<UserMoreFiltersState>(filters);
	const [corpSearch, setCorpSearch] = useState("");
	const [companySearch, setCompanySearch] = useState("");

	const corporationLabelById = useMemo(() => {
		const m = new Map<string, string>();
		for (const c of corporationOptions) m.set(c.id, c.label);
		return m;
	}, [corporationOptions]);

	const companyLabelById = useMemo(() => {
		const m = new Map<string, string>();
		for (const c of companyOptions) m.set(c.id, c.label);
		return m;
	}, [companyOptions]);

	const handleOpen = useCallback(
		(isOpen: boolean) => {
			if (isOpen) {
				setLocalFilters(filters);
				setCorpSearch("");
				setCompanySearch("");
			}
			onOpenChange(isOpen);
		},
		[filters, onOpenChange],
	);

	const draftFilterCount = useMemo(() => {
		return (
			localFilters.corporationIds.length +
			localFilters.companyIds.length +
			localFilters.timeZones.length
		);
	}, [localFilters]);

	const headerRight =
		draftFilterCount === 0 ? (
			<span className="text-muted-foreground text-sm font-medium">
				{MORE_FILTERS_CONTENT.noFiltersApplied}
			</span>
		) : (
			<span className="text-muted-foreground text-sm font-medium">
				{draftFilterCount} {draftFilterCount === 1 ? "filter" : "filters"}{" "}
				applied
			</span>
		);

	const filteredCorpOptions = useMemo(() => {
		if (!corpSearch.trim()) return corporationOptions;
		const term = corpSearch.trim().toLowerCase();
		return corporationOptions.filter((c) =>
			c.label.toLowerCase().includes(term),
		);
	}, [corpSearch, corporationOptions]);

	const filteredCompanyOptions = useMemo(() => {
		if (!companySearch.trim()) return companyOptions;
		const term = companySearch.trim().toLowerCase();
		return companyOptions.filter((c) => c.label.toLowerCase().includes(term));
	}, [companySearch, companyOptions]);

	const handleToggleCorporation = useCallback((id: string) => {
		setLocalFilters((prev) => ({
			...prev,
			corporationIds: prev.corporationIds.includes(id)
				? prev.corporationIds.filter((c) => c !== id)
				: [...prev.corporationIds, id],
		}));
	}, []);

	const handleRemoveCorporation = useCallback((id: string) => {
		setLocalFilters((prev) => ({
			...prev,
			corporationIds: prev.corporationIds.filter((c) => c !== id),
		}));
	}, []);

	const handleToggleCompany = useCallback((id: string) => {
		setLocalFilters((prev) => ({
			...prev,
			companyIds: prev.companyIds.includes(id)
				? prev.companyIds.filter((c) => c !== id)
				: [...prev.companyIds, id],
		}));
	}, []);

	const handleToggleTimeZone = useCallback((tz: string) => {
		setLocalFilters((prev) => ({
			...prev,
			timeZones: prev.timeZones.includes(tz)
				? prev.timeZones.filter((t) => t !== tz)
				: [...prev.timeZones, tz],
		}));
	}, []);

	const handleClearAll = useCallback(() => {
		setLocalFilters({
			corporationIds: [],
			companyIds: [],
			timeZones: [],
		});
	}, []);

	const handleApply = useCallback(() => {
		onApply(localFilters);
		onOpenChange(false);
	}, [localFilters, onApply, onOpenChange]);

	return (
		<Dialog open={open} onOpenChange={handleOpen}>
			<DialogContent
				showCloseButton={false}
				className="max-w-md gap-0 overflow-hidden rounded-xl border border-border p-0 shadow-lg"
			>
				<DialogHeader className="flex flex-row items-start justify-between gap-4 border-b border-border px-5 py-4">
					<DialogTitle className="text-left text-base font-semibold text-text-foreground">
						{MORE_FILTERS_CONTENT.title}
					</DialogTitle>
					{headerRight}
				</DialogHeader>

				<div className="flex max-h-[min(60vh,420px)] flex-col gap-4 overflow-y-auto px-5 py-4">
					<div className="flex flex-col gap-3">
						<span className="text-small text-muted-foreground">
							{MORE_FILTERS_CONTENT.corporationLabel}
							{localFilters.corporationIds.length > 0 &&
								` (${localFilters.corporationIds.length})`}
						</span>
						<InputGroup className="h-9 w-full rounded-lg">
							<InputGroupInput
								type="text"
								placeholder={MORE_FILTERS_CONTENT.corporationSearchPlaceholder}
								value={corpSearch}
								onChange={(e) => setCorpSearch(e.target.value)}
								disabled={optionsLoading}
							/>
							<InputGroupAddon align="inline-end">
								<Search className="size-4 text-muted-foreground" />
							</InputGroupAddon>
						</InputGroup>

						{corpSearch.trim() && filteredCorpOptions.length > 0 && (
							<div className="flex max-h-32 flex-col gap-1 overflow-y-auto rounded-lg border border-border p-1">
								{filteredCorpOptions.map((corp) => (
									<button
										key={corp.id}
										type="button"
										onClick={() => {
											handleToggleCorporation(corp.id);
											setCorpSearch("");
										}}
										className={`cursor-pointer rounded px-2 py-1.5 text-left text-small text-text-foreground hover:bg-card-foreground ${localFilters.corporationIds.includes(corp.id) ? "bg-card-foreground" : ""}`}
									>
										{corp.label}
									</button>
								))}
							</div>
						)}

						{localFilters.corporationIds.length > 0 && (
							<div className="flex flex-wrap gap-2">
								{localFilters.corporationIds.map((id) => (
									<span
										key={id}
										className="inline-flex items-center gap-1.5 rounded-lg bg-brand-gray-bg px-2 py-1.5 text-mini text-brand-gray-text"
									>
										{corporationLabelById.get(id) ?? id}
										<button
											type="button"
											onClick={() => handleRemoveCorporation(id)}
											className="cursor-pointer text-muted-foreground hover:text-text-foreground"
											aria-label={`Remove ${corporationLabelById.get(id) ?? id}`}
										>
											<X className="size-2.5" />
										</button>
									</span>
								))}
							</div>
						)}
					</div>

					<div className="h-px w-full bg-border" />

					<div className="flex flex-col gap-3">
						<span className="text-small text-muted-foreground">
							{MORE_FILTERS_CONTENT.companyLabel}
							{localFilters.companyIds.length > 0 &&
								` (${localFilters.companyIds.length})`}
						</span>
						<InputGroup className="h-9 w-full rounded-lg">
							<InputGroupInput
								type="text"
								placeholder={MORE_FILTERS_CONTENT.companySearchPlaceholder}
								value={companySearch}
								onChange={(e) => setCompanySearch(e.target.value)}
								disabled={optionsLoading}
							/>
							<InputGroupAddon align="inline-end">
								<Search className="size-4 text-muted-foreground" />
							</InputGroupAddon>
						</InputGroup>

						{companySearch.trim() && filteredCompanyOptions.length > 0 && (
							<div className="flex max-h-32 flex-col gap-1 overflow-y-auto rounded-lg border border-border p-1">
								{filteredCompanyOptions.map((company) => (
									<button
										key={company.id}
										type="button"
										onClick={() => {
											handleToggleCompany(company.id);
											setCompanySearch("");
										}}
										className={`cursor-pointer rounded px-2 py-1.5 text-left text-small text-text-foreground hover:bg-card-foreground ${localFilters.companyIds.includes(company.id) ? "bg-card-foreground" : ""}`}
									>
										{company.label}
									</button>
								))}
							</div>
						)}

						{localFilters.companyIds.length > 0 && (
							<div className="flex flex-wrap gap-2">
								{localFilters.companyIds.map((id) => (
									<span
										key={id}
										className="inline-flex items-center gap-1.5 rounded-lg bg-brand-gray-bg px-2 py-1.5 text-mini text-brand-gray-text"
									>
										{companyLabelById.get(id) ?? id}
										<button
											type="button"
											onClick={() => handleToggleCompany(id)}
											className="cursor-pointer text-muted-foreground hover:text-text-foreground"
											aria-label={`Remove ${companyLabelById.get(id) ?? id}`}
										>
											<X className="size-2.5" />
										</button>
									</span>
								))}
							</div>
						)}
					</div>

					<div className="h-px w-full bg-border" />

					<div className="flex flex-col gap-3">
						<span className="text-small text-muted-foreground">
							{MORE_FILTERS_CONTENT.timeZoneLabel}
							{localFilters.timeZones.length > 0 &&
								` (${localFilters.timeZones.length})`}
						</span>
						<div className="grid grid-cols-2 gap-x-2.5 gap-y-2">
							{MORE_FILTERS_TIMEZONE_OPTIONS.map((tz) => {
								const checkboxId = `tz-${tz.value.replace(/\s|\(/g, "-")}`;
								return (
									<div
										key={tz.value}
										className="flex cursor-pointer items-center gap-2 py-1"
									>
										<Checkbox
											id={checkboxId}
											checked={localFilters.timeZones.includes(tz.value)}
											onCheckedChange={() => handleToggleTimeZone(tz.value)}
										/>
										<label
											htmlFor={checkboxId}
											className="cursor-pointer text-small text-text-foreground"
										>
											{tz.label}
										</label>
									</div>
								);
							})}
						</div>
					</div>
				</div>

				<DialogFooter
					className={cn(
						"flex-row justify-between gap-3 border-t border-border px-5 py-4 sm:justify-between",
					)}
				>
					<Button
						type="button"
						variant="outline"
						className="rounded-lg border-border bg-background text-text-foreground hover:bg-muted"
						onClick={handleClearAll}
					>
						{MORE_FILTERS_CONTENT.clearAllButton}
					</Button>
					<Button type="button" className="rounded-lg" onClick={handleApply}>
						{MORE_FILTERS_CONTENT.applyFiltersButton}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
