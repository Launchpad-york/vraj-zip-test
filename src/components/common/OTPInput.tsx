import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type OTPInputProps = {
	length: number;
	value: string[];
	onChange: (value: string[]) => void;
	error?: boolean;
};

export function OTPInput({ length, value, onChange, error }: OTPInputProps) {
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	const handleInputChange = (index: number, inputValue: string) => {
		// Only allow single digit
		if (inputValue.length > 1) {
			inputValue = inputValue.slice(-1);
		}

		// Only allow numbers
		if (inputValue && !/^\d$/.test(inputValue)) return;

		const newCode = [...value];
		newCode[index] = inputValue;
		onChange(newCode);

		// Auto-focus next input
		if (inputValue && index < length - 1) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleKeyDown = (
		index: number,
		e: React.KeyboardEvent<HTMLInputElement>,
	) => {
		// Handle backspace - move to previous input
		if (e.key === "Backspace" && !value[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handlePaste = (e: React.ClipboardEvent) => {
		e.preventDefault();
		const pastedData = e.clipboardData.getData("text");
		// Remove non-digits first, then slice to length
		const digits = pastedData.replace(/\D/g, "").slice(0, length);

		if (digits) {
			const newCode = [...value];
			for (let i = 0; i < digits.length && i < length; i++) {
				newCode[i] = digits[i];
			}
			onChange(newCode);

			// Focus the next empty input or last input
			const nextEmptyIndex = newCode.findIndex((c) => !c);
			const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
			inputRefs.current[focusIndex]?.focus();
		}
	};

	return (
		<div className="flex items-center justify-between">
			{value.map((digit, index) => (
				<div key={index} className="flex items-center">
					<Input
						ref={(el) => {
							inputRefs.current[index] = el;
						}}
						type="text"
						inputMode="numeric"
						maxLength={1}
						value={digit}
						onChange={(e) => handleInputChange(index, e.target.value)}
						onKeyDown={(e) => handleKeyDown(index, e)}
						onPaste={index === 0 ? handlePaste : undefined}
						className={cn(
							"sm:h-10 sm:w-14 h-8 w-10 text-center text-lg font-medium rounded-lg",
							error && "border-destructive focus-visible:ring-destructive",
						)}
					/>
					{/* Dash separator after middle */}
					{index === Math.floor(length / 2) - 1 && (
						<span className="ml-2 text-text-secondary">-</span>
					)}
				</div>
			))}
		</div>
	);
}
