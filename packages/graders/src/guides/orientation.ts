// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; graders hold no Effect code.
import { expect } from "playwright/test";
import type { Page } from "playwright/test";

import { claim } from "../grader.js";
import type { ContextOptions, Grader } from "../grader.js";

const SIDEWAYS: ContextOptions = {
  hasTouch: true,
  isMobile: true,
  viewport: { height: 390, width: 844 },
};

const UPRIGHT: ContextOptions = {
  hasTouch: true,
  isMobile: true,
  viewport: { height: 844, width: 390 },
};

const TURN =
  /(?:turn|rotate|hold)\b[^.]{0,40}\b(?:phone|device|screen|tablet|upright|portrait|landscape)|best viewed in (?:portrait|landscape)/iu;

const firstControlIsOnTop = async (page: Page): Promise<void> => {
  await page.waitForTimeout(400);

  const control = page
    .locator(
      "main button, main a[href], main input:not([type=hidden]), main select, main textarea"
    )
    .filter({ visible: true })
    .first();

  expect(await control.count(), "main has no visible control").toBe(1);
  await control.scrollIntoViewIfNeeded();

  const onTop = await control.evaluate((element) => {
    const rect = element.getBoundingClientRect();

    const top = document.elementFromPoint(
      rect.x + rect.width / 2,
      rect.y + rect.height / 2
    );

    return top !== null && (top === element || element.contains(top));
  });

  expect(onTop, "something covers the page's first control").toBe(true);
};

export const grader: Grader = {
  claims: [
    claim(
      1,
      "the page works on a phone held sideways",
      async ({ page }) => {
        await firstControlIsOnTop(page);
      },
      SIDEWAYS
    ),

    claim(
      2,
      "nothing asks to turn the device",
      async ({ page }) => {
        await page.waitForTimeout(400);
        expect(
          await page.getByText(TURN).filter({ visible: true }).count(),
          "a message asks to turn the device"
        ).toBe(0);
      },
      SIDEWAYS
    ),

    claim(
      3,
      "the page works on a phone held upright",
      async ({ page }) => {
        await firstControlIsOnTop(page);
      },
      UPRIGHT
    ),
  ],
  guide: "orientation",
};
