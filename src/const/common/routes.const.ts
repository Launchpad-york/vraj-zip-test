import type { AppRoutes } from "@/types";
//Temp Demo Changes in chatbot
export const ROUTES: AppRoutes = {
	auth: {
		login: "/login",
		forgotPassword: "/forgot-password",
	},
	dashboard: {
		root: "/dashboard",
	},
	corporateDirectory: {
		root: "/corporation-directory",
		view: "/corporation-directory/:corporationId",
		viewWithIdPath: (corporationId: string) =>
			`/corporation-directory/${corporationId}`,
		chooseSetup: "/corporation-directory/choose-setup",
		add: "/corporation-directory/add",
		addWithId: "/corporation-directory/add/:corporationId",
		addWithIdPath: (corporationId: string) =>
			`/corporation-directory/add/${corporationId}`,
		addAdvanced: "/corporation-directory/add-advanced",
		addAdvancedWithId: "/corporation-directory/add-advanced/:corporationId",
		addAdvancedWithIdPath: (corporationId: string) =>
			`/corporation-directory/add-advanced/${corporationId}`,
	},
	companyDirectory: {
		root: "/company-directory",
		view: "/company-directory/:companyId",
		viewWithIdPath: (companyId: string) => `/company-directory/${companyId}`,
		add: "/company-directory/add",
		addWithId: "/company-directory/add/:companyId",
		addWithIdPath: (companyId: string) => `/company-directory/add/${companyId}`,
	},
	chatbot: {
		root: "/chat",
	},
	roles: {
		root: "/roles",
		add: "/roles/add",
		edit: "/roles/edit/:roleId",
		editWithIdPath: (roleId: string) => `/roles/edit/${roleId}`,
	},
	finance: {
		invoices: "/finance/invoices",
	},
	userDirectory: {
		root: "/user-directory",
	},
} as const;
