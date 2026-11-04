// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { open, target } from "./task.ts";

const control = (page: Page) =>
  target(page, "control", { name: "Size (EU)", role: "combobox" });

const valueOf = async (page: Page): Promise<string> =>
  await control(page).evaluate((node) =>
    node instanceof HTMLSelectElement
      ? node.value
      : (node.textContent?.trim() ?? "")
  );

const change = async (page: Page): Promise<string> => {
  const before = await valueOf(page);
  await control(page).focus();
  await page.keyboard.press("ArrowDown");

  if ((await valueOf(page)) === before) {
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
  }

  return before;
};

test.beforeEach(async ({ page }) => {
  await open(page, "custom-select");
});

test("E1 a combobox named by its label", async ({ page }) => {
  await expect(control(page)).toBeVisible();
});

test("E2 a native select's label focuses it", async ({ page }) => {
  const native = await control(page).evaluate(
    (node) => node instanceof HTMLSelectElement
  );

  if (native) {
    await control(page).evaluate((node) => {
      if (node instanceof HTMLSelectElement) {
        node.labels[0]?.click();
      }
    });
    await expect(control(page)).toBeFocused();
  }
});

test("E3 the keyboard changes the value", async ({ page }) => {
  const before = await change(page);
  expect(await valueOf(page)).not.toBe(before);
});

test("E4 one Tab stop, options are not stops", async ({ page }) => {
  await control(page).focus();
  await page.keyboard.press("Tab");

  const stop = await page.evaluate(() => {
    const node = document.activeElement;

    return {
      option:
        node?.closest('[role="option"], [role="listbox"], option') !== null &&
        node !== null,
      tag: node?.tagName ?? "",
    };
  });

  expect(stop.option).toBe(false);
  await expect(control(page)).not.toBeFocused();
});

test("E5 a change neither navigates nor moves focus", async ({ page }) => {
  const url = page.url();
  await change(page);
  expect(page.url()).toBe(url);
  await expect(control(page)).toBeFocused();
});
