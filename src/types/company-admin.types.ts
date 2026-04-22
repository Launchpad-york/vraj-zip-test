export type CompanyAdminTrialSummary = {
	zeroTrial: boolean;
	trialLengthDays: number;
	trialStartDate: string | null;
	trialEndDate: string | null;
	autoConvertTrial: boolean;
};

export type CompanyAdminPricingSummary = {
	planPrice: string;
	discount: string;
	invoiceAmount: string;
	billingCurrency: string;
	promoCode: string | null;
};

export type CompanyAdminPlanSummary = {
	pricingPlanId: string;
	planTypeId: string;
	planTypeName: string;
	stripePriceConfigured: boolean;
	customerType: string;
	employeeRangeLabel: string | null;
	listPrice: string;
	trial: CompanyAdminTrialSummary | null;
	pricing: CompanyAdminPricingSummary;
};

/** One company the admin can manage (review, checkout, or overview). */
export type CompanyAdminCompanyItem = {
	companyId: string;
	corporationId: string;
	hasActiveSubscription: boolean;
	subscriptionStatus: string | null;
	corporation: {
		legalName: string;
		ownershipType: string;
		dataResidencyRegion: string;
	};
	company: {
		legalName: string;
		dbaName: string | null;
		website: string | null;
		companyType: string;
		officeType: string;
		industry: string;
		phoneNo: string | null;
		addressFormatted: string;
	};
	planSummary: CompanyAdminPlanSummary | null;
	canCheckout: boolean;
};

export type CompanyBasicDetailsReviewProps = {
	corporation: CompanyAdminCompanyItem["corporation"];
	company: CompanyAdminCompanyItem["company"];
};

export type CompanyAdminCompaniesListProps = {
	companies: CompanyAdminCompanyItem[];
	onProceedToPayment: (company: CompanyAdminCompanyItem) => void;
	onViewCompany: (company: CompanyAdminCompanyItem) => void;
};

export type CompanyAdminCompanyOverviewProps = {
	review: CompanyAdminCompanyItem;
	/** When set, show back control to return to the multi-company list. */
	onBackToList?: () => void;
};

export type CompanyAdminOnboardingFlowProps = CompanyAdminCompanyOverviewProps;

/** @deprecated Use CompanyAdminCompanyItem */
export type CompanyAdminOnboardingReview = CompanyAdminCompanyItem;

export type CompanyAdminDashboardResponse = {
	companies: CompanyAdminCompanyItem[];
};

/** Multi-company dashboard: which full-screen flow is open for a selected company. */
export type CompanyAdminDashboardDetail =
	| { kind: "onboarding"; company: CompanyAdminCompanyItem }
	| { kind: "overview"; company: CompanyAdminCompanyItem };
