// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; graders hold no Effect code.
import type { Flow } from "@good-a11y/core";
import { expect } from "playwright/test";
import type { Page } from "playwright/test";

import { target } from "../flow.js";
import { claim } from "../grader.js";
import type { Grader } from "../grader.js";
import { accessibleName } from "../name.js";
import { focusedIsSeen } from "../visible.js";

const toggle = (page: Page, flow: Flow) =>
  target(page, flow, "toggle", { name: "Shipping", role: "button" });

const content = (page: Page, flow: Flow) =>
  target(page, flow, "content", {
    text: "Orders ship within two working days",
  });

export const grader: Grader = {
  claims: [
    claim(1, "the toggle is a collapsed button", async ({ page, flow }) => {
      await expect(toggle(page, flow)).toHaveAttribute(
        "aria-expanded",
        "false"
      );
    }),

    claim(
      2,
      "Enter expands and shows the panel content",
      async ({ page, flow }) => {
        await toggle(page, flow).focus();
        await page.keyboard.press("Enter");
        await expect(toggle(page, flow)).toHaveAttribute(
          "aria-expanded",
          "true"
        );
        await expect(content(page, flow)).toBeVisible();
      }
    ),

    claim(
      3,
      "Space collapses and hides the panel content",
      async ({ page, flow }) => {
        await toggle(page, flow).focus();
        await page.keyboard.press("Enter");
        await expect(content(page, flow)).toBeVisible();
        await page.keyboard.press("Space");
        await expect(toggle(page, flow)).toHaveAttribute(
          "aria-expanded",
          "false"
        );
        await expect(content(page, flow)).toBeHidden();
      }
    ),

    claim(
      4,
      "Tab from a closed toggle never lands on hidden content",
      async ({ page, flow }) => {
        await toggle(page, flow).focus();

        for (let press = 0; press < 5; press += 1) {
          await page.keyboard.press("Tab");
          expect(await focusedIsSeen(page)).toBe(true);
        }
      }
    ),

    claim(
      5,
      "the toggle sits inside a heading of the same name",
      async ({ page, flow }) => {
        const name = await accessibleName(toggle(page, flow));

        const heading = toggle(page, flow).locator(
          "xpath=ancestor::*[self::h1 or self::h2 or self::h3 or self::h4 or self::h5 or self::h6 or @role='heading']"
        );

        await expect(heading).toHaveCount(1);
        await expect(heading).toHaveAccessibleName(name);
      }
    ),
  ],
  guide: "disclosure-accordion",
};
