import { Building2, ChevronRight, SquarePen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ADD_NEW_CORPORATION_CONTENT } from "@/const";
import { cn } from "@/lib/utils";
import type { CompanyCardProps, CompanyCardSkeletonVariant } from "@/types";

const COMPANY_SETUP = ADD_NEW_CORPORATION_CONTENT.advancedSteps.companySetup;

export function CompanyCard(props: CompanyCardProps) {
	const { company, variant } = props;
	const {
		id,
		legalName,
		planLabel,
		planEmployeeLabel,
		showEmployeeBadge = false,
		detailLine1,
		detailLine2,
	} = company;

	const isList = variant === "list";
	const hasClick = isList && props.onClick;

	return (
		<Card
			className={cn(
				"w-full gap-0 rounded-xl border border-border bg-background p-0 shadow-none transition-colors",
				hasClick && "cursor-pointer",
			)}
			onClick={hasClick ? props.onClick : undefined}
		>
			<CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
				{/* Icon + content */}
				<div className="flex min-w-0 flex-1 items-center gap-3 sm:min-w-0">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-info-bg p-2">
						<Building2 className="size-4 text-link" aria-hidden />
					</div>
					<div className="min-w-0 flex-1 space-y-1">
						<div className="flex min-h-6 flex-wrap items-center gap-2">
							<span className="min-w-0 truncate text-sm font-medium leading-6 text-text-foreground capitalize">
								{legalName || "—"}
							</span>
							<span className="inline-flex h-6 shrink-0 items-center justify-center rounded-lg bg-info-bg px-2 py-0.5 text-xs font-semibold text-link">
								{planLabel}
							</span>
							{showEmployeeBadge && planEmployeeLabel && (
								<span className="inline-flex h-6 shrink-0 items-center justify-center rounded-lg bg-success-bg px-2 py-0.5 text-xs font-semibold text-brand-green">
									{planEmployeeLabel}
								</span>
							)}
						</div>
						<p className="text-xs leading-4 text-text-secondary">
							{detailLine1}
						</p>
						<p className="min-w-0 truncate text-xs leading-4 text-muted-foreground">
							{detailLine2}
						</p>
					</div>
				</div>
				{/* List: chevron when clickable */}
				{isList && hasClick && (
					<div className="flex shrink-0 items-center sm:pl-2">
						<ChevronRight
							className="size-5 text-muted-foreground"
							aria-hidden
						/>
					</div>
				)}
				{/* Edit: actions aligned to end */}
				{variant === "edit" && (
					<div className="flex shrink-0 items-center justify-end gap-2">
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							onClick={(e) => {
								e.stopPropagation();
								props.onEdit(id);
							}}
							aria-label={COMPANY_SETUP.editAriaLabel}
							className="h-9 w-9 rounded-lg p-0 text-icon-primary hover:bg-muted"
						>
							<SquarePen className="size-4" aria-hidden />
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							onClick={(e) => {
								e.stopPropagation();
								props.onDelete(id);
							}}
							aria-label={COMPANY_SETUP.deleteAriaLabel}
							className="h-9 w-9 rounded-lg p-0 text-icon-secondary hover:bg-muted"
						>
							<Trash2 className="size-4 text-icon-error" aria-hidden />
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export function CompanyCardSkeleton({
	variant = "edit",
}: {
	variant?: CompanyCardSkeletonVariant;
} = {}) {
	const showActions = variant === "edit";
	return (
		<Card className="w-full gap-0 rounded-xl border border-border bg-background p-0 shadow-none transition-colors">
			<CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
				<div className="flex min-w-0 flex-1 items-center gap-3 sm:min-w-0">
					<Skeleton className="h-10 w-10 shrink-0 rounded-xl" aria-hidden />
					<div className="min-w-0 flex-1 space-y-2">
						<div className="flex flex-wrap items-center gap-2">
							<Skeleton className="h-5 w-32" aria-hidden />
							<Skeleton className="h-6 w-20 rounded-lg" aria-hidden />
						</div>
						<Skeleton className="h-4 w-24" aria-hidden />
						<Skeleton className="h-4 w-40" aria-hidden />
					</div>
				</div>
				{showActions && (
					<div className="flex shrink-0 gap-2">
						<Skeleton className="h-9 w-9 rounded-lg" aria-hidden />
						<Skeleton className="h-9 w-9 rounded-lg" aria-hidden />
					</div>
				)}
			</CardContent>
		</Card>
	);
}
