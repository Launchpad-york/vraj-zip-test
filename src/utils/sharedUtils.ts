import * as yup from "yup";
import {
	CORPORATION_VALIDATION_MESSAGES,
	PASSWORD_REQUIREMENTS,
} from "@/const";
import type { PasswordStrengthLevel } from "@/types";

const DEFAULT_MAX_LENGTH = 100;

/**
 * Reusable required string schema: trims input, requires presence, rejects empty/whitespace,
 * and enforces max length. Use for any required text field to get consistent messages.
 * @param fieldName - Used in validation messages.
 * @param maxLength - Max allowed length (default 100).
 */
export const requiredString = (
	fieldName: string,
	maxLength: number = DEFAULT_MAX_LENGTH,
) =>
	yup
		.string()
		.transform((value) => (typeof value === "string" ? value.trim() : value))
		.required(`${fieldName} is required`)
		.max(maxLength, `Maximum ${maxLength} characters are allowed`)
		.test("not-empty", `${fieldName} is required`, (value) => {
			return value != null && (value as string).trim() !== "";
		});

/**
 * Format code for display with a prefix and 3-digit pad (e.g. CORP-001, COMP-012).
 * @param value - Numeric or string code (e.g. 1 → CORP-001, 12 → COMP-012).
 * @param prefix - Prefix (e.g. "CORP", "COMP").
 */
export function formatCode(value: string | number, prefix: string): string {
	return `${prefix}-${String(value).padStart(3, "0")}`;
}

/**
 * Joins first and last name into a single trimmed string.
 * @returns Non-empty string if either part is present, otherwise "".
 */
export function formatFullName(
	firstName?: string | null,
	lastName?: string | null,
): string {
	return [firstName, lastName].filter(Boolean).join(" ").trim();
}

/**
 * Format address parts into a single line (e.g. for Corporation or Company address display).
 * @param addr - Object with optional addressLine, state, city, country, zip
 * @returns Comma-separated address or "—" if empty
 */
export function formatAddress(
	addr:
		| {
				addressLine?: string | null;
				state?: string | null;
				city?: string | null;
				country?: string | null;
				zip?: string | null;
		  }
		| null
		| undefined,
): string {
	if (!addr) return "—";
	const parts = [
		addr.addressLine,
		addr.state,
		addr.city,
		addr.country,
		addr.zip,
	].filter(Boolean);
	return parts.length ? parts.join(", ") : "—";
}

/**
 * Plan tier label from pricing API (`employeeRangeMin` / `employeeRangeMax`):
 * e.g. Plan Level dropdown, company cards.
 * @returns "X-Y employees", "X+ employees", or "Custom" when both bounds are null.
 */
export function formatPlanEmployeeRange(
	min: number | null | undefined,
	max: number | null | undefined,
): string {
	if (min != null && max != null) return `${min}-${max} employees`;
	if (min != null) return `${min}+ employees`;
	return "Custom";
}

/**
 * USD amount for display (`en-US`, 0–2 fraction digits, comma grouping).
 * @param amount - Coerced with `Number`; non-finite values return "".
 */
export function formatCurrencyAmount(
	amount: number | string | null | undefined,
): string {
	const n = Number(amount);
	if (!Number.isFinite(n)) {
		return "";
	}
	return n.toLocaleString("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

/**
 * Rounds a monetary amount to 2 decimal.
 */
export function roundCurrencyToTwoDecimals(value: number): number {
	if (!Number.isFinite(value)) return 0;
	return Math.round(value * 100) / 100;
}

/**
 * Formats Stripe-style minor units (e.g. cents) with an ISO currency code.
 */
export function formatMoneyFromMinorUnits(
	amountMinor: number,
	currencyCode: string,
): string {
	try {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currencyCode.toUpperCase(),
		}).format(amountMinor / 100);
	} catch {
		return `${(amountMinor / 100).toFixed(2)} ${currencyCode}`;
	}
}

/**
 * Formats seconds into MM:SS format
 * @param seconds - The number of seconds to format
 * @returns Formatted time string (e.g., "02:45")
 */
