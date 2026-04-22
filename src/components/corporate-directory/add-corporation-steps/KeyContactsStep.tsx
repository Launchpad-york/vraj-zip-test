import { yupResolver } from "@hookform/resolvers/yup";
import { Info } from "lucide-react";
import { useEffect, useMemo } from "react";
import type { Resolver } from "react-hook-form";
import { Controller, useForm, useWatch } from "react-hook-form";
import { FormInput } from "@/components/common/FormInput";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { ADD_NEW_CORPORATION_CONTENT } from "@/const";
import { cn } from "@/lib/utils";
import { type KeyContactsSchemaType, keyContactsSchema } from "@/schemas";
import { useCorporationsStore } from "@/store";
import type { KeyContactsStepProps } from "@/types";

const defaultValues: KeyContactsSchemaType = {
	complianceOn: true,
	firstName: "",
	lastName: "",
	nickname: "",
	role: "",
	email: "",
	workPhone: "",
	cellPhone: "",
};

function KeyContactsFormInner({
	onSuccess,
}: Pick<KeyContactsStepProps, "corporationDetail" | "onSuccess">) {
	const { corporationDetail, updateKeyContact } = useCorporationsStore();

	const formDefaultValues = useMemo((): KeyContactsSchemaType => {
		const contact = corporationDetail?.complianceContact;
		if (!contact) {
			return { ...defaultValues, complianceOn: false };
		}
		const hasData = !!(
			contact.firstName != null ||
			contact.lastName != null ||
			contact.role ||
			contact.email ||
			contact.workPhone
		);
		return {
			complianceOn: hasData,
			firstName: contact.firstName ?? "",
			lastName: contact.lastName ?? "",
			nickname: contact.nickname ?? "",
			role: contact.role ?? "",
			email: contact.email ?? "",
			workPhone: contact.workPhone ?? "",
			cellPhone: contact.cellPhone ?? "",
		};
	}, [corporationDetail]);

	const {
		control,
		register,
		handleSubmit,
		reset,
		setValue,
		formState: { errors },
	} = useForm<KeyContactsSchemaType>({
		resolver: yupResolver(keyContactsSchema) as Resolver<KeyContactsSchemaType>,
		mode: "onChange",
		defaultValues: formDefaultValues,
	});

	const complianceOn = useWatch({
		control,
		name: "complianceOn",
		defaultValue: true,
	});

	useEffect(() => {
		reset(formDefaultValues);
	}, [formDefaultValues, reset]);

	const onSubmit = async (values: KeyContactsSchemaType) => {
		const corpId = corporationDetail?.id ?? corporationDetail?.id;
		if (!corpId) return;

		const isOn = values.complianceOn;
		const result = await updateKeyContact(corpId, {
			complianceContact: isOn,
			firstName: isOn ? (values.firstName ?? "").trim() : "",
			lastName: isOn ? (values.lastName ?? "").trim() : "",
			nickname: isOn ? (values.nickname ?? "").trim() : "",
			role: isOn ? (values.role ?? "").trim() : "",
			email: isOn ? (values.email ?? "").trim() : "",
			workPhone: isOn ? (values.workPhone ?? "").trim() : "",
			cellPhone: isOn ? (values.cellPhone ?? "").trim() : "",
		});

		if (result?.ok === false) return;
		onSuccess?.();
	};

	return (
		<form
			id="key-contacts-form"
			onSubmit={handleSubmit(onSubmit)}
			className="space-y-4"
		>
			<Collapsible
				open={complianceOn}
				onOpenChange={(open) =>
					setValue("complianceOn", open, { shouldValidate: true })
				}
			>
				<Card
					className={cn(
						"border border-border bg-background !pt-0",
						!complianceOn && "!pb-0",
					)}
					size="sm"
				>
					<CardHeader
						className={cn("p-4", complianceOn && "border-b border-border")}
					>
						<CardTitle className="flex items-center gap-2 text-base font-medium text-text-secondary">
							Compliance Contact
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										type="button"
										aria-label="compliance-info"
										className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground hover:text-text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
									>
										<Info className="w-3.5 h-3.5 text-icon-info" />
									</button>
								</TooltipTrigger>
								<TooltipContent sideOffset={6} className="max-w-xs">
									{ADD_NEW_CORPORATION_CONTENT.referenceOnlyTooltip}
								</TooltipContent>
							</Tooltip>
						</CardTitle>
						<CardAction className="self-center shrink-0">
							<Controller
								name="complianceOn"
								control={control}
								render={({ field }) => (
									<Switch
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								)}
							/>
						</CardAction>
					</CardHeader>

					<CollapsibleContent>
						<CardContent>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<FormInput
									id="compliance-first-name"
									label={ADD_NEW_CORPORATION_CONTENT.fields.firstName}
									placeholder={
										ADD_NEW_CORPORATION_CONTENT.placeholders.firstName
									}
									error={errors.firstName?.message}
									required={complianceOn}
									{...register("firstName")}
								/>
								<FormInput
									id="compliance-last-name"
									label={ADD_NEW_CORPORATION_CONTENT.fields.lastName}
									placeholder={
										ADD_NEW_CORPORATION_CONTENT.placeholders.lastName
									}
									error={errors.lastName?.message}
									required={complianceOn}
									{...register("lastName")}
								/>
								<FormInput
									id="compliance-nickname"
									label={ADD_NEW_CORPORATION_CONTENT.fields.nickname}
									placeholder={
										ADD_NEW_CORPORATION_CONTENT.placeholders.nickname
									}
									error={errors.nickname?.message}
									required={false}
									{...register("nickname")}
								/>
								<FormInput
									id="compliance-role"
									label={ADD_NEW_CORPORATION_CONTENT.fields.role}
									placeholder={ADD_NEW_CORPORATION_CONTENT.placeholders.role}
									error={errors.role?.message}
									required={false}
									{...register("role")}
								/>
								<FormInput
									id="compliance-email"
									label={ADD_NEW_CORPORATION_CONTENT.fields.email}
									placeholder={ADD_NEW_CORPORATION_CONTENT.placeholders.email}
									error={errors.email?.message}
									required={complianceOn}
									{...register("email")}
								/>
								<FormInput
									id="compliance-work-phone"
									label={ADD_NEW_CORPORATION_CONTENT.fields.workPhoneNo}
									placeholder={
										ADD_NEW_CORPORATION_CONTENT.placeholders.workPhoneNo
									}
									error={errors.workPhone?.message}
									required={complianceOn}
									{...register("workPhone")}
								/>
								<FormInput
									id="compliance-cell-phone"
									label={ADD_NEW_CORPORATION_CONTENT.fields.cellPhoneNo}
									placeholder={
										ADD_NEW_CORPORATION_CONTENT.placeholders.cellPhoneNo
									}
									error={errors.cellPhone?.message}
									required={false}
									{...register("cellPhone")}
								/>
							</div>
						</CardContent>
					</CollapsibleContent>
				</Card>
			</Collapsible>
		</form>
	);
}

export function KeyContactsStep({
	corporationDetail,
	onSuccess,
	isLoadingDetail,
}: KeyContactsStepProps) {
	if (isLoadingDetail && !corporationDetail) {
		return (
			<p className="text-small text-muted-foreground">
				{ADD_NEW_CORPORATION_CONTENT.loadingDetail}
			</p>
		);
	}
	return (
		<KeyContactsFormInner
			key={corporationDetail?.id ?? "new"}
			corporationDetail={corporationDetail ?? undefined}
			onSuccess={onSuccess}
		/>
	);
}

export default KeyContactsStep;
