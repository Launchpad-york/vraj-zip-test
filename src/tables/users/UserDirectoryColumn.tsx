import {
	Ban,
	CheckCircle,
	Eye,
	MoreVertical,
	RefreshCw,
	SquarePen,
	Trash2,
	XOctagon,
} from "lucide-react";
import { BSPBadge } from "@/components";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { USER_ACTION_LABELS, USER_TABLE_HEADERS } from "@/const";
import type { ColumnDef, UserDirectoryListItem } from "@/types";
import { formatCode } from "@/utils";

function categoryBadgeType(categoryName: string | null): string {
	if (!categoryName) return "default";
	const k = categoryName.toLowerCase();
	if (k.includes("super") && k.includes("admin")) return "internal";
	if (k.includes("corporation") && k.includes("admin")) return "internal";
	if (k.includes("corporate") && k.includes("admin")) return "internal";
	if (k.includes("company") && k.includes("admin")) return "incomplete";
	if (k.includes("executive") || k.includes("leadership")) return "active";
	if (k.includes("client") || k.includes("success")) return "annual";
	if (k.includes("finance") || k.includes("accounting")) return "annual";
	if (k.includes("sales")) return "one_time";
	if (k.includes("bdr")) return "one_time";
	return "monthly";
}

export type UserDirectoryColumnOptions = {
	onViewClick?: (row: UserDirectoryListItem) => void;
	onEditClick?: (row: UserDirectoryListItem) => void;
	onBlockClick?: (row: UserDirectoryListItem) => void;
	onUnblockClick?: (row: UserDirectoryListItem) => void;
	onResendInviteClick?: (row: UserDirectoryListItem) => void;
	onCancelInvitationClick?: (row: UserDirectoryListItem) => void;
	onRemoveClick?: (row: UserDirectoryListItem) => void;
};

