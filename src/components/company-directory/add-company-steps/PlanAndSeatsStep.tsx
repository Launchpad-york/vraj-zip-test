import { yupResolver } from "@hookform/resolvers/yup";
import { Info } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { toast } from "sonner";
import { getPricingPlans } from "@/api";
import {
	CollapsibleCard,
	DatePickerInput,
	FormInput,
} from "@/components/common";
import { Banner } from "@/components/ui/banner";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { ADD_NEW_COMPANY_CONTENT } from "@/const/companies/company-directory.const";
import { cn } from "@/lib/utils";
import {
	type AddCompanyPlanAndSeatsSchemaType,
	addCompanyPlanAndSeatsSchema,
} from "@/schemas";
import { useCompanyDirectoryStore } from "@/store";
import type { PricingPlanType } from "@/types/common/pricing.types";
import type {
	AddCompanyPlanSeatsStepProps,
	BuildCompanyPlanSeatsPayloadInput,
	CompanyDetailData,
	CompanyPlanSeatsPayload,
	IndividualPlanSectionProps,
	MonthlyTrialSectionProps,
	PlanConfigSnapshot,
	PlanConfigurationSectionProps,
	PlanSeatsPrefillResult,
	PlanTypeTabsProps,
	PromoCodeFieldProps,
} from "@/types/companies";
import {
	formatCurrencyAmount,
	formatPlanEmployeeRange,
	roundCurrencyToTwoDecimals,
} from "@/utils";

const c = ADD_NEW_COMPANY_CONTENT.planAndSeats;

const PLAN_SEATS_DEFAULTS: AddCompanyPlanAndSeatsSchemaType = {
	activePlanTypeId: "",
	companyPlanCount: 0,
	zeroTrial: false,
	trialLength: "14",
	trialStartDate: "",
	hasPromoCode: false,
	promoCode: "",
	selectedPlanId: "",
	planPriceLimit: 0,
	discount: "",
	billingCurrency: "usd",
};

const INFO_ICON = (
	<Info className="size-4 shrink-0 text-icon-info" aria-hidden />
);

/** Parse `yyyy-MM-dd` as a calendar date in local time (avoids UTC shifts from `new Date(iso)`). */
function parseIsoDateLocal(iso: string): Date | null {
	const parts = iso.trim().split("-");
	if (parts.length !== 3) return null;
	const y = Number(parts[0]);
	const mo = Number(parts[1]);
	const d = Number(parts[2]);
	if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d))
		return null;
	const dt = new Date(y, mo - 1, d);
	return Number.isNaN(dt.getTime()) ? null : dt;
}

/**
 * Trial length is **inclusive** of the start day (e.g. 14 days from the 1st ends on the 14th).
 * Uses local calendar arithmetic so it matches the date picker.
 */
function trialEndDateLocalInclusive(
	startIso: string,
	trialLengthDays: number,
): Date | null {
	const start = parseIsoDateLocal(startIso);
	if (!start) return null;
	const offset = Math.max(0, trialLengthDays - 1);
	const end = new Date(start.getTime());
	end.setDate(end.getDate() + offset);
	return end;
}

export function computeTrialEndDate(
	startDate: string,
	trialLengthDays: number,
): string {
	if (!startDate) return "";
	const end = trialEndDateLocalInclusive(startDate, trialLengthDays);
	if (!end) return "";
	const mm = String(end.getMonth() + 1).padStart(2, "0");
	const dd = String(end.getDate()).padStart(2, "0");
	const yyyy = end.getFullYear();
	return `${mm}-${dd}-${yyyy}`;
}

