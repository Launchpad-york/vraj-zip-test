import { BSPLogo, ThemeToggle } from "@/components";
import { APP_CONFIG, AUTH_CARD_MAX_WIDTH, FOOTER_CONTENT } from "@/const";
import type { AuthLayoutProps } from "@/types";

export function AuthLayout({ children }: AuthLayoutProps) {
	const versionText = `${FOOTER_CONTENT.versionPrefix} ${APP_CONFIG.version}`;

	return (
		<div className="relative flex min-h-screen flex-col bg-card">
			{/* Header with theme toggle */}
			<header className="absolute right-4 top-4 z-10 md:right-6 md:top-6">
				<ThemeToggle className="text-icon-secondary hover:text-icon-primary" />
			</header>

			{/* Main content area - centered vertically and horizontally */}
			<main className="flex flex-1 flex-col items-center justify-center px-4 py-16 md:px-6 md:py-20">
				{/* Logo */}
				<div className="mb-8 md:mb-10">
					<BSPLogo />
				</div>

				{/* Auth card container */}
				<div className="w-full" style={{ maxWidth: AUTH_CARD_MAX_WIDTH }}>
					{children}
				</div>

				{/* Footer - below card with same width */}
				<footer
					className="mt-8 flex w-full items-center justify-between text-small text-text-secondary"
					style={{ maxWidth: AUTH_CARD_MAX_WIDTH }}
				>
					<span className="text-muted-foreground font-normal cursor-pointer">
						{versionText}
					</span>
					<div className="flex items-center gap-2 text-small">
						<span className="text-muted-foreground font-normal cursor-pointer text-small">
							{FOOTER_CONTENT.privacyPolicy}
						</span>
						<span className="text-muted-foreground text-small">
							{FOOTER_CONTENT.separator}
						</span>
						<span className="text-muted-foreground font-normal cursor-pointer text-small">
							{FOOTER_CONTENT.termsOfUse}
						</span>
					</div>
				</footer>
			</main>
		</div>
	);
}
