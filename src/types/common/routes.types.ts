import type { ReactNode } from "react";

export interface RouteConfig {
	path: string;
	element: ReactNode;
	children?: RouteConfig[];
}

export interface AuthRoutes {
	login: string;
	forgotPassword: string;
	register?: string;
}

export interface DashboardRoutes {
	root: string;
}

export interface CorporateDirectoryRoutes {
	root: string;
	view: string;
	viewWithIdPath: (corporationId: string) => string;
	chooseSetup: string;
	add: string;
	addWithId: string;
	addWithIdPath: (corporationId: string) => string;
	addAdvanced: string;
	addAdvancedWithId: string;
	addAdvancedWithIdPath: (corporationId: string) => string;
}
//Temp Demo Changes
export interface ChatbotRoutes {
	root: string;
}

export interface RolesRoutes {
	root: string;
	add: string;
	edit: string;
	editWithIdPath: (roleId: string) => string;
}

export interface FinanceRoutes {
	invoices: string;
}

export interface CompanyDirectoryRoutes {
	root: string;
	view: string;
	viewWithIdPath: (companyId: string) => string;
	add: string;
	addWithId: string;
	addWithIdPath: (companyId: string) => string;
}

export interface UserDirectoryRoutes {
	root: string;
}

export interface AppRoutes {
	auth: AuthRoutes;
	dashboard: DashboardRoutes;
	corporateDirectory: CorporateDirectoryRoutes;
	companyDirectory: CompanyDirectoryRoutes;
	chatbot: ChatbotRoutes;
	roles: RolesRoutes;
	finance: FinanceRoutes;
	userDirectory: UserDirectoryRoutes;
}
