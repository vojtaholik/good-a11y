// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { open, target } from "./task.ts";

const trigger = (page: Page) =>
  target(page, "trigger", { name: "Actions", role: "button" });

const menu = (page: Page) => page.getByRole("menu").filter({ visible: true });

const items = (page: Page) => menu(page).getByRole("menuitem");

const openMenu = async (page: Page) => {
  await trigger(page).focus();
  await page.keyboard.press("ArrowDown");
};

test.beforeEach(async ({ page }) => {
  await open(page, "menu-button");
});

test("E1 the trigger declares a collapsed menu popup", async ({ page }) => {
  await expect(trigger(page)).toHaveAttribute(
    "aria-haspopup",
    /^(?:menu|true)$/u
  );
  await expect(trigger(page)).toHaveAttribute("aria-expanded", "false");
});

test("E2 Arrow Down opens the menu on its first item", async ({ page }) => {
  await openMenu(page);
  await expect(menu(page)).toHaveCount(1);
  await expect(trigger(page)).toHaveAttribute("aria-expanded", "true");
  await expect(items(page).first()).toBeFocused();
});

test("E3 arrow keys wrap around the items", async ({ page }) => {
  await openMenu(page);
  await expect(items(page).first()).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(items(page).last()).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(items(page).first()).toBeFocused();
});

test("E4 Escape closes and focuses the trigger", async ({ page }) => {
  await openMenu(page);
  await expect(menu(page)).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(menu(page)).toHaveCount(0);
  await expect(trigger(page)).toHaveAttribute("aria-expanded", "false");
  await expect(trigger(page)).toBeFocused();
});

test("E5 Tab closes the menu and leaves it", async ({ page }) => {
  await openMenu(page);
  await expect(menu(page)).toHaveCount(1);
  await page.keyboard.press("Tab");
  await expect(menu(page)).toHaveCount(0);

  const inMenu = await page.evaluate(() =>
    Boolean(document.activeElement?.closest('[role="menu"]'))
  );

  expect(inMenu).toBe(false);
});

test("E6 Enter on an item closes the menu and focuses the trigger", async ({
  page,
}) => {
  await openMenu(page);
  await expect(items(page).first()).toBeFocused();

  const safe = target(page, "safeItem", {
    name: "Duplicate",
    role: "menuitem",
  });

  for (let press = 0; press < 10; press += 1) {
    if (await safe.evaluate((node) => node === document.activeElement)) {
      break;
    }

    await page.keyboard.press("ArrowDown");
  }

  await expect(safe).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(menu(page)).toHaveCount(0);
  await expect(trigger(page)).toBeFocused();
});
