import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { Resolver } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import { DataTable, FormInput, WhiteBox } from "@/components/common";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
	EXTERNAL_DEFAULT_CATEGORY_NAMES,
	ROLES_PAGE_CONTENT,
	SUPER_ADMIN_CATEGORY_NAME,
} from "@/const";
import { cn } from "@/lib/utils";
import { type RoleFormSchemaType, roleFormSchema } from "@/schemas";
import { getRolePermissionColumns } from "@/tables/roles/RolePermissionsColumn";
import type { RoleFormProps } from "@/types";

export function RoleForm({
	formId,
	initialValues,
	modules,
	categories,
	onSubmit,
	submitLabel: _submitLabel,
	isSubmitting: _isSubmitting = false,
}: RoleFormProps) {
	const selectableCategories = useMemo(
		() => categories.filter((c) => c.name !== SUPER_ADMIN_CATEGORY_NAME),
		[categories],
	);

	const defaultCategoryId = useMemo(() => {
		const catId = initialValues?.categoryId ?? "";
		if (!catId) return "";
		const cat = categories.find((c) => c.id === catId);
		return cat?.name === SUPER_ADMIN_CATEGORY_NAME ? "" : catId;
	}, [initialValues?.categoryId, categories]);

	const isExternalDefaultForCategory = useCallback(
		(categoryId: string) => {
			const cat = categories.find((c) => c.id === categoryId);
			return cat
				? (EXTERNAL_DEFAULT_CATEGORY_NAMES as readonly string[]).includes(
						cat.name,
					)
				: false;
		},
		[categories],
	);

	const defaultValues = useMemo<RoleFormSchemaType>(() => {
		const defaultIsExternal =
			initialValues?.isExternal !== undefined
				? initialValues.isExternal
				: defaultCategoryId
					? isExternalDefaultForCategory(defaultCategoryId)
					: false;
		return {
			name: initialValues?.name ?? "",
			categoryId: defaultCategoryId,
			description: initialValues?.description ?? "",
			isPrivate: initialValues?.isPrivate ?? false,
			isExternal: defaultIsExternal,
			permissionIds: initialValues?.permissionIds ?? [],
		};
	}, [
		initialValues?.name,
		initialValues?.description,
		initialValues?.isPrivate,
		initialValues?.isExternal,
		initialValues?.permissionIds,
		defaultCategoryId,
		isExternalDefaultForCategory,
	]);

	const {
		register,
		control,
		handleSubmit,
		watch,
		setValue,
		reset,
		formState: { errors },
	} = useForm<RoleFormSchemaType>({
		resolver: yupResolver(roleFormSchema) as Resolver<RoleFormSchemaType>,
		mode: "onChange",
		defaultValues,
	});

	const permissionIds = watch("permissionIds");
	const categoryId = watch("categoryId");

	useEffect(() => {
		const defaultIsExternal =
			initialValues?.isExternal !== undefined
				? initialValues.isExternal
				: defaultCategoryId
					? isExternalDefaultForCategory(defaultCategoryId)
					: false;
		reset({
			name: initialValues?.name ?? "",
			categoryId: defaultCategoryId,
			description: initialValues?.description ?? "",
			isPrivate: initialValues?.isPrivate ?? false,
			isExternal: defaultIsExternal,
			permissionIds: initialValues?.permissionIds ?? [],
		});
	}, [
		reset,
		initialValues?.name,
		initialValues?.categoryId,
		initialValues?.description,
		initialValues?.isPrivate,
		initialValues?.isExternal,
		initialValues?.permissionIds,
		defaultCategoryId,
		isExternalDefaultForCategory,
	]);

	// When category is Corp/Company Admin check "Mark as External"; on add page only, uncheck for other categories
	const prevCategoryIdRef = useRef<string | undefined>(undefined);
	const isAddPage = initialValues == null;
	useEffect(() => {
		const prev = prevCategoryIdRef.current;
		prevCategoryIdRef.current = categoryId;
		if (prev === undefined || !categoryId || categoryId === prev) return;
		if (isExternalDefaultForCategory(categoryId)) {
			setValue("isExternal", true);
		} else if (isAddPage) {
			setValue("isExternal", false);
		}
	}, [categoryId, isExternalDefaultForCategory, setValue, isAddPage]);

	const togglePermission = useCallback(
		(permissionId: string | null, checked: boolean) => {
			if (!permissionId) return;
			const current = watch("permissionIds") ?? [];
			const next = checked
				? [...current, permissionId]
				: current.filter((id) => id !== permissionId);
			setValue("permissionIds", next, { shouldValidate: true });
		},
		[watch, setValue],
	);

	const onFormSubmit = async (data: RoleFormSchemaType) => {
		await onSubmit({
			name: data.name.trim(),
			categoryId: data.categoryId,
			description: data.description.trim(),
			isPrivate: data.isPrivate,
			isExternal: data.isExternal,
			permissionIds: data.permissionIds,
		});
	};

	const permissionIdSet = useMemo(
		() => new Set(permissionIds ?? []),
		[permissionIds],
	);

	const permissionColumns = useMemo(
		() => getRolePermissionColumns(permissionIdSet, togglePermission),
		[permissionIdSet, togglePermission],
	);

	return (
		<form
			id={formId}
			onSubmit={handleSubmit(onFormSubmit)}
			className="flex flex-col"
		>
			<WhiteBox className="flex flex-col gap-0">
				<div>
					<FieldGroup>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FormInput
								id="role-name"
								label={ROLES_PAGE_CONTENT.roleName}
								placeholder={ROLES_PAGE_CONTENT.roleNamePlaceholder}
								error={errors.name?.message}
								required
								{...register("name")}
							/>
							<Field>
								<FieldLabel>
									<span className="text-destructive">*</span>
									{ROLES_PAGE_CONTENT.category}
								</FieldLabel>
								<Controller
									name="categoryId"
									control={control}
									render={({ field }) => (
										<Select
											value={field.value || undefined}
											onValueChange={field.onChange}
										>
											<SelectTrigger
												className={cn(
													"h-10 w-full",
													errors.categoryId && "border-destructive",
												)}
												aria-invalid={!!errors.categoryId}
											>
												<SelectValue
													placeholder={ROLES_PAGE_CONTENT.categoryPlaceholder}
												/>
											</SelectTrigger>
											<SelectContent>
												{selectableCategories.map((cat) => (
													<SelectItem key={cat.id} value={cat.id}>
														{cat.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
								/>
								{errors.categoryId && (
									<FieldError>
										<span>{errors.categoryId.message}</span>
									</FieldError>
								)}
							</Field>
						</div>
						<Field>
							<FieldLabel>
								<span className="text-destructive">*</span>
								{ROLES_PAGE_CONTENT.description}
							</FieldLabel>
							<Textarea
								{...register("description")}
								placeholder={ROLES_PAGE_CONTENT.descriptionPlaceholder}
								rows={1}
								className={cn(
									"min-h-[2.5rem] field-sizing-content",
									errors.description && "border-destructive",
								)}
								aria-invalid={!!errors.description}
							/>
							{errors.description && (
								<FieldError>
									<span>{errors.description.message}</span>
								</FieldError>
							)}
						</Field>
						<div className="flex flex-wrap gap-6">
							<Controller
								name="isPrivate"
								control={control}
								render={({ field }) => (
									<div className="flex items-center gap-2">
										<Checkbox
											id="mark-private"
											checked={field.value}
											onCheckedChange={(v) => field.onChange(v === true)}
										/>
										<Label
											htmlFor="mark-private"
											className="text-sm font-normal cursor-pointer"
										>
											{ROLES_PAGE_CONTENT.markAsPrivate}
										</Label>
									</div>
								)}
							/>
							<Controller
								name="isExternal"
								control={control}
								render={({ field }) => (
									<div className="flex items-center gap-2">
										<Checkbox
											id="mark-external"
											checked={field.value}
											onCheckedChange={(v) => field.onChange(v === true)}
										/>
										<Label
											htmlFor="mark-external"
											className="text-sm font-normal cursor-pointer"
										>
											{ROLES_PAGE_CONTENT.markAsExternal}
										</Label>
									</div>
								)}
							/>
						</div>
					</FieldGroup>
				</div>

				<hr
					className="my-6 border-0 border-t border-border shrink-0"
					aria-hidden
				/>

				<div>
					<p className="text-small text-text-secondary mb-4">
						{ROLES_PAGE_CONTENT.permissionsHint}
					</p>
					{errors.permissionIds && (
						<p className="text-small text-destructive mb-2" role="alert">
							{errors.permissionIds.message}
						</p>
					)}
					{modules.length > 0 &&
						modules.every(
							(m) =>
								!m.permissions.add &&
								!m.permissions.update &&
								!m.permissions.view &&
								!m.permissions.remove,
						) && (
							<div
								className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-small text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
								role="alert"
							>
								{ROLES_PAGE_CONTENT.noPermissionsConfigured}
							</div>
						)}
					<div className="overflow-x-auto border border-border rounded-lg">
						<DataTable
							data={modules}
							columns={permissionColumns}
							showPagination={false}
							emptyMessage={ROLES_PAGE_CONTENT.noData}
						/>
					</div>
				</div>
			</WhiteBox>
		</form>
	);
}
