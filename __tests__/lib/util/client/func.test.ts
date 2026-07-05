import { formLabel, joinClass, stepIndex } from "@/lib/util/client/func";

describe("joinClass", () => {
	it("joins truthy class names with a space", () => {
		expect(joinClass("a", "b")).toBe("a b");
	});

	it("drops falsy values", () => {
		expect(joinClass("a", false, undefined, null, "b")).toBe("a b");
	});

	it("merges conflicting tailwind utilities, keeping the last", () => {
		expect(joinClass("p-1", "p-2")).toBe("p-2");
	});
});

describe("formLabel", () => {
	it("lowercases and replaces the first underscore with a space", () => {
		expect(formLabel("IN_PROGRESS")).toBe("in progress");
	});

	it("only replaces the first underscore", () => {
		expect(formLabel("A_B_C")).toBe("a b_c");
	});
});

describe("stepIndex", () => {
	it("clamps at the lower bound by default", () => {
		expect(stepIndex(0, -1, 5)).toBe(0);
	});

	it("clamps at the upper bound by default", () => {
		expect(stepIndex(4, 1, 5)).toBe(4);
	});

	it("steps normally within bounds", () => {
		expect(stepIndex(2, 1, 5)).toBe(3);
		expect(stepIndex(2, -1, 5)).toBe(1);
	});

	it("wraps around when mode is wrap", () => {
		expect(stepIndex(4, 1, 5, "wrap")).toBe(0);
		expect(stepIndex(0, -1, 5, "wrap")).toBe(4);
	});
});
