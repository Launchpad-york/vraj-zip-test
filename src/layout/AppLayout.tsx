import { ChatButton, Header, Sidebar } from "@/components";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ROUTES } from "@/const";
import type { AppLayoutProps, BreadcrumbItem } from "@/types";

type AppLayoutWithBreadcrumbProps = AppLayoutProps & {
	breadcrumbs?: BreadcrumbItem[];
};

export function AppLayout({
	children,
	breadcrumbs = [],
}: AppLayoutWithBreadcrumbProps) {
	return (
		<SidebarProvider>
			<Sidebar />
			<SidebarInset className="bg-content-bg flex h-svh min-h-0 flex-1 flex-col overflow-hidden">
				<Header breadcrumbs={breadcrumbs} />
				<div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-4">
					{children}
				</div>
				{window.location.pathname !== ROUTES.chatbot.root && <ChatButton />}
			</SidebarInset>
		</SidebarProvider>
	);
}
