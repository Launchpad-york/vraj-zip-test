import * as yup from "yup";
import { CORPORATION_VALIDATION_MESSAGES } from "@/const";
import {
	requiredEmail,
	requiredString,
	requiredZipNumeric,
	validatePhone,
} from "@/utils";

/** Matches POST /corporations request body */
const addressSchema = yup.object().shape({
	addressLine: requiredString("Address line"),
	state: requiredString("State"),
	city: requiredString("City"),
	country: requiredString("Country"),
	zip: requiredZipNumeric("ZIP/Postal code"),
	timezone: requiredString("Time Zone"),
});

const executiveSponsorSchema = yup.object().shape({
	sameAsCorpAdmin: yup.boolean().optional().default(false),
	firstName: requiredString("First Name"),
	lastName: requiredString("Last Name"),
	nickname: yup.string().optional().default(""),
	role: requiredString("Job Role"),
	email: requiredEmail("Email"),
	workPhone: validatePhone().required("Work Phone No. is required"),
	cellPhone: validatePhone().optional(),
});

export const createCorporationSchema = yup.object().shape({
	mode: yup.string().oneOf(["quick", "advanced"]).default("quick"),
	legalName: requiredString("Corporation Legal name"),
	dbaName: yup
		.string()
		.default("")
		.max(100, "Maximum 100 characters are allowed"),
	website: yup
		.string()
		.optional()
		.default("")
		.test(
			"url",
			CORPORATION_VALIDATION_MESSAGES.url,
			(value) =>
				!value ||
				String(value).trim() === "" ||
				yup
					.string()
					.url(CORPORATION_VALIDATION_MESSAGES.url)
					.isValidSync(value),
		),
	ownershipType: requiredString("Ownership Type"),
	dataResidencyRegion: requiredString("Region (Data Residency)"),
	industry: requiredString("Industry"),
	phoneNo: validatePhone().required("Corporation Phone No. is required"),
	address: addressSchema,
	executiveSponsor: executiveSponsorSchema,
	corporationAdmin: yup
		.object()
		.shape({
			firstName: requiredString("First Name"),
			lastName: requiredString("Last Name"),
			nickname: yup.string().optional().default(""),
			role: requiredString("Job Role"),
			email: requiredEmail("Email"),
			workPhone: validatePhone().required("Work Phone No. is required"),
			cellPhone: validatePhone().optional(),
		})
		.optional()
		.default(undefined),
});

export type CreateCorporationSchemaType = yup.InferType<
	typeof createCorporationSchema
>;

/** Matches POST /corporations/:id/companies request body */
export const createCompanySchema = yup.object().shape({
	legalName: requiredString("Legal name"),
	companyType: requiredString("Company type"),
	officeType: requiredString("Office type"),
	sameAsCorpAdmin: yup.boolean().default(false),
	planTypeId: yup.string().optional().default(""),
	planId: requiredString("Plan level"),
	firstName: requiredString("First Name"),
	lastName: requiredString("Last Name"),
	nickname: yup.string().optional().default(""),
	role: requiredString("Job role"),
	email: requiredEmail("Email"),
	workPhone: validatePhone().required("Work Phone No. is required"),
	cellPhone: validatePhone().optional(),
	addressLine: requiredString("Address line"),
	state: requiredString("State/Province"),
	city: requiredString("City"),
	country: requiredString("Country"),
	zip: requiredZipNumeric("ZIP/Postal code"),
	securityPosture: requiredString("Security posture"),
	region: yup.string().optional(),
	industry: yup.string().optional(),
});

export type CreateCompanySchemaType = yup.InferType<typeof createCompanySchema>;

export const keyContactsSchema = yup.object().shape({
	complianceOn: yup.boolean().default(true),
	firstName: yup.string().when("complianceOn", {
		is: true,
		then: () => requiredString("First name"),
		otherwise: (schema) => schema.optional().default(""),
	}),
	lastName: yup.string().when("complianceOn", {
		is: true,
		then: () => requiredString("Last name"),
		otherwise: (schema) => schema.optional().default(""),
	}),
	nickname: yup.string().optional().default(""),
	role: yup.string().optional().default(""),
	email: yup.string().when("complianceOn", {
		is: true,
		then: () => requiredEmail("Email"),
		otherwise: (schema) => schema.optional().default(""),
	}),
	workPhone: yup.string().when("complianceOn", {
		is: true,
		then: () => validatePhone().required("Work phone is required"),
		otherwise: (schema) => schema.optional().default(""),
	}),
	cellPhone: validatePhone().optional().default(""),
});

export type KeyContactsSchemaType = yup.InferType<typeof keyContactsSchema>;

/** Suspend/Close corporation action modal form */
export const corporationActionFormSchema = yup.object().shape({
	reason: yup
		.string()
		.required(CORPORATION_VALIDATION_MESSAGES.reasonRequired)
		.trim(),
	notes: yup
		.string()
		.default("")
		.when("reason", {
			is: "Other",
			then: (schema) => schema.required("Additional notes are required").trim(),
			otherwise: (schema) => schema.optional().trim(),
		}),
});

export type CorporationActionFormSchemaType = yup.InferType<
	typeof corporationActionFormSchema
>;
