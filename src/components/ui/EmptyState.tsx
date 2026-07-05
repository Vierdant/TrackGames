import type { LucideIcon } from "lucide-react";

type EmptyStateProps = Readonly<{ icon: LucideIcon; message: string }>;

export default function EmptyState({ icon: Icon, message }: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center gap-2 rounded p-6 text-center text-sm text-text-muted">
			<Icon size={28} aria-hidden="true" className="opacity-60" />
			<p>{message}</p>
		</div>
	);
}
