import * as normalize from "@/lib/util/validate/normalize";

describe("clamp", () => {
	it("clamps below the minimum", () => {
		expect(normalize.clamp(-5, 0, 10)).toBe(0);
	});

	it("clamps above the maximum", () => {
		expect(normalize.clamp(15, 0, 10)).toBe(10);
	});

	it("keeps values already in range", () => {
		expect(normalize.clamp(5, 0, 10)).toBe(5);
	});
});

describe("integer", () => {
	it("parses numeric strings", () => {
		expect(normalize.integer("42")).toBe(42);
	});

	it("returns fallback for non-integer input", () => {
		expect(normalize.integer("not a number", { fallback: 7 })).toBe(7);
		expect(normalize.integer(3.5, { fallback: 7 })).toBe(7);
	});

	it("clamps within min/max", () => {
		expect(normalize.integer(100, { min: 0, max: 10 })).toBe(10);
		expect(normalize.integer(-100, { min: 0, max: 10 })).toBe(0);
	});
});

describe("boolean", () => {
	it("passes through real booleans", () => {
		expect(normalize.boolean(true)).toBe(true);
		expect(normalize.boolean(false)).toBe(false);
	});

	it.each(["true", "1", "yes", "on", "TRUE"])("treats %s as true", (value) => {
		expect(normalize.boolean(value)).toBe(true);
	});

	it.each(["false", "0", "no", "off"])("treats %s as false", (value) => {
		expect(normalize.boolean(value)).toBe(false);
	});

	it("falls back for unrecognized strings", () => {
		expect(normalize.boolean("maybe", true)).toBe(true);
		expect(normalize.boolean("maybe", false)).toBe(false);
	});

	it("falls back for non-string, non-boolean input", () => {
		expect(normalize.boolean(null, true)).toBe(true);
		expect(normalize.boolean(undefined)).toBe(false);
	});
});

describe("choice", () => {
	const options = ["grid", "list"] as const;

	it("returns a matching choice, case-insensitively", () => {
		expect(normalize.choice("GRID", options)).toBe("grid");
	});

	it("falls back when not in the choices", () => {
		expect(normalize.choice("table", options, "grid")).toBe("grid");
	});

	it("falls back for non-string input", () => {
		expect(normalize.choice(42, options, "list")).toBe("list");
	});
});

describe("hexColor", () => {
	it("accepts a valid six-digit hex color", () => {
		expect(normalize.hexColor("#ABCDEF")).toBe("#ABCDEF");
	});

	it("rejects malformed hex colors and returns the fallback", () => {
		expect(normalize.hexColor("#ABC")).toBe("#7B5CDB");
		expect(normalize.hexColor("not-a-color")).toBe("#7B5CDB");
		expect(normalize.hexColor(123)).toBe("#7B5CDB");
	});

	it("supports a custom fallback", () => {
		expect(normalize.hexColor(null, "#000000")).toBe("#000000");
	});
});

describe("byKey / byKeys / value / label", () => {
	const items = [
		{ id: "a", name: "Alpha" },
		{ id: "b", name: "Beta" },
	];

	it("byKey finds the first matching item", () => {
		expect(normalize.byKey(items, "id", "b")).toEqual({ id: "b", name: "Beta" });
	});

	it("byKey returns undefined when nothing matches", () => {
		expect(normalize.byKey(items, "id", "z")).toBeUndefined();
	});

	it("byKeys matches on multiple fields", () => {
		expect(normalize.byKeys(items, { id: "a", name: "Alpha" })).toEqual({ id: "a", name: "Alpha" });
		expect(normalize.byKeys(items, { id: "a", name: "Beta" })).toBeUndefined();
	});

	it("value resolves the canonical stored value or falls back", () => {
		expect(normalize.value("b", items, "id", "a")).toBe("b");
		expect(normalize.value("z", items, "id", "a")).toBe("a");
	});

	it("label resolves a display label or falls back", () => {
		expect(normalize.label(items, "id", "name", "a", "Unknown")).toBe("Alpha");
		expect(normalize.label(items, "id", "name", "z", "Unknown")).toBe("Unknown");
	});
});
