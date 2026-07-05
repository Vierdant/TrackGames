import { expect, test } from "@playwright/test";
import { TEST_GAME, TEST_USER } from "./test-data";

test.describe.configure({ mode: "serial" });

test("register, add a game to the library, then filter the library", async ({ page }) => {
	await page.goto("/login");
	await page.getByRole("button", { name: "Register" }).click();

	await page.getByLabel("Username", { exact: true }).fill(TEST_USER.name);
	await page.getByLabel("Email", { exact: true }).fill(TEST_USER.email);
	await page.getByLabel("Password", { exact: true }).fill(TEST_USER.password);
	await page.getByLabel("Confirm password", { exact: true }).fill(TEST_USER.password);
	await page.getByRole("button", { name: "Create account" }).click();

	await expect(page).toHaveURL("/");

	await page.goto(`/game/${TEST_GAME.slug}`);
	await expect(page.getByRole("heading", { name: TEST_GAME.name })).toBeVisible();

	await page.getByRole("button", { name: "Add to library" }).click();
	await expect(page.getByRole("button", { name: "Manage library status" })).toBeVisible();

	await page.goto(`/library/${TEST_USER.name}`);
	await expect(page.getByText(TEST_GAME.name)).toBeVisible();

	await page.getByPlaceholder("Search library").fill("no game matches this query");
	await expect(page.getByText("No games found.")).toBeVisible();

	await page.getByPlaceholder("Search library").fill(TEST_GAME.name);
	await expect(page.getByText(TEST_GAME.name)).toBeVisible();
});
