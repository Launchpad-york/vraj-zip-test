import { PanelLeft } from "lucide-react";
import { NavLink } from "react-router-dom";
import { BSPLogo } from "@/components/BSPLogo";
import { Button } from "@/components/ui/button";
import {
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	Sidebar as SidebarRoot,
	useSidebar,
} from "@/components/ui/sidebar";
import { SIDEBAR_MENU } from "@/const";
import { useIsSuperAdmin } from "@/hooks/useIsSuperAdmin";

function SidebarToggle() {
	const { toggleSidebar } = useSidebar();

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggleSidebar}
			className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
		>
			<PanelLeft className="h-4 w-4" />
			<span className="sr-only">Toggle Sidebar</span>
		</Button>
	);
}

export function Sidebar() {
	const { isSuperAdmin } = useIsSuperAdmin();

	return (
		<SidebarRoot collapsible="icon" className="border-r border-border">
			{/* Logo Section */}
			<SidebarHeader className="flex-row items-center gap-2 border-b border-border h-15 px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
				<BSPLogo
					variant="app"
					className="group-data-[collapsible=icon]:hidden"
				/>
				<div className="flex-1" />
				<SidebarToggle />
			</SidebarHeader>

			{/* Navigation */}
			<SidebarContent className="px-2 py-2 group-data-[collapsible=icon]:px-0">
				{SIDEBAR_MENU.map((section) => {
					const visibleItems = section.items.filter(
						(item) =>
							!("superAdminOnly" in item && item.superAdminOnly) ||
							isSuperAdmin,
					);
					if (visibleItems.length === 0) return null;
					return (
						<SidebarGroup key={section.title} className="py-1">
							<SidebarGroupLabel className="text-muted-foreground text-xs font-semibold tracking-wider px-1 mb-1 group-data-[collapsible=icon]:hidden">
								{section.title}
							</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									{visibleItems.map((item) => {
										const Icon = item.icon;
										return (
											<SidebarMenuItem key={item.id}>
												<NavLink to={item.path}>
													{({ isActive }) => (
														<SidebarMenuButton
															isActive={isActive}
															tooltip={item.label}
															className="text-sidebar-foreground cursor-pointer"
														>
															<Icon className="h-4 w-4 shrink-0" />
															<span className="group-data-[collapsible=icon]:hidden">
																{item.label}
															</span>
														</SidebarMenuButton>
													)}
												</NavLink>
											</SidebarMenuItem>
										);
									})}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					);
				})}
			</SidebarContent>
		</SidebarRoot>
	);
}
