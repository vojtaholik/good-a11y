// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";

import { targetUrl } from "./demo.ts";

test.beforeEach(async ({ page }) => {
  await page.goto(targetUrl("skip-link-landmarks"));
});

test("E1 the first Tab shows a skip link", async ({ page }) => {
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: /^Skip/u });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
});

test("E2 the skip link moves focus into main", async ({ page }) => {
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");

  const inMain = await page.evaluate(() =>
    Boolean(document.activeElement?.closest("main"))
  );

  expect(inMain).toBe(true);
});

test("E3 the next Tab after skipping stays in main", async ({ page }) => {
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("main").locator(":focus")).toHaveCount(1);
});

test("E4 one main, one banner, one content info", async ({ page }) => {
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("banner")).toHaveCount(1);
  await expect(page.getByRole("contentinfo")).toHaveCount(1);
});

test("E5 navigation landmarks have distinct names", async ({ page }) => {
  const names = await page
    .locator("nav, [role=navigation]")
    .evaluateAll((navs) => navs.map((nav) => nav.getAttribute("aria-label")));

  expect(names.length).toBeGreaterThan(1);
  expect(new Set(names).size).toBe(names.length);
  expect(names).not.toContain(null);
});

test("E6 one h1, inside main", async ({ page }) => {
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("main h1")).toHaveCount(1);
});
