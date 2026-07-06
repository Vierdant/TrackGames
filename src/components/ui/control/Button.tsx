import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from "react";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { joinClass } from "@/lib/util/client/func";

type ButtonColor = "primary" | "secondary" | "surface" | "ghost" | "danger" | "success";
type ButtonVariant = "main" | "outline" | "text";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	children: ReactNode;
	href?: string;
	target?: string;
	color?: ButtonColor;
	variant?: ButtonVariant;
};

type FloatedSquareButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	children: ReactNode;
	label?: ReactNode;
	labelClassName?: string;
};

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	icon: ReactNode;
	label: string;
	pressed?: boolean;
};

const base = "flex items-center gap-5 justify-center px-6 py-2 rounded cursor-pointer font-bold transition-colors";

// Each color maps to its solid/hover token + a Tailwind class set per variant.
// main:    filled, brightens on hover.
// outline: hollow, border+text in color; hover fills bg and flips text to inverse.
// text:    no border; hover shows a faint tint and shifts text to the hover shade.
const colors: Record<ButtonColor, Record<ButtonVariant, string>> = {
	primary: {
		main: "bg-primary ring ring-primary text-text-inverse hover:bg-primary-hover",
		outline: "ring ring-primary text-primary hover:bg-primary hover:text-text-inverse",
		text: "text-primary hover:bg-primary/15 hover:text-primary-hover",
	},
	secondary: {
		main: "bg-secondary ring ring-secondary text-text-inverse hover:bg-secondary-hover",
		outline: "ring ring-secondary text-secondary hover:bg-secondary hover:text-text-inverse",
		text: "text-secondary hover:bg-secondary/15 hover:text-secondary-hover",
	},
	surface: {
		main: "bg-surface ring ring-surface text-text hover:bg-surface-hover",
		outline: "ring ring-surface text-surface hover:bg-surface hover:text-text",
		text: "text-surface hover:bg-surface/15 hover:text-surface-hover",
	},
	ghost: {
		main: "bg-text-faint ring ring-text-faint text-text hover:bg-surface-hover",
		outline: "ring ring-text-faint  text-text-faint hover:bg-text-faint hover:text-text-inverse",
		text: "text-text-faint hover:bg-text-faint/15 hover:text-text-faint-hover",
	},
	danger: {
		main: "bg-error ring ring-error text-text-inverse hover:bg-error-hover",
		outline: "ring ring-error text-error hover:bg-error hover:text-text-inverse",
		text: "text-error hover:bg-error/15 hover:text-error-hover",
	},
	success: {
		main: "bg-success ring ring-success text-text-inverse hover:bg-success-hover",
		outline: "border border-success text-success hover:bg-success hover:text-text-inverse",
		text: "text-success hover:bg-success/15 hover:text-success-hover",
	},
};

export function Button({ children, href, target, className, color = "primary", variant = "main", ...props }: ButtonProps) {
	const cls = joinClass(base, colors[color][variant], className);
	if (href)
		return (
			<Link {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)} href={href} target={target} rel="noopener noreferrer" className={cls}>
				{children}
			</Link>
		);

	return (
		<button {...props} className={cls}>
			{children}
		</button>
	);
}

export const PrimaryButton = (p: Omit<ButtonProps, "color">) => <Button {...p} color="primary" />;
export const SecondaryButton = (p: Omit<ButtonProps, "color">) => <Button {...p} color="secondary" />;
export const SurfaceButton = (p: Omit<ButtonProps, "color">) => <Button {...p} color="surface" />;
export const GhostButton = (p: Omit<ButtonProps, "color">) => <Button {...p} color="ghost" />;
export const DangerButton = (p: Omit<ButtonProps, "color">) => <Button {...p} color="danger" />;
export const SuccessButton = (p: Omit<ButtonProps, "color">) => <Button {...p} color="success" />;

export function AdvancedFilterButton({ onClick, filterCount }: { onClick: () => void; filterCount: number }) {
	return (
		<GhostButton
			variant="outline"
			onClick={onClick}
			className={joinClass("h-9 border-border", filterCount ? "border-primary text-primary" : "border-border text-text-muted")}
			aria-label="Advanced filters"
		>
			<SlidersHorizontal size={17} aria-hidden="true" />
			Filter{filterCount ? ` (${filterCount})` : ""}
		</GhostButton>
	);
}

export function IconButton({ icon, label, pressed, className, ...props }: IconButtonProps) {
	return (
		<button
			type="button"
			{...props}
			aria-label={label}
			aria-pressed={pressed}
			className={joinClass(
				"grid size-7 cursor-pointer place-items-center rounded text-text-faint transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50",
				pressed && "text-primary",
				className,
			)}
		>
			{icon}
		</button>
	);
}

export function FloatedSquareButton({ children, className, label, labelClassName, ...props }: FloatedSquareButtonProps) {
	return (
		<div className="relative grid size-12 place-items-center text-xs font-bold">
			<button
				{...props}
				className={joinClass("grid size-12 cursor-pointer place-items-center rounded border transition disabled:cursor-wait disabled:opacity-60", className)}
			>
				{children}
			</button>
			<span className={joinClass("absolute top-full left-1/2 mt-1 -translate-x-1/2 whitespace-nowrap", labelClassName)}>{label}</span>
		</div>
	);
}
