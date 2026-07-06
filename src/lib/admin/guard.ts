import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { UserRole } from "@/lib/generated/prisma/enums";

export const ADMIN_REAUTH_COOKIE = "trackgames-admin-reauth";
export const ADMIN_REAUTH_TTL_MS = 30 * 60 * 1000;

function secret() {
	const value = process.env.AUTH_SECRET;
	if (!value) throw new Error("AUTH_SECRET is required for admin reauth.");
	return value;
}

/** Builds a tamper-proof cookie value binding an admin session to an expiry. */
export function signReauth(userId: string, expiresAt: number) {
	const payload = `${userId}.${expiresAt}`;
	const sig = createHmac("sha256", secret()).update(payload).digest("hex");
	return `${payload}.${sig}`;
}

/** Returns the userId if the cookie is authentic and unexpired, else null. */
export function verifyReauth(value: string): string | null {
	const parts = value.split(".");
	if (parts.length !== 3) return null;

	const [userId, expiresRaw, sig] = parts;
	const expected = createHmac("sha256", secret()).update(`${userId}.${expiresRaw}`).digest("hex");

	const sigBuffer = Buffer.from(sig, "hex");
	const expectedBuffer = Buffer.from(expected, "hex");
	if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) return null;

	const expiresAt = Number(expiresRaw);
	if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return null;

	return userId;
}

// Session + ADMIN role + password requirement — the checks shared by the gate and the dashboard.
// Redirects (which throw) on any failure, so callers can trust the returned admin.
async function loadAdmin() {
	const session = await auth();
	if (!session?.user?.id) redirect("/login");

	const user = await db.user.findUnique({
		where: { id: session.user.id },
		select: { id: true, name: true, image: true, roles: true, passwordHash: true },
	});

	// Neutral redirect for non-admins — don't reveal the area exists.
	if (!user || !user.roles.includes(UserRole.ADMIN)) redirect("/");
	if (!user.passwordHash) redirect("/dashboard/locked");

	return user;
}

/** Full guard for every admin page and every admin server action. */
export async function requireAdmin() {
	const admin = await loadAdmin();
	const value = (await cookies()).get(ADMIN_REAUTH_COOKIE)?.value;
	if (!value || verifyReauth(value) !== admin.id) redirect("/dashboard/gate");
	return admin;
}

/** Gate-only check: verifies admin eligibility without requiring a fresh reauth cookie. */
export async function requireAdminForGate() {
	const admin = await loadAdmin();
	const value = (await cookies()).get(ADMIN_REAUTH_COOKIE)?.value;
	return { admin, alreadyVerified: Boolean(value && verifyReauth(value) === admin.id) };
}
