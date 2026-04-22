import {
	BSPBadge,
	DetailRow,
	ViewCompanyDetailContent,
	ViewCorporationCompaniesTab,
} from "@/components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	CORPORATE_DIRECTORY_PAGE_CONTENT as C,
	EMPTY_VALUE_PLACEHOLDER,
} from "@/const";
import type {
	CorporationDetailsContentProps,
	CorporationStatus,
} from "@/types";
import { formatAddress, formatFullName, getBrandLogoDisplayUrl } from "@/utils";

function toCorporationStatus(status: string): CorporationStatus {
	const s = status?.toLowerCase();
	if (["active", "suspended", "closed", "incomplete"].includes(s))
		return s as CorporationStatus;
	return "incomplete";
}

export function CorporationDetailsContent({
	corporation,
	activeTab,
	formatCorpId,
	selectedCompanyId,
	onCompanyClick,
	onBackToCompanies,
}: CorporationDetailsContentProps) {
	const addr = corporation.address;
	const status = toCorporationStatus(corporation.status);
	const brandLogoDisplayUrl = getBrandLogoDisplayUrl(corporation.brandLogo);

	if (activeTab === "basic") {
		return (
			<div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
				<Card className="w-full gap-0 rounded-xl border border-border bg-background p-0 shadow-none">
					<CardHeader className="flex h-14 w-full items-center justify-between gap-6 border-b border-border p-4 !pb-4">
						<CardTitle className="flex flex-1 items-center text-base font-medium text-text-secondary">
							{C.viewCardCorporationBasics}
						</CardTitle>
					</CardHeader>
					<CardContent className="flex w-full flex-col gap-4 p-4">
						<div className="flex w-full flex-col gap-3">
							<DetailRow
								label={C.viewFieldCorporationId}
								value={formatCorpId(corporation.corporationCode)}
								emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
							/>
							<DetailRow label={C.viewFieldStatus}>
								<BSPBadge type={status} className="capitalize">
									{status}
								</BSPBadge>
							</DetailRow>
							<DetailRow
								label={C.viewFieldCorporationLegalName}
								value={corporation.legalName}
								emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
							/>
							<DetailRow
								label={C.viewFieldDbaName}
								value={corporation.dbaName}
								emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
							/>
							<DetailRow
								label={C.viewFieldWebsiteUrl}
								value={corporation.website}
								emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
							/>
							<DetailRow
								label={C.viewFieldOwnershipType}
								value={corporation.ownershipType ?? ""}
								emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
							/>
							<DetailRow
								label={C.viewFieldRegion}
								value={corporation.dataResidencyRegion}
								emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
							/>
							<DetailRow
								label={C.viewFieldIndustry}
								value={corporation.industry}
								emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
							/>
							<DetailRow
								label={C.viewFieldCorporatePhoneNo}
								value={corporation.phoneNo}
								emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
							/>
							<DetailRow
								label={C.viewFieldAddress}
								value={formatAddress(addr)}
								emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
							/>
							<DetailRow
								label={C.viewFieldTimeZone}
								value={addr?.timezone}
								emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
							/>
						</div>
					</CardContent>
				</Card>
				<div className="flex w-full flex-col gap-4">
					{corporation.corporationAdmin && (
						<Card className="w-full gap-0 rounded-xl border border-border bg-background p-0 shadow-none">
							<CardHeader className="flex h-14 w-full items-center justify-between gap-6 border-b border-border p-4 !pb-4">
								<CardTitle className="flex flex-1 items-center text-base font-medium text-text-secondary">
									{C.viewCardCorporateAdmin}
								</CardTitle>
							</CardHeader>
							<CardContent className="flex flex-col gap-4 px-4 pt-4 pb-0">
								<div className="flex w-full flex-col gap-3">
									<DetailRow
										label={C.viewFieldFullName}
										value={formatFullName(
											corporation.corporationAdmin?.firstName,
											corporation.corporationAdmin?.lastName,
										)}
										emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
									/>
									<DetailRow
										label={C.viewFieldNickname}
										value={corporation.corporationAdmin.nickname}
										emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
									/>
									<DetailRow
										label={C.viewFieldJobRole}
										value={corporation.corporationAdmin.role}
										emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
									/>
									<DetailRow
										label={C.viewFieldEmail}
										value={corporation.corporationAdmin.email}
										emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
									/>
									<DetailRow
										label={C.viewFieldWorkPhoneNo}
										value={corporation.corporationAdmin.workPhone}
										emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
									/>
									<DetailRow
										label={C.viewFieldCellPhoneNo}
										value={corporation.corporationAdmin.cellPhone}
										emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
									/>
								</div>
							</CardContent>
						</Card>
					)}
					{corporation.executiveSponsor && (
						<Card className="w-full gap-0 rounded-xl border border-border bg-background p-0 shadow-none">
							<CardHeader className="flex h-14 w-full items-center justify-between gap-6 border-b border-border p-4 !pb-4">
								<CardTitle className="flex flex-1 items-center text-base font-medium text-text-secondary">
									{C.viewCardExecutiveSponsor}
								</CardTitle>
							</CardHeader>
							<CardContent className="flex flex-col gap-4 px-4 pt-4 pb-0">
								<div className="flex w-full flex-col gap-3">
									<DetailRow
										label={C.viewFieldFullName}
										value={formatFullName(
											corporation.executiveSponsor?.firstName,
											corporation.executiveSponsor?.lastName,
										)}
										emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
									/>
									<DetailRow
										label={C.viewFieldNickname}
										value={corporation.executiveSponsor.nickname}
										emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
									/>
									<DetailRow
										label={C.viewFieldJobRole}
										value={corporation.executiveSponsor.role}
										emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
									/>
									<DetailRow
										label={C.viewFieldEmail}
										value={corporation.executiveSponsor.email}
										emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
									/>
									<DetailRow
										label={C.viewFieldWorkPhoneNo}
										value={corporation.executiveSponsor.workPhone}
										emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
									/>
									<DetailRow
										label={C.viewFieldCellPhoneNo}
										value={corporation.executiveSponsor.cellPhone}
										emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
									/>
								</div>
							</CardContent>
						</Card>
					)}
					{!corporation.corporationAdmin && !corporation.executiveSponsor && (
						<Card className="bg-white shadow-sm">
							<CardContent className="py-6 text-small text-text-secondary">
								{C.viewNoAdminOrSponsor}
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		);
	}

	if (activeTab === "companies" && corporation.id) {
		if (selectedCompanyId != null && selectedCompanyId !== "") {
			return (
				<ViewCompanyDetailContent
					corporationId={corporation.id}
					initialCompanyId={selectedCompanyId}
					onBackToCompanies={onBackToCompanies ?? (() => {})}
				/>
			);
		}
		return (
			<ViewCorporationCompaniesTab
				corporationId={corporation.id}
				onCompanyClick={onCompanyClick}
			/>
		);
	}

	if (activeTab === "branding") {
		return (
			<div className="max-w-2xl">
				<Card className="w-full gap-0 rounded-xl border border-border bg-background p-0 shadow-sm">
					<CardHeader className="flex h-14 w-full items-center justify-between gap-6 border-b border-border p-4 !pb-4">
						<CardTitle className="flex flex-1 items-center text-base font-normal text-text-foreground">
							{C.viewCardBrandLogo}
						</CardTitle>
					</CardHeader>
					<CardContent className="p-4 pt-4 pb-6">
						{brandLogoDisplayUrl ? (
							<img
								src={brandLogoDisplayUrl}
								alt="Corporation brand logo"
								className="h-20 max-w-[200px] w-auto rounded-lg object-contain"
							/>
						) : (
							<p className="py-6 text-small text-text-secondary">
								{C.viewNoLogoUploaded}
							</p>
						)}
					</CardContent>
				</Card>
			</div>
		);
	}

	if (activeTab === "contacts") {
		return (
			<div className="max-w-2xl">
				<Card className="w-full gap-0 rounded-xl border border-border bg-background p-0 shadow-none">
					<CardHeader className="flex h-14 w-full items-center justify-between gap-6 border-b border-border p-4 !pb-4">
						<CardTitle className="flex flex-1 items-center text-base font-medium text-text-secondary">
							{C.viewCardComplianceContact}
						</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col gap-4 px-4 pt-4 pb-0">
						{corporation.complianceContact ? (
							<div className="flex w-full flex-col gap-3">
								<DetailRow
									label={C.viewFieldFullName}
									value={formatFullName(
										corporation.complianceContact?.firstName,
										corporation.complianceContact?.lastName,
									)}
									emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
								/>
								<DetailRow
									label={C.viewFieldNickname}
									value={corporation.complianceContact.nickname}
									emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
								/>
								<DetailRow
									label={C.viewFieldJobRole}
									value={corporation.complianceContact.role}
									emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
								/>
								<DetailRow
									label={C.viewFieldEmail}
									value={corporation.complianceContact.email}
									emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
								/>
								<DetailRow
									label={C.viewFieldWorkPhoneNo}
									value={corporation.complianceContact.workPhone}
									emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
								/>
								<DetailRow
									label={C.viewFieldCellPhoneNo}
									value={corporation.complianceContact.cellPhone}
									emptyPlaceholder={EMPTY_VALUE_PLACEHOLDER}
								/>
							</div>
						) : (
							<p className="py-6 text-small text-text-secondary">
								{C.viewNoComplianceContact}
							</p>
						)}
					</CardContent>
				</Card>
			</div>
		);
	}

	return null;
}
