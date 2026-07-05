import { LinkType } from "@/lib/types";
import { getSocialOption, getSocialPlaceholder, getSocialPlatformLabel, isSocialPlatform, parseSocials, serializeSocials } from "@/lib/util/parse/socials";

describe("isSocialPlatform", () => {
	it("recognizes a known platform value", () => {
		expect(isSocialPlatform("x")).toBe(true);
	});

	it("rejects an unknown platform value", () => {
		expect(isSocialPlatform("not-a-real-platform")).toBe(false);
	});
});

describe("getSocialOption / getSocialPlatformLabel / getSocialPlaceholder", () => {
	it("resolves an option by id", () => {
		expect(getSocialOption("x-link")).toBeDefined();
	});

	it("resolves the label for a known platform/kind pair", () => {
		expect(getSocialPlatformLabel("x", LinkType.LINK)).toBe("X (Twitter)");
	});

	it("falls back to the raw value when the platform is unknown", () => {
		expect(getSocialPlatformLabel("not-a-real-platform", LinkType.LINK)).toBe("not-a-real-platform");
	});

	it("gives a generic placeholder for unknown link-type platforms", () => {
		expect(getSocialPlaceholder("not-a-real-platform", LinkType.LINK)).toBe("https://...");
	});

	it("gives a generic placeholder for unknown copy-type platforms", () => {
		expect(getSocialPlaceholder("not-a-real-platform", LinkType.COPY)).toBe("username");
	});
});

describe("parseSocials", () => {
	it("returns an empty array for null or undefined input", () => {
		expect(parseSocials(null)).toEqual([]);
		expect(parseSocials(undefined)).toEqual([]);
	});

	it("returns an empty array for invalid JSON", () => {
		expect(parseSocials("{not json")).toEqual([]);
	});

	it("returns an empty array when the JSON is not an array", () => {
		expect(parseSocials(JSON.stringify({ platform: "x", value: "me" }))).toEqual([]);
	});

	it("drops entries with an unknown platform or non-string value", () => {
		const raw = JSON.stringify([
			{ platform: "not-a-real-platform", value: "me" },
			{ platform: "x", value: 42 },
		]);

		expect(parseSocials(raw)).toEqual([]);
	});

	it("parses valid entries and defaults missing id/kind", () => {
		const raw = JSON.stringify([{ platform: "x", value: "vierdant" }]);
		const [entry] = parseSocials(raw);

		expect(entry.platform).toBe("x");
		expect(entry.value).toBe("vierdant");
		expect(entry.kind).toBe(LinkType.LINK);
		expect(typeof entry.id).toBe("string");
	});

	it("preserves an explicit id and copy kind", () => {
		const raw = JSON.stringify([{ id: "custom-id", platform: "discord", value: "vierdant", kind: LinkType.COPY }]);
		const [entry] = parseSocials(raw);

		expect(entry.id).toBe("custom-id");
		expect(entry.kind).toBe(LinkType.COPY);
	});
});

describe("serializeSocials", () => {
	it("serializes only platform, kind and trimmed value", () => {
		const json = serializeSocials([{ id: "1", platform: "x", kind: LinkType.LINK, value: "  vierdant  " }]);

		expect(JSON.parse(json)).toEqual([{ platform: "x", kind: LinkType.LINK, value: "vierdant" }]);
	});

	it("drops entries that are blank after trimming", () => {
		const json = serializeSocials([{ id: "1", platform: "x", kind: LinkType.LINK, value: "   " }]);

		expect(JSON.parse(json)).toEqual([]);
	});

	it("round-trips through parseSocials", () => {
		const original = [{ id: "1", platform: "x", kind: LinkType.LINK, value: "vierdant" }];
		const parsed = parseSocials(serializeSocials(original));

		expect(parsed).toMatchObject([{ platform: "x", kind: LinkType.LINK, value: "vierdant" }]);
	});
});
