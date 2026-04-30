import type { KeyContactType, ViewCompanyTabId } from "@/types";

export const COMPANIES_DIRECTORY_PAGE_CONTENT = {
	breadcrumbsTitle: "Company Directory",
	backButton: "Back",
	viewCompanyNotFound: "Company not found.",
	backToCompanyDirectory: "Back to Company Directory",
	viewEditCompanyButton: "Edit Company",
	viewSuspendButton: "Suspend",
	viewReinstateButton: "Reinstate",
	viewTabBasicInfo: "Basic Info.",
	viewTabKeyContacts: "Key Contacts",
	viewTabPlanSeats: "Plan & Seats",
	viewTabBranding: "Branding",
	viewTabConfiguration: "Configuration",
	viewTrialConfigurationCard: "Trial Configuration",
	viewPlanConfigurationCard: "Plan Configuration",
	viewGeneralSettingsCard: "General Settings",
	viewFieldZeroTrial: "Zero Trial",
	viewFieldTrialLength: "Trial Length",
	viewFieldTrialStartDate: "Trial Start Date",
	viewFieldTrialEndDate: "Trial End Date",
	viewFieldAutoConvertTrial: "Auto-convert Trial",
	viewAutoConvertOnDefault: "On (Default)",
	viewOn: "On",
	viewOff: "Off",
	viewNotApplicable: "NA",
	viewFieldPricePerAssessment: "Price per Assessment",
	viewPlanDetailsUnavailable:
		"Plan details are not available for this company yet.",
	viewCardCompanyBasics: "Company Basics",
	viewCardParentCorporation: "Parent Corporation Info.",
	viewFieldCompanyId: "Company ID",
	title: "Companies",
	subtitle: "Manage all physical Companies and their corporation assignments",
	addNewCompanyButton: "Add New Company",
	searchPlaceholder: "Search company or corporation name...",
	searchAriaLabel: "Search companies",
	statusFilterAriaLabel: "Filter by status",
	corporationFilterAriaLabel: "Filter by corporation",
	planFilterAriaLabel: "Filter by plan",
	dateFilterAriaLabel: "Filter by date range",
	statusFilterAllLabel: "All Status",
	corporationFilterAllLabel: "All Corporations",
	corporationFilterNoResultsLabel: "No matching corporations",
	planFilterAllLabel: "All Plans",
	dateFilterAllLabel: "All time",
	noData: "No companies found.",
	tableResumeButton: "Resume setup",
	tableViewButton: "View company",
	tableEditButton: "Edit",
	tableSuspendButton: "Suspend",
	reinstateButton: "Reinstate",
	tableDeleteButton: "Delete",
	paginationInfo: (showing: number, total: number) =>
		`Showing ${showing} of ${total} results`,
	previousButton: "Previous",
	nextButton: "Next",
} as const;

export const VIEW_COMPANY_TABS: {
	id: ViewCompanyTabId;
	label: string;
}[] = [
	{ id: "basic", label: COMPANIES_DIRECTORY_PAGE_CONTENT.viewTabBasicInfo },
	{
		id: "keyContacts",
		label: COMPANIES_DIRECTORY_PAGE_CONTENT.viewTabKeyContacts,
	},
	{ id: "planSeats", label: COMPANIES_DIRECTORY_PAGE_CONTENT.viewTabPlanSeats },
	{ id: "branding", label: COMPANIES_DIRECTORY_PAGE_CONTENT.viewTabBranding },
	{
		id: "configuration",
		label: COMPANIES_DIRECTORY_PAGE_CONTENT.viewTabConfiguration,
	},
];

export const COMPANY_TABLE_HEADERS = {
	companyId: "Company ID",
	companyName: "Company Name",
	status: "Status",
	assignedCorporation: "Assigned Corporation",
	plan: "Plan",
	createdOn: "Created On",
	lastUpdatedOn: "Last Updated On",
	actions: "Actions",
} as const;

export const COMPANY_DATE_FILTER_OPTIONS = [
	{ value: "all", label: "All time" },
	{ value: "last24Hours", label: "Last 24 hours" },
	{ value: "last7Days", label: "Last 7 days" },
	{ value: "last30Days", label: "Last 30 days" },
	{ value: "last3Months", label: "Last 3 months" },
	{ value: "last6Months", label: "Last 6 months" },
	{ value: "lastYear", label: "Last year" },
] as const;

