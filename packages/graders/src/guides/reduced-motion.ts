// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; graders hold no Effect code.
import { expect } from "playwright/test";
import type { Page } from "playwright/test";

import { claim } from "../grader.js";
import type { Grader } from "../grader.js";

const words = async (page: Page): Promise<string> =>
  await page.evaluate(() => document.body.textContent);

const transforms = async (page: Page): Promise<readonly string[]> =>
  await page.evaluate(() =>
    [...document.querySelectorAll("body *")].map(
      (node) => getComputedStyle(node).transform
    )
  );

const scrollThrough = async (page: Page) => {
  const height = await page.evaluate(() => document.body.scrollHeight);

  for (let y = 0; y <= height; y += 400) {
    await page.mouse.wheel(0, 400);
    await page.clock.runFor(100);
  }
};

export const grader: Grader = {
  claims: [
    claim(1, "nothing changes on its own", async ({ page }) => {
      const before = await words(page);
      await page.clock.runFor(10_500);
      expect(await words(page)).toBe(before);
    }),
    claim(
      2,
      "auto-moving content has a pause control that sticks",
      async ({ page }) => {
        const before = await words(page);
        await page.clock.runFor(6000);

        if ((await words(page)) !== before) {
          const pause = page
            .getByRole("button", { name: /pause|stop/iu })
            .filter({ visible: true })
            .first();

          await pause.focus();
          await expect(pause).toBeFocused();
          await page.keyboard.press("Enter");
          await page.mouse.move(0, 0);
          const paused = await words(page);
          await page.clock.runFor(10_500);
          expect(await words(page)).toBe(paused);
        }
      },
      { reducedMotion: "no-preference" }
    ),
    claim(3, "scrolling is not smooth", async ({ page }) => {
      const behavior = await page.evaluate(() => [
        getComputedStyle(document.documentElement).scrollBehavior,
        getComputedStyle(document.body).scrollBehavior,
      ]);

      expect(behavior).toEqual(["auto", "auto"]);
    }),
    claim(4, "nothing moves while scrolling", async ({ page }) => {
      const before = await transforms(page);
      await scrollThrough(page);

      const moving = await page.evaluate(
        () =>
          document.getAnimations().filter((animation) => {
            const { effect } = animation;

            if (
              !(effect instanceof KeyframeEffect) ||
              animation.playState !== "running"
            ) {
              return false;
            }

            return effect
              .getKeyframes()
              .some((frame) =>
                ["transform", "translate", "scale", "rotate"].some(
                  (property) => property in frame
                )
              );
          }).length
      );

      expect(moving).toBe(0);
      expect(await transforms(page)).toEqual(before);
    }),
    claim(5, "content still shows", async ({ page }) => {
      await scrollThrough(page);
      await page.clock.runFor(2000);

      const hidden = await page.evaluate(() =>
        [
          ...document.querySelectorAll("main h1, main h2, main h3, main img"),
        ].flatMap((node) =>
          node.checkVisibility({
            opacityProperty: true,
            visibilityProperty: true,
          })
            ? []
            : [node.outerHTML.slice(0, 60)]
        )
      );

      expect(hidden).toEqual([]);
    }),
  ],
  context: { reducedMotion: "reduce" },
  guide: "reduced-motion",
  precheck: {
    context: { reducedMotion: "no-preference" },
    run: async ({ open, page }) => {
      await page.clock.install();
      await open();

      const smooth = await page.evaluate(() =>
        [document.documentElement, document.body].some(
          (node) => getComputedStyle(node).scrollBehavior === "smooth"
        )
      );

      const before = { moved: await transforms(page), text: await words(page) };
      await scrollThrough(page);

      const scrolled = await page.evaluate(
        () => document.getAnimations().length
      );

      await page.clock.runFor(6000);
      const ticked = await page.evaluate(() => document.getAnimations().length);
      const after = { moved: await transforms(page), text: await words(page) };

      const changed =
        after.text !== before.text ||
        after.moved.length !== before.moved.length ||
        after.moved.some((value, index) => value !== before.moved[index]);

      expect(
        smooth || scrolled > 0 || ticked > 0 || changed,
        "Without reduced motion the page neither scrolls smoothly, animates nor changes on its own, so the motion the task asks for is missing"
      ).toBe(true);
    },
  },
  start: async ({ open, page }) => {
    await page.clock.install();
    await open();
  },
};
