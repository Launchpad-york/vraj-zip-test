import { cva, type VariantProps } from "class-variance-authority";
import { Info } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

const bannerVariants = cva("flex w-full flex-col gap-0.5 rounded-lg p-4", {
	variants: {
		variant: {
			default: "bg-info-bg",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

export interface BannerProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
		VariantProps<typeof bannerVariants> {
	title: React.ReactNode;
	icon?: React.ReactNode;
}

function Banner({
	className,
	variant = "default",
	title,
	icon,
	children,
	...props
}: BannerProps) {
	const iconNode =
		icon ??
		(variant === "default" ? (
			<Info className="size-4 shrink-0 text-icon-info" aria-hidden />
		) : null);

	return (
		<div
			role="status"
			aria-live="polite"
			className={cn(bannerVariants({ variant }), className)}
			{...props}
		>
			<div className="flex items-center gap-3">
				{iconNode}
				<p className="text-sm font-semibold text-text-foreground">{title}</p>
			</div>
			{children ? (
				<p className="pl-7 text-sm font-normal text-muted-foreground">
					{children}
				</p>
			) : null}
		</div>
	);
}

export { Banner, bannerVariants };