export function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins.toString().padStart(2, "0")}:${secs
		.toString()
		.padStart(2, "0")}`;
}

/**
 * Masks an email address for privacy display
 * Dynamically calculates visible characters based on email length:
 * - 1-3 chars: show 1 char (e.g., "ab@..." -> "a***@...")
 * - 4-6 chars: show 2 chars (e.g., "abcdef@..." -> "ab***@...")
 * - 7+ chars: show 3 chars (e.g., "abcdefgh@..." -> "abc***@...")
 *
 * @param email - The email address to mask
 * @returns Masked email string
 */
export function maskEmail(email: string): string {
	if (!email || !email.includes("@")) {
		return email;
	}

	const [localPart, domain] = email.split("@");
	const length = localPart.length;

	// Calculate visible characters based on local part length
	let visibleChars: number;
	if (length <= 3) {
		visibleChars = 1;
	} else if (length <= 6) {
		visibleChars = 2;
	} else {
		visibleChars = 3;
	}

	const visiblePart = localPart.slice(0, visibleChars);
	return `${visiblePart}***@${domain}`;
}

const EMAIL_REGEX = /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/;

/**
 * Validates an email string. Trims before validation. Returns an error message or empty string if valid.
 * Use with Yup's .test() or directly for custom validation.
 */
export function validateEmail(email: string): string {
	const trimmed = typeof email === "string" ? email.trim() : "";
	if (!trimmed) return "Email is required.";
	if (!EMAIL_REGEX.test(trimmed)) return "Invalid email address.";
	return "";
}

/**
 * Password strength for the new-password UI meter (length, mixed case, symbol or number).
 * Matches PASSWORD_REQUIREMENTS and set-password / Cognito challenge flows.
 */
export function calculatePasswordStrength(
	password: string,
): PasswordStrengthLevel {
	if (!password) return "none";

	let score = 0;
	if (password.length >= PASSWORD_REQUIREMENTS.minLength) score++;
	if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
	if (/[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;
	if (score === 0) return "poor";
	if (score === 1) return "poor";
	if (score === 2) return "average";
	return "strong";
}

/**
 * Required string + email format using validateEmail (used in Yup schemas).
 * Empty/whitespace is handled by requiredString; this test only fails when there is
 * content that fails the email regex, so "Invalid email address." is shown (not "Email is required.").
 */
export const requiredEmail = (fieldName: string) =>
	requiredString(fieldName).test("email", "Invalid email address.", (value) => {
		const trimmed = (value ?? "").toString().trim();
		if (!trimmed) return true; // let requiredString handle empty
		return EMAIL_REGEX.test(trimmed);
	});

/**
 * Zip code format: 5 digits (required), optional dash + 4 digits (ZIP+4).
 * Examples: 45150 or 45150-2193
 */
const ZIP_CODE_REGEX = /^\d{5}(-\d{4})?$/;

/**
 * Yup schema for zip: optional. When present, must be 5 digits or 5 digits, dash, 4 digits.
 */
export const zipNumericOnly = (fieldName: string) =>
	yup
		.string()
		.transform((value) => (typeof value === "string" ? value.trim() : value))
		.test(
			"zip-format",
			`${fieldName} is invalid`,
			(value) => value == null || value === "" || ZIP_CODE_REGEX.test(value),
		);

/**
 * Required zip: 5 digits (required), optional dash + 4 digits (ZIP+4).
 */
export const requiredZipNumeric = (fieldName: string) =>
	yup
		.string()
		.transform((value) => (typeof value === "string" ? value.trim() : value))
		.required(`${fieldName} is required`)
		.test(
			"zip-format",
			`${fieldName} is invalid`,
			(value) => value != null && value !== "" && ZIP_CODE_REGEX.test(value),
		);

/** Phone: optional +, digits, spaces, hyphens, parentheses. Used for format validation. */
const PHONE_REGEX = /^\+?[\d\s\-()]+$/;

/** Minimum number of digits required in a valid phone number (after stripping non-digits). */
const PHONE_MIN_DIGITS = 10;

/** Maximum number of digits allowed in a phone number (E.164 style). */
const PHONE_MAX_DIGITS = 15;

/**
 * Phone validation: trims, allows + (prefix), digits, spaces, hyphens, parentheses.
 * Validates digit count is between PHONE_MIN_DIGITS and PHONE_MAX_DIGITS when value is present.
 * Use validatePhone().required("...") for required fields or validatePhone().optional() for optional.
 */
export const validatePhone = () =>
	yup
		.string()
		.transform((value) => (typeof value === "string" ? value.trim() : value))
		.test("phone", CORPORATION_VALIDATION_MESSAGES.phone, (value) => {
			if (value == null || value === "") return true;
			if (!PHONE_REGEX.test(value)) return false;
			const digits = value.replace(/\D/g, "");
			return (
				digits.length >= PHONE_MIN_DIGITS && digits.length <= PHONE_MAX_DIGITS
			);
		});

// File Validation Utilities

export type ValidateFileOptions = {
	/** Max file size in bytes. */
	maxSizeBytes: number;
	/** Allowed MIME types (e.g. image/png, image/jpeg). Browser may send with params (e.g. image/svg+xml; charset=utf-8); only the base type is compared. */
	allowedMimeTypes: readonly string[];
	/** Optional custom message when file type is not allowed. */
	messageUnsupportedFormat?: string;
	/** Optional custom message when file exceeds max size. */
	messageFileTooLarge?: string;
};

const DEFAULT_UNSUPPORTED_FORMAT = "File format is not allowed.";
const DEFAULT_FILE_TOO_LARGE = "File size exceeds the allowed limit.";

/**
 * Validates a file against max size and allowed MIME types.
 * Strips MIME parameters (e.g. "image/svg+xml; charset=utf-8" -> "image/svg+xml") before comparing.
 * @returns Error message string, or null if valid.
 */
export function validateFile(
	file: File,
	options: ValidateFileOptions,
): string | null {
	const {
		maxSizeBytes,
		allowedMimeTypes,
		messageUnsupportedFormat = DEFAULT_UNSUPPORTED_FORMAT,
		messageFileTooLarge = DEFAULT_FILE_TOO_LARGE,
	} = options;

	const baseType = (file.type ?? "").split(";")[0].trim().toLowerCase();
	const allowed = [...allowedMimeTypes];
	if (!allowed.includes(baseType)) {
		return messageUnsupportedFormat;
	}

	if (file.size > maxSizeBytes) {
		return messageFileTooLarge;
	}

	return null;
}

// Brand Logo Utilities

export const BRAND_LOGOS_KEY_PREFIX = "brand-logos/";

/** Base URL for brand logo assets (S3 or CloudFront). Uses VITE_BRAND_LOGO_BASE_URL if set, else derived from VITE_ENV and VITE_AWS_REGION to match backend bucket. */
export function getBrandLogoBaseUrl(): string {
	const fromEnv = import.meta.env.VITE_BRAND_LOGO_BASE_URL as
		| string
		| undefined;
	if (fromEnv?.trim()) return fromEnv.trim().replace(/\/$/, "");
	const env = import.meta.env.VITE_ENV ?? "dev";
	const region = import.meta.env.VITE_AWS_REGION ?? "us-east-1";
	const bucket = `bsp-blueprint-${env}-frontend`;
	return `https://${bucket}.s3.${region}.amazonaws.com`;
}

