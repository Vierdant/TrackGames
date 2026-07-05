import { fireEvent, render, screen } from "@testing-library/react";
import { AdvancedFilterButton, Button, FloatedSquareButton, IconButton } from "@/components/ui/control/Button";

describe("Button", () => {
	it("renders a button element by default", () => {
		render(<Button>Click me</Button>);
		expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
	});

	it("renders a link when href is provided", () => {
		render(<Button href="/games">Browse</Button>);
		const link = screen.getByRole("link", { name: "Browse" });
		expect(link).toHaveAttribute("href", "/games");
	});

	it("fires onClick when clicked", () => {
		const onClick = jest.fn();
		render(<Button onClick={onClick}>Click me</Button>);
		fireEvent.click(screen.getByRole("button", { name: "Click me" }));
		expect(onClick).toHaveBeenCalledTimes(1);
	});
});

describe("IconButton", () => {
	it("exposes accessible label and pressed state", () => {
		render(<IconButton icon={<span />} label="Toggle password" pressed />);
		const button = screen.getByRole("button", { name: "Toggle password" });
		expect(button).toHaveAccessibleName("Toggle password");
		expect(button).toHaveAttribute("aria-pressed", "true");
	});

	it("omits aria-pressed when not a toggle button", () => {
		render(<IconButton icon={<span />} label="Toggle" />);
		expect(screen.getByRole("button", { name: "Toggle" })).not.toHaveAttribute("aria-pressed");
	});

	it("disables click handling when disabled", () => {
		const onClick = jest.fn();
		render(<IconButton icon={<span />} label="Toggle" disabled onClick={onClick} />);
		const button = screen.getByRole("button", { name: "Toggle" });
		expect(button).toBeDisabled();
		fireEvent.click(button);
		expect(onClick).not.toHaveBeenCalled();
	});
});

describe("AdvancedFilterButton", () => {
	it("shows no count when filterCount is zero", () => {
		render(<AdvancedFilterButton onClick={jest.fn()} filterCount={0} />);
		expect(screen.getByRole("button", { name: "Advanced filters" })).toHaveTextContent("Filter");
		expect(screen.getByRole("button", { name: "Advanced filters" })).not.toHaveTextContent("Filter (");
	});

	it("shows the count when filters are active", () => {
		render(<AdvancedFilterButton onClick={jest.fn()} filterCount={3} />);
		expect(screen.getByRole("button", { name: "Advanced filters" })).toHaveTextContent("Filter (3)");
	});

	it("calls onClick when pressed", () => {
		const onClick = jest.fn();
		render(<AdvancedFilterButton onClick={onClick} filterCount={0} />);
		fireEvent.click(screen.getByRole("button", { name: "Advanced filters" }));
		expect(onClick).toHaveBeenCalledTimes(1);
	});
});

describe("FloatedSquareButton", () => {
	it("renders label text alongside the button", () => {
		render(
			<FloatedSquareButton label="Add" aria-label="Add to library">
				+
			</FloatedSquareButton>,
		);
		expect(screen.getByRole("button", { name: "Add to library" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Add to library" })).toHaveAccessibleName("Add to library");
		expect(screen.getByText("Add")).toBeInTheDocument();
	});
});
