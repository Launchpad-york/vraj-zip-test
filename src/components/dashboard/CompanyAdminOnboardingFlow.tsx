import { ArrowLeft, Info } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { postCompanyAdminCheckoutSession } from "@/api";
import { BSPLogo } from "@/components/BSPLogo";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { COMPANY_ADMIN_ONBOARDING } from "@/const";
import { cn } from "@/lib/utils";
import type { CompanyAdminOnboardingFlowProps } from "@/types";
import { formatCurrencyAmount } from "@/utils";
import {
	CompanyBasicDetailsReview,
	ReviewField,
} from "./CompanyBasicDetailsReview";

export function CompanyAdminOnboardingFlow({
	review,
	onBackToList,
}: CompanyAdminOnboardingFlowProps) {
	const [step, setStep] = useState<1 | 2>(1);
	const [checkoutLoading, setCheckoutLoading] = useState(false);

	const { corporation, company, planSummary } = review;
	const C = COMPANY_ADMIN_ONBOARDING;

	const onProceedToPayment = async () => {
		if (!review.canCheckout) {
			toast.error(C.checkoutDisabled);
			return;
		}
		setCheckoutLoading(true);
		try {
			const res = await postCompanyAdminCheckoutSession({
				companyId: review.companyId,
			});
			if (!res.ok) {
				toast.error(res.message);
				return;
			}
			window.location.href = res.data.url;
		} finally {
			setCheckoutLoading(false);
		}
	};

	const trial = planSummary?.trial;
	const pricing = planSummary?.pricing;
	const showTrialSection = planSummary?.planTypeId !== "annual";
	const step2Intro =
		planSummary?.planTypeId === "annual"
			? C.step2IntroAnnual
			: C.step2IntroMonthly;

	return (
		<div className="flex min-h-[calc(100vh-8rem)] w-full flex-col items-center px-0 sm:px-2">
			<div className="w-full max-w-4xl">
				{onBackToList ? (
					<div className="mb-4 flex justify-start">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="gap-1 -ml-2 px-2 text-muted-foreground"
							onClick={onBackToList}
						>
							<ArrowLeft className="h-4 w-4" aria-hidden />
							{C.backToCompanies}
						</Button>
					</div>
				) : null}
				<div className="mb-8 flex justify-center">
					<BSPLogo variant="app" />
				</div>

				{step === 1 ? (
					<Card className="w-full border bg-background rounded-xl border-border shadow-md">
						<CardHeader className="space-y-1 text-center">
							<CardTitle className="text-heading-4 font-semibold text-text-foreground">
								{C.step1Title}
							</CardTitle>
							<CardDescription className="text-small font-normal text-text-secondary">
								{C.step1Subtitle}
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-8">
							<CompanyBasicDetailsReview
								corporation={corporation}
								company={company}
							/>
							<div className="flex justify-end gap-3 pt-2">
								<Button
									type="button"
									variant="outline"
									onClick={() =>
										toast.info(
											"You can return to this review from the dashboard when you're ready.",
										)
									}
								>
									{C.discard}
								</Button>
								<Button type="button" onClick={() => setStep(2)}>
									{C.proceedToPlan}
								</Button>
							</div>
							{!planSummary ? (
								<p className="text-center text-sm text-muted-foreground">
									{C.noPlanBody}
								</p>
							) : null}
						</CardContent>
					</Card>
				) : (
					<Card className="w-full border bg-background rounded-xl border-border shadow-md">
						<CardHeader className="space-y-1 text-center">
							<CardTitle className="text-heading-4 font-semibold text-text-foreground">
								{planSummary?.planTypeName ?? C.noPlanTitle}
							</CardTitle>
							<CardDescription className="text-small font-normal text-text-secondary">
								{step2Intro}
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-8">
							{planSummary ? (
								<>
									{showTrialSection ? (
										<section className="space-y-2">
											<h3 className="text-sm font-semibold text-text-foreground">
												{C.trialSection}
											</h3>
											<div className="rounded-lg border border-border bg-background px-4 py-5 sm:px-6">
												<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
													<ReviewField
														label={C.labelsPlan.zeroTrial}
														value={
															trial
																? trial.zeroTrial
																	? C.labelsPlan.on
																	: C.labelsPlan.off
																: "—"
														}
													/>
													<ReviewField
														label={C.labelsPlan.trialLength}
														value={
															trial ? `${trial.trialLengthDays} days` : "—"
														}
													/>
													<ReviewField
														label={C.labelsPlan.trialStart}
														value={trial?.trialStartDate ?? "—"}
													/>
												</div>
												<div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
													<ReviewField
														label={C.labelsPlan.trialEnd}
														value={trial?.trialEndDate ?? "—"}
													/>
													<ReviewField
														label={C.labelsPlan.autoConvert}
														value={
															trial
																? `${trial.autoConvertTrial ? C.labelsPlan.on : C.labelsPlan.off}${trial.autoConvertTrial ? ` ${C.labelsPlan.default}` : ""}`
																: "—"
														}
													/>
												</div>
											</div>
										</section>
									) : null}
									<section className="space-y-2">
										<h3 className="text-sm font-semibold text-text-foreground">
											{C.planSection}
										</h3>
										<div className="rounded-lg border border-border bg-background px-4 py-5 sm:px-6">
											<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
												<ReviewField
													label={C.labelsPlan.promoCode}
													value={
														pricing?.promoCode === null ||
														pricing?.promoCode === ""
															? "NA"
															: (pricing?.promoCode ?? "NA")
													}
												/>
												<ReviewField
													label={C.labelsPlan.planLevel}
													value={planSummary.employeeRangeLabel ?? "—"}
												/>
												<ReviewField
													label={C.labelsPlan.planPrice}
													value={formatCurrencyAmount(
														pricing?.planPrice ?? "0",
													)}
												/>
												<ReviewField
													label={C.labelsPlan.discount}
													value={formatCurrencyAmount(pricing?.discount ?? "0")}
												/>
												<ReviewField
													label={C.labelsPlan.invoiceAmount}
													value={formatCurrencyAmount(
														pricing?.invoiceAmount ?? "0",
													)}
												/>
												<ReviewField
													label={C.labelsPlan.billingCurrency}
													value={pricing?.billingCurrency ?? "USD ($)"}
												/>
											</div>
										</div>
									</section>
									<div
										className={cn(
											"flex gap-3 rounded-lg border border-sky-200/80 bg-sky-50 p-4 text-sm text-sky-950 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-100",
										)}
									>
										<Info
											className="h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400"
											aria-hidden
										/>
										<p className="leading-relaxed">{C.paymentNote}</p>
									</div>
								</>
							) : (
								<p className="text-center text-muted-foreground">
									{C.noPlanBody}
								</p>
							)}
							<div className="flex justify-end gap-3 pt-2">
								<Button
									type="button"
									variant="outline"
									onClick={() => setStep(1)}
								>
									{C.discard}
								</Button>
								<Button
									type="button"
									onClick={() => void onProceedToPayment()}
									disabled={
										!review.canCheckout || checkoutLoading || !planSummary
									}
								>
									{checkoutLoading ? C.proceeding : C.proceedToPayment}
								</Button>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
