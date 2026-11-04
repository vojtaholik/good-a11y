// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { targetUrl } from "./demo.ts";

const slide = (page: Page) => page.locator("#slide-title");

test.beforeEach(async ({ page }) => {
  await page.clock.install();
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test.beforeEach(async ({ page }) => {
    await page.goto(targetUrl("reduced-motion"));
  });

  test("E1 the carousel does not advance", async ({ page }) => {
    await page.clock.runFor(10_500);
    await expect(slide(page)).toHaveText("Rain jackets");
  });

  test("E3 scrolling is not smooth", async ({ page }) => {
    const behavior = await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior
    );

    expect(behavior).toBe("auto");
  });

  test("E4 reveals do not move", async ({ page }) => {
    await page.getByRole("button", { name: "Show size guide" }).click();
    await expect(page.locator("#details")).toHaveCSS("transform", "none");
  });

  test("E5 controls still work", async ({ page }) => {
    await page.getByRole("button", { name: "Show size guide" }).click();
    await page.clock.runFor(400);
    await expect(page.locator("#details p")).toBeVisible();
    await page.getByRole("button", { name: "Next slide" }).click();
    await expect(slide(page)).toHaveText("Hiking boots");
  });
});

test.describe("without reduced motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("E2 a pause button stops the carousel", async ({ page }) => {
    await page.goto(targetUrl("reduced-motion"));
    await page.clock.runFor(5500);
    await expect(slide(page)).not.toHaveText("Rain jackets");
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("button", { name: "Pause slides" })
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await page.getByRole("heading", { level: 1 }).click();
    const paused = await slide(page).textContent();
    await page.clock.runFor(10_500);
    await expect(slide(page)).toHaveText(paused ?? "");
  });
});
