// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { targetUrl } from "./demo.ts";

const size = (page: Page) => page.getByRole("combobox", { name: "Size (EU)" });

test.beforeEach(async ({ page }) => {
  await page.goto(targetUrl("custom-select"));
});

test("E1 a combobox named by its label", async ({ page }) => {
  await expect(size(page)).toBeVisible();
});

test("E2 the label focuses the control", async ({ page }) => {
  await page.locator('label[for="size"]').click();
  await expect(size(page)).toBeFocused();
});

test("E3 Arrow Down changes the value", async ({ page }) => {
  await size(page).focus();
  await page.keyboard.press("ArrowDown");

  if ((await size(page).inputValue()) === "") {
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
  }

  await expect(size(page)).toHaveValue("40");
});

test("E4 one Tab stop, options are not stops", async ({ page }) => {
  await page.getByRole("heading", { level: 1 }).click();
  await page.keyboard.press("Tab");
  await expect(size(page)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("combobox", { name: "Color" })).toBeFocused();
});

test("E5 a change neither navigates nor moves focus", async ({ page }) => {
  const before = page.url();
  await size(page).focus();
  await size(page).selectOption("42");
  expect(page.url()).toBe(before);
  await expect(size(page)).toBeFocused();
});
