// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; graders hold no Effect code.
import type { Flow } from "@good-a11y/core";
import { expect } from "playwright/test";
import type { Locator, Page } from "playwright/test";

import { target, text } from "../flow.js";
import { claim } from "../grader.js";
import type { Grader } from "../grader.js";

const STEP_MS = 10 * 1000;

const EXTEND =
  /extend|more time|more minutes|another \d+ minutes|keep|hold|still here|stay|continue|renew|add \d+ (?:more )?minutes/iu;

const limitMs = (flow: Flow) =>
  Number(text(flow, "limitMinutes", "15")) * 60 * 1000;

const extendControl = (page: Page): Locator =>
  page.getByRole("button", { name: EXTEND }).filter({ visible: true }).first();

const isExpired = async (page: Page, flow: Flow): Promise<boolean> =>
  (await page
    .getByText(text(flow, "expired", "expired"), { exact: false })
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
  within: number,
  flow: Flow
): Promise<number | null> => {
  for (let elapsed = 0; elapsed <= within; elapsed += STEP_MS) {
    if (await isExpired(page, flow)) {
      return null;
    }

    if ((await extendControl(page).count()) > 0) {
      return elapsed;
    }

    await advance(page, STEP_MS);
  }

  return null;
};

const extendOnce = async (
  page: Page,
  within: number,
  flow: Flow
): Promise<number> => {
  const seen = await waitForWarning(page, within, flow);

  expect(
    seen,
    "no warning with a way to extend came before the time ran out"
  ).not.toBeNull();
  await extendControl(page).click();
  await page.waitForTimeout(500);

  return seen ?? 0;
};

export const grader: Grader = {
  claims: [
    claim(
      1,
      "a warning with a way to extend comes at least 20 seconds before the end",
      async ({ flow, page }) => {
        const late = limitMs(flow) - 25 * 1000;

        for (let elapsed = 0; elapsed < late; elapsed += STEP_MS) {
          await advance(page, Math.min(STEP_MS, late - elapsed));
        }

        expect(await isExpired(page, flow), "it ran out early").toBe(false);
        expect(
          await extendControl(page).count(),
          "25 seconds before the end there is no way to extend"
        ).toBeGreaterThan(0);
        await extendControl(page).click();
        await page.waitForTimeout(500);
        await advance(page, 25 * 1000 + 60 * 1000);
        expect(
          await isExpired(page, flow),
          "extending did not keep it past the original limit"
        ).toBe(false);
      }
    ),

    claim(2, "the time can be extended again", async ({ flow, page }) => {
      await extendOnce(page, limitMs(flow), flow);
      await advance(page, STEP_MS);

      const again = await extendOnce(page, 2 * limitMs(flow), flow);

      await advance(page, Math.min(limitMs(flow), 2 * 60 * 1000));
      expect(
        await isExpired(page, flow),
        `the second extension, after ${again} ms, did not hold`
      ).toBe(false);
    }),
  ],
  guide: "timeouts-and-warnings",
  start: async ({ flow, open, page }) => {
    await page.clock.install();
    await open();
    await target(page, flow, "start", {
      name: "Add to cart",
      nth: 0,
      role: "button",
    }).click();
    await page.waitForTimeout(500);
  },
  timeout: 120_000,
};
