import type { LoginFormData } from "@/types";

export const AUTH_FORM_IDS = {
	loginForm: "login-form",
	email: "email",
	password: "password",
} as const;

export const AUTH_FIELD_NAMES = {
	email: "email",
	password: "password",
} as const;

export const LOGIN_PAGE_CONTENT = {
	title: "Welcome back!",
	subtitle: "Enter your email and password to sign in.",
	emailLabel: "Email",
	emailPlaceholder: "Enter email",
	passwordLabel: "Password",
	passwordPlaceholder: "Enter password",
	forgotPassword: "Forgot Password?",
	submitButton: "Login",
	helpText: "Need help?",
	contactUs: "Contact Us",
} as const;

export const PASSWORD_VISIBILITY_LABELS = {
	show: "Show password",
	hide: "Hide password",
} as const;

export const INITIAL_LOGIN_FORM_STATE: LoginFormData = {
	email: "",
	password: "",
} as const;

export const PASSWORD_INPUT_ICON_SIZE = 18;

export const AUTH_VALIDATION_MESSAGES = {
	emailInvalid: "Invalid email address",
	passwordsDoNotMatch: "Passwords do not match",
} as const;

export const AUTH_TOAST_MESSAGES = {
	loginSuccess: "Login successful!",
	loginError: "Login failed. Please try again.",
	logoutSuccess: "Logged out successfully",
	verificationSuccess: "Account verified successfully!",
	verificationError: "Verification failed. Please try again.",
	codeResent: "Verification code resent!",
} as const;

export const VERIFICATION_PAGE_CONTENT = {
	title: "Enter Verification Code",
	subtitle: "We've sent a 6-digit code to your email",
	codeLabel: "Enter code",
	submitButton: "Verify Account",
	resendText: "Didn't receive a code?",
	resendLink: "Resend",
	loadingText: "Verifying...",
} as const;

export const VERIFICATION_CONFIG = {
	codeLength: 6,
	timerDuration: 180,
} as const;

export const FORGOT_PASSWORD_PAGE_CONTENT = {
	title: "Forgot Password?",
	subtitle: "No worries — we'll send you reset instructions.",
	emailLabel: "Email",
	emailPlaceholder: "Enter your email here",
	submitButton: "Send Instructions",
	backToLogin: "Back to Login",
} as const;

export const PASSWORD_RESET_PAGE_CONTENT = {
	title: "Password Reset",
	subtitle: "We've sent a 6-digit code to your email",
	codeLabel: "Enter code",
	submitButton: "Verify Account",
	resendText: "Didn't receive a code?",
	resendLink: "Resend",
	backToLogin: "Back to Login",
	verifyingText: "Verifying...",
} as const;

export const PASSWORD_RESET_CONFIG = {
	codeLength: 6,
	timerDuration: 180,
} as const;

export const FORGOT_PASSWORD_TOAST_MESSAGES = {
	resetCodeSent: "Reset code sent to your email!",
	resetCodeError: "Failed to send reset code. Please try again.",
	passwordResetSuccess: "Password reset successfully!",
	passwordResetError: "Password reset failed. Please try again.",
	codeResent: "Reset code resent!",
} as const;

export const AUTH_ERROR_MESSAGES = {
	invalidCredentials: "We couldn't verify your credentials. Please try again",
	invalidVerificationCode: "The verification code is invalid or has expired",
} as const;

export const SET_NEW_PASSWORD_PAGE_CONTENT = {
	title: "Set New Password",
	subtitle:
		"Must be at least 8 characters, with upper & lowercase, a symbol or a number.",
	passwordLabel: "Password",
	passwordPlaceholder: "Password",
	confirmPasswordLabel: "Confirm Password",
	confirmPasswordPlaceholder: "Confirm Password",
	submitButton: "Reset Password",
	backToLogin: "Back to Login",
	resetting: "Resetting...",
} as const;

/** After first login with a Cognito temporary password (e.g. company admin invite). */
export const FIRST_LOGIN_NEW_PASSWORD_PAGE_CONTENT = {
	title: "Set your password",
	subtitle: SET_NEW_PASSWORD_PAGE_CONTENT.subtitle,
	submitButton: "Continue",
	submitting: "Saving…",
	backToSignIn: "Back to sign in",
	successToast: "Password set. Welcome!",
} as const;

export const PASSWORD_STRENGTH = {
	none: {
		level: 0,
		label: "",
		color: "bg-border",
	},
	poor: {
		level: 1,
		label: "Poor",
		color: "bg-destructive",
	},
	average: {
		level: 2,
		label: "Average",
		color: "bg-warning",
	},
	strong: {
		level: 3,
		label: "Strong",
		color: "bg-success",
	},
} as const;

export const PASSWORD_REQUIREMENTS = {
	minLength: 8,
	requireUpperAndLower: true,
	requireSymbolOrNumber: true,
} as const;
