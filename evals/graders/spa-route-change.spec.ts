// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { targetUrl } from "./demo.ts";

const goJournal = async (page: Page) => {
  await page.getByRole("link", { name: "Journal" }).focus();
  await page.keyboard.press("Enter");
};

test.beforeEach(async ({ page }) => {
  await page.goto(targetUrl("spa-route-change"));
});

test("E1 the title follows the new view", async ({ page }) => {
  await goJournal(page);
  await expect(page).toHaveTitle(/Journal/u);
});

test("E2 focus lands on the new heading", async ({ page }) => {
  await goJournal(page);
  await expect(
    page.getByRole("heading", { level: 1, name: "Journal" })
  ).toBeFocused();
});

test("E3 the next Tab continues inside main", async ({ page }) => {
  await goJournal(page);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("main").locator(":focus")).toHaveCount(1);
});

test("E4 aria-current marks only the current view", async ({ page }) => {
  await goJournal(page);
  const current = page.locator('nav [aria-current="page"]');
  await expect(current).toHaveCount(1);
  await expect(current).toHaveText("Journal");
});

test("E5 Back restores the view and title", async ({ page }) => {
  await goJournal(page);
  await page.goBack();
  await expect(page).toHaveTitle(/Shop/u);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Shop");
});

test("E6 the first load leaves focus alone", async ({ page }) => {
  const tag = await page.evaluate(() => document.activeElement?.tagName);
  expect(tag).toBe("BODY");
});
