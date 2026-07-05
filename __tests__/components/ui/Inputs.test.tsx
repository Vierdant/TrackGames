import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Checkbox, Field, Input, Select, SuffixedInput, Textarea } from "@/components/ui/Inputs";

describe("Field", () => {
	it("renders label, children and optional hint", () => {
		render(
			<Field label="Email" hint="We never share this">
				<input aria-label="Email" />
			</Field>,
		);
		expect(screen.getByText("Email")).toBeInTheDocument();
		expect(screen.getByText("We never share this")).toBeInTheDocument();
		expect(screen.getByLabelText("Email")).toBeInTheDocument();
		expect(screen.getByLabelText("Email")).toBeVisible();
	});
});

describe("Input", () => {
	it("forwards ref and accepts user input", () => {
		const ref = createRef<HTMLInputElement>();
		render(<Input ref={ref} aria-label="Username" />);
		const input = screen.getByLabelText("Username");
		expect(ref.current).toBe(input);

		fireEvent.change(input, { target: { value: "vierdant" } });
		expect(input).toHaveValue("vierdant");
	});
});

describe("SuffixedInput", () => {
	it("renders the suffix and disables the input when disabled", () => {
		render(<SuffixedInput aria-label="Price" suffix="USD" disabled />);
		expect(screen.getByText("USD")).toBeInTheDocument();
		expect(screen.getByLabelText("Price")).toBeDisabled();
	});

	it("is enabled by default", () => {
		render(<SuffixedInput aria-label="Price" suffix="USD" />);
		expect(screen.getByLabelText("Price")).toBeEnabled();
	});
});

describe("Textarea", () => {
	it("accepts multiline input", () => {
		render(<Textarea aria-label="Bio" />);
		const textarea = screen.getByLabelText("Bio");
		fireEvent.change(textarea, { target: { value: "line one\nline two" } });
		expect(textarea).toHaveValue("line one\nline two");
	});
});

describe("Select", () => {
	it("fires onChange with the selected value", () => {
		const onChange = jest.fn();
		render(
			<Select aria-label="Status" onChange={onChange} defaultValue="playing">
				<option value="playing">Playing</option>
				<option value="completed">Completed</option>
			</Select>,
		);
		fireEvent.change(screen.getByLabelText("Status"), { target: { value: "completed" } });
		expect(onChange).toHaveBeenCalledTimes(1);
	});
});

describe("Checkbox", () => {
	it("defaults to type checkbox and toggles", () => {
		render(<Checkbox aria-label="Accept terms" />);
		const checkbox = screen.getByLabelText("Accept terms") as HTMLInputElement;
		expect(checkbox).toHaveAttribute("type", "checkbox");
		fireEvent.click(checkbox);
		expect(checkbox.checked).toBe(true);
	});

	it("is disableable and keeps its accessible name", () => {
		render(<Checkbox aria-label="Accept terms" disabled />);
		const checkbox = screen.getByRole("checkbox", { name: "Accept terms" });
		expect(checkbox).toBeDisabled();
		expect(checkbox).toHaveAccessibleName("Accept terms");
	});
});
