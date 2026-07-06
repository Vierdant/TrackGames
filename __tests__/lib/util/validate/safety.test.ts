import { isSafeLinkHref, isSafeUrl, isVideoUrl } from "@/lib/util/validate/safety";

describe("isSafeUrl", () => {
	it("accepts any https URL", () => {
		expect(isSafeUrl("https://i.imgur.com/abc.png")).toBe(true);
		expect(isSafeUrl("https://t3.ftcdn.net/jpg/03/66/76/96/img.jpg")).toBe(true);
	});

	it("rejects an http URL", () => {
		expect(isSafeUrl("http://i.imgur.com/abc.png")).toBe(false);
	});

	it("rejects non-https protocols", () => {
		expect(isSafeUrl("javascript:alert(1)")).toBe(false);
		expect(isSafeUrl("data:image/png;base64,AAAA")).toBe(false);
	});

	it("rejects non-string input", () => {
		expect(isSafeUrl(null)).toBe(false);
		expect(isSafeUrl(undefined)).toBe(false);
		expect(isSafeUrl(42)).toBe(false);
	});

	it("rejects unparsable strings", () => {
		expect(isSafeUrl("not a url")).toBe(false);
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
