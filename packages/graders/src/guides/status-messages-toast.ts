// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; graders hold no Effect code.
import type { Flow } from "@good-a11y/core";
import { expect } from "playwright/test";
import type { Locator, Page } from "playwright/test";

import { target, text } from "../flow.js";
import { claim } from "../grader.js";
import type { Grader } from "../grader.js";
import { liveTexts, markLiveRegions } from "../live.js";

const action = (page: Page, flow: Flow) => target(page, flow, "action");

const act = async (page: Page, flow: Flow): Promise<string> => {
  await markLiveRegions(page);
  await action(page, flow).focus();
  await page.keyboard.press("Enter");
  await page.clock.runFor(200);

  await expect(
    page
      .getByText(text(flow, "message"), { exact: false })
      .filter({ visible: true })
      .first(),
    "The feedback message the task asks for never appeared"
  ).toBeVisible();

  const lines = await liveTexts(page);

  return lines.find((line) => line !== "") ?? "";
};

const toast = (page: Page, message: string) =>
  page
    .getByText(message.slice(0, 24), { exact: false })
    .filter({ visible: true })
    .last();

const shows = async (locator: Locator): Promise<boolean> =>
  (await locator.count()) > 0 &&
  (await locator.evaluate((node) => {
    for (const animation of document.getAnimations()) {
      try {
        animation.finish();
      } catch {
        animation.cancel();
      }
    }

    return node.checkVisibility({
      opacityProperty: true,
      visibilityProperty: true,
    });
  }));

export const grader: Grader = {
  claims: [
    claim(1, "a live region exists before any action", async ({ page }) => {
      expect(await markLiveRegions(page)).toBeGreaterThan(0);
    }),

    claim(
      2,
      "the message lands in a pre-existing live region",
      async ({ page, flow }) => {
        expect(await act(page, flow)).not.toBe("");
      }
    ),

    claim(3, "focus stays on the activated control", async ({ page, flow }) => {
      await act(page, flow);
      await expect(action(page, flow)).toBeFocused();
    }),

    claim(4, "success is not announced assertively", async ({ page, flow }) => {
      await act(page, flow);

      const loud = await page.evaluate(() =>
        [
          ...document.querySelectorAll(
            '[role="alert"], [aria-live="assertive"]'
          ),
        ].some((node) => (node.textContent?.trim() ?? "") !== "")
      );

      expect(loud).toBe(false);
    }),

    claim(
      5,
      "the toast lasts 5 s and stays while hovered or focused",
      async ({ page, flow }) => {
        const message = await act(page, flow);
        expect(message).not.toBe("");
        expect(await shows(toast(page, message))).toBe(true);
        await page.clock.runFor(5000);
        expect(await shows(toast(page, message))).toBe(true);
        await toast(page, message).hover();
        await page.clock.runFor(10_000);
        expect(await shows(toast(page, message))).toBe(true);
      }
    ),

    claim(6, "buttons in the toast are named", async ({ page, flow }) => {
      const message = await act(page, flow);

      const holder = toast(page, message).locator(
        "xpath=ancestor-or-self::*[.//button][1]"
      );

      for (const button of await holder.getByRole("button").all()) {
        await expect(button).toHaveAccessibleName(/\S/u);
      }
    }),
  ],
  context: { permissions: ["clipboard-read", "clipboard-write"] },
  guide: "status-messages-toast",
  start: async ({ open, page }) => {
    await page.clock.install();
    await open();
  },
};
