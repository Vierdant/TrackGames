"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from "react";
import { joinClass } from "@/lib/util/client/func";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
	label?: ReactNode;
	labelClassName?: string;
	fieldClassName?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ className, type, label, labelClassName, fieldClassName, id, ...props }, ref) {
	const generatedId = useId();
	const inputId = id ?? generatedId;
	const input = (
		<input
			ref={ref}
			id={inputId}
			{...props}
			type={type ?? "checkbox"}
			className={joinClass(
				"size-4 shrink-0 cursor-pointer appearance-none rounded border border-border bg-bg transition checked:border-primary checked:bg-primary hover:border-primary checked:hover:ring-2 checked:hover:ring-primary-hover/50 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
		/>
	);

	if (!label) return input;

	return (
		<label htmlFor={inputId} className={joinClass("flex cursor-pointer items-center gap-2 text-sm font-bold text-text-muted", fieldClassName)}>
			{input}
			<span className={labelClassName}>{label}</span>
		</label>
	);
});
