// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { accessibleName } from "./name.ts";
import { open, target } from "./task.ts";

const DIALOG = 'dialog[open], [role="dialog"], [role="alertdialog"]';

const visibleDialogs = (page: Page) =>
  page.locator(DIALOG).filter({ visible: true });

const opener = (page: Page) =>
  target(page, "opener", { name: "Delete project", role: "button" });

const show = async (page: Page) => {
  await opener(page).focus();
  await page.keyboard.press("Enter");
  await expect(visibleDialogs(page)).toHaveCount(1);
};

const focusInDialog = async (page: Page) =>
  await page.evaluate(
    (selector) =>
      Boolean(document.activeElement?.closest(selector)?.checkVisibility()),
    DIALOG
  );

test.beforeEach(async ({ page }) => {
  await open(page, "dialog-modal");
});

test("E1 the opener shows a dialog named by its heading", async ({ page }) => {
  await show(page);

  const dialog = visibleDialogs(page).first();

  const named = {
    heading: await accessibleName(
      dialog.locator("h1, h2, h3, h4, h5, h6, [role=heading]").first()
    ),
    name: await accessibleName(dialog),
  };

  expect(named.name).not.toBe("");
  expect(named.name).toBe(named.heading);
  await expect(
    page
      .getByRole("dialog", { name: named.name })
      .or(page.getByRole("alertdialog", { name: named.name }))
  ).toBeVisible();
});

test("E2 focus moves into the dialog on open", async ({ page }) => {
  await show(page);
  expect(await focusInDialog(page)).toBe(true);
});

test("E3 Tab never reaches page content behind the dialog", async ({
  page,
}) => {
  await show(page);

  for (let press = 0; press < 10; press += 1) {
    await page.keyboard.press("Tab");

    const inside = await page.evaluate(
      (selector) =>
        Boolean(document.activeElement?.closest(selector)?.checkVisibility()) ||
        document.activeElement === document.body,
      DIALOG
    );

    expect(inside).toBe(true);
  }
});

test("E4 content behind the open dialog cannot be focused", async ({
  page,
}) => {
  await show(page);

  const leaked = await page.evaluate((selector) => {
    const dialog =
      [...document.querySelectorAll(selector)].find((node) =>
        node.checkVisibility()
      ) ?? null;

    const behind = [
      ...document.querySelectorAll<HTMLElement>(
        "a[href], button, input, select, textarea"
      ),
    ].filter(
      (node) =>
        dialog !== null && !dialog.contains(node) && node.checkVisibility()
    );

    return behind.some((node) => {
      node.focus();

      return document.activeElement === node;
    });
  }, DIALOG);

  expect(leaked).toBe(false);
});

test("E5 Escape closes and returns focus to the opener", async ({ page }) => {
  await show(page);
  await page.keyboard.press("Escape");
  await expect(visibleDialogs(page)).toHaveCount(0);
  await expect(opener(page)).toBeFocused();
});

test("E6 the cancel button closes and returns focus to the opener", async ({
  page,
}) => {
  await show(page);
  await target(page, "close", { name: "Cancel", role: "button" }).click();
  await expect(visibleDialogs(page)).toHaveCount(0);
  await expect(opener(page)).toBeFocused();
});
