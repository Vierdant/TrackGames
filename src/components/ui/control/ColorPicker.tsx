"use client";

import { type ChangeEvent, forwardRef, useEffect, useId, useState } from "react";
import { TextInput } from "@/components/ui/control/TextInput";
import { joinClass } from "@/lib/util/client/func";
import { hexColor } from "@/lib/util/validate/normalize";

type ColorPickerProps = Readonly<{
	defaultValue?: string;
	value?: string;
	onChange?: (event: ChangeEvent<HTMLInputElement, HTMLInputElement>) => void;
	name?: string;
	label?: string;
	shouldShowValue?: boolean;
	gap?: string;
	swatchClassName?: string;
	className?: string;
}>;

export const ColorPicker = forwardRef<HTMLInputElement, ColorPickerProps>(function ColorPicker(
	{ defaultValue, value, onChange, name, label, shouldShowValue = true, gap = "gap-2", swatchClassName, className },
	ref,
) {
	const inputId = useId();
	const initialValue = hexColor(value || defaultValue);
	const [draft, setDraft] = useState(value ?? defaultValue ?? "");
	const pickerValue = hexColor(draft, initialValue).toLowerCase();

	useEffect(() => {
		setDraft(value ?? defaultValue ?? "");
	}, [defaultValue, value]);

	return (
		<div className={className}>
			{label && (
				<label htmlFor={inputId} className="mb-1 block text-sm font-bold text-text-muted">
					{label}
				</label>
			)}
			<div className={`flex items-center ${gap}`}>
				<label
					htmlFor={inputId}
					className={joinClass(
						"relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded border border-border bg-bg transition-colors hover:border-primary",
						swatchClassName,
					)}
					title="Pick color"
					aria-label="Pick color"
				>
					<span className="block h-full w-full" style={{ background: pickerValue }} />
					<input
						ref={shouldShowValue ? undefined : ref}
						id={inputId}
						name={shouldShowValue ? undefined : name}
						type="color"
						value={pickerValue}
						onChange={(event) => {
							const nextValue = event.target.value.toUpperCase();
							setDraft(nextValue);
							onChange?.(event);
						}}
						className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
					/>
				</label>
				{shouldShowValue && (
					<TextInput
						ref={ref}
						name={name}
						value={draft}
						onChange={(event) => {
							setDraft(event.target.value);
							onChange?.(event);
						}}
						placeholder={initialValue}
						className="mt-0 w-28 shrink text-text"
					/>
				)}
			</div>
		</div>
	);
});
