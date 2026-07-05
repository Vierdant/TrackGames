"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from "react";
import type { LucideIcon } from "lucide-react";
import { TextInput } from "@/components/ui/control/TextInput";
import { joinClass } from "@/lib/util/client/func";

type FieldProps = Readonly<{ label?: ReactNode; hint?: string; children: ReactNode; className?: string; htmlFor?: string; labelClassName?: string }>;

export function Field({ label, hint, children, className, htmlFor, labelClassName }: FieldProps) {
	const generatedId = useId();
	const labelId = htmlFor ?? generatedId;

	return (
		<div className={className}>
			{label && htmlFor ? (
				<label htmlFor={labelId} className={labelClassName}>
					{label}
				</label>
			) : (
				label && <h3 className={labelClassName}>{label}</h3>
			)}
			{children}
			{hint && <p className="ml-1.5 text-[0.7rem] text-text-muted">{hint}</p>}
		</div>
	);
}

export const IconField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { icon: LucideIcon; label: string; error?: string; endAdornment?: ReactNode }>(
	function IconField({ icon: Icon, label, error, endAdornment, id, className, ...props }, ref) {
		const generatedId = useId();
		const inputId = id ?? generatedId;
		const errorId = error ? `${inputId}-error` : undefined;

		return (
			<div className="flex flex-col gap-2 text-sm font-bold text-text-muted">
				<label htmlFor={inputId}>{label}</label>
				<span className="relative">
					<Icon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-faint" size={18} aria-hidden="true" />
					<TextInput
						ref={ref}
						id={inputId}
						{...props}
						aria-invalid={Boolean(error)}
						aria-describedby={error ? errorId : undefined}
						className={joinClass("mt-0 h-10 bg-surface pl-10 focus:border-primary", endAdornment ? "pr-12" : "", className)}
					/>
					{endAdornment}
				</span>
				{error && (
					<span id={errorId} className="text-xs font-bold text-error">
						{error}
					</span>
				)}
			</div>
		);
	},
);
