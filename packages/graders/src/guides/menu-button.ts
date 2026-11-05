// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; graders hold no Effect code.
import type { Flow } from "@good-a11y/core";
import { expect } from "playwright/test";
import type { Page } from "playwright/test";

import { target } from "../flow.js";
import { claim } from "../grader.js";
import type { Grader } from "../grader.js";

const trigger = (page: Page, flow: Flow) =>
  target(page, flow, "trigger", { name: "Actions", role: "button" });

const menu = (page: Page) => page.getByRole("menu").filter({ visible: true });

const items = (page: Page) => menu(page).getByRole("menuitem");

const openMenu = async (page: Page, flow: Flow) => {
  await trigger(page, flow).focus();
  await page.keyboard.press("ArrowDown");
};

export const grader: Grader = {
  claims: [
    claim(
      1,
      "the trigger declares a collapsed menu popup",
      async ({ page, flow }) => {
        await expect(trigger(page, flow)).toHaveAttribute(
          "aria-haspopup",
          /^(?:menu|true)$/u
        );
        await expect(trigger(page, flow)).toHaveAttribute(
          "aria-expanded",
          "false"
        );
      }
    ),

    claim(
      2,
      "Arrow Down opens the menu on its first item",
      async ({ page, flow }) => {
        await openMenu(page, flow);
        await expect(menu(page)).toHaveCount(1);
        await expect(trigger(page, flow)).toHaveAttribute(
          "aria-expanded",
          "true"
        );
        await expect(items(page).first()).toBeFocused();
      }
    ),

    claim(3, "arrow keys wrap around the items", async ({ page, flow }) => {
      await openMenu(page, flow);
      await expect(items(page).first()).toBeFocused();
      await page.keyboard.press("ArrowUp");
      await expect(items(page).last()).toBeFocused();
      await page.keyboard.press("ArrowDown");
      await expect(items(page).first()).toBeFocused();
    }),

    claim(
      4,
      "Escape closes and focuses the trigger",
      async ({ page, flow }) => {
        await openMenu(page, flow);
        await expect(menu(page)).toHaveCount(1);
        await page.keyboard.press("Escape");
        await expect(menu(page)).toHaveCount(0);
        await expect(trigger(page, flow)).toHaveAttribute(
          "aria-expanded",
          "false"
        );
        await expect(trigger(page, flow)).toBeFocused();
      }
    ),

    claim(5, "Tab closes the menu and leaves it", async ({ page, flow }) => {
      await openMenu(page, flow);
      await expect(menu(page)).toHaveCount(1);
      await page.keyboard.press("Tab");
      await expect(menu(page)).toHaveCount(0);

      const inMenu = await page.evaluate(() =>
        Boolean(document.activeElement?.closest('[role="menu"]'))
      );

      expect(inMenu).toBe(false);
    }),

    claim(
      6,
      "Enter on an item closes the menu and focuses the trigger",
      async ({ page, flow }) => {
        await openMenu(page, flow);
        await expect(items(page).first()).toBeFocused();

        const safe = target(page, flow, "safeItem", {
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
        await expect(trigger(page, flow)).toBeFocused();
      }
    ),
  ],
  guide: "menu-button",
};
