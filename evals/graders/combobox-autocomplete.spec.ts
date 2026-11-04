// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { liveTexts, markLiveRegions } from "./live.ts";
import { open, target, text, textOf } from "./task.ts";

const field = (page: Page) =>
  target(page, "field", { name: "City", role: "combobox" });

const typeQuery = async (page: Page) => {
  await field(page).focus();
  await page.keyboard.type(text("query", "B"), { delay: 20 });
};

test.beforeEach(async ({ page }) => {
  await page.clock.install();
  await open(page, "combobox-autocomplete");
});

test("E1 a labelled, collapsed combobox", async ({ page }) => {
  await expect(field(page)).toBeVisible();
  await expect(field(page)).toHaveAttribute("aria-expanded", "false");
});

test("E2 typing opens the listbox", async ({ page }) => {
  await typeQuery(page);
  await page.clock.runFor(500);
  await expect(page.getByRole("listbox").filter({ visible: true })).toHaveCount(
    1
  );
  await expect(field(page)).toHaveAttribute("aria-expanded", "true");
});

test("E3 Arrow Down highlights an option without moving focus", async ({
  page,
}) => {
  await typeQuery(page);
  await page.clock.runFor(500);
  await page.keyboard.press("ArrowDown");
  await expect(field(page)).toBeFocused();
  const id = await field(page).getAttribute("aria-activedescendant");
  expect(id ?? "").not.toBe("");
  const option = page.locator(`[id="${id ?? ""}"]`);
  await expect(option).toHaveAttribute("role", "option");
  await expect(option).toHaveAttribute("aria-selected", "true");
});

test("E4 Enter accepts the highlighted option", async ({ page }) => {
  await typeQuery(page);
  await page.clock.runFor(500);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  const id = await field(page).getAttribute("aria-activedescendant");

  const chosen = await textOf(page.locator(`[id="${id ?? ""}"]`));

  expect(chosen).not.toBe("");
  await page.keyboard.press("Enter");
  await expect(field(page)).toHaveValue(chosen);
  await expect(field(page)).toHaveAttribute("aria-expanded", "false");
});

test("E5 Escape closes the list and keeps focus", async ({ page }) => {
  await typeQuery(page);
  await page.clock.runFor(500);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox").filter({ visible: true })).toHaveCount(
    0
  );
  await expect(field(page)).toHaveAttribute("aria-expanded", "false");
  await expect(field(page)).toBeFocused();
});

test("E6 a pre-existing live region gives the result count", async ({
  page,
}) => {
  expect(await markLiveRegions(page)).toBeGreaterThan(0);
  await typeQuery(page);
  await page.clock.runFor(1500);
  const said = await liveTexts(page);
  expect(said.some((line) => /\d|\bno\b/iu.test(line))).toBe(true);
});
