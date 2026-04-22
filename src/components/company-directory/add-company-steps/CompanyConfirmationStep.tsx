import { useSearchParams } from "react-router-dom";
import { FormStepSkeleton } from "@/components/common";
import { Banner } from "@/components/ui/banner";
import { Card } from "@/components/ui/card";
import {
	ADD_NEW_COMPANY_CONTENT,
	CONFIRMATION_STEP_CONTENT,
	KEY_CONTACTS_CONFIRMATION,
} from "@/const";
import { useCompanyDirectoryStore } from "@/store";
import type { KeyContactType } from "@/types";
import {
	formatAddress,
	formatCurrencyAmount,
	formatFullName,
	formatPlanEmployeeRange,
	getBrandLogoDisplayUrl,
} from "@/utils";

const ac = ADD_NEW_COMPANY_CONTENT;
const confirm = ac.confirmation;
const f = ac.fields;
const cards = ac.cards;
const pc = ac.planAndSeats.planConfiguration;
const gs = ac.configuration.generalSettings;
const b = ac.configuration.branding;

const C = CONFIRMATION_STEP_CONTENT;
const CD = C.companyDetailsFields;
const CA = C.companyAdminInfoFields;
const CorpA = C.corporationAdminInfoFields;

function FieldItem({ label, value }: { label: string; value: string }) {
	return (
		<div className="space-y-1">
			<p className="text-small font-normal text-text-secondary">{label}</p>
			<p className="text-small font-semibold text-text-foreground">
				{value ? value : "-"}
			</p>
		</div>
	);
}

