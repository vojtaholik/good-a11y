// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { targetUrl } from "./demo.ts";

const field = (page: Page) => page.getByRole("combobox", { name: "City" });

test.beforeEach(async ({ page }) => {
  await page.clock.install();
  await page.goto(targetUrl("combobox-autocomplete"));
});

test("E1 a labelled, collapsed combobox", async ({ page }) => {
  await expect(field(page)).toHaveAttribute("aria-expanded", "false");
});

test("E2 typing opens the listbox", async ({ page }) => {
  await field(page).focus();
  await page.keyboard.type("B");
  await expect(page.getByRole("listbox")).toBeVisible();
  await expect(field(page)).toHaveAttribute("aria-expanded", "true");
});

test("E3 Arrow Down highlights an option without moving focus", async ({
  page,
}) => {
  await field(page).focus();
  await page.keyboard.type("B");
  await page.keyboard.press("ArrowDown");
  await expect(field(page)).toBeFocused();
  const active = await field(page).getAttribute("aria-activedescendant");
  expect(active).not.toBeNull();
  const option = page.locator(`[id="${active ?? ""}"]`);
  await expect(option).toHaveAttribute("role", "option");
  await expect(option).toHaveAttribute("aria-selected", "true");
});

test("E4 Enter accepts the highlighted option", async ({ page }) => {
  await field(page).focus();
  await page.keyboard.type("B");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(field(page)).toHaveValue("Berlin");
  await expect(field(page)).toHaveAttribute("aria-expanded", "false");
});

test("E5 Escape closes the list and keeps focus", async ({ page }) => {
  await field(page).focus();
  await page.keyboard.type("Pa");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox")).toBeHidden();
  await expect(field(page)).toHaveAttribute("aria-expanded", "false");
  await expect(field(page)).toBeFocused();
});

test("E6 a pre-existing status region gives the result count", async ({
  page,
}) => {
  await expect(page.getByRole("status")).toBeAttached();
  await field(page).focus();
  await page.keyboard.type("Pa");
  await page.clock.runFor(500);
  await expect(page.getByRole("status")).toHaveText(/1 city available/u);
});
