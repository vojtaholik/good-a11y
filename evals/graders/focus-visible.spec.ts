// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";

import { targetUrl } from "./demo.ts";

const ring = () => {
  const node = document.activeElement;

  if (!(node instanceof HTMLElement)) {
    return null;
  }

  const style = getComputedStyle(node);

  return {
    background: getComputedStyle(node.parentElement ?? document.body)
      .backgroundColor,
    color: style.outlineColor,
    keyboard: node.matches(":focus-visible"),
    style: style.outlineStyle,
    tag: node.tagName,
    width: Number(style.outlineWidth.replace("px", "")),
  };
};

test.beforeEach(async ({ page }) => {
  await page.goto(targetUrl("focus-visible"));
});

test("E1 every Tab stop has a 2px or wider outline", async ({ page }) => {
  const stops = await page.locator("a, button, input").count();

  for (let stop = 0; stop < stops; stop += 1) {
    await page.keyboard.press("Tab");
    const seen = await page.evaluate(ring);
    expect(seen?.keyboard).toBe(true);
    expect(seen?.style).not.toBe("none");
    expect(seen?.width ?? 0).toBeGreaterThanOrEqual(2);
  }
});

test("E2 the outline color is not the background", async ({ page }) => {
  const stops = await page.locator("a, button, input").count();

  for (let stop = 0; stop < stops; stop += 1) {
    await page.keyboard.press("Tab");
    const seen = await page.evaluate(ring);
    expect(seen?.color).not.toBe("rgba(0, 0, 0, 0)");
    expect(seen?.color).not.toBe(seen?.background);
  }
});

test("E3 a mouse click on a button shows no ring", async ({ page }) => {
  await page.getByRole("button", { name: "Save profile" }).click();

  const keyboard = await page.evaluate(
    () => document.activeElement?.matches(":focus-visible") ?? false
  );

  expect(keyboard).toBe(false);
});

test("E4 focus is not hidden under the sticky header", async ({ page }) => {
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.getByRole("link", { name: "Delete my account" }).focus();

  for (let press = 0; press < 6; press += 1) {
    await page.keyboard.press("Shift+Tab");

    const clear = await page.evaluate(() => {
      const header = document.querySelector("header");
      const node = document.activeElement;

      if (header === null || node === null || header.contains(node)) {
        return true;
      }

      return (
        node.getBoundingClientRect().top >=
        header.getBoundingClientRect().bottom - 1
      );
    });

    expect(clear).toBe(true);
  }
});

test("E5 links, buttons and inputs all show the ring", async ({ page }) => {
  const tags = new Set<string>();
  const stops = await page.locator("a, button, input").count();

  for (let stop = 0; stop < stops; stop += 1) {
    await page.keyboard.press("Tab");
    const seen = await page.evaluate(ring);

    if (seen !== null && seen.style !== "none" && seen.width >= 2) {
      tags.add(seen.tag);
    }
  }

  expect([...tags].toSorted()).toEqual(["A", "BUTTON", "INPUT"]);
});
