import { useState } from "react";
import {
	ForgotPasswordForm,
	PasswordResetForm,
	SetNewPasswordForm,
} from "@/components/auth";
import { AuthLayout } from "@/layout";
import { useAuthStore } from "@/store";

type ForgotPasswordStep = "email" | "verification" | "newPassword";

export function ForgotPasswordPage() {
	const { email } = useAuthStore();
	const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>("email");

	const handleEmailSuccess = () => {
		setCurrentStep("verification");
	};

	const handleVerificationSuccess = () => {
		setCurrentStep("newPassword");
	};

	return (
		<AuthLayout>
			{currentStep === "email" && (
				<ForgotPasswordForm onSuccess={handleEmailSuccess} />
			)}
			{currentStep === "verification" && (
				<PasswordResetForm
					email={email ?? undefined}
					onSuccess={handleVerificationSuccess}
				/>
			)}
			{currentStep === "newPassword" && <SetNewPasswordForm />}
		</AuthLayout>
	);
}
