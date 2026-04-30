import { Bell, ChevronRight, LogOut, Menu, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { HEADER_CONTENT, ICON_SIZES, USER_DROPDOWN_LABELS } from "@/const";
import { useTheme } from "@/hooks";
import { useAuthStore } from "@/store";
import type { BreadcrumbItem } from "@/types";

type HeaderProps = {
	breadcrumbs?: BreadcrumbItem[];
};

export function Header({ breadcrumbs = [] }: HeaderProps) {
	const { theme, toggleTheme } = useTheme();
	const { logout, email } = useAuthStore();
	const { toggleSidebar } = useSidebar();

	const handleSignOut = async () => {
		await logout();
	};

	const userInitials = email ? email.substring(0, 2).toUpperCase() : "U";

	return (
		<header className="z-10 flex h-15 min-w-0 shrink-0 items-center justify-between border-b border-border bg-background px-4">
			<div className="flex min-w-0 flex-1 items-center gap-2 md:flex-initial">
				{/* Mobile Menu Toggle */}
				<Button
					variant="ghost"
					size="icon"
					onClick={toggleSidebar}
					className="md:hidden h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
					aria-label="Toggle menu"
				>
					<Menu className="h-5 w-5" />
				</Button>

				{/* Breadcrumb */}
				<nav aria-label="Breadcrumb" className="min-w-0 flex-1">
					<ol className="flex min-w-0 items-center gap-2 truncate">
						{breadcrumbs.map((item, index) => (
							<li
								key={item.label}
								className="flex min-w-0 shrink-0 items-center gap-2"
							>
								{index > 0 && (
									<ChevronRight className="h-4 w-4 shrink-0 text-text-secondary" />
								)}
								{item.path && index < breadcrumbs.length - 1 ? (
									<Link
										to={item.path}
										className="truncate text-sm text-text-secondary hover:text-text-foreground transition-colors"
									>
										{item.label}
									</Link>
								) : (
									<span className="truncate text-sm font-medium text-text-foreground capitalize">
										{item.label}
									</span>
								)}
							</li>
						))}
					</ol>
				</nav>
			</div>

			{/* Right Section */}
			<div className="flex shrink-0 items-center gap-2">
				{/* Theme Toggle */}
				<Button
					variant="ghost"
					size="icon"
					onClick={toggleTheme}
					className="text-icon-secondary hover:text-icon-primary"
					aria-label={
						theme === "light"
							? HEADER_CONTENT.themeDark
							: HEADER_CONTENT.themeLight
					}
				>
					{theme === "light" ? (
						<Moon size={ICON_SIZES.default} />
					) : (
						<Sun size={ICON_SIZES.default} />
					)}
				</Button>

				{/* Notifications */}
				<Button
					variant="ghost"
					size="icon"
					className="text-icon-secondary hover:text-icon-primary"
					aria-label={HEADER_CONTENT.notifications}
				>
					<Bell size={ICON_SIZES.default} />
				</Button>

				{/* User Dropdown */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="rounded-full"
							aria-label={USER_DROPDOWN_LABELS.myAccount}
						>
							<Avatar className="h-7 w-7">
								<AvatarImage src="" alt="User avatar" />
								<AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
									{userInitials}
								</AvatarFallback>
							</Avatar>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56">
						<DropdownMenuLabel className="font-normal">
							<div className="flex flex-col space-y-1">
								<p className="text-sm font-medium">
									{USER_DROPDOWN_LABELS.myAccount}
								</p>
								{email && (
									<p className="text-xs text-muted-foreground truncate">
										{email}
									</p>
								)}
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem onClick={toggleTheme}>
								{theme === "light" ? (
									<Moon className="mr-2 h-4 w-4" />
								) : (
									<Sun className="mr-2 h-4 w-4" />
								)}
								<span>
									{theme === "light"
										? USER_DROPDOWN_LABELS.darkMode
										: USER_DROPDOWN_LABELS.lightMode}
								</span>
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleSignOut} variant="destructive">
							<LogOut className="mr-2 h-4 w-4" />
							<span>{USER_DROPDOWN_LABELS.signOut}</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}
