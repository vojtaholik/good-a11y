// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { open, target, text, textOf } from "./task.ts";

const route = (page: Page) =>
  target(page, "link", { name: "Journal", role: "link" });

const heading = (page: Page) => page.locator("main h1, h1").first();

const go = async (page: Page) => {
  const before = {
    h1: await textOf(heading(page)),
    title: await page.title(),
  };

  await route(page).focus();
  await page.keyboard.press("Enter");
  await expect(heading(page)).not.toHaveText(before.h1);

  return before;
};

test.beforeEach(async ({ page }) => {
  await open(page, "spa-route-change");
});

test("E1 the title follows the new view", async ({ page }) => {
  const before = await go(page);
  const h1 = await textOf(heading(page));
  await expect(page).not.toHaveTitle(before.title);
  const title = await page.title();
  expect(title.toLowerCase()).toContain(h1.toLowerCase());
});

test("E2 focus lands on the new heading or main", async ({ page }) => {
  await go(page);

  const on = await page.evaluate(() => {
    const node = document.activeElement;

    return node?.matches("h1, main") === true;
  });

  expect(on).toBe(true);
});

test("E3 the next Tab continues inside main", async ({ page }) => {
  await go(page);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("main").locator(":focus")).toHaveCount(1);
});

test("E4 aria-current marks only the current view", async ({ page }) => {
  await go(page);
  const current = page.locator('[aria-current="page"]');
  expect(await current.count()).toBeLessThanOrEqual(1);
  const name = text("current", "Journal");

  if (name !== "") {
    await expect(current).toHaveCount(1);
    await expect(current).toHaveText(name);
  }
});

test("E5 Back restores the view and title", async ({ page }) => {
  const before = await go(page);
  await page.goBack();
  await expect(page).toHaveTitle(before.title);
  await expect(heading(page)).toHaveText(before.h1);
});

test("E6 the first load leaves focus alone", async ({ page }) => {
  const tag = await page.evaluate(() => document.activeElement?.tagName);
  expect(tag).toBe("BODY");
});