export const ADD_NEW_COMPANY_STEPS = [
	{
		id: "basic-info",
		title: "Basic Info.",
		subtitle: "Company-based details",
	},
	{
		id: "key-contacts",
		title: "Key Contacts",
		subtitle: "Operating unit setup",
	},
	{
		id: "plan-seats",
		title: "Plan & Seats",
		subtitle: "Subscription setup",
	},
	{
		id: "configuration",
		title: "Configuration",
		subtitle: "General settings for security & branding experience.",
	},
	{
		id: "confirmation",
		title: "Confirmation",
		subtitle: "Review & submit details",
	},
] as const;

export const ADD_NEW_COMPANY_CONTENT = {
	pageTitle: "Add New Company",
	pageSubtitle:
		"Set up a new company with its basic details, plan, permissions & general configuration settings.",
	editPageTitle: "Edit Company",
	editPageSubtitle:
		"Update company details, plan, permissions, and general configuration settings.",
	progress: "Complete",
	toast: {
		companyCreated: "Company created successfully.",
		companyUpdated: "Company updated successfully.",
	},
	buttons: {
		cancel: "Cancel",
		previous: "Previous",
		next: "Next",
		confirmAdd: "Confirm & Add",
		confirmUpdate: "Confirm & Update",
	},
	basicInfo: {
		title: "Basic Info.",
		subtitle: "Enter the core details for the new company.",
	},
	keyContacts: {
		title: "Key Contacts",
		subtitle: "Setup the operating unit for the company.",
		sections: {
			finance: "Finance/ Billing Contact",
			technical: "Technical/ IT Lead",
			implementation_lead: "Implementation Lead",
			hr: "HR/ Program Owner",
		},
	},
	planAndSeats: {
		title: "Plan & Seats",
		subtitle: "Manage your plan allocations and seats assignments.",
		loadingPlans: "Loading plans…",
		plansLoadError: "Unable to load pricing plans.",
		noCompanyPlansForTab: "No company plans available for this selection.",
		zeroTrial: {
			label: "Zero Trial",
			description: "Skip trial and activate paid access immediately.",
		},
		trialConfiguration: {
			title: "Trial Configuration",
			trialLength: "Trial Length",
			trialStartDate: "Trial Start Date",
			trialEndDate: "Trial End Date",
			autoConvertTitle: "Auto-convert Trial - On (Default)",
			autoConvertDescription:
				"The subscription will automatically convert to a paid plan using the saved payment method once the trial period ends.",
		},
		planConfiguration: {
			title: "Plan Configuration",
			hasPromoCode: "Has Promo Code?",
			hasPromoCodeDescription:
				"Enable only if you have a valid promotional code.",
			promoCode: "Promo Code",
			promoCodePlaceholder: "e.g., BSP100OFF",
			planLevel: "Plan Level",
			planPrice: "Plan Price",
			discount: "Discount",
			invoiceAmount: "Invoice Amount",
			billingCurrency: "Billing Currency",
		},
		placeholders: {
			planLevel: "Select plan level",
			trialStartDate: "Select trial start date",
			endDate: "mm-dd-yyyy",
		},
		trialLengthOptions: [
			{ value: "7", label: "7 days" },
			{ value: "14", label: "14 days" },
			{ value: "30", label: "30 days" },
			{ value: "60", label: "60 days" },
			{ value: "90", label: "90 days" },
		],
		billingCurrencyOptions: [
			{ value: "usd", label: "USD ($)" },
			{ value: "eur", label: "EUR (€)" },
			{ value: "gbp", label: "GBP (£)" },
			{ value: "cad", label: "CAD (C$)" },
		],
		individualPlan: {
			bannerTitle: "Plan Configuration Managed by Company Admin",
			bannerDescription: (cost: string, currency: string) =>
				`This plan is configured at the company level by the Company Admin. Each assessment costs ${cost}, and all billing is processed in ${currency}.`,
			billingCurrency: "USD ($)",
			promoCodeLabel: "Promo Code",
		},
		validation: {
			trialStartDateInvalid: "Enter a valid trial start date",
			discountInvalidAmount: "Enter a valid discount amount",
			discountExceedsPlanPrice: "Discount cannot exceed plan price",
		},
	},
	configuration: {
		title: "Configuration",
		subtitle: "General settings for security & branding experience.",
		generalSettings: {
			title: "General Settings",
			authenticationMethod: "Authentication Method",
			passwordPolicy: "Password Policy",
			twoFaRequirement: "2FA Requirement (Inherited)",
			sessionTimeout: "Session Timeout (In minutes)",
			securityPosture: "Security Posture",
			primaryLanguage: "Primary Language",
			placeholders: {
				authenticationMethod: "Select authentication method",
				passwordPolicy: "Select password policy",
				twoFaRequirement: "Select 2FA requirement",
				sessionTimeout: "Select session timeout",
				securityPosture: "Select security posture",
				primaryLanguage: "Select primary language",
			},
		},
		errors: {
			missingCompanyId:
				"Company information is not loaded. Complete the previous steps first.",
		},
		branding: {
			title: "Branding",
			logoRemovedSuccess: "Logo removed.",
			uploadLogo: "Upload Logo",
			noteTitle: "Note",
			noteDescription:
				"Display settings remain consistent with BSPBlueprint Branding & overall experience.",
			uploadLabel: "Click to upload or drag-&-drop file",
			uploadHint: "Supported file formats are PNG & JPG up to 10MB",
			removeLogo: "Remove logo",
			logoAlt: "Company logo",
			errors: {
				unsupportedFormat: "Logo must be a PNG or JPG file.",
				fileTooLarge: "Logo size must not exceed 10 MB.",
				imageLoadFailed: "Image could not be loaded. Try a different file.",
				removeFailed: "Failed to remove logo. Please try again.",
			},
		},
	},
	confirmation: {
		title: "Confirmation",
		subtitle: "Review all the details that have been added.",
		noteTitle: "Note",
		noteBodyBefore:
			"Kindly review the information below to ensure everything is correct, then click ",
		noteBodyAfter: " to create the company.",
		noteBodyAfterEdit: " to update the company.",
		sections: {
			corporationInfo: "Corporation Info.",
			corporationAdminInfo: "Corporation Admin Info.",
			companyInfo: "Company Info.",
			companyAdminInfo: "Company Admin Info.",
			keyContacts: "Key Contacts",
			planConfiguration: "Plan Configuration",
			configuration: "Configuration",
			brandingExperience: "Branding & Experience",
		},
		planFields: {
			plan: "Plan",
			promoCode: "Promo Code",
			planLevel: "Plan Level",
			planPrice: "Plan Price",
			discount: "Discount",
			invoiceAmount: "Invoice Amount",
			billingCurrency: "Billing Currency",
			pricePerAssessment: "Price per Assessment",
		},
		/** Summary labels on confirmation (match Figma; form step may use longer copy). */
		configurationSummaryLabels: {
			sessionTimeout: "Session Timeout",
		},
	},
	cards: {
		parentCorporation: "Parent Corporation",
		companyInfo: "Company Info.",
		companyAddress: "Company Address",
		companyAdmin: "Company Admin",
	},
	parentCorporationAlertTitle: "Didn't find your parent corporation?",
	parentCorporationAlertDescription:
		"If you are unable to see your corporation in the above dropdown list then kindly create new one.",
	addNewCorporationButton: "Add New Corporation",
	sameAsCorpAdminLabel: "Same as corporation admin",
	fields: {
		parentCorporationLegalName: "Parent Corporation Legal Name",
		ownershipType: "Ownership Type",
		companyLegalName: "Company Legal Name",
		dbaTradeName: "DBA/ Trade Name",
		websiteUrl: "Website URL",
		companyType: "Company Type",
		officeType: "Office Type",
		region: "Region (Data Residency)",
		industry: "Industry",
		companyPhoneNo: "Company Phone No.",
		addressLine: "Address Line",
		stateProvince: "State/ Province",
		city: "City",
		country: "Country",
		zipPostalCode: "ZIP/ Postal Code",
		firstName: "First Name",
		lastName: "Last Name",
		nickname: "Nickname",
		jobRole: "Job Role",
		email: "Email",
		workPhoneNo: "Work Phone No.",
		cellPhoneNo: "Cell Phone No.",
	},
	placeholders: {
		parentCorporationLegalName: "Select parent corporation",
		parentCorporationNoMatches: "No matching corporations",
		ownershipType: "e.g., Wholly Owned",
		companyLegalName: "e.g., Acme Inc.",
		dbaTradeName: "e.g., Acme Co.",
		websiteUrl: "e.g., https://www.acme.com",
		companyType: "Select company type",
		officeType: "Select office type",
		region: "Select region",
		industry: "Select industry.",
		companyPhoneNo: "e.g., +1 (555) 123-4567",
		addressLine: "Address line",
		stateProvince: "Select state/ province",
		city: "Select city",
		country: "Select country",
		zipPostalCode: "Enter zip/ postal code",
		firstName: "e.g., Arthur",
		lastName: "e.g., Harold",
		nickname: "e.g., Arold",
		jobRole: "e.g., Administrator",
		email: "e.g., arthur_harold@email.com",
		workPhoneNo: "e.g., +1 (555) 123-4567",
		cellPhoneNo: "e.g., +1 (555) 123-4567",
	},
} as const;

