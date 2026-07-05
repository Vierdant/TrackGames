import { chunked, filterNumber, formatNumber, matchesNumberRange } from "@/lib/util/format/numbers";

describe("formatNumber", () => {
	it("formats large numbers compactly", () => {
		expect(formatNumber(1500)).toBe("1.5K");
		expect(formatNumber(2_000_000)).toBe("2M");
	});

	it("formats small numbers as-is", () => {
		expect(formatNumber(42)).toBe("42");
	});
});

describe("filterNumber", () => {
	it("returns null for an empty string", () => {
		expect(filterNumber("")).toBeNull();
	});

	it("parses numeric strings", () => {
		expect(filterNumber("3.5")).toBe(3.5);
	});

	it("returns null for non-numeric strings", () => {
		expect(filterNumber("not a number")).toBeNull();
	});
});

describe("matchesNumberRange", () => {
	it("matches when both bounds are null", () => {
		expect(matchesNumberRange(50, null, null)).toBe(true);
	});

	it("respects the minimum bound", () => {
		expect(matchesNumberRange(5, 10, null)).toBe(false);
		expect(matchesNumberRange(15, 10, null)).toBe(true);
	});

	it("respects the maximum bound", () => {
		expect(matchesNumberRange(15, null, 10)).toBe(false);
		expect(matchesNumberRange(5, null, 10)).toBe(true);
	});

	it("respects both bounds together", () => {
		expect(matchesNumberRange(5, 1, 10)).toBe(true);
		expect(matchesNumberRange(0, 1, 10)).toBe(false);
		expect(matchesNumberRange(11, 1, 10)).toBe(false);
	});
});

describe("chunked", () => {
	it("processes items in chunks of the given size, in order", async () => {
		const seen: number[][] = [];
		await chunked([1, 2, 3, 4, 5], 2, async (chunk) => {
			seen.push(chunk);
		});

		expect(seen).toEqual([[1, 2], [3, 4], [5]]);
	});

	it("does nothing for an empty list", async () => {
		const fn = jest.fn();
		await chunked([], 2, fn);
		expect(fn).not.toHaveBeenCalled();
	});
});
