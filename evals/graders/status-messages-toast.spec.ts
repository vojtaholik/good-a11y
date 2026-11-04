// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { targetUrl } from "./demo.ts";

const add = (page: Page) => page.getByRole("button", { name: "Add to cart" });

const addOne = async (page: Page) => {
  await add(page).focus();
  await page.keyboard.press("Enter");
  await page.clock.runFor(100);
};

test.beforeEach(async ({ page }) => {
  await page.clock.install();
  await page.goto(targetUrl("status-messages-toast"));
});

test("E1 a status region exists before any action", async ({ page }) => {
  await expect(page.getByRole("status")).toBeAttached();
  await expect(page.getByRole("status")).toBeEmpty();
});

test("E2 the message lands in that region", async ({ page }) => {
  const region = await page.getByRole("status").elementHandle();
  await addOne(page);
  await expect(page.getByRole("status")).toHaveText(
    /Rain jacket added to cart/u
  );

  const same = await page
    .getByRole("status")
    .evaluate((node, before) => node === before, region);

  expect(same).toBe(true);
});

test("E3 focus stays on the activated control", async ({ page }) => {
  await addOne(page);
  await expect(add(page)).toBeFocused();
});

test("E4 success is not announced assertively", async ({ page }) => {
  await addOne(page);
  await expect(
    page.locator('[role="alert"], [aria-live="assertive"]')
  ).toHaveCount(0);
});

test("E5 the toast lasts 5 s and stays while focused", async ({ page }) => {
  await addOne(page);
  await page.clock.runFor(5000);
  await expect(page.locator("#toast")).toBeVisible();
  await page.getByRole("button", { name: "Dismiss" }).focus();
  await page.clock.runFor(10_000);
  await expect(page.locator("#toast")).toBeVisible();
});

test("E6 the close button is named", async ({ page }) => {
  await addOne(page);
  await expect(page.getByRole("button", { name: "Dismiss" })).toBeVisible();
});
