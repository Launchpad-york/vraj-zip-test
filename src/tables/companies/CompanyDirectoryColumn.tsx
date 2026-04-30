import {
	Ban,
	Eye,
	MoreVertical,
	PlayCircle,
	RotateCcw,
	SquarePen,
} from "lucide-react";
import type { NavigateFunction } from "react-router-dom";
import { BSPBadge } from "@/components";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	COMPANIES_DIRECTORY_PAGE_CONTENT,
	COMPANY_TABLE_HEADERS,
	ROUTES,
} from "@/const";
import type {
	ColumnDef,
	CompanyDirectoryColumnOptions,
	CompanyDirectoryItem,
} from "@/types";

export function getCompanyDirectoryColumns(
	navigate: NavigateFunction,
	options?: CompanyDirectoryColumnOptions,
): ColumnDef<CompanyDirectoryItem>[] {
	const { onSuspendClick, onReinstateClick } = options ?? {};
	return [
		{
			id: "companyId",
			header: COMPANY_TABLE_HEADERS.companyId,
			accessorKey: "companyId",
			sortable: true,
			minWidth: "90px",
		},
		{
			id: "companyName",
			header: COMPANY_TABLE_HEADERS.companyName,
			accessorKey: "companyName",
			sortable: true,
			minWidth: "300px",
			cell: (row) => (
				<div className="flex min-w-0 flex-col gap-1">
					<span
						className="truncate text-text-foreground"
						title={row.companyName}
					>
						{row.companyName}
					</span>
					<span className="text-mini text-muted-foreground">{row.region}</span>
				</div>
			),
		},
		{
			id: "status",
			header: COMPANY_TABLE_HEADERS.status,
			accessorKey: "status",
			sortable: true,
			minWidth: "100px",
			cell: (row) => {
				const label =
					row.status === "incomplete" && row.completionPercentage != null
						? `${row.status} (${row.completionPercentage}%)`
						: row.status;

				return (
					<div className="flex flex-col gap-1.5">
						<BSPBadge type={row.status} className="capitalize">
							{label}
						</BSPBadge>
						{row.status === "incomplete" &&
							row.completionPercentage != null && (
								<div className="h-0.5 w-full max-w-[122px] overflow-hidden rounded-full bg-brand-gray-bg">
									<div
										className="h-full rounded-full bg-destructive"
										style={{
											width: `${row.completionPercentage}%`,
										}}
									/>
								</div>
							)}
					</div>
				);
			},
		},
		{
			id: "assignedCorporation",
			header: COMPANY_TABLE_HEADERS.assignedCorporation,
			sortable: true,
			minWidth: "246px",
			cell: (row) => {
				if (!row.assignedCorporation) {
					return <span className="text-text-foreground">NA</span>;
				}
				return (
					<div className="flex min-w-0 flex-col gap-1">
						<span
							className="truncate text-text-foreground"
							title={row.assignedCorporation.name}
						>
							{row.assignedCorporation.name}
						</span>
						<span className="text-mini text-muted-foreground">
							{row.assignedCorporation.corporationCode}
						</span>
					</div>
				);
			},
		},
		{
			id: "plan",
			header: COMPANY_TABLE_HEADERS.plan,
			accessorKey: "plan",
			sortable: true,
			minWidth: "246px",
			cell: (row) =>
				row.planName ? (
					<BSPBadge type={row.planTypeId}>{row.planName}</BSPBadge>
				) : (
					<span className="text-muted-foreground">N/A</span>
				),
		},
		{
			id: "createdOn",
			header: COMPANY_TABLE_HEADERS.createdOn,
			accessorKey: "createdOn",
			sortable: true,
			minWidth: "246px",
		},
		{
			id: "lastUpdatedOn",
			header: COMPANY_TABLE_HEADERS.lastUpdatedOn,
			accessorKey: "lastUpdatedOn",
			sortable: true,
			minWidth: "246px",
		},
		{
			id: "actions",
			header: COMPANY_TABLE_HEADERS.actions,
			minWidth: "50px",
			cell: (row) => {
				if (row.status === "incomplete") {
					const steps = row.submittedSteps ?? 0;
					const handleResume = () => {
						const step = Math.max(0, steps);
						const path = ROUTES.companyDirectory.addWithIdPath(row.id);
						navigate(`${path}?flow=edit`, { state: { editStep: step } });
					};

					return (
						<div className="flex gap-1">
							<Button
								variant="ghost"
								size="icon-sm"
								onClick={handleResume}
								aria-label={COMPANIES_DIRECTORY_PAGE_CONTENT.tableResumeButton}
							>
								<PlayCircle className="h-4 w-4" />
							</Button>
						</div>
					);
				}

				const handleEdit = () => {
					navigate(
						`${ROUTES.companyDirectory.addWithIdPath(row.id)}?flow=edit`,
					);
				};

				return (
					<div className="flex gap-1">
						<Button
							variant="ghost"
							size="icon-sm"
							aria-label={COMPANIES_DIRECTORY_PAGE_CONTENT.tableViewButton}
							onClick={() =>
								navigate(ROUTES.companyDirectory.viewWithIdPath(row.id))
							}
						>
							<Eye className="h-4 w-4" />
						</Button>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="icon-sm"
									aria-label={COMPANY_TABLE_HEADERS.actions}
								>
									<MoreVertical className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onSelect={handleEdit}>
									<SquarePen
										className="h-4 w-4 text-icon-primary"
										aria-hidden
									/>
									{COMPANIES_DIRECTORY_PAGE_CONTENT.tableEditButton}
								</DropdownMenuItem>
								{row.status === "suspended" ? (
									<DropdownMenuItem
										onSelect={() => onReinstateClick?.(row)}
										aria-label={
											COMPANIES_DIRECTORY_PAGE_CONTENT.reinstateButton
										}
									>
										<RotateCcw
											className="h-4 w-4 text-icon-primary"
											aria-hidden
										/>
										{COMPANIES_DIRECTORY_PAGE_CONTENT.reinstateButton}
									</DropdownMenuItem>
								) : (
									<DropdownMenuItem
										variant="destructive"
										onSelect={() => onSuspendClick?.(row)}
										aria-label={
											COMPANIES_DIRECTORY_PAGE_CONTENT.tableSuspendButton
										}
									>
										<Ban
											className="h-4 w-4 text-icon-destructive"
											aria-hidden
										/>
										{COMPANIES_DIRECTORY_PAGE_CONTENT.tableSuspendButton}
									</DropdownMenuItem>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				);
			},
		},
	];
}
