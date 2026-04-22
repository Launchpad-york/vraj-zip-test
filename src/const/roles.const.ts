export const ROLES_PAGE_CONTENT = {
	title: "Roles & Permissions",
	subtitle: "Manage global role templates and permission sets",
	searchPlaceholder: "Search by role name here...",
	searchAriaLabel: "Search roles by name",
	viewAllPermissions: "View All Permission",
	addNewRole: "Add New Role",
	allCategories: "All categories",
	categoryFilterAriaLabel: "Filter by category",
	noData: "No roles found",
	roleName: "Role Name",
	category: "Category",
	roleType: "Role Type",
	description: "Description",
	actions: "Actions",
	edit: "Edit",
	delete: "Delete",
	// Add / Edit form
	addNewRoleTitle: "Add New Role",
	editRoleTitle: "Edit Role-based Permissions",
	roleNamePlaceholder: "Enter role name",
	categoryPlaceholder: "Select category",
	descriptionPlaceholder: "Enter role-based description here...",
	markAsPrivate: "Mark as Private",
	markAsExternal: "Mark as External",
	permissionsHint:
		"Provide specific permissions by selecting the required checkboxes.",
	modules: "Modules",
	add: "Add",
	update: "Update",
	view: "View",
	remove: "Remove",
	saveAndAddRole: "Save & Add Role",
	saveAndUpdate: "Save & Update",
	back: "Back",
	atLeastOnePermission: "At least one permission must be selected.",
	// Form validation (RoleForm)
	roleNameRequired: "Role name is required",
	categoryRequired: "Category is required",
	descriptionRequired: "Description is required",
	// Permission grid empty state
	emptyPermissionCell: "—",
	noPermissionsConfigured: "No permissions configured.",
	// Messages & toasts (Add/Edit role pages)
	roleIdMissing: "Role ID is missing",
	permissionDataUnavailable: "Permission data is temporarily unavailable.",
	roleNotFound: "Role not found",
	failedToUpdateRole: "Failed to update role",
	failedToCreateRole: "Failed to create role",
	roleCreatedSuccess: "Role created successfully",
	roleUpdatedSuccess: "Role updated successfully",
	roleDeletedSuccess: "Role deleted successfully",
	failedToDeleteRole: "Failed to delete role",
	cannotDeleteSuperAdmin: "Super Admin role cannot be deleted",
	// Delete confirmation dialog
	deleteRoleDialogTitle: "Delete role?",
	deleteRoleDialogDescription:
		"This will permanently remove this role. This action cannot be undone.",
	deleteRoleDialogConfirm: "Delete",
	deleteRoleDialogCancel: "Cancel",
} as const;

/** Category name reserved for system; not selectable when creating or editing roles. */
export const SUPER_ADMIN_CATEGORY_NAME = "Super Admin";

/** Category names for which "Mark as External" is checked by default on add/edit role. */
export const EXTERNAL_DEFAULT_CATEGORY_NAMES = [
	"Corporation Admin",
	"Company Admin",
] as const;
