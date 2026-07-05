import { NotificationType } from "@/lib/generated/prisma/enums";
import { defaultActivityFilter, defaultLibraryFilters, notificationAllowed } from "@/lib/util/preferences";

describe("notificationAllowed", () => {
	const allEnabled = {
		notifyCommentReplies: true,
		notifyProfileComments: true,
		notifyLikes: true,
		notifyFollows: true,
		notifyFollowerLists: true,
		notifyBadges: true,
	};

	it.each([
		[NotificationType.COMMENT_REPLY, "notifyCommentReplies"],
		[NotificationType.COMMENTED_ON_PROFILE, "notifyProfileComments"],
		[NotificationType.RECEIVED_LIKE, "notifyLikes"],
		[NotificationType.FOLLOWED_USER, "notifyFollows"],
		[NotificationType.FOLLOWING_CREATED_LIST, "notifyFollowerLists"],
		[NotificationType.EARNED_BADGE, "notifyBadges"],
	] as const)("respects the %s preference flag (%s)", (type, flag) => {
		expect(notificationAllowed({ ...allEnabled, [flag]: true }, type)).toBe(true);
		expect(notificationAllowed({ ...allEnabled, [flag]: false }, type)).toBe(false);
	});

	it("defaults to allowed for unmapped notification types", () => {
		const otherTypes = Object.values(NotificationType).filter(
			(type) =>
				![
					NotificationType.COMMENT_REPLY,
					NotificationType.COMMENTED_ON_PROFILE,
					NotificationType.RECEIVED_LIKE,
					NotificationType.FOLLOWED_USER,
					NotificationType.FOLLOWING_CREATED_LIST,
					NotificationType.EARNED_BADGE,
				].includes(type),
		);

		for (const type of otherTypes) {
			expect(notificationAllowed(allEnabled, type)).toBe(true);
		}
	});
});

describe("defaultLibraryFilters", () => {
	it("maps user preferences to filter defaults", () => {
		expect(
			defaultLibraryFilters({
				defaultGameListStatus: "playing",
				defaultGameListSort: "rating",
				defaultGameListView: "list",
			}),
		).toEqual({ status: "playing", sort: "rating", mode: "list" });
	});

	it("falls back to grid mode for any non-list view value", () => {
		expect(
			defaultLibraryFilters({
				defaultGameListStatus: "all",
				defaultGameListSort: "added",
				defaultGameListView: "grid",
			}).mode,
		).toBe("grid");

		expect(
			defaultLibraryFilters({
				defaultGameListStatus: "all",
				defaultGameListSort: "added",
				defaultGameListView: "unexpected",
			}).mode,
		).toBe("grid");
	});
});

describe("defaultActivityFilter", () => {
	it("returns the stored preference when present", () => {
		expect(defaultActivityFilter({ defaultActivityFilter: "friends" })).toBe("friends");
	});

	it("falls back to 'all' when empty", () => {
		expect(defaultActivityFilter({ defaultActivityFilter: "" })).toBe("all");
	});
});
