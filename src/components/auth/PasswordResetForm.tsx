import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
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
	PASSWORD_RESET_CONFIG,
	PASSWORD_RESET_PAGE_CONTENT,
	ROUTES,
} from "@/const";
import { useAuthStore } from "@/store";
import type { PasswordResetFormData, PasswordResetFormProps } from "@/types";
import { formatTime, maskEmail } from "@/utils";

export function PasswordResetForm({
	email,
	onSuccess,
}: PasswordResetFormProps) {
	const [timer, setTimer] = useState<number>(
		PASSWORD_RESET_CONFIG.timerDuration,
	);
	const [isVerifying, setIsVerifying] = useState(false);
	const [isResending, setIsResending] = useState(false);
	const navigate = useNavigate();
	const { validatePasswordReset, resendPasswordReset } = useAuthStore();

	const { control, handleSubmit, watch } = useForm<PasswordResetFormData>({
		defaultValues: {
			code: Array(PASSWORD_RESET_CONFIG.codeLength).fill(""),
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

	const onSubmit = async () => {
		if (!email) {
			navigate(ROUTES.auth.forgotPassword);
			return;
		}
		setIsVerifying(true);
		const response = await validatePasswordReset(email, code.join(""));
		setIsVerifying(false);
		if (response && onSuccess) {
			onSuccess();
		}
	};

	const handleResend = async () => {
		if (email) {
			setIsResending(true);
			const response = await resendPasswordReset(email);
			setIsResending(false);
			if (response) {
				setTimer(PASSWORD_RESET_CONFIG.timerDuration);
			}
		}
	};

	const handleBackToLogin = () => {
		navigate(ROUTES.auth.login);
	};

	return (
		<Card className="border bg-background rounded-xl border-border shadow-md">
			<CardHeader className="space-y-1 text-center">
				<CardTitle className="text-heading-4 font-semibold text-text-foreground">
					{PASSWORD_RESET_PAGE_CONTENT.title}
				</CardTitle>
				<CardDescription className="text-small font-normal text-text-secondary">
					{PASSWORD_RESET_PAGE_CONTENT.subtitle}
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
								{PASSWORD_RESET_PAGE_CONTENT.codeLabel}
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
									length={PASSWORD_RESET_CONFIG.codeLength}
									value={field.value}
									onChange={field.onChange}
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
								? PASSWORD_RESET_PAGE_CONTENT.verifyingText
								: PASSWORD_RESET_PAGE_CONTENT.submitButton}
						</Button>
					</div>
				</form>
			</CardContent>

			<CardFooter className="flex-col text-center space-y-3">
				<Button
					type="button"
					variant="link"
					onClick={handleBackToLogin}
					className="text-small font-medium text-text-foreground hover:text-text-secondary transition-colors p-0 h-auto"
				>
					{PASSWORD_RESET_PAGE_CONTENT.backToLogin}
				</Button>

				<p className="text-small text-text-secondary">
					{PASSWORD_RESET_PAGE_CONTENT.resendText}{" "}
					<Button
						type="button"
						variant="link"
						onClick={handleResend}
						disabled={isResending || timer > 0}
						className="font-normal cursor-pointer p-0 h-auto disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{PASSWORD_RESET_PAGE_CONTENT.resendLink}
					</Button>
				</p>
			</CardFooter>
		</Card>
	);
}
