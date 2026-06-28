import db from "../db";
import { UserRole } from "../generated/prisma/enums";

export async function userHasRole(userId: string, role: UserRole) {
	const user = await db.user.findUnique({
		where: { id: userId },
		select: { roles: true },
	});

	return Boolean(user?.roles.includes(role));
}

export async function userHasAnyRole(userId: string, roles: UserRole[]) {
	const user = await db.user.findUnique({
		where: { id: userId },
		select: { roles: true },
	});

	return Boolean(user?.roles.some((role) => roles.includes(role)));
}
