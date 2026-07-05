"use client";

import { type ChangeEvent, Children, forwardRef, isValidElement, type OptionHTMLAttributes, type ReactNode, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { base } from "@/components/ui/control/TextInput";
import MenuPanel from "@/components/ui/MenuPanel";
import { joinClass } from "@/lib/util/client/func";

type SelectOption = { value: string; label: ReactNode; disabled?: boolean };

type CustomSelectProps = Readonly<{
	children: ReactNode;
	value?: string;
	defaultValue?: string;
	onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
	name?: string;
	id?: string;
	disabled?: boolean;
	className?: string;
	label?: ReactNode;
	hint?: ReactNode;
	labelClassName?: string;
	fieldClassName?: string;
	"aria-label"?: string;
}>;

function optionsFromChildren(children: ReactNode): SelectOption[] {
	return Children.toArray(children).flatMap((child) => {
		if (!isValidElement<OptionHTMLAttributes<HTMLOptionElement>>(child) || child.type !== "option") return [];

		const stringed = typeof child.props.children === "string" ? child.props.children : "";
		const value = child.props.value === undefined ? stringed : String(child.props.value);
		return [{ value, label: child.props.children, disabled: child.props.disabled }];
	});
}

function handleOptionKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
	if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Home" && event.key !== "End") return;
	event.preventDefault();

	const buttons = Array.from(event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? []);
	const currentIndex = buttons.indexOf(event.currentTarget);

	let nextIndex = currentIndex;
	if (event.key === "ArrowDown") nextIndex = (currentIndex + 1) % buttons.length;
	else if (event.key === "ArrowUp") nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
	else if (event.key === "Home") nextIndex = 0;
	else if (event.key === "End") nextIndex = buttons.length - 1;

	buttons[nextIndex]?.focus();
}

export const Select = forwardRef<HTMLButtonElement, CustomSelectProps>(function CustomSelect(
	{ children, value, defaultValue, onChange, name, id, disabled, className, label, hint, labelClassName, fieldClassName, "aria-label": ariaLabel },
	ref,
) {
	const options = optionsFromChildren(children);
	const [open, setOpen] = useState(false);
	const [internalValue, setInternalValue] = useState(() => defaultValue ?? options[0]?.value ?? "");
	const generatedId = useId();
	const triggerRef = useRef<HTMLButtonElement>(null);
	const selectId = id ?? generatedId;

	const current = value ?? internalValue;
	const selected = options.find((option) => option.value === current) ?? options[0];

	function selectOption(option: SelectOption) {
		setOpen(false);
		if (value === undefined) setInternalValue(option.value);
		onChange?.({ target: { value: option.value, name } } as ChangeEvent<HTMLSelectElement>);
	}

	const select = (
		<div className="relative mt-1 w-full">
			{name && <input type="hidden" name={name} value={current} />}
			<button
				ref={(node) => {
					triggerRef.current = node;
					if (typeof ref === "function") ref(node);
					else if (ref) ref.current = node;
				}}
				type="button"
				id={selectId}
				disabled={disabled}
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-label={ariaLabel}
				onClick={() => setOpen((isOpen) => !isOpen)}
				onKeyDown={(event) => {
					if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== " ") return;
					event.preventDefault();
					setOpen(true);
				}}
				className={joinClass(
					`${base} mt-0 box-border flex h-10 w-full cursor-pointer items-center justify-between gap-2 text-left leading-5 transition-colors hover:border-primary/60 disabled:cursor-not-allowed disabled:opacity-60`,
					className,
				)}
			>
				<span className="truncate text-text">{selected?.label}</span>
				<ChevronDown size={16} aria-hidden="true" className={joinClass("shrink-0 text-text-faint transition-transform duration-200", open && "rotate-180")} />
			</button>
			<MenuPanel
				open={open}
				onClose={() => setOpen(false)}
				variant="anchored"
				role="listbox"
				shouldShowClose={false}
				anchorRef={triggerRef}
				panelClassName="left-0 right-auto mt-2 max-h-64 w-max min-w-full max-w-[min(24rem,90vw)] overflow-y-auto p-1"
			>
				<div className="animate-content-fade-in flex flex-col">
					{options.map((option) => (
						<button
							key={option.value}
							type="button"
							role="option"
							aria-selected={option.value === current}
							disabled={option.disabled}
							onClick={() => selectOption(option)}
							onKeyDown={handleOptionKeyDown}
							className={joinClass(
								"flex items-center rounded px-3 py-2 text-left text-text transition-colors hover:bg-primary hover:text-text focus:bg-primary focus:text-text focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
								option.value === current && "bg-primary/15 font-bold text-text",
							)}
						>
							{option.label}
						</button>
					))}
				</div>
			</MenuPanel>
		</div>
	);

	if (!label && !hint) return select;

	return (
		<div className={fieldClassName}>
			{label && (
				<label htmlFor={selectId} className={joinClass("mb-1 block text-sm font-bold text-text-muted", labelClassName)}>
					{label}
				</label>
			)}
			{select}
			{hint && <p className="ml-1.5 text-[0.7rem] text-text-muted">{hint}</p>}
		</div>
	);
});
