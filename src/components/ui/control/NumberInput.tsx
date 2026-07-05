"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from "react";
import { base } from "@/components/ui/control/TextInput";
import { joinClass } from "@/lib/util/client/func";

type NumberInputProps = InputHTMLAttributes<HTMLInputElement> & {
	suffix?: ReactNode;
	inputClassName?: string;
	label?: ReactNode;
	hint?: ReactNode;
	labelClassName?: string;
	fieldClassName?: string;
};

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
	{ className, inputClassName, suffix, disabled, label, hint, labelClassName, fieldClassName, id, ...props },
	ref,
) {
	const generatedId = useId();
	const inputId = id ?? generatedId;
	const hasSuffix = suffix !== undefined && suffix !== null;
	const input = (
		<span className="relative block">
			<input
				ref={ref}
				id={inputId}
				{...props}
				disabled={disabled}
				className={joinClass(`${base} box-border h-10 w-full leading-5 disabled:cursor-not-allowed disabled:opacity-60`, hasSuffix && "pr-8", className, inputClassName)}
			/>
			{hasSuffix && <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-text-muted select-none">{suffix}</span>}
		</span>
	);

	if (!label && !hint) return input;

	return (
		<div className={fieldClassName}>
			{label && (
				<label htmlFor={inputId} className={joinClass("mb-1 block text-sm font-bold text-text-muted", labelClassName)}>
					{label}
				</label>
			)}
			{input}
			{hint && <p className="ml-1.5 text-[0.7rem] text-text-muted">{hint}</p>}
		</div>
	);
});
