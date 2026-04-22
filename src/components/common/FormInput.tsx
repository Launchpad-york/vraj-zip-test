import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormInputProps = {
	id: string;
	label: string;
	type?: string;
	placeholder?: string;
	error?: string;
	autoComplete?: string;
	className?: string;
	rightElement?: React.ReactNode;
	required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
	(
		{
			id,
			label,
			type = "text",
			placeholder,
			error,
			autoComplete,
			className = "",
			rightElement,
			required,
			...props
		},
		ref,
	) => {
		return (
			<div className="space-y-2">
				<Label
					htmlFor={id}
					className="text-small font-medium text-text-foreground"
				>
					{required && <span className="text-destructive">*</span>}
					{label}
				</Label>
				<div className="relative">
					<Input
						ref={ref}
						id={id}
						type={type}
						placeholder={placeholder}
						autoComplete={autoComplete}
						className={`disabled:opacity-100 disabled:bg-card disabled:text-muted-foreground h-10 ${rightElement ? "pr-10" : ""} ${
							error ? "border-destructive" : ""
						} ${className}`}
						aria-invalid={!!error}
						{...props}
					/>
					{rightElement}
				</div>
				{error && <p className="text-mini text-destructive">{error}</p>}
			</div>
		);
	},
);

FormInput.displayName = "FormInput";
