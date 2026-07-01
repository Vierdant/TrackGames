import { CSSProperties } from "react";
import db from "../db";
import type { UserGetPayload } from "../generated/prisma/models/User";
import type { PublicUser } from "../types";
import { hexColor } from "../util/normalize";

type SessionUserRef = {
	id?: string;
	email?: string | null;
	name?: string | null;
	image?: string | null;
};

export type SecuredUser = UserGetPayload<{ omit: { passwordHash: true } }>;

export async function getUser(sessionUser: SessionUserRef | undefined): Promise<SecuredUser | null> {
	if (!sessionUser) return null;

	return await db.user.findFirst({
		where: {
			OR: [
				sessionUser.id ? { id: sessionUser.id } : undefined,
				sessionUser.email ? { email: sessionUser.email } : undefined,
				sessionUser.name ? { name: sessionUser.name } : undefined,
			].filter(Boolean) as { id?: string; email?: string; name?: string }[],
		},
		omit: {
			passwordHash: true,
		},
	});
}

export async function hasUserPassword(email: string): Promise<boolean> {
	const user = await db.user.findFirst({
		where: {
			email,
		},
		select: {
			passwordHash: true,
		},
	});

	return user?.passwordHash != undefined;
}

export async function getUserProviders(userId: string) {
	return await db.account.findMany({
		where: {
			userId,
		},
		select: {
			provider: true,
		},
	});
}

export async function getPublicUser(name: string): Promise<PublicUser | null> {
	const user = await db.user.findFirst({
		where: { name },
		select: {
			id: true,
			name: true,
			image: true,
			background: true,
			bio: true,
			profileColor: true,
			accentColor: true,
			privacy: true,
			libraryPrivacy: true,
			logsPrivacy: true,
			activityPrivacy: true,
			playlistPrivacy: true,
			socials: true,
			widgets: true,
			commentsHidden: true,
			hideCommentsEverywhere: true,
			roles: true,
			createdAt: true,
		},
	});

	return user as PublicUser;
}

export function checkPublicPrivacy(privacy: string | null | undefined, isOwner: boolean, isFollower: boolean) {
	if (isOwner) return true;
	if (privacy === "private") return false;
	if (privacy === "followers") return isFollower;
	return true;
}

export async function isFollower(sessionUserId: string | undefined, userId: string | undefined): Promise<boolean> {
	if (!sessionUserId || !userId) return false;
	if (sessionUserId === userId) return true;

	return !!(await db.userFollow.findUnique({
		where: {
			followerId_followingId: {
				followerId: sessionUserId,
				followingId: userId,
			},
		},
		select: {
			id: true,
		},
	}));
}

export function profileThemeStyle(profileColor: string | null | undefined, accentColor: string | null | undefined) {
	const style: CSSProperties & Record<string, string> = {};
	const primary = hexColor(profileColor, "#7b5cdb");
	const secondary = hexColor(accentColor, "#b8842f");

	style["--primary"] = primary;
	style["--primary-hover"] = `color-mix(in srgb, ${primary} 82%, white)`;
	style["--border-strong"] = primary;

	style["--secondary"] = secondary;
	style["--secondary-hover"] = `color-mix(in srgb, ${secondary} 82%, white)`;

	return style;
}
