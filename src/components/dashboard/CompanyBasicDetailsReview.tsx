import { COMPANY_ADMIN_ONBOARDING } from "@/const";
import type { CompanyBasicDetailsReviewProps } from "@/types";

/**
 * Corporation + company rectangles (same layout as onboarding step 1 body).
 */
export function CompanyBasicDetailsReview({
	corporation,
	company,
}: CompanyBasicDetailsReviewProps) {
	const C = COMPANY_ADMIN_ONBOARDING;
	const safeCorporation = corporation ?? {
		legalName: "—",
		ownershipType: "—",
		dataResidencyRegion: "—",
	};
	const safeCompany = company ?? {
		legalName: "—",
		dbaName: "—",
		website: "—",
		companyType: "—",
		officeType: "—",
		industry: "—",
		phoneNo: "—",
		addressFormatted: "—",
	};

	return (
		<div className="space-y-8">
			<section className="space-y-2">
				<h3 className="text-sm font-semibold text-text-foreground">
					{C.corporationSection}
				</h3>
				<div className="rounded-lg border border-border bg-background px-4 py-5 sm:px-6">
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
						<ReviewField
							label={C.labels.parentCorporationLegalName}
							value={safeCorporation.legalName}
						/>
						<ReviewField
							label={C.labels.ownershipType}
							value={safeCorporation.ownershipType}
						/>
					</div>
				</div>
			</section>
			<section className="space-y-2">
				<h3 className="text-sm font-semibold text-text-foreground">
					{C.companySection}
				</h3>
				<div className="rounded-lg border border-border bg-background px-4 py-5 sm:px-6">
					<div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-3">
						<ReviewField
							label={C.labels.companyLegalName}
							value={safeCompany.legalName}
						/>
						<ReviewField
							label={C.labels.dbaTradeName}
							value={safeCompany.dbaName ?? "—"}
						/>
						<ReviewField
							label={C.labels.websiteUrl}
							value={safeCompany.website ?? "—"}
						/>
						<ReviewField
							label={C.labels.companyType}
							value={safeCompany.companyType}
						/>
						<ReviewField
							label={C.labels.officeType}
							value={safeCompany.officeType}
						/>
						<ReviewField
							label={C.labels.regionDataResidency}
							value={safeCorporation.dataResidencyRegion}
						/>
						<ReviewField label={C.labels.industry} value={safeCompany.industry} />
						<ReviewField
							label={C.labels.companyPhone}
							value={safeCompany.phoneNo ?? "—"}
						/>
						<ReviewField
							label={C.labels.companyAddress}
							value={safeCompany.addressFormatted}
						/>
					</div>
				</div>
			</section>
		</div>
	);
}

/** Label (muted) above value (emphasized), for review rectangles / grids. */
export function ReviewField({
	label,
	value,
}: {
	label: string;
	value: string;
}) {
	return (
		<div className="flex min-w-0 flex-col gap-1">
			<span className="text-xs font-normal leading-tight text-muted-foreground">
				{label}
			</span>
			<span className="text-sm font-semibold leading-snug text-foreground break-words">
				{value}
			</span>
		</div>
	);
}
