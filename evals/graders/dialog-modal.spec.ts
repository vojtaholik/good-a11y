// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { targetUrl } from "./demo.ts";

const open = async (page: Page) => {
  await page.getByRole("button", { name: "Delete project" }).focus();
  await page.keyboard.press("Enter");
};

const focusInDialog = async (page: Page) =>
  await page.evaluate(() =>
    Boolean(document.activeElement?.closest("dialog[open]"))
  );

test.beforeEach(async ({ page }) => {
  await page.goto(targetUrl("dialog-modal"));
});

test("E1 the opener shows a dialog named by its heading", async ({ page }) => {
  await open(page);
  await expect(
    page.getByRole("dialog", { name: "Delete this project?" })
  ).toBeVisible();
});

test("E2 focus moves into the dialog on open", async ({ page }) => {
  await open(page);
  expect(await focusInDialog(page)).toBe(true);
});

test("E3 Tab never reaches page content behind the dialog", async ({
  page,
}) => {
  await open(page);

  for (let press = 0; press < 10; press += 1) {
    await page.keyboard.press("Tab");

    const inside = await page.evaluate(
      () =>
        Boolean(document.activeElement?.closest("dialog[open]")) ||
        document.activeElement === document.body
    );

    expect(inside).toBe(true);
  }
});

test("E4 content behind the open dialog cannot be focused", async ({
  page,
}) => {
  await open(page);

  const leaked = await page.evaluate(() => {
    const behind = document.querySelector("main a");

    if (!(behind instanceof HTMLElement)) {
      return true;
    }

    behind.focus();

    return document.activeElement === behind;
  });

  expect(leaked).toBe(false);
});

test("E5 Escape closes and returns focus to the opener", async ({ page }) => {
  await open(page);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Delete project" })
  ).toBeFocused();
});

test("E6 the cancel button closes and returns focus to the opener", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Delete project" })
  ).toBeFocused();
});
