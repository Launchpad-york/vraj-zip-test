import type { ChangeEventHandler } from "react";
import type {
	PricingPlanLevel,
	PricingPlanType,
} from "@/types/common/pricing.types";

/** Plan configuration */
export type PlanConfigSnapshot = {
	selectedPlanId: string;
	discount: string;
	hasPromoCode: boolean;
	promoCode: string;
};

/** Plan type tab strip (pricing API groups). */
export type PlanTypeTabsProps = {
	planTypes: PricingPlanType[];
	activePlanTypeId: string;
	onSelect: (id: string) => void;
};

/** Shared promo code field (Plan & Seats). */
export type PromoCodeFieldProps = {
	id: string;
	value: string;
	onChange: (value: string) => void;
	error?: string;
};

/** Individual / one_time plan banner + promo block. */
export type IndividualPlanSectionProps = {
	oneTimeCompanyPlanPrice: number;
	hasPromoCode: boolean;
	onHasPromoCodeChange: (v: boolean) => void;
	promoCode: string;
	onPromoCodeChange: (v: string) => void;
	promoCodeError?: string;
};

/** Monthly plan: zero trial + trial configuration. */
export type MonthlyTrialSectionProps = {
	zeroTrial: boolean;
	onZeroTrialChange: (v: boolean) => void;
	trialLength: string;
	onTrialLengthChange: (v: string) => void;
	trialStartDate: string;
	onTrialStartDateChange: (v: string) => void;
	trialEndDate: string;
	trialStartDateError?: string;
};

/** Plan configuration card */
export type PlanConfigurationSectionProps = {
	activePlanTypeId: string;
	companyPlans: PricingPlanLevel[];
	selectedPlanId: string;
	onSelectedPlanIdChange: (id: string) => void;
	hasPromoCode: boolean;
	onHasPromoCodeChange: (v: boolean) => void;
	promoCode: string;
	onPromoCodeChange: (v: string) => void;
	discount: string;
	onDiscountChange: ChangeEventHandler<HTMLInputElement>;
	billingCurrency: string;
	onBillingCurrencyChange: (v: string) => void;
	planPrice: number;
	invoiceAmount: number;
	planLevelError?: string;
	promoCodeError?: string;
	discountError?: string;
};

export type TrialEndDateStringFormat = "MM-DD-YYYY" | "YYYY-MM-DD";
