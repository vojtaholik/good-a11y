// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { open, target, textOf } from "./task.ts";
import { focusedIsSeen } from "./visible.ts";

const toggle = (page: Page) =>
  target(page, "toggle", { name: "Shipping", role: "button" });

const content = (page: Page) =>
  target(page, "content", { text: "Orders ship within two working days" });

test.beforeEach(async ({ page }) => {
  await open(page, "disclosure-accordion");
});

test("E1 the toggle is a collapsed button", async ({ page }) => {
  await expect(toggle(page)).toHaveAttribute("aria-expanded", "false");
});

test("E2 Enter expands and shows the panel content", async ({ page }) => {
  await toggle(page).focus();
  await page.keyboard.press("Enter");
  await expect(toggle(page)).toHaveAttribute("aria-expanded", "true");
  await expect(content(page)).toBeVisible();
});

test("E3 Space collapses and hides the panel content", async ({ page }) => {
  await toggle(page).focus();
  await page.keyboard.press("Enter");
  await expect(content(page)).toBeVisible();
  await page.keyboard.press("Space");
  await expect(toggle(page)).toHaveAttribute("aria-expanded", "false");
  await expect(content(page)).toBeHidden();
});

test("E4 Tab from a closed toggle never lands on hidden content", async ({
  page,
}) => {
  await toggle(page).focus();

  for (let press = 0; press < 5; press += 1) {
    await page.keyboard.press("Tab");
    expect(await focusedIsSeen(page)).toBe(true);
  }
});

test("E5 the toggle sits inside a heading of the same name", async ({
  page,
}) => {
  const name = await textOf(toggle(page));

  const heading = toggle(page).locator(
    "xpath=ancestor::*[self::h1 or self::h2 or self::h3 or self::h4 or self::h5 or self::h6 or @role='heading']"
  );

  await expect(heading).toHaveCount(1);
  await expect(heading).toHaveAccessibleName(name);
});