/**
 * Select `value` strings match the multipart text fields sent to
 * PUT /corporations/companies/:companyId/configuration (authMethod, passwordPolicy, mfa, etc.).
 */
export const ADD_NEW_COMPANY_CONFIGURATION_OPTIONS = {
	authenticationMethods: [
		{ value: "Email & Password", label: "Email & Password" },
	],
	passwordPolicies: [
		{
			value: "Standard (8+ Characters & Mixed case)",
			label: "Standard (8+ Characters & Mixed case)",
		},
	],
	twoFaRequirements: [
		{ value: "Required", label: "Required" },
		{ value: "Optional", label: "Optional" },
		{ value: "Disabled", label: "Disabled" },
	],
	sessionTimeouts: [{ value: "60 min", label: "60 min" }],
	primaryLanguages: [
		{ value: "English (US)", label: "English (US)" },
		{ value: "Spanish", label: "Spanish" },
	],
	securityPostures: [
		{ value: "Standard", label: "Standard" },
		{ value: "Enhanced", label: "Enhanced" },
		{ value: "Enterprise", label: "Enterprise" },
	],
} as const;

/** Mock parent corporation options for Add Company (no API). */
export const ADD_NEW_COMPANY_PARENT_CORPORATION_OPTIONS = [
	{ value: "acme-corp", label: "Acme Corporation" },
	{ value: "beta-solutions", label: "Beta Solutions" },
	{ value: "alpha-innovations", label: "Alpha Innovations" },
] as const;

export const KEY_CONTACTS_CONFIRMATION: {
	type: KeyContactType;
	label: string;
}[] = [
	{
		type: "finance",
		label: ADD_NEW_COMPANY_CONTENT.keyContacts.sections.finance,
	},
	{
		type: "implementation_lead",
		label: ADD_NEW_COMPANY_CONTENT.keyContacts.sections.implementation_lead,
	},
	{
		type: "technical",
		label: ADD_NEW_COMPANY_CONTENT.keyContacts.sections.technical,
	},
	{ type: "hr", label: ADD_NEW_COMPANY_CONTENT.keyContacts.sections.hr },
];

export const VIEW_COMPANY_KEY_CONTACT_GRID: {
	type: KeyContactType;
	title: string;
}[] = [
	{
		type: "finance",
		title: ADD_NEW_COMPANY_CONTENT.keyContacts.sections.finance,
	},
	{
		type: "technical",
		title: ADD_NEW_COMPANY_CONTENT.keyContacts.sections.technical,
	},
	{
		type: "implementation_lead",
		title: ADD_NEW_COMPANY_CONTENT.keyContacts.sections.implementation_lead,
	},
	{ type: "hr", title: ADD_NEW_COMPANY_CONTENT.keyContacts.sections.hr },
];
