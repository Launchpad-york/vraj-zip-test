import { APP_CONFIG } from "@/const";
import { useTheme } from "@/hooks";

type BSPLogoProps = {
	className?: string;
	variant?: "auth" | "app";
};

const logoConfig = {
	auth: {
		height: 50,
	},
	app: {
		height: 35,
	},
};

export function BSPLogo({ className, variant = "auth" }: BSPLogoProps) {
	const { theme } = useTheme();
	const config = logoConfig[variant];
	const assetBase = import.meta.env.BASE_URL ?? "/";

	const logoSrc =
		theme === "dark" ? `${assetBase}BSPDark.svg` : `${assetBase}BSP.svg`;

	return (
		<div className={`flex items-center shrink-0 ${className ?? ""}`}>
			<img
				src={logoSrc}
				alt={APP_CONFIG.name}
				style={{ height: config.height }}
				className="w-auto"
			/>
		</div>
	);
}
