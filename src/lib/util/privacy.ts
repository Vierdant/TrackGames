import type { UserModel } from "@/lib/generated/prisma/models/User";

/** Whether a viewer may see content at the given privacy level (`private` / `followers` / public). */
export function checkPublicPrivacy(privacy: string | null | undefined, isOwner: boolean, isFollower: boolean) {
	if (isOwner) return true;
	if (privacy === "private") return false;
	if (privacy === "followers") return isFollower;
	return true;
}

/** Whether the viewer has globally hidden comments across the site. */
export function shouldHideComments(user?: Pick<UserModel, "hideCommentsEverywhere"> | null) {
	return Boolean(user?.hideCommentsEverywhere);
}
