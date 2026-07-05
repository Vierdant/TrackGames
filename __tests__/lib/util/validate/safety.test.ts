import { isSafeLinkHref, isSafeUrl, isVideoUrl } from "@/lib/util/validate/safety";

describe("isSafeUrl", () => {
	it("accepts an https URL on an allow-listed host", () => {
		expect(isSafeUrl("https://i.imgur.com/abc.png")).toBe(true);
	});

	it("rejects an http URL even on an allow-listed host", () => {
		expect(isSafeUrl("http://i.imgur.com/abc.png")).toBe(false);
	});

	it("rejects a host not on the allow list", () => {
		expect(isSafeUrl("https://evil.example.com/abc.png")).toBe(false);
	});

	it("rejects a host that merely contains an allowed host as a substring", () => {
		expect(isSafeUrl("https://i.imgur.com.evil.com/abc.png")).toBe(false);
	});

	it("rejects non-string input", () => {
		expect(isSafeUrl(null)).toBe(false);
		expect(isSafeUrl(undefined)).toBe(false);
		expect(isSafeUrl(42)).toBe(false);
	});

	it("rejects unparsable strings", () => {
		expect(isSafeUrl("not a url")).toBe(false);
	});

	it("is case-insensitive on the hostname", () => {
		expect(isSafeUrl("https://I.IMGUR.COM/abc.png")).toBe(true);
	});
});

describe("isSafeLinkHref", () => {
	it("accepts absolute https links", () => {
		expect(isSafeLinkHref("https://example.com/page")).toBe(true);
	});

	it("rejects absolute http links", () => {
		expect(isSafeLinkHref("http://example.com/page")).toBe(false);
	});

	it("accepts same-site relative paths", () => {
		expect(isSafeLinkHref("/settings")).toBe(true);
	});

	it("rejects protocol-relative URLs (host spoofing vector)", () => {
		expect(isSafeLinkHref("//evil.example.com/page")).toBe(false);
	});

	it("rejects javascript: URLs", () => {
		expect(isSafeLinkHref("javascript:alert(1)")).toBe(false);
	});

	it("rejects non-string input", () => {
		expect(isSafeLinkHref(null)).toBe(false);
		expect(isSafeLinkHref(123)).toBe(false);
	});
});

describe("isVideoUrl", () => {
	it.each(["clip.mp4", "clip.webm", "clip.ogg"])("recognizes %s as a video", (path) => {
		expect(isVideoUrl(path)).toBe(true);
	});

	it("recognizes video extensions ignoring query strings", () => {
		expect(isVideoUrl("https://cdn.example.com/clip.mp4?token=abc")).toBe(true);
	});

	it("is case-insensitive", () => {
		expect(isVideoUrl("clip.MP4")).toBe(true);
	});

	it("rejects non-video files", () => {
		expect(isVideoUrl("image.png")).toBe(false);
	});
});