export function CompanyConfirmationStep() {
	const [searchParams] = useSearchParams();
	const isEditMode = searchParams.get("flow") === "edit";
	const { companyDetail, companyDetailLoading } = useCompanyDirectoryStore();

	const planSummary = companyDetail?.plan;
	const planSeat = companyDetail?.planSeat;
	const planTypeId = planSummary?.planTypeId ?? "";
	const isOneTimePlan = planTypeId === "one_time";
	const planNameDisplay = planSummary?.planType?.name ?? "";

	const planLevelDisplay = formatPlanEmployeeRange(
		planSummary?.employeeRangeMin,
		planSummary?.employeeRangeMax,
	);

	const logoDisplayUrl = getBrandLogoDisplayUrl(
		companyDetail?.brandLogo ?? null,
	);

	const configuration = companyDetail?.configuration;

	const confirmActionLabel = isEditMode
		? ac.buttons.confirmUpdate
		: ac.buttons.confirmAdd;

	const noteBodyAfter = isEditMode
		? confirm.noteBodyAfterEdit
		: confirm.noteBodyAfter;

	if (companyDetailLoading && !companyDetail) {
		return <FormStepSkeleton fieldCount={12} />;
	}

	if (!companyDetail) {
		return (
			<p className="text-small text-muted-foreground">
				{ac.configuration.errors.missingCompanyId}
			</p>
		);
	}

	const sectionCardClass = "rounded-lg border border-border p-4";

	const corp = companyDetail.corporation;
	const corpAdmin = corp?.corporationAdmin;
	const regionLabel = corp?.dataResidencyRegion ?? "";

	const keyContactName = (type: KeyContactType) => {
		const contact = companyDetail.keyContacts?.find(
			(k) => k.contactType === type,
		);
		return formatFullName(contact?.firstName, contact?.lastName);
	};

	return (
		<div className="space-y-6">
			<Banner variant="default" title={confirm.noteTitle}>
				{confirm.noteBodyBefore}
				<strong className="text-text-foreground">{confirmActionLabel}</strong>
				{noteBodyAfter}
			</Banner>

			<div className="space-y-2">
				<p className="text-mini font-medium text-text-secondary">
					{confirm.sections.corporationInfo}
				</p>
				<div className={sectionCardClass}>
					<div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
						<div className="space-y-4">
							<FieldItem
								label={f.parentCorporationLegalName}
								value={corp?.legalName ?? ""}
							/>
						</div>
						<div className="space-y-4">
							<FieldItem
								label={f.ownershipType}
								value={corp?.ownershipType ?? ""}
							/>
						</div>
					</div>
				</div>
			</div>

			{corpAdmin && (
				<div className="space-y-2">
					<p className="text-mini font-medium text-text-secondary">
						{confirm.sections.corporationAdminInfo}
					</p>
					<div className={sectionCardClass}>
						<div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
							<div className="space-y-4">
								<FieldItem
									label={CorpA.fullName}
									value={formatFullName(
										corpAdmin.firstName,
										corpAdmin.lastName,
									)}
								/>
								<FieldItem label={CorpA.jobRole} value={corpAdmin.role ?? ""} />
								<FieldItem
									label={CorpA.workPhoneNo}
									value={corpAdmin.workPhone ?? ""}
								/>
							</div>
							<div className="space-y-4">
								<FieldItem
									label={CorpA.nickname}
									value={corpAdmin.nickname ?? ""}
								/>
								<FieldItem label={CorpA.email} value={corpAdmin.email ?? ""} />
								<FieldItem
									label={CorpA.cellPhoneNo}
									value={corpAdmin.cellPhone ?? ""}
								/>
							</div>
						</div>
					</div>
				</div>
			)}

			<div className="space-y-2">
				<p className="text-mini font-medium text-text-secondary">
					{confirm.sections.companyInfo}
				</p>
				<div className={sectionCardClass}>
					<div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
						<FieldItem
							label={CD.companyLegalName}
							value={companyDetail.legalName ?? ""}
						/>
						<FieldItem
							label={f.dbaTradeName}
							value={companyDetail.dbaName ?? ""}
						/>
						<FieldItem
							label={f.websiteUrl}
							value={companyDetail.website ?? ""}
						/>
						<FieldItem
							label={CD.companyType}
							value={companyDetail.companyType ?? ""}
						/>
						<FieldItem
							label={CD.officeType}
							value={companyDetail.officeType ?? ""}
						/>
						<FieldItem label={f.region} value={regionLabel} />
						<FieldItem
							label={CD.industry}
							value={companyDetail.industry ?? ""}
						/>
						<FieldItem
							label={f.companyPhoneNo}
							value={companyDetail.phoneNo ?? ""}
						/>
						<div className="md:col-span-1">
							<FieldItem
								label={cards.companyAddress}
								value={formatAddress(companyDetail)}
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="space-y-2">
				<p className="text-mini font-medium text-text-secondary">
					{confirm.sections.companyAdminInfo}
				</p>
				<div className={sectionCardClass}>
					<div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
						<div className="space-y-4">
							<FieldItem
								label={CA.fullName}
								value={formatFullName(
									companyDetail.firstName,
									companyDetail.lastName,
								)}
							/>
							<FieldItem label={CA.jobRole} value={companyDetail.role ?? ""} />
							<FieldItem
								label={CA.workPhoneNo}
								value={companyDetail.workPhone ?? ""}
							/>
						</div>
						<div className="space-y-4">
							<FieldItem
								label={CA.nickname}
								value={companyDetail.nickname ?? ""}
							/>
							<FieldItem label={CA.email} value={companyDetail.email ?? ""} />
							<FieldItem
								label={CA.cellPhoneNo}
								value={companyDetail.cellPhone ?? ""}
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="space-y-2">
				<p className="text-mini font-medium text-text-secondary">
					{confirm.sections.keyContacts}
				</p>
				<div className={sectionCardClass}>
					<div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
						{KEY_CONTACTS_CONFIRMATION.map(({ type, label }) => (
							<FieldItem
								key={type}
								label={label}
								value={keyContactName(type)}
							/>
						))}
					</div>
				</div>
			</div>

			<div className="space-y-2">
				<p className="text-mini font-medium text-text-secondary">
					{confirm.sections.planConfiguration}
				</p>
				<div className={sectionCardClass}>
					{planSeat ? (
						isOneTimePlan ? (
							<div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
								<FieldItem
									label={confirm.planFields.plan}
									value={planNameDisplay}
								/>
								<FieldItem
									label={confirm.planFields.pricePerAssessment}
									value={formatCurrencyAmount(planSeat.planPrice)}
								/>
								<FieldItem
									label={confirm.planFields.billingCurrency}
									value={planSeat.billingCurrency}
								/>
								<div className="hidden md:block" aria-hidden />
							</div>
						) : (
							<div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
								<FieldItem label={pc.promoCode} value="" />
								<FieldItem
									label={confirm.planFields.plan}
									value={planNameDisplay}
								/>
								<FieldItem
									label={confirm.planFields.planLevel}
									value={planLevelDisplay}
								/>
								<FieldItem
									label={pc.planPrice}
									value={formatCurrencyAmount(planSeat.planPrice)}
								/>
								<FieldItem
									label={pc.discount}
									value={formatCurrencyAmount(planSeat.discount)}
								/>
								<FieldItem
									label={pc.invoiceAmount}
									value={formatCurrencyAmount(planSeat.invoiceAmount)}
								/>
								<FieldItem
									label={pc.billingCurrency}
									value={planSeat.billingCurrency}
								/>
							</div>
						)
					) : (
						<p className="text-small text-muted-foreground">-</p>
					)}
				</div>
			</div>

			<div className="space-y-2">
				<p className="text-mini font-medium text-text-secondary">
					{confirm.sections.configuration}
				</p>
				<div className={sectionCardClass}>
					<div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
						<FieldItem
							label={gs.authenticationMethod}
							value={configuration?.authMethod ?? ""}
						/>
						<FieldItem
							label={gs.passwordPolicy}
							value={configuration?.passwordPolicy ?? ""}
						/>
						<FieldItem
							label={confirm.configurationSummaryLabels.sessionTimeout}
							value={configuration?.sessionTimeout ?? ""}
						/>
						<FieldItem
							label={gs.twoFaRequirement}
							value={configuration?.mfa ?? ""}
						/>
						<FieldItem
							label={gs.securityPosture}
							value={configuration?.securityPosture ?? ""}
						/>
						<FieldItem
							label={gs.primaryLanguage}
							value={configuration?.primaryLanguage ?? ""}
						/>
					</div>
				</div>
			</div>
			{logoDisplayUrl && (
				<div className="space-y-2">
					<p className="text-mini font-medium text-text-secondary">
						{confirm.sections.brandingExperience}
					</p>
					<div className={sectionCardClass}>
						<div className="max-w-xs space-y-1">
							<p className="text-small font-normal text-text-secondary">
								{C.brandLogo}
							</p>

							<Card className="flex h-72 w-72 flex-col items-center justify-center rounded-lg border border-border bg-white p-6">
								<div className="relative flex h-64 w-64 items-center justify-center overflow-hidden rounded-lg bg-white group">
									<img
										src={logoDisplayUrl}
										alt={b.logoAlt}
										className="max-h-full max-w-full object-contain"
									/>
								</div>
							</Card>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
