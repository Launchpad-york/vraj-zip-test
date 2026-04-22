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
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	FIRST_LOGIN_NEW_PASSWORD_PAGE_CONTENT,
	PASSWORD_INPUT_ICON_SIZE,
	PASSWORD_STRENGTH,
	PASSWORD_VISIBILITY_LABELS,
	ROUTES,
	SET_NEW_PASSWORD_PAGE_CONTENT,
} from "@/const";
import { cn } from "@/lib/utils";
import {
	type CognitoNewPasswordChallengeSchemaType,
	cognitoNewPasswordChallengeSchema,
} from "@/schemas";
import { useAuthStore } from "@/store";
import { calculatePasswordStrength } from "@/utils";

export function LoginNewPasswordChallengeForm() {
	const navigate = useNavigate();
	const {
		completeNewPasswordChallenge,
		cancelNewPasswordChallenge,
		isLoading,
		email,
	} = useAuthStore();

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const passwordForm = useForm<CognitoNewPasswordChallengeSchemaType>({
		resolver: yupResolver(cognitoNewPasswordChallengeSchema),
		defaultValues: { password: "", confirmPassword: "" },
		mode: "onChange",
	});

	const { trigger, watch } = passwordForm;
	const pwd = watch("password");
	const confirmPwd = watch("confirmPassword");

	useEffect(() => {
		if (confirmPwd) {
			void trigger("confirmPassword");
		}
	}, [pwd, confirmPwd, trigger]);
	const strength = useMemo(() => calculatePasswordStrength(pwd ?? ""), [pwd]);
	const strengthConfig = PASSWORD_STRENGTH[strength];
	const progressWidth = (strengthConfig.level / 3) * 100;
	const passwordOk =
		strength === "strong" &&
		!passwordForm.formState.errors.password &&
		!passwordForm.formState.errors.confirmPassword &&
		confirmPwd !== "";

	const onSubmit = async (data: CognitoNewPasswordChallengeSchemaType) => {
		const ok = await completeNewPasswordChallenge(data.password);
		if (ok) {
			navigate(ROUTES.dashboard.root, { replace: true });
		}
	};

	const onBack = () => {
		void cancelNewPasswordChallenge();
	};

	return (
		<Card className="border bg-background rounded-xl border-border shadow-md">
			<CardHeader className="space-y-1 text-center">
				<CardTitle className="text-heading-4 font-semibold text-text-foreground">
					{FIRST_LOGIN_NEW_PASSWORD_PAGE_CONTENT.title}
				</CardTitle>
				<CardDescription className="text-small font-normal text-text-secondary">
					{FIRST_LOGIN_NEW_PASSWORD_PAGE_CONTENT.subtitle}
				</CardDescription>
				{email ? (
					<p className="text-muted-foreground text-small pt-1">{email}</p>
				) : null}
			</CardHeader>
			<CardContent>
				<form
					onSubmit={passwordForm.handleSubmit(onSubmit)}
					className="space-y-5"
				>
					<FormInput
						id="first-login-new-password"
						label={SET_NEW_PASSWORD_PAGE_CONTENT.passwordLabel}
						type={showPassword ? "text" : "password"}
						autoComplete="new-password"
						placeholder={SET_NEW_PASSWORD_PAGE_CONTENT.passwordPlaceholder}
						error={passwordForm.formState.errors.password?.message}
						{...passwordForm.register("password")}
						rightElement={
							<Button
								type="button"
								variant="ghost"
								onClick={() => setShowPassword((v) => !v)}
								className="cursor-pointer p-0 h-auto absolute right-3 top-1/2 -translate-y-1/2 text-icon-secondary hover:text-icon-primary transition-colors hover:bg-transparent"
								aria-label={
									showPassword
										? PASSWORD_VISIBILITY_LABELS.hide
										: PASSWORD_VISIBILITY_LABELS.show
								}
							>
								{showPassword ? (
									<EyeOff size={PASSWORD_INPUT_ICON_SIZE} />
								) : (
									<Eye size={PASSWORD_INPUT_ICON_SIZE} />
								)}
							</Button>
						}
					/>
					<div className="space-y-2">
						<FormInput
							id="first-login-confirm-password"
							label={SET_NEW_PASSWORD_PAGE_CONTENT.confirmPasswordLabel}
							type={showConfirmPassword ? "text" : "password"}
							autoComplete="new-password"
							placeholder={
								SET_NEW_PASSWORD_PAGE_CONTENT.confirmPasswordPlaceholder
							}
							error={passwordForm.formState.errors.confirmPassword?.message}
							{...passwordForm.register("confirmPassword")}
							rightElement={
								<Button
									type="button"
									variant="ghost"
									onClick={() => setShowConfirmPassword((v) => !v)}
									className="cursor-pointer p-0 h-auto absolute right-3 top-1/2 -translate-y-1/2 text-icon-secondary hover:text-icon-primary transition-colors hover:bg-transparent"
									aria-label={
										showConfirmPassword
											? PASSWORD_VISIBILITY_LABELS.hide
											: PASSWORD_VISIBILITY_LABELS.show
									}
								>
									{showConfirmPassword ? (
										<EyeOff size={PASSWORD_INPUT_ICON_SIZE} />
									) : (
										<Eye size={PASSWORD_INPUT_ICON_SIZE} />
									)}
								</Button>
							}
						/>
						{pwd ? (
							<div className="space-y-1">
								<div className="h-1 w-full bg-border rounded-full overflow-hidden">
									<div
										className={cn(
											"h-full rounded-full transition-all duration-500 ease-out",
											strengthConfig.color,
										)}
										style={{ width: `${progressWidth}%` }}
									/>
								</div>
								<p
									className={cn(
										"text-small font-normal transition-colors duration-300",
										strength === "poor" && "text-destructive",
										strength === "average" && "text-warning",
										strength === "strong" && "text-success",
									)}
								>
									{strengthConfig.label}
								</p>
							</div>
						) : null}
					</div>
					<div className="flex flex-col gap-2 pt-2">
						<Button
							type="submit"
							disabled={!passwordOk || isLoading}
							className="w-full h-10 cursor-pointer"
						>
							{isLoading
								? FIRST_LOGIN_NEW_PASSWORD_PAGE_CONTENT.submitting
								: FIRST_LOGIN_NEW_PASSWORD_PAGE_CONTENT.submitButton}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={onBack}
							disabled={isLoading}
							className="w-full h-10 cursor-pointer"
						>
							{FIRST_LOGIN_NEW_PASSWORD_PAGE_CONTENT.backToSignIn}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
