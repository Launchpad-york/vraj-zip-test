import { yupResolver } from "@hookform/resolvers/yup";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Resolver } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { getPricingPlans } from "@/api";
import {
	AddressAutocomplete,
	CollapsibleCard,
	FormInput,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	ADD_NEW_CORPORATION_CONTENT,
	ADD_NEW_CORPORATION_DROPDOWN_OPTIONS,
	COMPANY_INFO_CONTENT,
} from "@/const";
import { type CreateCompanySchemaType, createCompanySchema } from "@/schemas";
import { useCorporationsStore } from "@/store";
import type { CompanyFormPanelProps } from "@/types";
import type { PricingPlanType } from "@/types/common/pricing.types";
import { formatPlanEmployeeRange } from "@/utils/sharedUtils";

const COMPANY_SETUP = ADD_NEW_CORPORATION_CONTENT.advancedSteps.companySetup;
const c = COMPANY_INFO_CONTENT;
const f = c.fields;
const p = c.placeholders;
const options = ADD_NEW_CORPORATION_DROPDOWN_OPTIONS;

export function CompanyFormPanel({
	mode,
	company,
	corporationDetail,
	onBack,
	onDiscard,
	onSave,
}: CompanyFormPanelProps) {
	const isEdit = mode === "edit";
	const title = isEdit
		? COMPANY_SETUP.editCompany
		: COMPANY_SETUP.addNewCompany;
	const subtitle = isEdit
		? COMPANY_SETUP.editCompanySubtitle
		: COMPANY_SETUP.addNewCompanySubtitle;
	const saveLabel = isEdit
		? COMPANY_SETUP.saveAndUpdate
		: COMPANY_SETUP.saveAndAdd;

	const { corporationId, createCompany, updateCompany } =
		useCorporationsStore();
	const [pricingPlans, setPricingPlans] = useState<PricingPlanType[]>([]);

	useEffect(() => {
		let cancelled = false;
		getPricingPlans().then((result) => {
			if (cancelled || !result.ok) return;
			setPricingPlans(result.data.filter((plan) => plan.id !== "one_time"));
		});
		return () => {
			cancelled = true;
		};
	}, []);

	const planTypeOptions = useMemo(
		() => pricingPlans.map((t) => ({ value: t.id, label: t.name })),
		[pricingPlans],
	);

	const defaultValues: Partial<CreateCompanySchemaType> = useMemo(() => {
		const base = {
			legalName: "",
			companyType: "",
			officeType: "",
			region: options.regions[0].value,
			industry: "",
			planTypeId: "",
			planId: "",
			state: "",
			city: "",
			zip: "",
			addressLine: "",
			country: "",
			sameAsCorpAdmin: false,
			firstName: "",
			lastName: "",
			nickname: "",
			role: "",
			email: "",
			workPhone: "",
			cellPhone: "",
			securityPosture: "Standard",
		};
		const region =
			corporationDetail?.dataResidencyRegion?.trim() ?? base.region;
		if (!company) return { ...base, region };
		return {
			...base,
			region,
			industry: company.industry?.trim() ?? base.industry,
			legalName: company.legalName ?? "",
			companyType: company.companyType ?? "",
			officeType: company.officeType ?? "",
			planId: company.planId ?? "",
			state: company.state ?? "",
			city: company.city ?? "",
			zip: company.zip ?? "",
			addressLine: company.addressLine ?? "",
			country: company.country ?? "",
			sameAsCorpAdmin: company.sameAsCorpAdmin ?? false,
			firstName: company.firstName ?? "",
			lastName: company.lastName ?? "",
			nickname: company.nickname ?? "",
			role: company.role ?? "",
			email: company.email ?? "",
			workPhone: company.workPhone ?? "",
			cellPhone: company.cellPhone ?? "",
			securityPosture: company.securityPosture ?? base.securityPosture,
		};
	}, [company, corporationDetail]);

	const {
		register,
		control,
		handleSubmit,
		watch,
		setValue,
		formState: { errors, isSubmitting, isDirty },
	} = useForm<CreateCompanySchemaType>({
		resolver: yupResolver(
			createCompanySchema,
		) as Resolver<CreateCompanySchemaType>,
		mode: "onChange",
		defaultValues,
	});

	const planTypeId = watch("planTypeId");
	const sameAsCorpAdmin = watch("sameAsCorpAdmin");
	useEffect(() => {
		if (!company?.planId || pricingPlans.length === 0) return;
		const type = pricingPlans.find((t) =>
			t.plans.some((pl) => pl.id === company.planId),
		);
		if (type) setValue("planTypeId", type.id);
	}, [company?.planId, pricingPlans, setValue]);

	const selectedPlanType = useMemo(
		() => pricingPlans.find((t) => t.id === planTypeId) ?? null,
		[pricingPlans, planTypeId],
	);
	const planLevelOptions = useMemo(() => {
		if (!selectedPlanType) return [];
		return selectedPlanType.plans
			.filter((pl) => pl.customerType === "company")
			.map((pl) => ({
				value: pl.id,
				label: formatPlanEmployeeRange(
					pl.employeeRangeMin,
					pl.employeeRangeMax,
				),
			}));
	}, [selectedPlanType]);

	const onSubmit = async (data: CreateCompanySchemaType) => {
		const { region, planTypeId: _pt, ...payload } = data;
		if (!corporationId) {
			onBack();
			return;
		}
		if (isEdit && company?.id) {
			const result = await updateCompany(
				corporationId,
				company.id,
				payload as Partial<CreateCompanySchemaType>,
			);
			if (result.ok) {
				toast.success(ADD_NEW_CORPORATION_CONTENT.toast.companyUpdated);
				onSave();
			}
		} else {
			const result = await createCompany(payload as CreateCompanySchemaType);
			if (result.ok) {
				toast.success(ADD_NEW_CORPORATION_CONTENT.toast.companyAdded);
				onSave();
			}
		}
	};

	return (
		<div className="flex w-full flex-col gap-4">
			<Button
				type="button"
				variant="outline"
				onClick={onBack}
				className="h-9 w-fit gap-2 rounded-lg border border-border bg-background px-4 text-text-foreground hover:bg-muted"
				aria-label={COMPANY_SETUP.backToCompanies}
			>
				<ArrowLeft className="size-4 shrink-0" aria-hidden />
				{COMPANY_SETUP.backToCompanies}
			</Button>

			<Card className="w-full border border-border bg-background" size="sm">
				<CardHeader className="mb-2 flex flex-col gap-1 pb-0">
					<CardTitle className="text-base font-semibold text-link">
						{title}
					</CardTitle>
					<p className="mt-0.5 text-sm font-normal text-muted-foreground">
						{subtitle}
					</p>
				</CardHeader>
				<CardContent className="flex flex-col gap-6">
					<form
						id="company-form-panel-form"
						onSubmit={handleSubmit(onSubmit)}
						className="flex flex-col gap-6"
					>
						<CollapsibleCard title={c.cards.companyDetails}>
							<FormInput
								id="company-form-legalName"
								label={f.companyLegalName}
								placeholder={p.companyLegalName}
								error={errors.legalName?.message}
								required
								className="h-10"
								{...register("legalName")}
							/>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label
										htmlFor="company-form-companyType"
										className="text-small font-medium text-text-foreground"
									>
										<span className="text-destructive">*</span> {f.companyType}
									</Label>
									<Controller
										name="companyType"
										control={control}
										render={({ field }) => (
											<Select
												value={field.value}
												onValueChange={field.onChange}
											>
												<SelectTrigger
													id="company-form-companyType"
													className="h-10 w-full"
												>
													<SelectValue placeholder={p.companyType} />
												</SelectTrigger>
												<SelectContent>
													{options.companyTypes.map((type) => (
														<SelectItem key={type.value} value={type.value}>
															{type.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										)}
									/>
									{errors.companyType?.message && (
										<p className="text-mini text-destructive">
											{errors.companyType.message}
										</p>
									)}
								</div>
								<div className="space-y-2">
									<Label
										htmlFor="company-form-officeType"
										className="text-small font-medium text-text-foreground"
									>
										<span className="text-destructive">*</span> {f.officeType}
									</Label>
									<Controller
										name="officeType"
										control={control}
										render={({ field }) => (
											<Select
												value={field.value}
												onValueChange={field.onChange}
											>
												<SelectTrigger
													id="company-form-officeType"
													className="h-10 w-full"
												>
													<SelectValue placeholder={p.officeType} />
												</SelectTrigger>
												<SelectContent>
													{options.officeTypes.map((type) => (
														<SelectItem key={type.value} value={type.value}>
															{type.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										)}
									/>
									{errors.officeType?.message && (
										<p className="text-mini text-destructive">
											{errors.officeType.message}
										</p>
									)}
								</div>
							</div>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label
										htmlFor="company-form-region"
										className="text-small font-medium text-text-foreground"
									>
										<span className="text-destructive">*</span> {f.region}
									</Label>
									<Controller
										name="region"
										control={control}
										render={({ field }) => (
											<Select
												value={field.value}
												onValueChange={field.onChange}
												disabled
											>
												<SelectTrigger
													id="company-form-region"
													className={`h-10 w-full ${errors.region ? "border-destructive" : ""}`}
												>
													<SelectValue placeholder={p.region} />
												</SelectTrigger>
												<SelectContent>
													{options.regions.map((region) => (
														<SelectItem key={region.value} value={region.value}>
															{region.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										)}
									/>
									{errors.region?.message && (
										<p className="text-mini text-destructive">
											{errors.region.message}
										</p>
									)}
								</div>
								<div className="space-y-2">
									<Label
										htmlFor="company-form-industry"
										className="text-small font-medium text-text-foreground"
									>
										<span className="text-destructive">*</span> {f.industry}
									</Label>
									<Controller
										name="industry"
										control={control}
										render={({ field }) => (
											<Select
												value={field.value}
												onValueChange={field.onChange}
											>
												<SelectTrigger
													id="company-form-industry"
													className={`h-10 w-full ${errors.industry ? "border-destructive" : ""}`}
												>
													<SelectValue placeholder={p.industry} />
												</SelectTrigger>
												<SelectContent>
													{options.industries.map((industry) => (
														<SelectItem
															key={industry.value}
															value={industry.value}
														>
															{industry.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										)}
									/>
									{errors.industry?.message && (
										<p className="text-mini text-destructive">
											{errors.industry.message}
										</p>
									)}
								</div>
							</div>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label
										htmlFor="company-form-planTypeId"
										className="text-small font-medium text-text-foreground"
									>
										<span className="text-destructive">*</span> {f.plan}
									</Label>
									<Controller
										name="planTypeId"
										control={control}
										render={({ field }) => (
											<Select
												value={field.value ?? ""}
												onValueChange={(v) => {
													field.onChange(v);
													setValue("planId", "");
												}}
											>
												<SelectTrigger
													id="company-form-planTypeId"
													className="h-10 w-full"
												>
													<SelectValue placeholder={p.plan} />
												</SelectTrigger>
												<SelectContent>
													{planTypeOptions.map((opt) => (
														<SelectItem key={opt.value} value={opt.value}>
															{opt.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										)}
									/>
								</div>
								<div className="space-y-2">
									<Label
										htmlFor="company-form-planId"
										className="text-small font-medium text-text-foreground"
									>
										<span className="text-destructive">*</span> {f.planLevel}
									</Label>
									<Controller
										name="planId"
										control={control}
										render={({ field }) => (
											<Select
												value={field.value ?? ""}
												onValueChange={field.onChange}
												disabled={!planTypeId}
											>
												<SelectTrigger
													id="company-form-planId"
													className={`h-10 w-full ${errors.planId ? "border-destructive" : ""}`}
												>
													<SelectValue placeholder={p.planLevel} />
												</SelectTrigger>
												<SelectContent>
													{planLevelOptions.map((opt) => (
														<SelectItem key={opt.value} value={opt.value}>
															{opt.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										)}
									/>
									{errors.planId?.message && (
										<p className="text-mini text-destructive">
											{errors.planId.message}
										</p>
									)}
								</div>
							</div>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label
										htmlFor="company-form-securityPosture"
										className="text-small font-medium text-text-foreground"
									>
										{f.securityPosture}
									</Label>
									<Controller
										name="securityPosture"
										control={control}
										render={({ field }) => (
											<Select
												value={field.value}
												onValueChange={field.onChange}
												disabled
											>
												<SelectTrigger
													id="company-form-securityPosture"
													className={`h-10 w-full ${errors.securityPosture ? "border-destructive" : ""}`}
												>
													<SelectValue placeholder={p.securityPosture} />
												</SelectTrigger>
												<SelectContent>
													{options.securityPostures.map((posture) => (
														<SelectItem
															key={posture.value}
															value={posture.value}
														>
															{posture.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										)}
									/>
									{errors.securityPosture?.message && (
										<p className="text-mini text-destructive">
											{errors.securityPosture.message}
										</p>
									)}
								</div>
							</div>
						</CollapsibleCard>

						<CollapsibleCard title={c.cards.companyAddress}>
							<AddressAutocomplete
								name="addressLine"
								label={f.addressLine}
								placeholder={p.addressLine}
								control={control}
								setValue={setValue}
								error={errors.addressLine?.message}
								required
								fieldMapping={{
									addressLine: "addressLine",
									city: "city",
									state: "state",
									country: "country",
									zip: "zip",
								}}
							/>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<FormInput
									id="company-form-state"
									label={f.stateProvince}
									placeholder={p.stateProvince}
									error={errors.state?.message}
									required
									className="h-10"
									{...register("state")}
								/>
								<FormInput
									id="company-form-city"
									label={f.city}
									placeholder={p.city}
									error={errors.city?.message}
									required
									className="h-10"
									{...register("city")}
								/>
							</div>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<FormInput
									id="company-form-country"
									label={f.country}
									placeholder={p.country}
									error={errors.country?.message}
									required
									className="h-10"
									{...register("country")}
								/>
								<FormInput
									id="company-form-zip"
									label={f.zipPostalCode}
									placeholder={p.zipPostalCode}
									error={errors.zip?.message}
									required
									className="h-10"
									{...register("zip")}
								/>
							</div>
						</CollapsibleCard>

						<CollapsibleCard title={c.cards.companyAdmin}>
							<div className="flex items-center gap-2">
								<Controller
									name="sameAsCorpAdmin"
									control={control}
									render={({ field }) => (
										<Checkbox
											id="company-form-sameAsCorpAdmin"
											checked={field.value}
											onCheckedChange={(checked) => {
												field.onChange(checked);
												const opts = { shouldValidate: true };
												if (checked && corporationDetail?.corporationAdmin) {
													const admin = corporationDetail.corporationAdmin;
													setValue("firstName", admin.firstName ?? "", opts);
													setValue("lastName", admin.lastName ?? "", opts);
													setValue("nickname", admin.nickname ?? "", opts);
													setValue("role", admin.role ?? "", opts);
													setValue("email", admin.email ?? "", opts);
													setValue("workPhone", admin.workPhone ?? "", opts);
													setValue("cellPhone", admin.cellPhone ?? "", opts);
												} else if (!checked) {
													setValue("firstName", "", opts);
													setValue("lastName", "", opts);
													setValue("nickname", "", opts);
													setValue("role", "", opts);
													setValue("email", "", opts);
													setValue("workPhone", "", opts);
													setValue("cellPhone", "", opts);
												}
											}}
										/>
									)}
								/>
								<Label
									htmlFor="company-form-sameAsCorpAdmin"
									className="cursor-pointer text-sm font-medium text-text-foreground"
								>
									{ADD_NEW_CORPORATION_CONTENT.sameAsCorpAdminLabel}
								</Label>
							</div>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<FormInput
									id="company-form-firstName"
									label={f.firstName}
									placeholder={p.firstName}
									error={errors.firstName?.message}
									required
									className="h-10"
									disabled={sameAsCorpAdmin}
									{...register("firstName")}
								/>
								<FormInput
									id="company-form-lastName"
									label={f.lastName}
									placeholder={p.lastName}
									error={errors.lastName?.message}
									required
									className="h-10"
									disabled={sameAsCorpAdmin}
									{...register("lastName")}
								/>
								<FormInput
									id="company-form-nickname"
									label={f.nickname}
									placeholder={p.nickname}
									error={errors.nickname?.message}
									className="h-10"
									disabled={sameAsCorpAdmin}
									{...register("nickname")}
								/>
								<FormInput
									id="company-form-role"
									label={f.jobRole}
									placeholder={p.jobRole}
									error={errors.role?.message}
									required
									className="h-10"
									disabled={sameAsCorpAdmin}
									{...register("role")}
								/>
								<FormInput
									id="company-form-email"
									label={f.email}
									type="email"
									placeholder={p.email}
									required
									error={errors.email?.message}
									className="h-10"
									autoComplete="email"
									disabled={sameAsCorpAdmin}
									{...register("email")}
								/>
								<FormInput
									id="company-form-workPhone"
									label={f.workPhoneNo}
									placeholder={p.workPhoneNo}
									error={errors.workPhone?.message}
									required
									className="h-10"
									disabled={sameAsCorpAdmin}
									{...register("workPhone")}
								/>
								<FormInput
									id="company-form-cellPhone"
									label={f.cellPhoneNo}
									placeholder={p.cellPhoneNo}
									error={errors.cellPhone?.message}
									className="h-10"
									disabled={sameAsCorpAdmin}
									{...register("cellPhone")}
								/>
							</div>
						</CollapsibleCard>
					</form>
					<div className="flex shrink-0 justify-end gap-2 border-t border-border pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={onDiscard}
							className="border-border text-text-foreground"
						>
							{COMPANY_SETUP.cancel}
						</Button>
						<Button
							type="submit"
							form="company-form-panel-form"
							disabled={isSubmitting || !corporationId || (isEdit && !isDirty)}
						>
							{isSubmitting && (
								<Loader2 className="h-4 w-4 animate-spin shrink-0" />
							)}
							<span className={isSubmitting ? "ml-2" : ""}>{saveLabel}</span>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