export function getUserDirectoryColumns(
	options?: UserDirectoryColumnOptions,
): ColumnDef<UserDirectoryListItem>[] {
	const {
		onViewClick,
		onEditClick,
		onBlockClick,
		onUnblockClick,
		onResendInviteClick,
		onCancelInvitationClick,
		onRemoveClick,
	} = options ?? {};
	return [
		{
			id: "userCode",
			header: USER_TABLE_HEADERS.userCode,
			accessorKey: "userCode",
			sortable: true,
			minWidth: "120px",
			cell: (row) => formatCode(row.userCode, "USER"),
		},
		{
			id: "name",
			header: USER_TABLE_HEADERS.userName,
			sortable: true,
			minWidth: "220px",
			cell: (row) => {
				const name = [row.firstName, row.lastName].filter(Boolean).join(" ");
				return (
					<div className="flex min-w-0 flex-col">
						<span className="truncate text-text-foreground" title={name}>
							{name || "N/A"}
						</span>
						<span className="text-mini text-muted-foreground">{row.email}</span>
					</div>
				);
			},
		},
		{
			id: "status",
			header: USER_TABLE_HEADERS.status,
			accessorKey: "status",
			sortable: true,
			minWidth: "130px",
			cell: (row) => (
				<BSPBadge type={row.status} className="capitalize">
					{row.status}
				</BSPBadge>
			),
		},
		{
			id: "corporationName",
			header: USER_TABLE_HEADERS.corporation,
			sortable: true,
			minWidth: "170px",
			cell: (row) => {
				const name = row.corporationName ?? "N/A";
				if (row.corporationCode != null) {
					return (
						<div className="flex min-w-0 flex-col">
							<span className="truncate text-text-foreground" title={name}>
								{name}
							</span>
							<span className="text-mini text-muted-foreground">
								{formatCode(row.corporationCode, "CORP")}
							</span>
						</div>
					);
				}
				return <span className="text-text-foreground">{name}</span>;
			},
		},
		{
			id: "companyName",
			header: USER_TABLE_HEADERS.company,
			sortable: true,
			minWidth: "210px",
			cell: (row) => (
				<div className="flex min-w-0 flex-col">
					<span
						className="truncate text-text-foreground"
						title={row.company?.companyName}
					>
						{row.company?.companyName ?? "N/A"}
					</span>
					<span className="text-mini text-muted-foreground">
						{row.company?.region ?? ""}
					</span>
				</div>
			),
		},
		{
			id: "roleName",
			header: USER_TABLE_HEADERS.roleName,
			accessorKey: "roleName",
			sortable: true,
			minWidth: "210px",
			cell: (row) => row.roleName ?? "N/A",
		},
		{
			id: "categoryName",
			header: USER_TABLE_HEADERS.category,
			sortable: true,
			minWidth: "300px",
			cell: (row) =>
				row.categoryName ? (
					<BSPBadge type={categoryBadgeType(row.categoryName)}>
						{row.categoryName}
					</BSPBadge>
				) : (
					"N/A"
				),
		},
		{
			id: "workPhone",
			header: USER_TABLE_HEADERS.workPhone,
			accessorKey: "workPhone",
			minWidth: "200px",
			cell: (row) => row.workPhone ?? "N/A",
		},
		{
			id: "timezone",
			header: USER_TABLE_HEADERS.timeZone,
			accessorKey: "timezone",
			sortable: true,
			minWidth: "220px",
			cell: (row) => row.timezone ?? "N/A",
		},
		{
			id: "createdAt",
			header: USER_TABLE_HEADERS.createdOn,
			accessorKey: "createdAt",
			sortable: true,
			minWidth: "220px",
		},
		{
			id: "actions",
			header: USER_TABLE_HEADERS.actions,
			minWidth: "100px",
			cell: (row) => {
				const s = row.status.toLowerCase();
				const isPending = s === "pending";
				const isBlocked = s === "blocked";
				const isExpired = s === "expired";

				const renderStatusActions = () => {
					if (isPending) {
						return (
							<>
								<DropdownMenuItem onSelect={() => onResendInviteClick?.(row)}>
									<RefreshCw
										className="h-4 w-4 text-icon-primary"
										aria-hidden
									/>
									{USER_ACTION_LABELS.resendInvite}
								</DropdownMenuItem>
								<DropdownMenuItem
									variant="destructive"
									onSelect={() => onCancelInvitationClick?.(row)}
								>
									<XOctagon
										className="h-4 w-4 text-icon-destructive"
										aria-hidden
									/>
									{USER_ACTION_LABELS.cancelInvitation}
								</DropdownMenuItem>
							</>
						);
					}

					if (isExpired) {
						return (
							<DropdownMenuItem onSelect={() => onResendInviteClick?.(row)}>
								<RefreshCw className="h-4 w-4 text-icon-primary" aria-hidden />
								{USER_ACTION_LABELS.resendInvite}
							</DropdownMenuItem>
						);
					}

					if (isBlocked) {
						return (
							<DropdownMenuItem onSelect={() => onUnblockClick?.(row)}>
								<CheckCircle
									className="h-4 w-4 text-interactive-success"
									aria-hidden
								/>
								<span className="text-interactive-success">
									{USER_ACTION_LABELS.unblockUser}
								</span>
							</DropdownMenuItem>
						);
					}

					return (
						<DropdownMenuItem
							variant="destructive"
							onSelect={() => onBlockClick?.(row)}
						>
							<Ban className="h-4 w-4 text-icon-destructive" aria-hidden />
							{USER_ACTION_LABELS.blockUser}
						</DropdownMenuItem>
					);
				};

				return (
					<div className="flex gap-1">
						<Button
							variant="ghost"
							size="icon-sm"
							onClick={() => onViewClick?.(row)}
						>
							<Eye className="h-4 w-4" />
						</Button>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="icon-sm"
									aria-label={USER_TABLE_HEADERS.actions}
								>
									<MoreVertical className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onSelect={() => onEditClick?.(row)}>
									<SquarePen
										className="h-4 w-4 text-icon-primary"
										aria-hidden
									/>
									{USER_ACTION_LABELS.edit}
								</DropdownMenuItem>
								{renderStatusActions()}
								<DropdownMenuItem
									variant="destructive"
									onSelect={() => onRemoveClick?.(row)}
								>
									<Trash2
										className="h-4 w-4 text-icon-destructive"
										aria-hidden
									/>
									{USER_ACTION_LABELS.removeUser}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				);
			},
		},
	];
}
