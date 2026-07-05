import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import MenuPanel from "@/components/ui/MenuPanel";

describe("MenuPanel", () => {
	it("renders nothing while closed", () => {
		render(
			<MenuPanel open={false} onClose={jest.fn()} title="Settings">
				content
			</MenuPanel>,
		);
		expect(screen.queryByText("content")).not.toBeInTheDocument();
	});

	it("renders title, children and close button once open", async () => {
		render(
			<MenuPanel open onClose={jest.fn()} title="Settings">
				content
			</MenuPanel>,
		);

		await waitFor(() => expect(screen.getByText("content")).toBeInTheDocument());
		expect(screen.getByText("Settings")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Close" })).toHaveAccessibleName("Close");

		const panel = screen.getAllByRole("dialog").find((element) => element.hasAttribute("aria-modal"));
		expect(panel).toHaveAttribute("aria-modal", "true");
	});

	it("supports a custom close label for accessibility", async () => {
		render(
			<MenuPanel open onClose={jest.fn()} title="Settings" closeLabel="Dismiss dialog">
				content
			</MenuPanel>,
		);

		await waitFor(() => expect(screen.getByText("content")).toBeInTheDocument());
		expect(screen.getByRole("button", { name: "Dismiss dialog" })).toBeInTheDocument();
	});

	it("calls onClose when the close button is clicked", async () => {
		const onClose = jest.fn();
		render(
			<MenuPanel open onClose={onClose} title="Settings">
				content
			</MenuPanel>,
		);

		await waitFor(() => expect(screen.getByText("content")).toBeInTheDocument());
		fireEvent.click(screen.getByRole("button", { name: "Close" }));
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("hides the close button when shouldShowClose is false", async () => {
		render(
			<MenuPanel open onClose={jest.fn()} title="Settings" shouldShowClose={false}>
				content
			</MenuPanel>,
		);

		await waitFor(() => expect(screen.getByText("content")).toBeInTheDocument());
		expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
	});

	it("does not portal for the anchored variant", async () => {
		render(
			<MenuPanel open onClose={jest.fn()} variant="anchored">
				content
			</MenuPanel>,
		);

		await waitFor(() => expect(screen.getByText("content")).toBeInTheDocument());
		expect(screen.getByRole("dialog")).not.toBe(document.body.lastElementChild);
		expect(screen.getByRole("dialog")).not.toHaveAttribute("aria-modal");
	});
});
