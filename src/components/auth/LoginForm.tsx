import { yupResolver } from "@hookform/resolvers/yup";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
	AUTH_FIELD_NAMES,
	AUTH_FORM_IDS,
	LOGIN_PAGE_CONTENT,
	PASSWORD_INPUT_ICON_SIZE,
	PASSWORD_VISIBILITY_LABELS,
	ROUTES,
} from "@/const";
import { type LoginSchemaType, loginSchema } from "@/schemas";
import { useAuthStore } from "@/store";
import type { LoginFormProps } from "@/types";

export function LoginForm({ setTempPassword }: LoginFormProps) {
	const [showPassword, setShowPassword] = useState(false);
	const navigate = useNavigate();
	const { login, isLoading } = useAuthStore();

	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<LoginSchemaType>({
		resolver: yupResolver(loginSchema),
		mode: "onChange",
	});

	const onSubmit = async (data: LoginSchemaType) => {
		setTempPassword(data.password);

		const result = await login({
			email: data.email.trim().toLowerCase(),
			password: data.password,
		});

		if (result === "success") {
			navigate(ROUTES.dashboard.root);
		}
	};

	const handleForgotPassword = () => {
		navigate(ROUTES.auth.forgotPassword);
	};

	const handleContactClick = () => {
		// TODO: Implement contact action
	};

	const passwordAriaLabel = showPassword
		? PASSWORD_VISIBILITY_LABELS.hide
		: PASSWORD_VISIBILITY_LABELS.show;

	return (
		<Card className="border bg-background rounded-xl border-border shadow-md">
			<CardHeader className="space-y-1 text-center">
				<CardTitle className="text-heading-4 font-semibold text-text-foreground">
					{LOGIN_PAGE_CONTENT.title}
				</CardTitle>
				<CardDescription className="text-small font-normal text-text-secondary">
					{LOGIN_PAGE_CONTENT.subtitle}
				</CardDescription>
			</CardHeader>

			<CardContent>
				<form
					id={AUTH_FORM_IDS.loginForm}
					onSubmit={handleSubmit(onSubmit)}
					className="space-y-5"
				>
					{/* Email Field */}
					<FormInput
						id={AUTH_FORM_IDS.email}
						label={LOGIN_PAGE_CONTENT.emailLabel}
						type="email"
						placeholder={LOGIN_PAGE_CONTENT.emailPlaceholder}
						autoComplete="email"
						error={errors.email?.message}
						{...register(AUTH_FIELD_NAMES.email)}
					/>

					{/* Password Field */}
					<div className="space-y-2">
						<div className="flex items-center justify-between mb-0">
							<Label
								htmlFor={AUTH_FORM_IDS.password}
								className="text-small font-medium text-text-foreground"
							>
								{LOGIN_PAGE_CONTENT.passwordLabel}
							</Label>
							<Button
								type="button"
								variant="link"
								onClick={handleForgotPassword}
								className="text-small font-normal text-link hover:text-link-hover transition-colors p-0 h-auto cursor-pointer"
							>
								{LOGIN_PAGE_CONTENT.forgotPassword}
							</Button>
						</div>
						<FormInput
							id={AUTH_FORM_IDS.password}
							label=""
							type={showPassword ? "text" : "password"}
							placeholder={LOGIN_PAGE_CONTENT.passwordPlaceholder}
							autoComplete="current-password"
							error={errors.password?.message}
							{...register(AUTH_FIELD_NAMES.password)}
							rightElement={
								<Button
									type="button"
									variant="ghost"
									onClick={() => setShowPassword((prev) => !prev)}
									className=" cursor-pointer p-0 h-auto absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-icon-primary transition-colors hover:bg-transparent"
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
					</div>

					{/* Login Button */}
					<div className="pt-2">
						<Button
							type="submit"
							disabled={!isValid || isLoading}
							className="w-full h-10 cursor-pointer"
						>
							{isLoading ? "Logging in..." : LOGIN_PAGE_CONTENT.submitButton}
						</Button>
					</div>
				</form>
			</CardContent>

			<CardFooter className="flex-col text-center">
				<p className="text-small text-text-secondary">
					{LOGIN_PAGE_CONTENT.helpText}{" "}
					<Button
						type="button"
						variant="link"
						onClick={handleContactClick}
						className="text-link font-normal hover:text-link-hover transition-colors p-0 h-auto cursor-pointer"
					>
						{LOGIN_PAGE_CONTENT.contactUs}
					</Button>
				</p>
			</CardFooter>
		</Card>
	);
}
