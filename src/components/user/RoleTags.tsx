import { joinClass } from "@/app/_util/func";
import { type UserRole } from "@/lib/generated/prisma/enums";

const roleClasses: Record<UserRole, string> = {
	ADMIN: "border-error/40 bg-error/15 text-error",
	STAFF: "border-primary/40 bg-primary/15 text-primary",
	VIP: "border-secondary/40 bg-secondary/15 text-secondary",
};

export default function RoleTags({ roles }: Readonly<{ roles?: UserRole[] | null }>) {
	if (!roles?.length) return null;

	return (
		<span className="flex flex-wrap items-center gap-1">
			{roles.map((role) => (
				<span key={role} className={joinClass("rounded border px-1.5 py-0.5 text-[0.65rem] font-bold", roleClasses[role])}>
					{role}
				</span>
			))}
		</span>
	);
}
