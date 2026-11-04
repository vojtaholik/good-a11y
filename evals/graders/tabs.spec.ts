// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { accessibleName } from "./name.ts";
import { open } from "./task.ts";

const list = (page: Page) =>
  page.getByRole("tablist").filter({ visible: true }).first();

const tabs = (page: Page) => list(page).getByRole("tab");

const selected = (page: Page) =>
  list(page).locator('[role="tab"][aria-selected="true"]');

test.beforeEach(async ({ page }) => {
  await open(page, "tabs");
});

test("E1 tabs sit in a named tab list", async ({ page }) => {
  await expect(list(page)).toBeVisible();
  await expect(list(page)).toHaveAccessibleName(/\S/u);
  expect(await tabs(page).count()).toBeGreaterThan(1);
});

test("E2 one selected tab owns the only Tab stop", async ({ page }) => {
  await expect(selected(page)).toHaveCount(1);

  const stops = await tabs(page).evaluateAll((nodes) =>
    nodes.map((node) => ({
      index: node instanceof HTMLElement ? node.tabIndex : 0,
      selected: node.getAttribute("aria-selected") === "true",
    }))
  );

  for (const stop of stops) {
    expect(stop.index).toBe(stop.selected ? 0 : -1);
  }
});

test("E3 Arrow Right moves and wraps", async ({ page }) => {
  const count = await tabs(page).count();
  await tabs(page).first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs(page).nth(1)).toBeFocused();
  await tabs(page).last().focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs(page).first()).toBeFocused();
  expect(count).toBeGreaterThan(1);
});

test("E4 Home and End jump to the ends", async ({ page }) => {
  await selected(page).focus();
  await page.keyboard.press("End");
  await expect(tabs(page).last()).toBeFocused();
  await page.keyboard.press("Home");
  await expect(tabs(page).first()).toBeFocused();
});

test("E5 the visible panel is named by its tab", async ({ page }) => {
  await tabs(page).first().focus();
  await page.keyboard.press("ArrowRight");
  await tabs(page).nth(1).press("Enter");
  const name = await accessibleName(tabs(page).nth(1));
  const panels = page.getByRole("tabpanel").filter({ visible: true });
  await expect(panels).toHaveCount(1);
  await expect(panels).toHaveAccessibleName(name);
});

test("E6 Tab from the tab list goes to the panel", async ({ page }) => {
  await selected(page).focus();
  await page.keyboard.press("Tab");

  const inPanel = await page.evaluate(() => {
    const panel = document.activeElement?.closest('[role="tabpanel"]');

    return panel instanceof HTMLElement && panel.checkVisibility();
  });

  expect(inPanel).toBe(true);
});
