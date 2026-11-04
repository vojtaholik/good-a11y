// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { open, target, text } from "./task.ts";

const STEP_MS = 10 * 1000;

test.describe.configure({ timeout: 120_000 });

const EXTEND =
  /extend|more time|more minutes|another \d+ minutes|keep|hold|still here|stay|continue|renew|add \d+ (?:more )?minutes/iu;

const limitMs = () => Number(text("limitMinutes", "15")) * 60 * 1000;

const extendControl = (page: Page): Locator =>
  page.getByRole("button", { name: EXTEND }).filter({ visible: true }).first();

const isExpired = async (page: Page): Promise<boolean> =>
  (await page
    .getByText(text("expired", "expired"), { exact: false })
    .filter({ visible: true })
    .count()) > 0;

const settle = async (page: Page): Promise<void> => {
  await page.waitForTimeout(150);
};

const advance = async (page: Page, ms: number): Promise<void> => {
  await page.clock.runFor(ms);
  await settle(page);
};

const waitForWarning = async (
  page: Page,
  within: number
): Promise<number | null> => {
  for (let elapsed = 0; elapsed <= within; elapsed += STEP_MS) {
    if (await isExpired(page)) {
      return null;
    }

    if ((await extendControl(page).count()) > 0) {
      return elapsed;
    }

    await advance(page, STEP_MS);
  }

  return null;
};

const start = async (page: Page): Promise<void> => {
  await page.clock.install();
  await open(page, "timeouts-and-warnings");
  await target(page, "start", {
    name: "Add to cart",
    nth: 0,
    role: "button",
  }).click();
  await page.waitForTimeout(500);
};

const extendOnce = async (page: Page, within: number): Promise<number> => {
  const seen = await waitForWarning(page, within);

  expect(
    seen,
    "no warning with a way to extend came before the time ran out"
  ).not.toBeNull();
  await extendControl(page).click();
  await page.waitForTimeout(500);

  return seen ?? 0;
};

test("E1 a warning with a way to extend comes at least 20 seconds before the end", async ({
  page,
}) => {
  await start(page);

  const late = limitMs() - 25 * 1000;

  for (let elapsed = 0; elapsed < late; elapsed += STEP_MS) {
    await advance(page, Math.min(STEP_MS, late - elapsed));
  }

  expect(await isExpired(page), "it ran out early").toBe(false);
  expect(
    await extendControl(page).count(),
    "25 seconds before the end there is no way to extend"
  ).toBeGreaterThan(0);
  await extendControl(page).click();
  await page.waitForTimeout(500);
  await advance(page, 25 * 1000 + 60 * 1000);
  expect(
    await isExpired(page),
    "extending did not keep it past the original limit"
  ).toBe(false);
});

test("E2 the time can be extended again", async ({ page }) => {
  await start(page);
  await extendOnce(page, limitMs());
  await advance(page, STEP_MS);

  const again = await extendOnce(page, 2 * limitMs());

  await advance(page, Math.min(limitMs(), 2 * 60 * 1000));
  expect(
    await isExpired(page),
    `the second extension, after ${again} ms, did not hold`
  ).toBe(false);
});
