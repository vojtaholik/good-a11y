// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; graders hold no Effect code.
import type { Flow } from "@good-a11y/core";
import { expect } from "playwright/test";
import type { Page } from "playwright/test";

import { target } from "../flow.js";
import { claim } from "../grader.js";
import type { Grader } from "../grader.js";

const SEEN = "data-eval-seen";

interface Box {
  readonly height: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
}

const newContent = async (page: Page): Promise<readonly Box[]> =>
  await page.evaluate(
    (seen) =>
      [...document.querySelectorAll(`body *:not([${seen}])`)]
        .flatMap((node) => {
          if (
            !(node instanceof HTMLElement) ||
            !node.checkVisibility({
              opacityProperty: true,
              visibilityProperty: true,
            })
          ) {
            return [];
          }

          const rect = node.getBoundingClientRect();

          return rect.width * rect.height >= 1500
            ? [{ height: rect.height, width: rect.width, x: rect.x, y: rect.y }]
            : [];
        })
        .toSorted((a, b) => b.width * b.height - a.width * a.height),
    SEEN
  );

const restOnTrigger = async (page: Page, flow: Flow): Promise<Box> => {
  const trigger = target(page, flow, "trigger", { css: "#trigger" });

  await trigger.scrollIntoViewIfNeeded();
  await page.evaluate((seen) => {
    for (const node of document.querySelectorAll("body *")) {
      if (node instanceof HTMLElement && node.checkVisibility()) {
        node.setAttribute(seen, "");
      }
    }
  }, SEEN);

  const box = await trigger.boundingBox();

  expect(box, "the trigger is not on the page").not.toBeNull();

  const place = box ?? { height: 0, width: 0, x: 0, y: 0 };

  await page.mouse.move(place.x + place.width / 2, place.y + place.height / 2, {
    steps: 5,
  });
  await page.waitForTimeout(900);

  const shown = await newContent(page);

  expect(
    shown.length,
    "nothing appeared while the pointer rested on the trigger"
  ).toBeGreaterThan(0);

  return place;
};

export const grader: Grader = {
  claims: [
    claim(
      1,
      "Escape closes the popup without moving the pointer",
      async ({ flow, page }) => {
        await restOnTrigger(page, flow);
        await page.keyboard.press("Escape");
        await page.waitForTimeout(400);
        expect(
          await newContent(page),
          "the popup is still open after Escape"
        ).toEqual([]);
      }
    ),

    claim(2, "the pointer can move onto the popup", async ({ flow, page }) => {
      const trigger = await restOnTrigger(page, flow);
      const [popup] = await newContent(page);
      const goal = popup ?? trigger;

      await page.mouse.move(goal.x + goal.width / 2, goal.y + goal.height / 2, {
        steps: 15,
      });
      await page.waitForTimeout(400);

      const after = await newContent(page);

      expect(
        after.length,
        "the popup closed when the pointer moved onto it"
      ).toBeGreaterThan(0);
    }),

    claim(
      3,
      "the popup stays while the pointer rests",
      async ({ flow, page }) => {
        await restOnTrigger(page, flow);
        await page.waitForTimeout(5000);

        const after = await newContent(page);

        expect(after.length, "the popup closed on its own").toBeGreaterThan(0);
      }
    ),
  ],
  guide: "hover-popups",
};
