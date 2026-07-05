import { X } from "lucide-react";

type RemovableChipProps = Readonly<{ variant: "include" | "exclude"; onRemove: () => void; children: React.ReactNode; isCapitalized?: boolean }>;

export default function RemovableChip({ variant, onRemove, children, isCapitalized }: RemovableChipProps) {
	const colorClasses = variant === "include" ? "border-primary/60 bg-primary/10 text-primary" : "border-error/60 bg-error/10 text-error";
	return (
		<button
			type="button"
			onClick={onRemove}
			className={`flex max-w-full cursor-pointer items-center gap-1 rounded border px-2 py-1 text-xs font-bold ${colorClasses} ${isCapitalized ? "capitalize" : ""}`}
		>
			<span className="truncate">{children}</span>
			<X size={13} aria-hidden="true" />
		</button>
	);
}
