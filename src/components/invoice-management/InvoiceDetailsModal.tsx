import { Download, Loader2, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { downloadInvoicePdfBlob, fetchInvoicePdfBlob } from "@/api/finance.api";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { INVOICE_DETAILS_MODAL } from "@/const";
import { cn } from "@/lib/utils";
import type { InvoiceManagementRow } from "@/types";

type InvoiceDetailsModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	invoice: InvoiceManagementRow | null;
	onSend: () => void | Promise<void>;
	sendPending?: boolean;
};

export function InvoiceDetailsModal({
	open,
	onOpenChange,
	invoice,
	onSend,
	sendPending,
}: InvoiceDetailsModalProps) {
	const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
	const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
	const [pdfLoading, setPdfLoading] = useState(false);
	const [pdfError, setPdfError] = useState<string | null>(null);
	const previewUrlRef = useRef<string | null>(null);

	const revokePreviewUrl = useCallback(() => {
		if (previewUrlRef.current) {
			URL.revokeObjectURL(previewUrlRef.current);
			previewUrlRef.current = null;
		}
		setPdfPreviewUrl(null);
	}, []);

	useEffect(() => {
		if (!open) {
			revokePreviewUrl();
			setPdfBlob(null);
			setPdfError(null);
			setPdfLoading(false);
			return;
		}
		if (!invoice?.id) {
			return;
		}

		let cancelled = false;

		(async () => {
			revokePreviewUrl();
			setPdfBlob(null);
			setPdfError(null);
			setPdfLoading(true);

			const res = await fetchInvoicePdfBlob(invoice.id);
			if (cancelled) return;

			if (!res.ok) {
				setPdfLoading(false);
				setPdfError(res.message);
				return;
			}

			const url = URL.createObjectURL(res.blob);
			previewUrlRef.current = url;
			setPdfPreviewUrl(url);
			setPdfBlob(res.blob);
			setPdfLoading(false);
		})();

		return () => {
			cancelled = true;
		};
	}, [open, invoice?.id, revokePreviewUrl]);

	useEffect(() => {
		return () => revokePreviewUrl();
	}, [revokePreviewUrl]);

	const handleOpenChange = (next: boolean) => {
		if (!next) {
			revokePreviewUrl();
			setPdfBlob(null);
			setPdfError(null);
			setPdfLoading(false);
		}
		onOpenChange(next);
	};

	const handleDownloadClick = () => {
		if (!invoice || !pdfBlob) return;
		downloadInvoicePdfBlob(pdfBlob, invoice.displayId);
	};

	const previewFrameClass =
		"box-border flex w-[672px] max-w-full flex-col gap-0 overflow-hidden rounded-xl border border-border bg-background p-0 " +
		"h-[783px] max-h-[min(783px,calc(100vh-14rem))]";

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent
				className="flex max-h-[min(95vh,980px)] w-[min(100vw-2rem,720px)] max-w-[min(100vw-2rem,720px)] flex-col gap-0 p-0 sm:max-w-[min(100vw-2rem,720px)]"
				showCloseButton
			>
				<div className="border-b border-border px-6 pt-6 pb-4">
					<DialogHeader className="gap-1">
						<DialogTitle>{INVOICE_DETAILS_MODAL.title}</DialogTitle>
						<DialogDescription>
							{INVOICE_DETAILS_MODAL.description}
						</DialogDescription>
					</DialogHeader>
				</div>
				<div className="flex min-h-0 flex-1 justify-center overflow-auto bg-muted/30 p-0">
					{pdfLoading ? (
						<div
							className={cn(previewFrameClass, "items-center justify-center")}
							role="status"
							aria-live="polite"
						>
							<Loader2
								className="size-8 animate-spin text-muted-foreground"
								aria-hidden
							/>
							<p className="mt-2 text-small text-muted-foreground">
								Loading PDF…
							</p>
						</div>
					) : pdfError ? (
						<div
							className={cn(
								previewFrameClass,
								"items-center justify-center text-center",
							)}
						>
							<p className="text-small text-destructive px-4">{pdfError}</p>
						</div>
					) : pdfPreviewUrl ? (
						<div className={previewFrameClass}>
							<iframe
								title={INVOICE_DETAILS_MODAL.title}
								src={pdfPreviewUrl}
								className="h-full w-full flex-1 border-0 bg-background p-0"
							/>
						</div>
					) : (
						<div
							className={cn(
								previewFrameClass,
								"items-center justify-center text-center",
							)}
						>
							<p className="text-small text-muted-foreground px-4">
								{INVOICE_DETAILS_MODAL.noPdf}
							</p>
						</div>
					)}
				</div>
				<DialogFooter className="border-t border-border px-6 py-4 sm:justify-end">
					<Button
						type="button"
						variant="outline"
						onClick={() => handleOpenChange(false)}
					>
						{INVOICE_DETAILS_MODAL.cancel}
					</Button>
					<Button
						type="button"
						variant="secondary"
						disabled={sendPending}
						onClick={() => void onSend()}
						className="gap-1.5"
					>
						<Send className="size-4" aria-hidden />
						{INVOICE_DETAILS_MODAL.sendInvoice}
					</Button>
					<Button
						type="button"
						variant="default"
						disabled={!pdfBlob}
						onClick={handleDownloadClick}
						className="gap-1.5"
					>
						<Download className="size-4" aria-hidden />
						{INVOICE_DETAILS_MODAL.downloadInvoice}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
