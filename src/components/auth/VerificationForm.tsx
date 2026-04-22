import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { OTPInput } from "@/components/common";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	AUTH_TOAST_MESSAGES,
	ROUTES,
	VERIFICATION_CONFIG,
	VERIFICATION_PAGE_CONTENT,
} from "@/const";
import { useAuthStore } from "@/store";
import type { VerificationFormData, VerificationFormProps } from "@/types";
import { formatTime, maskEmail } from "@/utils";

export function VerificationForm({ email, password }: VerificationFormProps) {
	const [timer, setTimer] = useState<number>(VERIFICATION_CONFIG.timerDuration);
	const [isVerifying, setIsVerifying] = useState(false);
	const [isResending, setIsResending] = useState(false);
	const navigate = useNavigate();
	const { confirmSignIn, login, error, clearError } = useAuthStore();

	const { control, handleSubmit, watch } = useForm<VerificationFormData>({
		defaultValues: {
			code: Array(VERIFICATION_CONFIG.codeLength).fill(""),
		},
	});

	const code = watch("code");
	const isCodeComplete = code.every((digit) => digit !== "");

	// Timer countdown
	useEffect(() => {
		if (timer <= 0) return;

		const interval = setInterval(() => {
			setTimer((prev) => prev - 1);
		}, 1000);

		return () => clearInterval(interval);
	}, [timer]);

	const onSubmit = async (data: VerificationFormData) => {
		const verificationCode = data.code.join("");
		setIsVerifying(true);
		const success = await confirmSignIn(verificationCode);
		setIsVerifying(false);

		if (success) {
			navigate(ROUTES.dashboard.root);
		}
	};

	const handleResend = async () => {
		if (!email || !password) return;

		clearError();
		setIsResending(true);
		const result = await login({
			email: email.trim().toLowerCase(),
			password: password,
		});
		setIsResending(false);

		if (result === "verification") {
			setTimer(VERIFICATION_CONFIG.timerDuration);
			toast.success(AUTH_TOAST_MESSAGES.codeResent);
		}
	};

	return (
		<Card className="border bg-background rounded-xl border-border shadow-md">
			<CardHeader className="space-y-1 text-center">
				<CardTitle className="text-heading-4 font-semibold text-text-foreground">
					{VERIFICATION_PAGE_CONTENT.title}
				</CardTitle>
				<CardDescription className="text-small font-normal text-text-secondary">
					{VERIFICATION_PAGE_CONTENT.subtitle}
					{email && (
						<>
							<br />
							<span className="text-link">{maskEmail(email)}</span>
						</>
					)}
				</CardDescription>
			</CardHeader>

			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
					{/* Code Input */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label className="text-small font-medium text-text-foreground">
								{VERIFICATION_PAGE_CONTENT.codeLabel}
							</Label>
							<span className="text-small text-text-secondary">
								{formatTime(timer)}
							</span>
						</div>

						<Controller
							name="code"
							control={control}
							render={({ field }) => (
								<OTPInput
									length={VERIFICATION_CONFIG.codeLength}
									value={field.value}
									onChange={(value) => {
										if (error) clearError();
										field.onChange(value);
									}}
									error={!!error}
								/>
							)}
						/>
					</div>

					{/* Verify Button */}
					<div className="pt-2">
						<Button
							type="submit"
							disabled={!isCodeComplete || isVerifying}
							className="w-full h-10"
						>
							{isVerifying
								? VERIFICATION_PAGE_CONTENT.loadingText
								: VERIFICATION_PAGE_CONTENT.submitButton}
						</Button>
					</div>
				</form>
			</CardContent>

			<CardFooter className="flex-col text-center">
				<p className="text-small text-text-secondary">
					{VERIFICATION_PAGE_CONTENT.resendText}{" "}
					<Button
						type="button"
						variant="link"
						onClick={handleResend}
						disabled={isResending || timer > 0}
						className="font-normal cursor-pointer p-0 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{VERIFICATION_PAGE_CONTENT.resendLink}
					</Button>
				</p>
			</CardFooter>
		</Card>
	);
}
