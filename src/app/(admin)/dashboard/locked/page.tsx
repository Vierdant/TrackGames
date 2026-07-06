import { ShieldAlert } from "lucide-react";
import { GhostButton } from "@/components/ui/control/Button";
import { requireAdminForGate } from "@/lib/admin/guard";

// requireAdminForGate confirms the visitor is actually an admin; loadAdmin sends
// password-less admins here in the first place, so we just show the instruction.
export default async function AdminLockedPage() {
	await requireAdminForGate();

	return (
		<div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded border border-border bg-bg-secondary/40 p-8 text-center">
			<ShieldAlert size={40} className="text-error" aria-hidden="true" />
			<h1 className="text-2xl font-bold">Password required</h1>
			<p className="text-sm text-text-muted">
				Admin accounts must have a password set. You signed in with a social provider only. Add a password to your account, then return here.
			</p>
			<GhostButton variant="outline" href="/settings?tab=account">
				Go to account settings
			</GhostButton>
		</div>
	);
}
