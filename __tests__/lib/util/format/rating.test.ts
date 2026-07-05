import { ratingToFive, ratingToHundred } from "@/lib/util/format/rating";

describe("ratingToFive", () => {
	it("converts a 0-100 rating to a 0-5 scale", () => {
		expect(ratingToFive(100)).toBe(5);
		expect(ratingToFive(50)).toBe(2.5);
		expect(ratingToFive(0)).toBe(0);
	});

	it("clamps out-of-range values", () => {
		expect(ratingToFive(200)).toBe(5);
		expect(ratingToFive(-50)).toBe(0);
	});

	it("returns undefined for null or undefined", () => {
		expect(ratingToFive(null)).toBeUndefined();
		expect(ratingToFive(undefined)).toBeUndefined();
	});
});

describe("ratingToHundred", () => {
	it("converts a 0-5 rating to a 0-100 scale", () => {
		expect(ratingToHundred(5)).toBe(100);
		expect(ratingToHundred(2.5)).toBe(50);
		expect(ratingToHundred(0)).toBe(0);
	});

	it("clamps out-of-range values", () => {
		expect(ratingToHundred(10)).toBe(100);
		expect(ratingToHundred(-1)).toBe(0);
	});

	it("returns undefined for null or undefined", () => {
		expect(ratingToHundred(null)).toBeUndefined();
		expect(ratingToHundred(undefined)).toBeUndefined();
	});

	it("round-trips through both conversions", () => {
		expect(ratingToHundred(ratingToFive(80))).toBe(80);
	});
});
