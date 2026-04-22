import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type SidebarMenuItem = {
	id: string;
	label: string;
	icon: LucideIcon;
	path: string;
	badge?: string | number;
	/** When true, the item is shown only to Cognito `SuperAdmin` users. */
	superAdminOnly?: boolean;
};

export type SidebarMenuSection = {
	title: string;
	items: readonly SidebarMenuItem[];
};

export type AppLayoutProps = {
	children: ReactNode;
};

export type BreadcrumbItem = {
	label: string;
	path?: string;
};

export type HeaderProps = {
	breadcrumbs?: BreadcrumbItem[];
};