/** Trial end as ISO YYYY-MM-DD; length is inclusive calendar days (start is day 1). */
export function trialEndIsoFromStart(
	trialStartIso: string,
	trialLengthDays: number,
): string {
	const end = trialEndDateLocalInclusive(trialStartIso, trialLengthDays);
	if (!end) return "";
	const y = end.getFullYear();
	const m = String(end.getMonth() + 1).padStart(2, "0");
	const d = String(end.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

export function buildCompanyPlanSeatsPayload(
	input: BuildCompanyPlanSeatsPayloadInput,
): CompanyPlanSeatsPayload {
	const discountNum = Number.parseFloat(input.discount) || 0;

	if (input.activePlanTypeId === "one_time") {
		if (!input.oneTimePlanLevelId) {
			throw new Error("Individual plan level is missing from pricing data.");
		}
		const price = roundCurrencyToTwoDecimals(input.oneTimePlanPrice);
		return {
			zeroTrial: true,
			trialStartDate: "",
			trialEndDate: "",
			planLevel: input.oneTimePlanLevelId,
			planPrice: price,
			discount: 0,
			invoiceAmount: price,
		};
	}

	if (!input.selectedPlanId) {
		throw new Error("Plan level is required.");
	}

	const isMonthly = input.activePlanTypeId === "monthly";
	const zeroTrial = isMonthly ? input.zeroTrial : true;

	let trialStartDate = "";
	let trialEndDate = "";
	if (isMonthly && !zeroTrial && input.trialStartDate.trim()) {
		trialStartDate = input.trialStartDate.trim();
		trialEndDate = trialEndIsoFromStart(trialStartDate, input.trialLengthDays);
	}

	return {
		zeroTrial,
		trialStartDate,
		trialEndDate,
		planLevel: input.selectedPlanId,
		planPrice: roundCurrencyToTwoDecimals(input.planPrice),
		discount: roundCurrencyToTwoDecimals(discountNum),
		invoiceAmount: roundCurrencyToTwoDecimals(input.invoiceAmount),
	};
}

/** ISO date string YYYY-MM-DD for DatePicker, or "" */
export function normalizeTrialStartDate(
	value: string | null | undefined,
): string {
	if (value == null || typeof value !== "string") return "";
	const s = value.trim();
	if (!s) return "";
	return s.length >= 10 ? s.slice(0, 10) : s;
}

/**
 * Build Plan & Seats form defaults from GET company `plan` + `planSeat`
 * (active tab = plan.planTypeId, tier = planId).
 */
export function buildPlanSeatsPrefillFromCompanyDetail(
	companyDetail: CompanyDetailData,
	planTypes: PricingPlanType[],
): PlanSeatsPrefillResult | null {
	const planSeat = companyDetail.planSeat;
	if (!planSeat) return null;

	const planTypeId = companyDetail.plan?.planTypeId;
	const tabId =
		planTypeId && planTypes.some((pt) => pt.id === planTypeId)
			? planTypeId
			: (planTypes[0]?.id ?? "");

	if (!tabId) return null;

	const planLevelId = (
		companyDetail.planId ??
		companyDetail.plan?.id ??
		""
	).trim();
	if (!planLevelId) return null;

	const trialLength = String(planSeat.trialLengthDuration ?? 14);
	const trialStartDate = normalizeTrialStartDate(planSeat.trialStartDate);

	const formValues: AddCompanyPlanAndSeatsSchemaType = {
		activePlanTypeId: tabId,
		companyPlanCount: 0,
		zeroTrial: planSeat.zeroTrial,
		trialLength,
		trialStartDate,
		hasPromoCode: false,
		promoCode: "",
		selectedPlanId: planLevelId,
		planPriceLimit: 0,
		discount: planSeat.discount ?? "",
		billingCurrency: "usd",
	};

	const refSnapshots: Record<string, PlanConfigSnapshot> = {
		[tabId]: {
			selectedPlanId: planLevelId,
			discount: planSeat.discount ?? "",
			hasPromoCode: false,
			promoCode: "",
		},
	};

	return { formValues, refSnapshots };
}

function PlanTypeTabs({
	planTypes,
	activePlanTypeId,
	onSelect,
}: PlanTypeTabsProps) {
	return (
		<div
			className="flex w-fit max-w-full flex-wrap items-center gap-4 self-start rounded-xl bg-card-foreground p-1"
			role="tablist"
			aria-label="Plan type tabs"
		>
			{planTypes.map((tab) => (
				<button
					key={tab.id}
					type="button"
					role="tab"
					aria-selected={activePlanTypeId === tab.id}
					tabIndex={activePlanTypeId === tab.id ? 0 : -1}
					className={cn(
						"min-h-9 cursor-pointer rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-all duration-300",
						activePlanTypeId === tab.id
							? "bg-background text-brand-primary shadow-xs"
							: "text-text-secondary hover:text-text-foreground",
					)}
					onClick={() => onSelect(tab.id)}
				>
					{tab.name}
				</button>
			))}
		</div>
	);
}

function PromoCodeField({ id, value, onChange, error }: PromoCodeFieldProps) {
	const pc = c.planConfiguration;
	return (
		<div className="w-full sm:max-w-md">
			<FormInput
				id={id}
				label={pc.promoCode}
				required
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={pc.promoCodePlaceholder}
				className="border-input bg-background"
				error={error}
			/>
		</div>
	);
}

function IndividualPlanSection({
	oneTimeCompanyPlanPrice,
	hasPromoCode,
	onHasPromoCodeChange,
	promoCode,
	onPromoCodeChange,
	promoCodeError,
}: IndividualPlanSectionProps) {
	return (
		<>
			<Banner title={c.individualPlan.bannerTitle} icon={INFO_ICON}>
				{c.individualPlan.bannerDescription(
					formatCurrencyAmount(oneTimeCompanyPlanPrice),
					c.individualPlan.billingCurrency,
				)}
			</Banner>

			<div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
				<span className="text-sm font-medium text-text-foreground">
					{c.individualPlan.promoCodeLabel}
				</span>
				<Switch
					checked={hasPromoCode}
					onCheckedChange={onHasPromoCodeChange}
					aria-label={c.individualPlan.promoCodeLabel}
					disabled
				/>
			</div>

			{hasPromoCode && (
				<PromoCodeField
					id="promo-code-individual"
					value={promoCode}
					onChange={onPromoCodeChange}
					error={promoCodeError}
				/>
			)}
		</>
	);
}

function MonthlyTrialSection({
	zeroTrial,
	onZeroTrialChange,
	trialLength,
	onTrialLengthChange,
	trialStartDate,
	onTrialStartDateChange,
	trialEndDate,
	trialStartDateError,
}: MonthlyTrialSectionProps) {
	const tc = c.trialConfiguration;
	return (
		<>
			<div className="flex items-center justify-between rounded-lg border border-border-muted bg-card p-4">
				<div className="flex flex-col gap-1">
					<span className="text-sm font-medium text-text-foreground">
						{c.zeroTrial.label}
					</span>
					<span className="text-xs tracking-wide text-muted-foreground">
						{c.zeroTrial.description}
					</span>
				</div>
				<Switch
					checked={zeroTrial}
					onCheckedChange={onZeroTrialChange}
					aria-label={c.zeroTrial.label}
				/>
			</div>

			{!zeroTrial && (
				<CollapsibleCard
					title={<span className="text-text-foreground">{tc.title}</span>}
					defaultOpen
				>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="flex flex-col gap-1">
							<Label
								htmlFor="trial-length"
								className="text-sm font-medium text-text-foreground"
							>
								{tc.trialLength}
							</Label>
							<Select value={trialLength} onValueChange={onTrialLengthChange}>
								<SelectTrigger
									id="trial-length"
									className="w-full rounded-lg border-border bg-card"
									aria-label={tc.trialLength}
									disabled
								>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{c.trialLengthOptions.map((opt) => (
										<SelectItem key={opt.value} value={opt.value}>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="flex flex-col gap-1">
							<Label
								htmlFor="trial-start-date"
								className="text-sm font-medium text-text-foreground"
							>
								<span className="text-brand-red">*</span> {tc.trialStartDate}
							</Label>
							<DatePickerInput
								id="trial-start-date"
								value={trialStartDate}
								onChange={onTrialStartDateChange}
								placeholder={c.placeholders.trialStartDate}
								error={trialStartDateError}
							/>
						</div>

						<FormInput
							id="trial-end-date"
							label={tc.trialEndDate}
							value={trialEndDate}
							disabled
							placeholder={c.placeholders.endDate}
						/>
					</div>

					<Banner title={tc.autoConvertTitle} icon={INFO_ICON}>
						{tc.autoConvertDescription}
					</Banner>
				</CollapsibleCard>
			)}
		</>
	);
}

function PlanConfigurationSection({
	activePlanTypeId,
	companyPlans,
	selectedPlanId,
	onSelectedPlanIdChange,
	hasPromoCode,
	onHasPromoCodeChange,
	promoCode,
	onPromoCodeChange,
	discount,
	onDiscountChange,
	billingCurrency,
	onBillingCurrencyChange,
	planPrice,
	invoiceAmount,
	planLevelError,
	promoCodeError,
	discountError,
}: PlanConfigurationSectionProps) {
	const pc = c.planConfiguration;
	const noPlans = companyPlans.length === 0;

	return (
		<CollapsibleCard title={pc.title} defaultOpen>
			<div className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
				<div className="flex flex-col gap-0.5">
					<span className="text-sm font-medium text-text-foreground">
						{pc.hasPromoCode}
					</span>
					<span className="text-xs tracking-wide text-muted-foreground">
						{pc.hasPromoCodeDescription}
					</span>
				</div>
				<Switch
					checked={hasPromoCode}
					onCheckedChange={onHasPromoCodeChange}
					aria-label={pc.hasPromoCode}
					disabled
				/>
			</div>

			{hasPromoCode && (
				<PromoCodeField
					id="promo-code"
					value={promoCode}
					onChange={onPromoCodeChange}
					error={promoCodeError}
				/>
			)}

			<Separator />

			{noPlans && (
				<p className="text-sm text-muted-foreground">
					{c.noCompanyPlansForTab}
				</p>
			)}

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div className="flex flex-col gap-1">
					<Label
						htmlFor="plan-level"
						className="text-sm font-medium text-text-foreground"
					>
						<span className="text-brand-red">*</span> {pc.planLevel}
					</Label>
					<Select
						key={activePlanTypeId}
						value={selectedPlanId || undefined}
						onValueChange={onSelectedPlanIdChange}
						disabled={noPlans}
					>
						<SelectTrigger
							id="plan-level"
							className={cn(
								"w-full rounded-lg border-border bg-background",
								planLevelError && "border-destructive",
							)}
							aria-label={pc.planLevel}
							aria-invalid={!!planLevelError}
						>
							<SelectValue placeholder={c.placeholders.planLevel} />
						</SelectTrigger>
						<SelectContent>
							{companyPlans.map((plan) => (
								<SelectItem key={plan.id} value={plan.id}>
									{formatPlanEmployeeRange(
										plan.employeeRangeMin,
										plan.employeeRangeMax,
									)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{planLevelError ? (
						<p className="text-mini text-destructive" role="alert">
							{planLevelError}
						</p>
					) : null}
				</div>

				<FormInput
					id="plan-price"
					label={pc.planPrice}
					value={formatCurrencyAmount(planPrice)}
					disabled
					className="border-border bg-card text-muted-foreground"
				/>

				<FormInput
					id="discount"
					label={pc.discount}
					value={discount}
					disabled={planPrice <= 0}
					onChange={onDiscountChange}
					className="border-input bg-background text-text-foreground"
					autoComplete="off"
					error={discountError}
				/>

				<FormInput
					id="invoice-amount"
					label={pc.invoiceAmount}
					value={formatCurrencyAmount(invoiceAmount)}
					disabled
					className="border-border bg-card text-muted-foreground"
				/>

				<div className="flex flex-col gap-1">
					<Label
						htmlFor="billing-currency"
						className="text-sm font-medium text-text-foreground"
					>
						{pc.billingCurrency}
					</Label>
					<Select
						value={billingCurrency}
						onValueChange={onBillingCurrencyChange}
					>
						<SelectTrigger
							id="billing-currency"
							className="w-full rounded-lg border-border bg-card"
							aria-label={pc.billingCurrency}
							disabled
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{c.billingCurrencyOptions.map((opt) => (
								<SelectItem key={opt.value} value={opt.value}>
									{opt.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
		</CollapsibleCard>
	);
}

function PlansLoadingSkeleton() {
	return (
		<div className="flex flex-col gap-4" aria-busy aria-live="polite">
			<Skeleton className="h-11 w-full max-w-xl rounded-xl" />
			<Skeleton className="h-36 w-full rounded-lg" />
			<Skeleton className="h-48 w-full rounded-lg" />
		</div>
	);
}

interface PlanAndSeatsFormInnerProps {
	companyId: string | null | undefined;
	companyDetail: CompanyDetailData | null;
	onSuccess?: () => void;
	submitPlanSeats: (
		companyId: string,
		body: CompanyPlanSeatsPayload,
	) => Promise<{ ok: true } | { ok: false; error: string }>;
}

function PlanAndSeatsFormInner({
	companyId,
	companyDetail,
	onSuccess,
	submitPlanSeats,
}: PlanAndSeatsFormInnerProps) {
	const [planTypes, setPlanTypes] = useState<PricingPlanType[]>([]);
	const [plansLoading, setPlansLoading] = useState(true);
	const [plansError, setPlansError] = useState<string | null>(null);
	const planConfigByPlanTypeIdRef = useRef<Record<string, PlanConfigSnapshot>>(
		{},
	);

	const {
		watch,
		setValue,
		getValues,
		handleSubmit,
		reset,
		formState: { errors, isSubmitted },
	} = useForm<AddCompanyPlanAndSeatsSchemaType>({
		mode: "onSubmit",
		reValidateMode: "onChange",
		defaultValues: PLAN_SEATS_DEFAULTS,
		resolver: yupResolver(
			addCompanyPlanAndSeatsSchema,
		) as Resolver<AddCompanyPlanAndSeatsSchemaType>,
	});

	const activePlanTypeId = watch("activePlanTypeId");
	const selectedPlanId = watch("selectedPlanId");
	const zeroTrial = watch("zeroTrial");
	const trialLength = watch("trialLength");
	const trialStartDate = watch("trialStartDate");
	const hasPromoCode = watch("hasPromoCode");
	const promoCode = watch("promoCode");
	const discount = watch("discount");
	const billingCurrency = watch("billingCurrency");

	const companyPlans = useMemo(() => {
		const pt = planTypes.find((p) => p.id === activePlanTypeId);
		if (!pt) return [];
		return pt.plans.filter((p) => p.customerType === "company");
	}, [planTypes, activePlanTypeId]);

	useEffect(() => {
		let cancelled = false;
		setPlansLoading(true);
		setPlansError(null);
		getPricingPlans().then((result) => {
			if (cancelled) return;
			if (!result.ok) {
				setPlansError(result.message);
				setPlansLoading(false);
				return;
			}
			setPlanTypes(result.data);
			setPlansLoading(false);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		if (planTypes.length === 0) return;
		if (companyDetail) {
			const prefill = buildPlanSeatsPrefillFromCompanyDetail(
				companyDetail,
				planTypes,
			);
			if (prefill) {
				planConfigByPlanTypeIdRef.current = prefill.refSnapshots;
				reset(prefill.formValues);
				return;
			}
		}
		planConfigByPlanTypeIdRef.current = {};
		reset({
			...PLAN_SEATS_DEFAULTS,
			activePlanTypeId: planTypes[0].id,
		});
	}, [planTypes, companyDetail, reset]);

	useEffect(() => {
		setValue("companyPlanCount", companyPlans.length, {
			shouldValidate: false,
		});
	}, [companyPlans.length, setValue]);

	/** Keep Select in sync with GET company `planId` once pricing tiers for the active tab are loaded. */
	useEffect(() => {
		if (companyPlans.length === 0) return;
		const planLevelId = (
			companyDetail?.planId ??
			companyDetail?.plan?.id ??
			""
		).trim();
		if (!planLevelId) return;
		if (!companyPlans.some((p) => p.id === planLevelId)) return;
		if (getValues("selectedPlanId") === planLevelId) return;
		setValue("selectedPlanId", planLevelId, { shouldValidate: false });
		const tabId = getValues("activePlanTypeId");
		if (tabId) {
			const prev = planConfigByPlanTypeIdRef.current[tabId];
			planConfigByPlanTypeIdRef.current[tabId] = {
				selectedPlanId: planLevelId,
				discount: prev?.discount ?? getValues("discount") ?? "",
				hasPromoCode: prev?.hasPromoCode ?? getValues("hasPromoCode") ?? false,
				promoCode: prev?.promoCode ?? getValues("promoCode") ?? "",
			};
		}
	}, [companyDetail, companyPlans, setValue, getValues]);

	/** Clear tier only when the active tab has tiers but the current id is not in the list (e.g. tab switch). */
	useEffect(() => {
		if (companyPlans.length === 0) return;
		const current = getValues("selectedPlanId");
		if (!current) return;
		if (companyPlans.some((p) => p.id === current)) return;
		setValue("selectedPlanId", "", { shouldValidate: false });
	}, [companyPlans, setValue, getValues]);

	const selectedPlan = useMemo(
		() => companyPlans.find((p) => p.id === selectedPlanId) ?? null,
		[companyPlans, selectedPlanId],
	);

	const trialLengthDays = Number.parseInt(trialLength ?? "14", 10) || 0;
	const trialEndDate = computeTrialEndDate(
		trialStartDate ?? "",
		trialLengthDays,
	);
	const planPrice = selectedPlan?.price ?? 0;

	useEffect(() => {
		setValue("planPriceLimit", planPrice, {
			shouldValidate: isSubmitted,
		});
	}, [planPrice, setValue, isSubmitted]);

	const invoiceAmount = useMemo(() => {
		const disc = Number.parseFloat(discount) || 0;
		return roundCurrencyToTwoDecimals(Math.max(0, planPrice - disc));
	}, [planPrice, discount]);

	const showTrialSections = activePlanTypeId === "monthly";
	const showIndividualBanner = activePlanTypeId === "one_time";

	const oneTimeCompanyPlan = useMemo(() => {
		const group = planTypes.find((p) => p.id === "one_time");
		return (
			group?.plans.find(
				(p) => p.planTypeId === "one_time" && p.customerType === "company",
			) ?? null
		);
	}, [planTypes]);

	const oneTimeCompanyPlanPrice = oneTimeCompanyPlan?.price ?? 0;
	const oneTimeCompanyPlanLevelId = oneTimeCompanyPlan?.id ?? "";

	const onSubmit = useCallback(
		async (values: AddCompanyPlanAndSeatsSchemaType) => {
			if (!companyId) return;
			try {
				const trialLengthDays =
					Number.parseInt(values.trialLength ?? "14", 10) || 0;
				const discountNum = Number.parseFloat(values.discount ?? "") || 0;
				const invoiceAmountComputed = roundCurrencyToTwoDecimals(
					Math.max(0, planPrice - discountNum),
				);
				const payload = buildCompanyPlanSeatsPayload({
					activePlanTypeId: values.activePlanTypeId,
					zeroTrial: values.zeroTrial,
					trialLengthDays,
					trialStartDate: values.trialStartDate ?? "",
					selectedPlanId: values.selectedPlanId ?? "",
					discount: values.discount ?? "",
					planPrice,
					invoiceAmount: invoiceAmountComputed,
					oneTimePlanLevelId: oneTimeCompanyPlanLevelId,
					oneTimePlanPrice: oneTimeCompanyPlanPrice,
				});
				const result = await submitPlanSeats(companyId, payload);
				if (result.ok) onSuccess?.();
			} catch (e) {
				toast.error(
					e instanceof Error ? e.message : "Unable to save plan details",
				);
			}
		},
		[
			companyId,
			onSuccess,
			submitPlanSeats,
			planPrice,
			oneTimeCompanyPlanLevelId,
			oneTimeCompanyPlanPrice,
		],
	);

	const handlePlanTypeSelect = useCallback(
		(id: string) => {
			const previousTabId = getValues("activePlanTypeId");
			if (previousTabId) {
				const v = getValues();
				planConfigByPlanTypeIdRef.current[previousTabId] = {
					selectedPlanId: v.selectedPlanId ?? "",
					discount: v.discount ?? "",
					hasPromoCode: v.hasPromoCode ?? false,
					promoCode: v.promoCode ?? "",
				};
			}

			setValue("activePlanTypeId", id, { shouldValidate: false });

			const saved = planConfigByPlanTypeIdRef.current[id];
			setValue("selectedPlanId", saved?.selectedPlanId ?? "", {
				shouldValidate: false,
			});
			setValue("discount", saved?.discount ?? "", { shouldValidate: false });
			setValue("hasPromoCode", saved?.hasPromoCode ?? false, {
				shouldValidate: false,
			});
			setValue("promoCode", saved?.promoCode ?? "", { shouldValidate: false });

			reset(getValues(), {
				keepDirty: true,
				keepErrors: false,
				keepIsSubmitted: false,
			});
		},
		[getValues, setValue, reset],
	);

	const plansReady = !plansLoading && !plansError && planTypes.length > 0;
	const showEmptyPlansMessage =
		!plansLoading && !plansError && planTypes.length === 0;

	return (
		<form
			id="add-company-plan-seats-form"
			onSubmit={handleSubmit(onSubmit)}
			className="flex flex-col gap-4"
		>
			{plansLoading && <PlansLoadingSkeleton />}

			{plansError && (
				<p className="text-sm text-destructive" role="alert">
					{c.plansLoadError} {plansError}
				</p>
			)}

			{showEmptyPlansMessage && (
				<p className="text-sm text-muted-foreground" role="status">
					{c.noCompanyPlansForTab}
				</p>
			)}

			{plansReady && (
				<>
					<PlanTypeTabs
						planTypes={planTypes}
						activePlanTypeId={activePlanTypeId ?? ""}
						onSelect={handlePlanTypeSelect}
					/>

					{showIndividualBanner && (
						<IndividualPlanSection
							oneTimeCompanyPlanPrice={oneTimeCompanyPlanPrice}
							hasPromoCode={hasPromoCode}
							onHasPromoCodeChange={(v: boolean) =>
								setValue("hasPromoCode", v, { shouldValidate: true })
							}
							promoCode={promoCode ?? ""}
							onPromoCodeChange={(v: string) =>
								setValue("promoCode", v, { shouldValidate: true })
							}
							promoCodeError={errors.promoCode?.message}
						/>
					)}

					{showTrialSections && (
						<MonthlyTrialSection
							zeroTrial={zeroTrial}
							onZeroTrialChange={(v: boolean) =>
								setValue("zeroTrial", v, { shouldValidate: true })
							}
							trialLength={trialLength ?? "14"}
							onTrialLengthChange={(v: string) =>
								setValue("trialLength", v, { shouldValidate: true })
							}
							trialStartDate={trialStartDate ?? ""}
							onTrialStartDateChange={(v: string) =>
								setValue("trialStartDate", v, { shouldValidate: true })
							}
							trialEndDate={trialEndDate}
							trialStartDateError={errors.trialStartDate?.message}
						/>
					)}

					{!showIndividualBanner && (
						<PlanConfigurationSection
							activePlanTypeId={activePlanTypeId}
							companyPlans={companyPlans}
							selectedPlanId={selectedPlanId ?? ""}
							onSelectedPlanIdChange={(id: string) =>
								setValue("selectedPlanId", id, { shouldValidate: isSubmitted })
							}
							hasPromoCode={hasPromoCode}
							onHasPromoCodeChange={(v: boolean) =>
								setValue("hasPromoCode", v, { shouldValidate: true })
							}
							promoCode={promoCode ?? ""}
							onPromoCodeChange={(v: string) =>
								setValue("promoCode", v, { shouldValidate: true })
							}
							discount={
								discount != null && discount !== "" ? `$${discount}` : "$"
							}
							onDiscountChange={(e) => {
								const raw = e.target.value.replace(/[^0-9.]/g, "");
								setValue("discount", raw, { shouldValidate: true });
							}}
							billingCurrency={billingCurrency ?? "usd"}
							onBillingCurrencyChange={(v: string) =>
								setValue("billingCurrency", v, { shouldValidate: true })
							}
							planPrice={planPrice}
							invoiceAmount={invoiceAmount}
							planLevelError={errors.selectedPlanId?.message}
							promoCodeError={errors.promoCode?.message}
							discountError={errors.discount?.message}
						/>
					)}
				</>
			)}
		</form>
	);
}

export function PlanAndSeatsStep({
	companyId,
	onSuccess,
}: AddCompanyPlanSeatsStepProps) {
	const { companyDetail, companyDetailLoading, submitPlanSeats } =
		useCompanyDirectoryStore();

	const isEditLoading = Boolean(companyId && companyDetailLoading);
	if (isEditLoading) {
		return <PlansLoadingSkeleton />;
	}

	return (
		<PlanAndSeatsFormInner
			key={`plan-seats-${companyId ?? "new"}-${companyDetail?.id ?? ""}-${companyDetail?.planSeat?.id ?? "none"}`}
			companyId={companyId}
			companyDetail={companyDetail}
			onSuccess={onSuccess}
			submitPlanSeats={submitPlanSeats}
		/>
	);
}
