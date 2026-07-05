import { checkPublicPrivacy, shouldHideComments } from "@/lib/util/privacy";

describe("checkPublicPrivacy", () => {
	it("always allows the owner, regardless of privacy level", () => {
		expect(checkPublicPrivacy("private", true, false)).toBe(true);
		expect(checkPublicPrivacy("followers", true, false)).toBe(true);
		expect(checkPublicPrivacy("public", true, false)).toBe(true);
	});

	it("blocks non-owners from private content", () => {
		expect(checkPublicPrivacy("private", false, true)).toBe(false);
		expect(checkPublicPrivacy("private", false, false)).toBe(false);
	});

	it("allows followers-only content only to followers", () => {
		expect(checkPublicPrivacy("followers", false, true)).toBe(true);
		expect(checkPublicPrivacy("followers", false, false)).toBe(false);
	});

	it("defaults to public for any other privacy value", () => {
		expect(checkPublicPrivacy("public", false, false)).toBe(true);
		expect(checkPublicPrivacy(null, false, false)).toBe(true);
		expect(checkPublicPrivacy(undefined, false, false)).toBe(true);
	});
});

describe("shouldHideComments", () => {
	it("hides comments when the user opted out globally", () => {
		expect(shouldHideComments({ hideCommentsEverywhere: true })).toBe(true);
	});

	it("shows comments by default", () => {
		expect(shouldHideComments({ hideCommentsEverywhere: false })).toBe(false);
		expect(shouldHideComments(null)).toBe(false);
		expect(shouldHideComments(undefined)).toBe(false);
	});
});
