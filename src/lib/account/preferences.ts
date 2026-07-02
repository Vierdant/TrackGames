import { NotificationType } from "../generated/prisma/enums";
import type { UserModel } from "../generated/prisma/models/User";
import { hexColor } from "../util/normalize";
import { profileThemeStyle } from "./user";

export function viewerThemeStyle(user: Pick<UserModel, "profileColor" | "accentColor" | "siteThemeMode" | "siteThemeColor" | "siteAccentColor">) {
	if (user.siteThemeMode === "custom") {
		return profileThemeStyle(hexColor(user.siteThemeColor, "#7b5cdb"), hexColor(user.siteAccentColor, "#b8842f"));
	}

	if (user.siteThemeMode === "default") {
		return undefined;
	}

	return profileThemeStyle(user.profileColor, user.accentColor);
}

export function shouldHideComments(user?: Pick<UserModel, "hideCommentsEverywhere"> | null) {
	return Boolean(user?.hideCommentsEverywhere);
}

export function notificationAllowed(
	user: Pick<UserModel, "notifyCommentReplies" | "notifyProfileComments" | "notifyLikes" | "notifyFollows" | "notifyFollowerLists" | "notifyBadges">,
	type: NotificationType,
) {
	if (type === NotificationType.COMMENT_REPLY) return user.notifyCommentReplies;
	if (type === NotificationType.COMMENTED_ON_PROFILE) return user.notifyProfileComments;
	if (type === NotificationType.RECEIVED_LIKE) return user.notifyLikes;
	if (type === NotificationType.FOLLOWED_USER) return user.notifyFollows;
	if (type === NotificationType.FOLLOWING_CREATED_LIST) return user.notifyFollowerLists;
	if (type === NotificationType.EARNED_BADGE) return user.notifyBadges;
	return true;
}

export function defaultLibraryFilters(user: Pick<UserModel, "defaultGameListStatus" | "defaultGameListSort" | "defaultGameListView">) {
	return {
		status: user.defaultGameListStatus,
		sort: user.defaultGameListSort,
		mode: user.defaultGameListView === "list" ? ("list" as const) : ("grid" as const),
	};
}

export function defaultActivityFilter(user: Pick<UserModel, "defaultActivityFilter">) {
	return user.defaultActivityFilter || "all";
}
