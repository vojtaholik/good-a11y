// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; graders hold no Effect code.
import type { Flow } from "@good-a11y/core";
import { expect } from "playwright/test";
import type { Page } from "playwright/test";

import { target } from "../flow.js";
import { claim } from "../grader.js";
import type { Grader } from "../grader.js";
import { accessibleName } from "../name.js";

const DIALOG = 'dialog[open], [role="dialog"], [role="alertdialog"]';

const visibleDialogs = (page: Page) =>
  page.locator(DIALOG).filter({ visible: true });

const opener = (page: Page, flow: Flow) =>
  target(page, flow, "opener", { name: "Delete project", role: "button" });

const show = async (page: Page, flow: Flow) => {
  await opener(page, flow).focus();
  await page.keyboard.press("Enter");
  await expect(visibleDialogs(page)).toHaveCount(1);
};

const focusInDialog = async (page: Page) =>
  await page.evaluate(
    (selector) =>
      Boolean(document.activeElement?.closest(selector)?.checkVisibility()),
    DIALOG
  );

export const grader: Grader = {
  claims: [
    claim(
      1,
      "the opener shows a dialog named by its heading",
      async ({ page, flow }) => {
        await show(page, flow);

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
      }
    ),

    claim(2, "focus moves into the dialog on open", async ({ page, flow }) => {
      await show(page, flow);
      expect(await focusInDialog(page)).toBe(true);
    }),

    claim(
      3,
      "Tab never reaches page content behind the dialog",
      async ({ page, flow }) => {
        await show(page, flow);

        for (let press = 0; press < 10; press += 1) {
          await page.keyboard.press("Tab");

          const inside = await page.evaluate(
            (selector) =>
              Boolean(
                document.activeElement?.closest(selector)?.checkVisibility()
              ) || document.activeElement === document.body,
            DIALOG
          );

          expect(inside).toBe(true);
        }
      }
    ),

    claim(
      4,
      "content behind the open dialog cannot be focused",
      async ({ page, flow }) => {
        await show(page, flow);

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
              dialog !== null &&
              !dialog.contains(node) &&
              node.checkVisibility()
          );

          return behind.some((node) => {
            node.focus();

            return document.activeElement === node;
          });
        }, DIALOG);

        expect(leaked).toBe(false);
      }
    ),

    claim(
      5,
      "Escape closes and returns focus to the opener",
      async ({ page, flow }) => {
        await show(page, flow);
        await page.keyboard.press("Escape");
        await expect(visibleDialogs(page)).toHaveCount(0);
        await expect(opener(page, flow)).toBeFocused();
      }
    ),

    claim(
      6,
      "the cancel button closes and returns focus to the opener",
      async ({ page, flow }) => {
        await show(page, flow);
        await target(page, flow, "close", {
          name: "Cancel",
          role: "button",
        }).click();
        await expect(visibleDialogs(page)).toHaveCount(0);
        await expect(opener(page, flow)).toBeFocused();
      }
    ),
  ],
  guide: "dialog-modal",
};
