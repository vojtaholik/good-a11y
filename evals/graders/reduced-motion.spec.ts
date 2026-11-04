// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { open } from "./task.ts";

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

test.beforeEach(async ({ page }) => {
  await page.clock.install();
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test.beforeEach(async ({ page }) => {
    await open(page, "reduced-motion");
  });

  test("E1 nothing changes on its own", async ({ page }) => {
    const before = await words(page);
    await page.clock.runFor(10_500);
    expect(await words(page)).toBe(before);
  });

  test("E3 scrolling is not smooth", async ({ page }) => {
    const behavior = await page.evaluate(() => [
      getComputedStyle(document.documentElement).scrollBehavior,
      getComputedStyle(document.body).scrollBehavior,
    ]);

    expect(behavior).toEqual(["auto", "auto"]);
  });

  test("E4 nothing moves while scrolling", async ({ page }) => {
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
  });

  test("E5 content still shows", async ({ page }) => {
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
  });
});

test.describe("without reduced motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("E2 auto-moving content has a pause control that sticks", async ({
    page,
  }) => {
    await open(page, "reduced-motion");
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
  });
});
