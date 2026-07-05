import { fireEvent, render, screen } from "@testing-library/react";
import StarRating from "@/components/game/StarRating";

describe("StarRating", () => {
	it("renders a non-interactive rating with an accessible label", () => {
		render(<StarRating rating={3.5} />);
		expect(screen.getByLabelText("Rating 3.5 out of 5")).toBeInTheDocument();
		expect(screen.queryAllByRole("button")).toHaveLength(0);
	});

	it("shows 'No rating' label when rating is null", () => {
		render(<StarRating rating={null} />);
		expect(screen.getByLabelText("No rating")).toBeInTheDocument();
	});

	it("shows the numeric value when shouldShowValue is set", () => {
		render(<StarRating rating={4} shouldShowValue />);
		expect(screen.getByText("4.0")).toBeInTheDocument();
	});

	it("renders 5 buttons and a hidden input when interactive", () => {
		render(<StarRating rating={2} isInteractive name="rating" />);
		const buttons = screen.getAllByRole("button");
		expect(buttons).toHaveLength(5);
		expect(document.querySelector('input[type="hidden"][name="rating"]')).toHaveValue("2");
	});

	it("gives every interactive star its own accessible name", () => {
		render(<StarRating rating={0} isInteractive />);
		for (let star = 1; star <= 5; star += 1) {
			expect(screen.getByRole("button", { name: `${star} star rating` })).toHaveAccessibleName(`${star} star rating`);
		}
	});

	it("calls onChange with the clicked star value", () => {
		const onChange = jest.fn();
		render(<StarRating rating={0} isInteractive onChange={onChange} />);
		const thirdStar = screen.getByRole("button", { name: "3 star rating" });

		jest.spyOn(thirdStar, "getBoundingClientRect").mockReturnValue({
			left: 0,
			width: 12,
			right: 12,
			top: 0,
			bottom: 12,
			height: 12,
			x: 0,
			y: 0,
			toJSON: () => {},
		});

		fireEvent.click(thirdStar, { clientX: 11 });
		expect(onChange).toHaveBeenCalledWith(3);
	});

	it("clears the rating when clicking the already-selected value", () => {
		const onChange = jest.fn();
		render(<StarRating rating={1} isInteractive onChange={onChange} />);
		const firstStar = screen.getByRole("button", { name: "1 star rating" });

		jest.spyOn(firstStar, "getBoundingClientRect").mockReturnValue({
			left: 0,
			width: 12,
			right: 12,
			top: 0,
			bottom: 12,
			height: 12,
			x: 0,
			y: 0,
			toJSON: () => {},
		});

		fireEvent.click(firstStar, { clientX: 11 });
		expect(onChange).toHaveBeenCalledWith(0);
	});
});
