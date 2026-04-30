import { BSPBadge, DetailRow } from "@/components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ADD_NEW_COMPANY_CONTENT as AC,
	COMPANIES_DIRECTORY_PAGE_CONTENT as CD,
	CORPORATE_DIRECTORY_PAGE_CONTENT as CorpC,
	EMPTY_VALUE_PLACEHOLDER,
	VIEW_COMPANY_KEY_CONTACT_GRID,
} from "@/const";
import type {
	CompanyDetailData,
	CompanyDetailKeyContact,
	CompanyStatus,
} from "@/types";
import {
	formatAddress,
	formatCode,
	formatCurrencyAmount,
	formatDateShort,
	formatFullName,
	formatPlanEmployeeRange,
	getBrandLogoDisplayUrl,
} from "@/utils";

const ac = AC;
const confirm = ac.confirmation;
const pc = ac.planAndSeats.planConfiguration;
const gs = ac.configuration.generalSettings;

function toCompanyStatus(status: string | undefined): CompanyStatus {
	const s = status?.toLowerCase() ?? "";
	if (s === "active" || s === "suspended" || s === "incomplete") return s;
	return "active";
}

export function CompanyViewBasicInfoTab({
	company,
}: {
	company: CompanyDetailData;
}) {
	const status = toCompanyStatus(company.status);
	const F = AC.fields;
	const parent = company.corporation;
	const region = parent?.dataResidencyRegion ?? "";

	return (
		<div className="grid w-full grid-cols-1 items-start gap-4 lg:grid-cols-2">
			<Card className="w-full gap-0 rounded-xl border border-border bg-background p-0 shadow-none">
				<CardHeader className="flex h-14 w-full items-center justify-between gap-6 border-b border-border p-4 !pb-4">
					<CardTitle className="flex flex-1 items-center text-base font-medium text-text-secondary">
						{CD.viewCardCompanyBasics}
					</CardTitle>
				</CardHeader>
				<CardContent className="flex w-full flex-col gap-4 pt-4 pb-0">
					<div className="flex w-full flex-col gap-3">
						<DetailRow
							label={CD.viewFieldCompanyId}
							value={formatCode(company.companyCode, "COMP")}
							emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
						/>
						<DetailRow label={CorpC.viewFieldStatus}>
							<BSPBadge type={status} className="capitalize">
								{status}
							</BSPBadge>
						</DetailRow>
						<DetailRow
							label={F.companyLegalName}
							value={company.legalName}
							emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
						/>
						<DetailRow
							label={F.dbaTradeName}
							value={company.dbaName}
							emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
						/>
						<DetailRow
							label={F.websiteUrl}
							value={company.website}
							emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
						/>
						<DetailRow
							label={F.companyType}
							value={company.companyType}
							emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
						/>
						<DetailRow
							label={F.officeType}
							value={company.officeType}
							emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
						/>
						<DetailRow
							label={F.region}
							value={region}
							emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
						/>
						<DetailRow
							label={F.industry}
							value={company.industry}
							emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
						/>
						<DetailRow
							label={F.companyPhoneNo}
							value={company.phoneNo}
							emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
						/>
						<DetailRow
							label={AC.cards.companyAddress}
							value={formatAddress(company)}
							emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
						/>
					</div>
				</CardContent>
			</Card>
			<div className="flex w-full flex-col gap-4">
				<Card className="w-full gap-0 rounded-xl border border-border bg-background p-0 shadow-none">
					<CardHeader className="flex h-14 w-full items-center justify-between gap-6 border-b border-border p-4 !pb-4">
						<CardTitle className="flex flex-1 items-center text-base font-medium text-text-secondary">
							{CD.viewCardParentCorporation}
						</CardTitle>
					</CardHeader>
					<CardContent className="flex w-full flex-col gap-4 pt-4 pb-0">
						<div className="flex w-full flex-col gap-3">
							<DetailRow
								label={F.parentCorporationLegalName}
								value={parent?.legalName ?? ""}
								emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
							/>
							<DetailRow
								label={F.ownershipType}
								value={parent?.ownershipType ?? ""}
								emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
							/>
						</div>
					</CardContent>
				</Card>
				<Card className="w-full gap-0 rounded-xl border border-border bg-background p-0 shadow-none">
					<CardHeader className="flex h-14 w-full items-center justify-between gap-6 border-b border-border p-4 !pb-4">
						<CardTitle className="flex flex-1 items-center text-base font-medium text-text-secondary">
							{AC.cards.companyAdmin}
						</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col gap-4 pt-4 pb-0">
						<div className="flex w-full flex-col gap-3">
							<DetailRow
								label={CorpC.viewFieldFullName}
								value={formatFullName(company.firstName, company.lastName)}
								emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
							/>
							<DetailRow
								label={CorpC.viewFieldNickname}
								value={company.nickname}
								emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
							/>
							<DetailRow
								label={CorpC.viewFieldJobRole}
								value={company.role}
								emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
							/>
							<DetailRow
								label={CorpC.viewFieldEmail}
								value={company.email}
								emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
							/>
							<DetailRow
								label={CorpC.viewFieldWorkPhoneNo}
								value={company.workPhone}
								emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
							/>
							<DetailRow
								label={CorpC.viewFieldCellPhoneNo}
								value={company.cellPhone}
								emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
							/>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

function KeyContactCard({
	title,
	contact,
}: {
	title: string;
	contact: CompanyDetailKeyContact | undefined;
}) {
	return (
		<Card className="w-full gap-0 rounded-xl border border-border bg-background p-0 shadow-none">
			<CardHeader className="flex h-14 w-full items-center justify-between gap-6 border-b border-border p-4 !pb-4">
				<CardTitle className="flex flex-1 items-center text-base font-medium text-text-secondary">
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-4 pt-4 pb-0">
				<div className="flex w-full flex-col gap-3">
					<DetailRow
						label={CorpC.viewFieldFullName}
						value={formatFullName(contact?.firstName, contact?.lastName)}
						emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
					/>
					<DetailRow
						label={CorpC.viewFieldNickname}
						value={contact?.nickname}
						emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
					/>
					<DetailRow
						label={CorpC.viewFieldJobRole}
						value={contact?.role}
						emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
					/>
					<DetailRow
						label={CorpC.viewFieldEmail}
						value={contact?.email}
						emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
					/>
					<DetailRow
						label={CorpC.viewFieldWorkPhoneNo}
						value={contact?.workPhone}
						emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
					/>
					<DetailRow
						label={CorpC.viewFieldCellPhoneNo}
						value={contact?.cellPhone}
						emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
					/>
				</div>
			</CardContent>
		</Card>
	);
}

export function CompanyViewKeyContactsTab({
	company,
}: {
	company: CompanyDetailData;
}) {
	return (
		<div className="grid w-full grid-cols-1 items-start gap-4 md:grid-cols-2">
			{VIEW_COMPANY_KEY_CONTACT_GRID.map(({ type, title }) => (
				<KeyContactCard
					key={type}
					title={title}
					contact={company.keyContacts?.find((c) => c.contactType === type)}
				/>
			))}
		</div>
	);
}

function PlanConfigurationRows({
	company,
	promoDisplay,
	planDisplayName,
}: {
	company: CompanyDetailData;
	promoDisplay: string;
	planDisplayName: string;
}) {
	const seat = company.planSeat;
	const plan = company.plan;

	return (
		<>
			<DetailRow label={confirm.planFields.promoCode} value={promoDisplay} />
			<DetailRow
				label={confirm.planFields.plan}
				value={planDisplayName}
				emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
			/>
			<DetailRow
				label={pc.planLevel}
				value={formatPlanEmployeeRange(
					plan?.employeeRangeMin ?? null,
					plan?.employeeRangeMax ?? null,
				)}
				emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
			/>
			<DetailRow
				label={pc.planPrice}
				value={formatCurrencyAmount(seat?.planPrice)}
				emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
			/>
			<DetailRow
				label={pc.discount}
				value={formatCurrencyAmount(seat?.discount)}
				emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
			/>
			<DetailRow
				label={pc.invoiceAmount}
				value={formatCurrencyAmount(seat?.invoiceAmount)}
				emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
			/>
			<DetailRow
				label={pc.billingCurrency}
				value={seat?.billingCurrency}
				emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
			/>
		</>
	);
}

function TrialConfigurationCard({ company }: { company: CompanyDetailData }) {
	const seat = company.planSeat;
	const zeroLabel = seat ? (seat.zeroTrial ? CD.viewOn : CD.viewOff) : "";

	const auto =
		seat?.autoConvertTrial === true
			? CD.viewAutoConvertOnDefault
			: seat
				? CD.viewOff
				: "";

	return (
		<Card className="w-full gap-0 rounded-xl border border-border bg-background p-0 shadow-none">
			<CardHeader className="flex h-14 w-full items-center justify-between gap-6 border-b border-border p-4 !pb-4">
				<CardTitle className="flex flex-1 items-center text-base font-medium text-text-secondary">
					{CD.viewTrialConfigurationCard}
				</CardTitle>
			</CardHeader>
			<CardContent className="flex w-full flex-col gap-4 pt-4 pb-0">
				<div className="flex w-full flex-col gap-3">
					<DetailRow
						label={CD.viewFieldZeroTrial}
						value={zeroLabel}
						emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
					/>
					{!seat?.zeroTrial && (
						<>
							<DetailRow
								label={CD.viewFieldTrialLength}
								value={
									seat?.trialLengthDuration && seat?.trialLengthType
										? `${seat.trialLengthDuration} ${seat.trialLengthType}`
										: EMPTY_VALUE_PLACEHOLDER
								}
								emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
							/>
							<DetailRow
								label={CD.viewFieldTrialStartDate}
								value={formatDateShort(seat?.trialStartDate)}
								emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
							/>
							<DetailRow
								label={CD.viewFieldTrialEndDate}
								value={formatDateShort(seat?.trialEndDate)}
								emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
							/>
							<DetailRow
								label={CD.viewFieldAutoConvertTrial}
								value={auto}
								emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
							/>
						</>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

export function CompanyViewPlanSeatsTab({
	company,
}: {
	company: CompanyDetailData;
}) {
	const plan = company.plan;
	const seat = company.planSeat;

	if (!plan?.id) {
		return (
			<Card className="w-full gap-0 rounded-xl border border-border bg-background p-0 shadow-none">
				<CardContent className="pt-4 pb-0">
					<p className="text-small text-text-secondary">
						{CD.viewPlanDetailsUnavailable}
					</p>
				</CardContent>
			</Card>
		);
	}

	const planDisplayName = company.plan?.planType?.name ?? "";

	if (plan?.planTypeId === "one_time") {
		return (
			<Card className="w-full gap-0 rounded-xl border border-border bg-background p-0 shadow-none">
				<CardHeader className="flex h-14 w-full items-center justify-between gap-6 border-b border-border p-4 !pb-4">
					<CardTitle className="flex flex-1 items-center text-base font-medium text-text-secondary">
						{CD.viewPlanConfigurationCard}
					</CardTitle>
				</CardHeader>
				<CardContent className="flex w-full flex-col gap-4 pt-4 pb-0">
					<div className="flex w-full flex-col gap-3">
						<DetailRow
							label={confirm.planFields.promoCode}
							value={EMPTY_VALUE_PLACEHOLDER}
						/>
						<DetailRow
							label={confirm.planFields.plan}
							value={planDisplayName}
							emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
						/>
						<DetailRow
							label={CD.viewFieldPricePerAssessment}
							value={formatCurrencyAmount(seat?.planPrice)}
							emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
						/>
						<DetailRow
							label={pc.billingCurrency}
							value={seat?.billingCurrency}
							emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
						/>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (plan?.planTypeId === "monthly") {
		return (
			<div className="grid w-full grid-cols-1 items-start gap-4 lg:grid-cols-2">
				<TrialConfigurationCard company={company} />
				<Card className="w-full gap-0 rounded-xl border border-border bg-background p-0 shadow-none">
					<CardHeader className="flex h-14 w-full items-center justify-between gap-6 border-b border-border p-4 !pb-4">
						<CardTitle className="flex flex-1 items-center text-base font-medium text-text-secondary">
							{CD.viewPlanConfigurationCard}
						</CardTitle>
					</CardHeader>
					<CardContent className="flex w-full flex-col gap-4 pt-4 pb-0">
						<div className="flex w-full flex-col gap-3">
							<PlanConfigurationRows
								company={company}
								promoDisplay={EMPTY_VALUE_PLACEHOLDER}
								planDisplayName={planDisplayName}
							/>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<Card className="w-full gap-0 rounded-xl border border-border bg-background p-0 shadow-none">
			<CardHeader className="flex h-14 w-full items-center justify-between gap-6 border-b border-border p-4 !pb-4">
				<CardTitle className="flex flex-1 items-center text-base font-medium text-text-secondary">
					{CD.viewPlanConfigurationCard}
				</CardTitle>
			</CardHeader>
			<CardContent className="flex w-full flex-col gap-4 pt-4 pb-0">
				<div className="flex w-full flex-col gap-3">
					<PlanConfigurationRows
						company={company}
						promoDisplay={EMPTY_VALUE_PLACEHOLDER}
						planDisplayName={planDisplayName}
					/>
				</div>
			</CardContent>
		</Card>
	);
}

export function CompanyViewBrandingTab({
	company,
}: {
	company: CompanyDetailData;
}) {
	const logoUrl = getBrandLogoDisplayUrl(company.brandLogo ?? null);

	return (
		<div className="max-w-2xl">
			<Card className="w-full gap-0 rounded-xl border border-border bg-background p-0 shadow-sm">
				<CardHeader className="flex h-14 w-full items-center justify-between gap-6 border-b border-border p-4 !pb-4">
					<CardTitle className="flex flex-1 items-center text-base font-normal text-text-foreground">
						{confirm.sections.brandingExperience}
					</CardTitle>
				</CardHeader>
				<CardContent className="p-4 pt-4 pb-6">
					{logoUrl ? (
						<Card className="flex h-72 w-72 flex-col items-center justify-center rounded-lg border border-border bg-white p-6">
							<div className="relative flex h-64 w-64 items-center justify-center overflow-hidden rounded-lg bg-white">
								<img
									src={logoUrl}
									alt={ac.configuration.branding.logoAlt}
									className="max-h-full max-w-full object-contain"
									crossOrigin="anonymous"
									referrerPolicy="no-referrer"
								/>
							</div>
						</Card>
					) : (
						<p className="py-6 text-small text-text-secondary">
							{CorpC.viewNoLogoUploaded}
						</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

export function CompanyViewConfigurationTab({
	company,
}: {
	company: CompanyDetailData;
}) {
	const cfg = company.configuration;

	return (
		<div className="max-w-2xl">
			<Card className="w-full gap-0 rounded-xl border border-border bg-background p-0 shadow-none">
				<CardHeader className="flex h-14 w-full items-center justify-between gap-6 border-b border-border p-4 !pb-4">
					<CardTitle className="flex flex-1 items-center text-base font-medium text-text-secondary">
						{gs.title}
					</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-4 pt-4 pb-0">
					<div className="flex w-full flex-col gap-3">
						<DetailRow
							label={gs.authenticationMethod}
							value={cfg?.authMethod}
							emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
						/>
						<DetailRow
							label={gs.passwordPolicy}
							value={cfg?.passwordPolicy}
							emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
						/>
						<DetailRow
							label={gs.sessionTimeout}
							value={cfg?.sessionTimeout}
							emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
						/>
						<DetailRow
							label={gs.twoFaRequirement}
							value={cfg?.mfa}
							emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
						/>
						<DetailRow
							label={gs.securityPosture}
							value={cfg?.securityPosture}
							emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
						/>
						<DetailRow
							label={gs.primaryLanguage}
							value={cfg?.primaryLanguage}
							emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
