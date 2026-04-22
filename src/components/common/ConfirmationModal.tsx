import { Loader2 } from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type ConfirmationModalVariant = "destructive" | "default";

type ConfirmationModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: React.ReactNode;
	description: React.ReactNode;
	/** Icon shown in the header media area (e.g. Building2, RotateCcw) */
	icon: React.ReactNode;
	confirmLabel: React.ReactNode;
	cancelLabel: React.ReactNode;
	onConfirm: () => void | Promise<void>;
	/** When true, confirm button shows spinner and both buttons are disabled */
	isConfirming?: boolean;
	/** Styling for the confirm button */
	variant?: ConfirmationModalVariant;
	/** Optional icon to show inside the confirm button (e.g. Trash2). Hidden when isConfirming. */
	confirmIcon?: React.ReactNode;
	/** Optional class for the content wrapper */
	contentClassName?: string;
};

/**
 * Reusable confirmation dialog with icon, title, description, and confirm/cancel actions.
 * Use for delete, reinstate, or other single-step confirmations.
 */
export function ConfirmationModal({
	open,
	onOpenChange,
	title,
	description,
	icon,
	confirmLabel,
	cancelLabel,
	onConfirm,
	isConfirming = false,
	variant = "default",
	confirmIcon,
	contentClassName,
}: ConfirmationModalProps) {
	const handleConfirm = () => {
		void onConfirm();
	};

	const handleCancel = () => {
		if (!isConfirming) onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton={false}
				className={cn(
					"flex max-w-96 flex-col gap-0 p-0 w-full",
					contentClassName,
				)}
			>
				<div className="flex flex-col items-center justify-center gap-6 p-8">
					<div className="flex w-full max-w-full flex-col items-center justify-center gap-6 text-center">
						<div
							className={cn(
								"flex size-20 shrink-0 items-center justify-center rounded-2xl",
								variant === "destructive" ? "bg-destructive/10" : "bg-info-bg",
							)}
							aria-hidden
						>
							{icon}
						</div>
						<div className="flex max-w-96 flex-col items-center gap-1.5 text-center">
							<DialogTitle className="text-xl font-semibold leading-6 text-text-foreground">
								{title}
							</DialogTitle>
							<DialogDescription className="text-sm leading-[21px] text-muted-foreground">
								{description}
							</DialogDescription>
						</div>
					</div>
				</div>
				<div className="flex w-full flex-col gap-2 border-t border-border px-6 py-5">
					<Button
						type="button"
						variant={variant === "destructive" ? "destructive" : "default"}
						className={
							variant === "destructive"
								? "w-full bg-interactive-error text-light-same hover:bg-interactive-error/90"
								: "w-full"
						}
						disabled={isConfirming}
						onClick={handleConfirm}
					>
						{isConfirming ? (
							<Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
						) : (
							<>
								{confirmIcon}
								{confirmLabel}
							</>
						)}
					</Button>
					<Button
						type="button"
						variant="outline"
						className="w-full"
						disabled={isConfirming}
						onClick={handleCancel}
					>
						{cancelLabel}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
