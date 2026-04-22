import * as yup from "yup";
import { INVOICE_BULK_SEND_MODAL } from "@/const";

const emailMsg = INVOICE_BULK_SEND_MODAL.invalidEmail;

/**
 * Stricter than Yup's default `.email()`: requires a subdomain with a dot (rejects `A@a`, `user@localhost`).
 * Aligns with common deliverable-address rules (domain + TLD).
 */
export const INVOICE_RECIPIENT_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Splits the recipients input by comma, semicolon, or whitespace (same as the modal). */
export function splitEmailInput(raw: string): string[] {
	return raw
		.split(/[,;\s]+/)
		.map((s) => s.trim())
		.filter(Boolean);
}

export function isValidInvoiceRecipientEmail(value: string): boolean {
	const v = value.trim();
	if (v.length === 0) {
		return false;
	}
	return INVOICE_RECIPIENT_EMAIL_REGEX.test(v);
}

export function validateEmailParts(parts: string[]): boolean {
	return parts.every((p) => isValidInvoiceRecipientEmail(p));
}

export const bulkSendInvoiceFormSchema = yup.object({
	draftEmail: yup
		.string()
		.default("")
		.test("draft-emails", emailMsg, (value) => {
			const parts = splitEmailInput(value ?? "");
			if (parts.length === 0) {
				return true;
			}
			return validateEmailParts(parts);
		}),
	recipients: yup
		.array()
		.of(
			yup
				.string()
				.required(emailMsg)
				.test("invoice-email", emailMsg, (v) =>
					v != null && v !== "" ? isValidInvoiceRecipientEmail(v) : false,
				),
		)
		.max(20)
		.default([]),
});

export type BulkSendInvoiceFormValues = yup.InferType<
	typeof bulkSendInvoiceFormSchema
>;
