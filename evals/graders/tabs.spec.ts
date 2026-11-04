// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { targetUrl } from "./demo.ts";

const tab = (page: Page, name: string) => page.getByRole("tab", { name });

test.beforeEach(async ({ page }) => {
  await page.goto(targetUrl("tabs"));
});

test("E1 tabs sit in a named tab list", async ({ page }) => {
  await expect(
    page.getByRole("tablist", { name: "Product information" })
  ).toBeVisible();
  await expect(page.getByRole("tab")).toHaveCount(3);
});

test("E2 one selected tab owns the only Tab stop", async ({ page }) => {
  await expect(page.locator('[role="tab"][aria-selected="true"]')).toHaveCount(
    1
  );
  await expect(page.locator('[role="tab"][tabindex="-1"]')).toHaveCount(2);
  await expect(tab(page, "Details")).not.toHaveAttribute("tabindex", "-1");
});

test("E3 Arrow Right moves and wraps", async ({ page }) => {
  await tab(page, "Details").focus();
  await page.keyboard.press("ArrowRight");
  await expect(tab(page, "Specs")).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(tab(page, "Details")).toBeFocused();
});

test("E4 Home and End jump to the ends", async ({ page }) => {
  await tab(page, "Details").focus();
  await page.keyboard.press("End");
  await expect(tab(page, "Reviews")).toBeFocused();
  await page.keyboard.press("Home");
  await expect(tab(page, "Details")).toBeFocused();
});

test("E5 the visible panel is named by its tab", async ({ page }) => {
  await tab(page, "Details").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tabpanel", { name: "Specs" })).toBeVisible();
  await expect(page.locator("#panel-details")).toBeHidden();
});

test("E6 Tab from the tab list goes to the panel", async ({ page }) => {
  await tab(page, "Details").focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("tabpanel", { name: "Details" })).toBeFocused();
});
