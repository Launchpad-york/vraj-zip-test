import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { FormInput } from "@/components/common";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { FORGOT_PASSWORD_PAGE_CONTENT, ROUTES } from "@/const";
import { type ForgotPasswordSchemaType, forgotPasswordSchema } from "@/schemas";
import { useAuthStore } from "@/store";
import type { ForgotPasswordFormProps } from "@/types";

export function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
	const navigate = useNavigate();
	const { requestPasswordReset, isLoading } = useAuthStore();

	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<ForgotPasswordSchemaType>({
		resolver: yupResolver(forgotPasswordSchema),
		mode: "onChange",
	});

	const onSubmit = async (data: ForgotPasswordSchemaType) => {
		const success = await requestPasswordReset(data.email.trim().toLowerCase());

		if (success) {
			onSuccess?.();
		}
	};

	const handleBackToLogin = () => {
		navigate(ROUTES.auth.login);
	};

	return (
		<Card className="border bg-background rounded-xl border-border shadow-md">
			<CardHeader className="space-y-1 text-center">
				<CardTitle className="text-heading-4 font-semibold text-text-foreground">
					{FORGOT_PASSWORD_PAGE_CONTENT.title}
				</CardTitle>
				<CardDescription className="text-small font-normal text-text-secondary">
					{FORGOT_PASSWORD_PAGE_CONTENT.subtitle}
				</CardDescription>
			</CardHeader>

			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
					{/* Email Field */}
					<FormInput
						id="forgot-password-email"
						label={FORGOT_PASSWORD_PAGE_CONTENT.emailLabel}
						type="email"
						placeholder={FORGOT_PASSWORD_PAGE_CONTENT.emailPlaceholder}
						autoComplete="email"
						error={errors.email?.message}
						{...register("email")}
					/>

					{/* Submit Button */}
					<div className="pt-2">
						<Button
							type="submit"
							disabled={!isValid || isLoading}
							className="w-full h-10"
						>
							{isLoading
								? "Sending..."
								: FORGOT_PASSWORD_PAGE_CONTENT.submitButton}
						</Button>
					</div>
				</form>
			</CardContent>

			<CardFooter className="flex-col text-center">
				<Button
					type="button"
					variant="link"
					onClick={handleBackToLogin}
					className="text-small font-medium text-text-foreground hover:text-text-secondary transition-colors p-0 h-auto"
				>
					{FORGOT_PASSWORD_PAGE_CONTENT.backToLogin}
				</Button>
			</CardFooter>
		</Card>
	);
}
