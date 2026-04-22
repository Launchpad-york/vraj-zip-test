import { yupResolver } from "@hookform/resolvers/yup";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import {
	PASSWORD_INPUT_ICON_SIZE,
	PASSWORD_STRENGTH,
	PASSWORD_VISIBILITY_LABELS,
	ROUTES,
	SET_NEW_PASSWORD_PAGE_CONTENT,
} from "@/const";
import { cn } from "@/lib/utils";
import { type SetNewPasswordSchemaType, setNewPasswordSchema } from "@/schemas";
import { useAuthStore } from "@/store";
import { calculatePasswordStrength } from "@/utils";

export function SetNewPasswordForm() {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const navigate = useNavigate();
	const { confirmPasswordReset, isLoading, email, passwordResetToken } =
		useAuthStore();

	const {
		register,
		handleSubmit,
		watch,
		trigger,
		formState: { errors },
	} = useForm<SetNewPasswordSchemaType>({
		resolver: yupResolver(setNewPasswordSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
		mode: "onChange",
	});

	const password = watch("password");
	const confirmPassword = watch("confirmPassword");

	const passwordStrength = useMemo(
		() => calculatePasswordStrength(password),
		[password],
	);

	useEffect(() => {
		if (confirmPassword) {
			trigger("confirmPassword");
		}
	}, [password, confirmPassword, trigger]);

	const strengthConfig = PASSWORD_STRENGTH[passwordStrength];
	const isStrong = passwordStrength === "strong";
	const hasNoErrors = !errors.password && !errors.confirmPassword;
	const isFormValid = isStrong && hasNoErrors && confirmPassword !== "";

	const onSubmit = async (data: SetNewPasswordSchemaType) => {
		if (!email || !passwordResetToken) {
			navigate(ROUTES.auth.forgotPassword);
			return;
		}
		const success = await confirmPasswordReset(
			email,
			passwordResetToken,
			data.password,
		);
		if (success) {
			navigate(ROUTES.auth.login);
		}
	};

	const handleBackToLogin = () => {
		navigate(ROUTES.auth.login);
	};

	const passwordAriaLabel = showPassword
		? PASSWORD_VISIBILITY_LABELS.hide
		: PASSWORD_VISIBILITY_LABELS.show;

	const confirmPasswordAriaLabel = showConfirmPassword
		? PASSWORD_VISIBILITY_LABELS.hide
		: PASSWORD_VISIBILITY_LABELS.show;

	// Calculate progress bar width percentage
	const progressWidth = (strengthConfig.level / 3) * 100;

	return (
		<Card className="border bg-background rounded-xl border-border shadow-md">
			<CardHeader className="space-y-1 text-center">
				<CardTitle className="text-heading-4 font-semibold text-text-foreground">
					{SET_NEW_PASSWORD_PAGE_CONTENT.title}
				</CardTitle>
				<CardDescription className="text-small font-normal text-text-secondary">
					{SET_NEW_PASSWORD_PAGE_CONTENT.subtitle}
				</CardDescription>
			</CardHeader>

			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
					{/* Password Field */}
					<FormInput
						id="password"
						label={SET_NEW_PASSWORD_PAGE_CONTENT.passwordLabel}
						type={showPassword ? "text" : "password"}
						placeholder={SET_NEW_PASSWORD_PAGE_CONTENT.passwordPlaceholder}
						autoComplete="new-password"
						error={errors.password?.message}
						{...register("password")}
						rightElement={
							<Button
								type="button"
								variant="ghost"
								onClick={() => setShowPassword((prev) => !prev)}
								className="cursor-pointer p-0 h-auto absolute right-3 top-1/2 -translate-y-1/2 text-icon-secondary hover:text-icon-primary transition-colors hover:bg-transparent"
								aria-label={passwordAriaLabel}
							>
								{showPassword ? (
									<EyeOff size={PASSWORD_INPUT_ICON_SIZE} />
								) : (
									<Eye size={PASSWORD_INPUT_ICON_SIZE} />
								)}
							</Button>
						}
					/>

					{/* Confirm Password Field */}
					<div className="space-y-2">
						<FormInput
							id="confirmPassword"
							label={SET_NEW_PASSWORD_PAGE_CONTENT.confirmPasswordLabel}
							type={showConfirmPassword ? "text" : "password"}
							placeholder={
								SET_NEW_PASSWORD_PAGE_CONTENT.confirmPasswordPlaceholder
							}
							autoComplete="new-password"
							error={errors.confirmPassword?.message}
							{...register("confirmPassword")}
							rightElement={
								<Button
									type="button"
									variant="ghost"
									onClick={() => setShowConfirmPassword((prev) => !prev)}
									className="cursor-pointer p-0 h-auto absolute right-3 top-1/2 -translate-y-1/2 text-icon-secondary hover:text-icon-primary transition-colors hover:bg-transparent"
									aria-label={confirmPasswordAriaLabel}
								>
									{showConfirmPassword ? (
										<EyeOff size={PASSWORD_INPUT_ICON_SIZE} />
									) : (
										<Eye size={PASSWORD_INPUT_ICON_SIZE} />
									)}
								</Button>
							}
						/>

						{/* Password Strength Indicator */}
						{password && (
							<div className="space-y-1">
								{/* Progress Bar */}
								<div className="h-1 w-full bg-border rounded-full overflow-hidden">
									<div
										className={cn(
											"h-full rounded-full transition-all duration-500 ease-out",
											strengthConfig.color,
										)}
										style={{ width: `${progressWidth}%` }}
									/>
								</div>
								{/* Strength Label */}
								<p
									className={cn(
										"text-small font-normal transition-colors duration-300",
										passwordStrength === "poor" && "text-destructive",
										passwordStrength === "average" && "text-warning",
										passwordStrength === "strong" && "text-success",
									)}
								>
									{strengthConfig.label}
								</p>
							</div>
						)}
					</div>

					{/* Reset Password Button */}
					<div className="pt-2">
						<Button
							type="submit"
							disabled={!isFormValid || isLoading}
							className="w-full h-10 cursor-pointer"
						>
							{isLoading
								? SET_NEW_PASSWORD_PAGE_CONTENT.resetting
								: SET_NEW_PASSWORD_PAGE_CONTENT.submitButton}
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
					{SET_NEW_PASSWORD_PAGE_CONTENT.backToLogin}
				</Button>
			</CardFooter>
		</Card>
	);
}