/**
 * Returns the display URL for a corporation brand logo.
 * Handles: full URL (use as-is), object key (prefix + key), or filename only (prefix + filename).
 */
export function getBrandLogoDisplayUrl(
	value: string | null | undefined,
): string | null {
	if (!value?.trim()) return null;
	const v = value.trim();
	// API/JSON may send the string "null" or "undefined" instead of null
	if (v.toLowerCase() === "null" || v.toLowerCase() === "undefined")
		return null;
	if (v.startsWith("http://") || v.startsWith("https://")) {
		// Don't use URLs that point to "null" (e.g. .../corporation-brand-logos/null)
		if (/\/null\/?$/i.test(v) || v.endsWith("/null")) return null;
		return v;
	}
	const base = getBrandLogoBaseUrl();
	const key = v.startsWith(BRAND_LOGOS_KEY_PREFIX)
		? v
		: `${BRAND_LOGOS_KEY_PREFIX}${v}`;
	const url = `${base}/${key}`;
	// Never return a URL that ends with or contains /null
	if (/\/null\/?$/i.test(url) || url.endsWith("/null")) return null;
	return url;
}

/**
 * Formats a date as MM-DD-YYYY (en-US short format with dashes).
 */
export function formatDateShort(date?: Date | string | null): string {
	if (!date || date === "") return "";

	const d = new Date(date);
	if (Number.isNaN(d.getTime())) return "";

	return new Intl.DateTimeFormat("en-US", {
		month: "2-digit",
		day: "2-digit",
		year: "numeric",
	})
		.format(typeof date === "string" ? new Date(date) : date)
		.replace(/\//g, "-");
}
