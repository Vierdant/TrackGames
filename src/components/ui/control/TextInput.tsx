"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from "react";
import { joinClass } from "@/lib/util/client/func";

export const base =
	"bg-bg-secondary/80 p-2 rounded mt-1 pl-3 pr-3 outline-none text-text placeholder:text-text-faint ring-2 ring-bg focus-visible:ring-primary transition-colors transition-[box-shadow]";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
	label?: ReactNode;
	hint?: ReactNode;
	labelClassName?: string;
	fieldClassName?: string;
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput({ className, label, hint, labelClassName, fieldClassName, id, ...props }, ref) {
	const generatedId = useId();
	const inputId = id ?? generatedId;
	const input = <input ref={ref} id={inputId} {...props} className={joinClass(`${base} box-border h-10 w-full leading-5`, className)} />;

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
