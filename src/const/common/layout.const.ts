import {
	Building2,
	LayoutDashboard,
	MapPin,
	Receipt,
	Shield,
	Users,
} from "lucide-react";
import type { SidebarMenuSection } from "@/types";

export const SIDEBAR_MENU: SidebarMenuSection[] = [
	{
		title: "Main",
		items: [
			{
				id: "dashboard",
				label: "Dashboard",
				icon: LayoutDashboard,
				path: "/dashboard",
			},
		],
	},
	{
		title: "Administration",
		items: [
			{
				id: "corporate-directory",
				label: "Corporation Directory",
				icon: Building2,
				path: "/corporation-directory",
				superAdminOnly: true,
			},
			{
				id: "company-directory",
				label: "Company Directory",
				icon: MapPin,
				path: "/company-directory",
				superAdminOnly: true,
			},
		],
	},
	{
		title: "Finance",
		items: [
			{
				id: "invoice-management",
				label: "Invoice Management",
				icon: Receipt,
				path: "/finance/invoices",
				superAdminOnly: true,
			},
		],
	},
	{
		title: "Users & Access",
		items: [
			{
				id: "user-directory",
				label: "User Directory",
				icon: Users,
				path: "/user-directory",
				superAdminOnly: true,
			},
			{
				id: "roles-permissions",
				label: "Roles & Permissions",
				icon: Shield,
				path: "/roles",
				superAdminOnly: true,
			},
		],
	},
] as const;

export const HEADER_CONTENT = {
	notifications: "Notifications",
	profile: "Profile",
	settings: "Settings",
	signOut: "Sign Out",
	themeLight: "Light",
	themeDark: "Dark",
	themeLabel: "Theme",
} as const;

export const USER_DROPDOWN_LABELS = {
	myAccount: "My Account",
	theme: "Theme",
	lightMode: "Light",
	darkMode: "Dark",
	signOut: "Sign Out",
} as const;
