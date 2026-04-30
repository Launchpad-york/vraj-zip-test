import type { ReactNode } from "react";

export type AuthUser = {
	userId: string;
	username: string;
};

export type AuthLayoutProps = {
	children: ReactNode;
	title?: string;
};

export type LoginFormData = {
	email: string;
	password: string;
};

export type LoginCredentials = {
	email: string;
	password: string;
};

export type ForgotPasswordFormData = {
	email: string;
};

export type PasswordResetFormData = {
	code: string[];
};

export type AuthState = {
	user: AuthUser | null;
	email: string | null;
	passwordResetToken: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	isInitialized: boolean;
	requiresVerification: boolean;
	/** Cognito NEW_PASSWORD_REQUIRED after signing in with a temporary password. */
	requiresNewPassword: boolean;
	error: string | null;
};

export type AuthActions = {
	login: (
		credentials: LoginCredentials,
	) => Promise<"success" | "verification" | "newPassword" | "error">;
	confirmSignIn: (code: string) => Promise<boolean>;
	completeNewPasswordChallenge: (newPassword: string) => Promise<boolean>;
	cancelNewPasswordChallenge: () => Promise<void>;
	requestPasswordReset: (email: string) => Promise<boolean>;
	validatePasswordReset: (email: string, token: string) => Promise<boolean>;
	resendPasswordReset: (email: string) => Promise<boolean>;
	confirmPasswordReset: (
		email: string,
		token: string,
		newPassword: string,
	) => Promise<boolean>;
	checkAuth: () => Promise<void>;
	logout: () => Promise<void>;
	clearError: () => void;
	reset: () => void;
};

export type AuthStore = AuthState & AuthActions;

export type ThemeMode = "light" | "dark";

export type ThemeContextValue = {
	theme: ThemeMode;
	toggleTheme: () => void;
	setTheme: (theme: ThemeMode) => void;
};

export type SetNewPasswordFormData = {
	password: string;
	confirmPassword: string;
};

export type PasswordStrengthLevel = "none" | "poor" | "average" | "strong";

export type PasswordResetFormProps = {
	email?: string;
	onSuccess?: () => void;
};

export type ForgotPasswordFormProps = {
	onSuccess?: () => void;
};

/**
 * Password Reset API Types
 */
export type PasswordResetRequestPayload = {
	email: string;
};

export type PasswordResetRequestResponse = {
	success: boolean;
	message?: string;
};

export type PasswordResetValidatePayload = {
	email: string;
	token: string;
};

export type PasswordResetValidateResponse = {
	success: boolean;
	message?: string;
};

export type PasswordResetResendPayload = {
	email: string;
};

export type PasswordResetResendResponse = {
	success: boolean;
	message?: string;
};

export type PasswordResetConfirmPayload = {
	email: string;
	token: string;
	newPassword: string;
};

export type PasswordResetConfirmResponse = {
	success: boolean;
	message?: string;
};

export type VerificationFormProps = {
	email?: string;
	password: string;
};

export type VerificationFormData = {
	code: string[];
};

export type LoginFormProps = {
	setTempPassword: (password: string) => void;
};
