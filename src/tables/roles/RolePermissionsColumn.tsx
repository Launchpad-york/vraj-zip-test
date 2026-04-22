import { Checkbox } from "@/components/ui/checkbox";
import { ROLES_PAGE_CONTENT } from "@/const";
import type { ColumnDef, ModuleWithPermissions } from "@/types";

export function getRolePermissionColumns(
	permissionIdSet: Set<string>,
	togglePermission: (permissionId: string | null, checked: boolean) => void,
): ColumnDef<ModuleWithPermissions>[] {
	return [
		{
			id: "module",
			header: ROLES_PAGE_CONTENT.modules,
			accessorKey: "name",
			sortable: false,
			minWidth: "240px",
			cellClassName: "text-text-foreground",
		},
		{
			id: "add",
			header: ROLES_PAGE_CONTENT.add,
			sortable: false,
			minWidth: "72px",
			cellClassName: "align-middle w-18 min-w-18",
			cell: (row) =>
				row.permissions.add ? (
					<div className="inline-flex size-6 min-w-6 min-h-6 items-center justify-center">
						<Checkbox
							checked={permissionIdSet.has(row.permissions.add)}
							onCheckedChange={(v) =>
								togglePermission(row.permissions.add, v === true)
							}
							aria-label={`${row.name} ${ROLES_PAGE_CONTENT.add}`}
							className="shrink-0"
						/>
					</div>
				) : (
					<span className="text-muted-foreground">
						{ROLES_PAGE_CONTENT.emptyPermissionCell}
					</span>
				),
		},
		{
			id: "update",
			header: ROLES_PAGE_CONTENT.update,
			sortable: false,
			minWidth: "72px",
			cellClassName: "align-middle w-18 min-w-18",
			cell: (row) =>
				row.permissions.update ? (
					<div className="inline-flex size-6 min-w-6 min-h-6 items-center justify-center">
						<Checkbox
							checked={permissionIdSet.has(row.permissions.update)}
							onCheckedChange={(v) =>
								togglePermission(row.permissions.update, v === true)
							}
							aria-label={`${row.name} ${ROLES_PAGE_CONTENT.update}`}
							className="shrink-0"
						/>
					</div>
				) : (
					<span className="text-muted-foreground">
						{ROLES_PAGE_CONTENT.emptyPermissionCell}
					</span>
				),
		},
		{
			id: "view",
			header: ROLES_PAGE_CONTENT.view,
			sortable: false,
			minWidth: "72px",
			cellClassName: "align-middle w-18 min-w-18",
			cell: (row) =>
				row.permissions.view ? (
					<div className="inline-flex size-6 min-w-6 min-h-6 items-center justify-center">
						<Checkbox
							checked={permissionIdSet.has(row.permissions.view)}
							onCheckedChange={(v) =>
								togglePermission(row.permissions.view, v === true)
							}
							aria-label={`${row.name} ${ROLES_PAGE_CONTENT.view}`}
							className="shrink-0"
						/>
					</div>
				) : (
					<span className="text-muted-foreground">
						{ROLES_PAGE_CONTENT.emptyPermissionCell}
					</span>
				),
		},
		{
			id: "remove",
			header: ROLES_PAGE_CONTENT.remove,
			sortable: false,
			minWidth: "72px",
			cellClassName: "align-middle w-18 min-w-18",
			cell: (row) =>
				row.permissions.remove ? (
					<div className="inline-flex size-6 min-w-6 min-h-6 items-center justify-center">
						<Checkbox
							checked={permissionIdSet.has(row.permissions.remove)}
							onCheckedChange={(v) =>
								togglePermission(row.permissions.remove, v === true)
							}
							aria-label={`${row.name} ${ROLES_PAGE_CONTENT.remove}`}
							className="shrink-0"
						/>
					</div>
				) : (
					<span className="text-muted-foreground">
						{ROLES_PAGE_CONTENT.emptyPermissionCell}
					</span>
				),
		},
	];
}
