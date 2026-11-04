// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { targetUrl } from "./demo.ts";

const trigger = (page: Page) => page.getByRole("button", { name: "Actions" });

const item = (page: Page, name: string) => page.getByRole("menuitem", { name });

test.beforeEach(async ({ page }) => {
  await page.goto(targetUrl("menu-button"));
});

test("E1 the trigger declares a collapsed menu popup", async ({ page }) => {
  await expect(trigger(page)).toHaveAttribute(
    "aria-haspopup",
    /^(?:menu|true)$/u
  );
  await expect(trigger(page)).toHaveAttribute("aria-expanded", "false");
});

test("E2 Arrow Down opens the menu on its first item", async ({ page }) => {
  await trigger(page).focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menu")).toBeVisible();
  await expect(trigger(page)).toHaveAttribute("aria-expanded", "true");
  await expect(item(page, "Rename")).toBeFocused();
});

test("E3 arrow keys wrap around the items", async ({ page }) => {
  await trigger(page).focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowUp");
  await expect(item(page, "Delete")).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(item(page, "Rename")).toBeFocused();
});

test("E4 Escape closes and focuses the trigger", async ({ page }) => {
  await trigger(page).focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toBeHidden();
  await expect(trigger(page)).toHaveAttribute("aria-expanded", "false");
  await expect(trigger(page)).toBeFocused();
});

test("E5 Tab closes the menu and leaves it", async ({ page }) => {
  await trigger(page).focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("menu")).toBeHidden();

  const inMenu = await page.evaluate(() =>
    Boolean(document.activeElement?.closest('[role="menu"]'))
  );

  expect(inMenu).toBe(false);
});

test("E6 Enter runs the item, closes and focuses the trigger", async ({
  page,
}) => {
  await trigger(page).focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page.locator("#log")).toHaveText("Duplicate chosen.");
  await expect(page.getByRole("menu")).toBeHidden();
  await expect(trigger(page)).toBeFocused();
});
