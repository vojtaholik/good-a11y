// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { liveTexts, markLiveRegions } from "./live.ts";
import { open, target } from "./task.ts";

const action = (page: Page) =>
  target(page, "action", { name: "Add to cart", role: "button" });

const act = async (page: Page): Promise<string> => {
  await markLiveRegions(page);
  await action(page).focus();
  await page.keyboard.press("Enter");
  await page.clock.runFor(200);

  const lines = await liveTexts(page);

  return lines.find((line) => line !== "") ?? "";
};

const toast = (page: Page, message: string) =>
  page
    .getByText(message.slice(0, 24), { exact: false })
    .filter({ visible: true })
    .last();

test.use({ permissions: ["clipboard-read", "clipboard-write"] });

test.beforeEach(async ({ page }) => {
  await page.clock.install();
  await open(page, "status-messages-toast");
});

test("E1 a live region exists before any action", async ({ page }) => {
  expect(await markLiveRegions(page)).toBeGreaterThan(0);
});

test("E2 the message lands in a pre-existing live region", async ({ page }) => {
  expect(await act(page)).not.toBe("");
});

test("E3 focus stays on the activated control", async ({ page }) => {
  await act(page);
  await expect(action(page)).toBeFocused();
});

test("E4 success is not announced assertively", async ({ page }) => {
  await act(page);

  const loud = await page.evaluate(() =>
    [
      ...document.querySelectorAll('[role="alert"], [aria-live="assertive"]'),
    ].some((node) => (node.textContent?.trim() ?? "") !== "")
  );

  expect(loud).toBe(false);
});

test("E5 the toast lasts 5 s and stays while hovered or focused", async ({
  page,
}) => {
  const message = await act(page);
  expect(message).not.toBe("");
  await expect(toast(page, message)).toBeVisible();
  await page.clock.runFor(5000);
  await expect(toast(page, message)).toBeVisible();
  await toast(page, message).hover();
  await page.clock.runFor(10_000);
  await expect(toast(page, message)).toBeVisible();
});

test("E6 buttons in the toast are named", async ({ page }) => {
  const message = await act(page);

  const holder = toast(page, message).locator(
    "xpath=ancestor-or-self::*[.//button][1]"
  );

  for (const button of await holder.getByRole("button").all()) {
    await expect(button).toHaveAccessibleName(/\S/u);
  }
});
