"use client";

import { forwardRef, type ReactNode, type TextareaHTMLAttributes, useId } from "react";
import { base } from "@/components/ui/control/TextInput";
import { joinClass } from "@/lib/util/client/func";

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
	label?: ReactNode;
	hint?: ReactNode;
	labelClassName?: string;
	fieldClassName?: string;
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea({ className, label, hint, labelClassName, fieldClassName, id, ...props }, ref) {
	const generatedId = useId();
	const inputId = id ?? generatedId;
	const textarea = <textarea ref={ref} id={inputId} {...props} className={joinClass(`${base} w-full`, className)} />;

	if (!label && !hint) return textarea;

	return (
		<div className={fieldClassName}>
			{label && (
				<label htmlFor={inputId} className={joinClass("mb-1 block text-sm font-bold text-text-muted", labelClassName)}>
					{label}
				</label>
			)}
			{textarea}
			{hint && <p className="ml-1.5 text-[0.7rem] text-text-muted">{hint}</p>}
		</div>
	);
});
