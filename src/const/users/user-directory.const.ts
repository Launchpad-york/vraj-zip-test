import type { UserDirectoryTabId, UserStatusFilter } from "@/types";

export const USER_DIRECTORY_PAGE_CONTENT = {
	breadcrumbsTitle: "User Directory",
	title: "Users",
	subtitle: "Manage users across all corporations",
	bulkUploadButton: "Bulk Upload",
	inviteUserButton: "Invite User",
	searchPlaceholder: "Search username or email...",
	searchPlaceholderContacts: "Search contact name or email...",
	searchAriaLabel: "Search users",
	statusFilterAriaLabel: "Filter by status",
	statusFilterAllLabel: "All Status",
	categoriesFilterAriaLabel: "Filter by categories",
	categoriesFilterAllLabel: "All Categories",
	companiesFilterAriaLabel: "Filter by company",
	companiesFilterAllLabel: "All Companies",
	moreFiltersButton: "Filters",
	noData: "No users found.",
} as const;

export const USER_DIRECTORY_TABS: {
	id: UserDirectoryTabId;
	label: string;
}[] = [
	{ id: "users", label: "Users" },
	{ id: "contacts", label: "Contacts" },
];

export const USER_STATUS_FILTER_OPTIONS: ReadonlyArray<{
	value: "all" | UserStatusFilter;
	label: string;
}> = [
	{ value: "all", label: "All Status" },
	{ value: "active", label: "Active" },
	{ value: "pending", label: "Pending" },
	{ value: "expired", label: "Expired" },
	{ value: "blocked", label: "Blocked" },
];

export const USER_TABLE_HEADERS = {
	userCode: "User ID",
	userName: "User Name",
	status: "Status",
	corporation: "Corporation",
	company: "Company",
	roleName: "Role Name",
	category: "Category",
	workPhone: "Work Phone No.",
	timeZone: "Time Zone",
	createdOn: "Created On",
	actions: "Actions",
} as const;

export const CONTACT_TABLE_HEADERS = {
	contactCode: "Contact ID",
	name: "Contact Name",
	corporationName: "Corporation",
	companyName: "Company",
	contactType: "Contact Type",
	jobRole: "Job Role",
	workPhone: "Work Phone No.",
	timezone: "Time Zone",
	createdAt: "Created On",
	actions: "Actions",
} as const;

export const CONTACT_ACTION_LABELS = {
	edit: "Edit",
	sendInvite: "Send Invite",
	removeContact: "Remove Contact",
} as const;

export const CONTACT_DIRECTORY_PAGE_CONTENT = {
	addContactButton: "Add Contact",
	contactTypesFilterAriaLabel: "Filter by contact type",
	contactTypesFilterAllLabel: "All Contact Types",
	noData: "No contacts found.",
} as const;

/** `contact_type` options for GET /key-contacts?contactType=. */
export const CONTACT_TYPE_FILTER_OPTIONS = [
	{ value: "all", label: "All Contact Types" },
	{ value: "exec_sponsor", label: "Executive Sponsor" },
	{ value: "budget_owner", label: "Budget Owner" },
	{ value: "primary_contact", label: "Primary Contact" },
	{ value: "implementation_lead", label: "Implementation Lead" },
	{ value: "project_manager", label: "Project Manager" },
	{ value: "technical_it_lead", label: "Technical / IT Lead" },
	{ value: "platform_administrator", label: "Platform Administrator" },
	{ value: "hr_program_owner", label: "HR / Program Owner" },
	{ value: "training_coordinator", label: "Training Coordinator" },
	{ value: "finance_billing_contact", label: "Finance / Billing Contact" },
	{ value: "legal_compliance_contact", label: "Legal / Compliance Contact" },
	{ value: "power_user_champion", label: "Power User / Champion" },
	{
		value: "behavioural_assessment_administrator",
		label: "Behavioural Assessment Administrator",
	},
	{ value: "team_leader_manager", label: "Team Leader / Manager" },
	{
		value: "culture_leadership_program_owner",
		label: "Culture / Leadership Program Owner",
	},
	{
		value: "hr_talent_development_owner",
		label: "HR / Talent Development Owner",
	},
] as const;

export const MORE_FILTERS_CONTENT = {
	title: "More Filters",
	noFiltersApplied: "No filters applied",
	corporationLabel: "Corporation",
	corporationSearchPlaceholder: "Search for corporation",
	companyLabel: "Company",
	companySearchPlaceholder: "Search for company",
	timeZoneLabel: "Time Zone",
	clearAllButton: "Clear All",
	applyFiltersButton: "Apply Filters",
} as const;

export const MORE_FILTERS_TIMEZONE_OPTIONS = [
	{ value: "EST (Eastern Time)", label: "EST (Eastern Time)" },
	{ value: "CST (Central Time)", label: "CST (Central Time)" },
	{ value: "MST (Mountain Time)", label: "MST (Mountain Time)" },
	{ value: "PST (Pacific Time)", label: "PST (Pacific Time)" },
	{ value: "AKST (Alaska Time)", label: "AKST (Alaska Time)" },
	{ value: "HST (Hawaii Time)", label: "HST (Hawaii Time)" },
] as const;

export const USER_ACTION_LABELS = {
	edit: "Edit",
	blockUser: "Block User",
	unblockUser: "Unblock User",
	resendInvite: "Resend Invite",
	cancelInvitation: "Cancel Invitation",
	removeUser: "Remove User",
} as const;

export const SEND_INVITE_DIALOG_CONTENT = {
	title: "Send Invite?",
	description: "This action will send an invitation to this contact.",
	sendInviteButton: "Send Invite",
	cancelButton: "Cancel",
} as const;
