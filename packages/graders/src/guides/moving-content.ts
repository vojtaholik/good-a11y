// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; graders hold no Effect code.
import { expect } from "playwright/test";
import type { Page } from "playwright/test";

import { target } from "../flow.js";
import { claim } from "../grader.js";
import type { Grader } from "../grader.js";

const STOPPED_AFTER_MS = 6500;

const SECOND_LOOK_MS = 700;

const boxes = async (page: Page): Promise<readonly string[]> =>
  await page.evaluate(() =>
    [...document.querySelectorAll("body *")]
      .filter((element) => element.getClientRects().length > 0)
      .slice(0, 600)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);

        return `${Math.round(rect.x)},${Math.round(rect.y)},${Math.round(rect.width)},${Math.round(rect.height)},${style.opacity},${style.transform}`;
      })
  );

const settle = async (page: Page): Promise<void> => {
  const opened = await page.evaluate(() => performance.now());

  await page.waitForTimeout(Math.max(0, STOPPED_AFTER_MS - opened));
};

export const grader: Grader = {
  claims: [
    claim(1, "nothing moves on its own after 5 seconds", async ({ page }) => {
      await settle(page);
      const first = await boxes(page);

      await page.waitForTimeout(SECOND_LOOK_MS);
      const second = await boxes(page);

      const moved = first.filter((box, index) => box !== second[index]);

      expect(
        moved.length,
        `${moved.length} of ${first.length} elements were still moving 6.5 seconds after the page opened, e.g. ${moved[0] ?? ""}`
      ).toBe(0);
    }),

    claim(
      2,
      "everything is inside the page once it stops",
      async ({ page }) => {
        await settle(page);

        const outside = await page.evaluate(() => {
          const width = document.documentElement.clientWidth;

          return [...document.querySelectorAll("body *")].flatMap((element) => {
            const text = (element.textContent ?? "").trim();
            const rect = element.getBoundingClientRect();

            const outsidePage =
              element.children.length === 0 &&
              text !== "" &&
              rect.width > 1 &&
              (rect.left < -1 || rect.right > width + 1);

            return outsidePage ? [text.slice(0, 40)] : [];
          });
        });

        expect(
          outside,
          "text outside the page once the motion stopped"
        ).toEqual([]);
      }
    ),
  ],
  guide: "moving-content",
  precheck: {
    run: async ({ flow, open, page }) => {
      await open();
      await expect(target(page, flow, "moving")).toBeAttached();
    },
  },
  timeout: 30_000,
};
