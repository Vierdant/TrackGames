import { redirect } from "next/navigation";
import GateForm from "@/app/(admin)/dashboard/gate/GateForm";
import { requireAdminForGate } from "@/lib/admin/guard";

export default async function AdminGatePage() {
	const { admin, alreadyVerified } = await requireAdminForGate();
	if (alreadyVerified) redirect("/dashboard");

	return (
		<div className="mx-auto flex max-w-md flex-col gap-5 rounded border border-border bg-bg-secondary/40 p-8">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold">Admin access</h1>
				<p className="text-sm text-text-muted">
					Signed in as <span className="font-bold text-text">{admin.name}</span>. Confirm your password to continue.
				</p>
			</div>
			<GateForm />
		</div>
	);
}
