import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "@/api";
import { AUTH_ERROR_MESSAGES, AUTH_TOAST_MESSAGES, ROUTES } from "@/const";
import { isApiError } from "@/lib/apiClient";
import type { AuthState, AuthStore, LoginCredentials } from "@/types";

const initialState: AuthState = {
	user: null,
	email: null,
	passwordResetToken: null,
	isAuthenticated: false,
	isLoading: false,
	isInitialized: false,
	requiresVerification: false,
	requiresNewPassword: false,
	error: null,
};

export const useAuthStore = create<AuthStore>()(
	persist(
		(set) => ({
			...initialState,

			checkAuth: async (): Promise<void> => {
				const email = sessionStorage.getItem("prototype-user-email");
				const role = sessionStorage.getItem("prototype-user-role") ?? "SuperAdmin";
				if (email) {
					set({
						user: { userId: "proto-user-1", username: email },
						email,
						isAuthenticated: true,
						isInitialized: true,
						error: null,
					});
					sessionStorage.setItem("prototype-user-role", role);
					return;
				}
				set({ isInitialized: true, isAuthenticated: false });
			},

			login: async (
				credentials: LoginCredentials,
			): Promise<"success" | "verification" | "newPassword" | "error"> => {
				set({ isLoading: true, error: null, email: credentials.email });
				if (!credentials.email || !credentials.password) {
					set({ isLoading: false, error: AUTH_ERROR_MESSAGES.invalidCredentials });
					toast.error(AUTH_ERROR_MESSAGES.invalidCredentials);
					return "error";
				}
				if (credentials.password === "verify123") {
					set({
						isLoading: false,
						requiresVerification: true,
						requiresNewPassword: false,
						error: null,
					});
					return "verification";
				}
				if (credentials.password === "newpass123") {
					set({
						isLoading: false,
						requiresNewPassword: true,
						requiresVerification: false,
						error: null,
					});
					return "newPassword";
				}
				sessionStorage.setItem("prototype-user-email", credentials.email);
				sessionStorage.setItem("prototype-user-role", "SuperAdmin");
				set({
					user: { userId: "proto-user-1", username: credentials.email },
					email: credentials.email,
					isAuthenticated: true,
					isLoading: false,
					requiresVerification: false,
					requiresNewPassword: false,
					error: null,
				});
				toast.success(AUTH_TOAST_MESSAGES.loginSuccess);
				return "success";
			},

			completeNewPasswordChallenge: async (
				newPassword: string,
			): Promise<boolean> => {
				set({ isLoading: true, error: null });
				if (!newPassword.trim()) {
					set({ isLoading: false, error: AUTH_TOAST_MESSAGES.loginError });
					toast.error(AUTH_TOAST_MESSAGES.loginError);
					return false;
				}
				const email = sessionStorage.getItem("prototype-user-email") ?? "demo@bsp.com";
				set({
					user: { userId: "proto-user-1", username: email },
					email,
					isAuthenticated: true,
					isLoading: false,
					requiresNewPassword: false,
					requiresVerification: false,
					error: null,
				});
				toast.success(AUTH_TOAST_MESSAGES.loginSuccess);
				return true;
			},

			cancelNewPasswordChallenge: async (): Promise<void> => {
				set({
					requiresNewPassword: false,
					isLoading: false,
					error: null,
				});
			},

			confirmSignIn: async (code: string): Promise<boolean> => {
				set({ isLoading: true, error: null });
				if (code.length < 4) {
					set({
						isLoading: false,
						error: AUTH_ERROR_MESSAGES.invalidVerificationCode,
					});
					toast.error(AUTH_ERROR_MESSAGES.invalidVerificationCode);
					return false;
				}
				const email = sessionStorage.getItem("prototype-user-email") ?? "demo@bsp.com";
				set({
					user: { userId: "proto-user-1", username: email },
					email,
					isAuthenticated: true,
					isLoading: false,
					requiresVerification: false,
					requiresNewPassword: false,
					error: null,
				});
				toast.success(AUTH_TOAST_MESSAGES.verificationSuccess);
				return true;
			},

			requestPasswordReset: async (email: string): Promise<boolean> => {
				set({ isLoading: true, error: null, email });

				const response = await authApi.requestPasswordReset({ email });

				if (isApiError(response)) {
					set({ isLoading: false, error: response.message });
					toast.error(response.message);
					return false;
				}

				set({ isLoading: false, error: null });
				toast.success(response.data.message);
				return true;
			},

			validatePasswordReset: async (
				email: string,
				token: string,
			): Promise<boolean> => {
				set({ isLoading: true, error: null, email });

				const response = await authApi.validatePasswordReset({ email, token });

				if (isApiError(response)) {
					set({ isLoading: false, error: response.message });
					toast.error(response.message);
					return false;
				}

				set({ isLoading: false, error: null, passwordResetToken: token });
				toast.success(response.data.message);
				return true;
			},

			resendPasswordReset: async (email: string): Promise<boolean> => {
				set({ isLoading: true, error: null, email });

				const response = await authApi.resendPasswordReset({ email });

				if (isApiError(response)) {
					set({ isLoading: false, error: response.message });
					toast.error(response.message);
					return false;
				}

				set({ isLoading: false, error: null });
				toast.success(response.data.message);
				return true;
			},

			confirmPasswordReset: async (
				email: string,
				token: string,
				newPassword: string,
			): Promise<boolean> => {
				set({ isLoading: true, error: null });

				const response = await authApi.confirmPasswordReset({
					email,
					token,
					newPassword,
				});

				if (isApiError(response)) {
					set({ isLoading: false, error: response.message });
					toast.error(response.message);
					const codeExpired = response.message
						.toLowerCase()
						.includes("expired");
					if (codeExpired) {
						// Delay redirect so the toast is visible before navigation
						setTimeout(() => {
							window.location.replace(ROUTES.auth.forgotPassword);
						}, 3000);
					}
					return false;
				}

				// Clear email and token after successful password reset
				set({
					isLoading: false,
					error: null,
					email: null,
					passwordResetToken: null,
				});
				toast.success(response.data.message);
				return true;
			},

			logout: async (): Promise<void> => {
				set({ isLoading: true });
				sessionStorage.removeItem("prototype-user-email");
				sessionStorage.removeItem("prototype-user-role");
				set({ ...initialState, isInitialized: true });
			},

			clearError: () => {
				set({ error: null });
			},

			reset: () => {
				set({ ...initialState });
			},
		}),
		{
			name: "auth-storage",
			storage: {
				getItem: (name) => {
					const value = sessionStorage.getItem(name);
					return value ? JSON.parse(value) : null;
				},
				setItem: (name, value) => {
					sessionStorage.setItem(name, JSON.stringify(value));
				},
				removeItem: (name) => {
					sessionStorage.removeItem(name);
				},
			},
			partialize: (state) =>
				({
					email: state.email,
					passwordResetToken: state.passwordResetToken,
				}) as AuthStore,
		},
	),
);
