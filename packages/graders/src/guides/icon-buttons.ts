// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; graders hold no Effect code.
import { expect } from "playwright/test";
import type { Page } from "playwright/test";

import { text } from "../flow.js";
import { claim } from "../grader.js";
import type { Grader } from "../grader.js";
import { accessibleName } from "../name.js";

const markIconControls = async (page: Page): Promise<number> =>
  await page.evaluate(() => {
    // oxlint-disable-next-line unicorn/consistent-function-scoping -- runs inside the page through page.evaluate, which cannot capture module scope
    const shown = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        const parent = node.parentElement;
        const box = parent?.getBoundingClientRect();

        const seen =
          parent?.checkVisibility({
            opacityProperty: true,
            visibilityProperty: true,
          }) ?? false;

        return seen && box !== undefined && box.width > 1 && box.height > 1
          ? (node.textContent ?? "")
          : "";
      }

      return [...node.childNodes].map(shown).join("");
    };

    const controls = [
      ...document.querySelectorAll<HTMLElement>(
        "button, a[href], [role=button]"
      ),
    ].filter(
      (node) =>
        node.checkVisibility() &&
        node.querySelector("svg, img") !== null &&
        shown(node).trim() === ""
    );

    for (const [index, node] of controls.entries()) {
      node.dataset.graderIcon = String(index);
    }

    return controls.length;
  });

const icons = (page: Page) => page.locator("[data-grader-icon]");

export const grader: Grader = {
  claims: [
    claim(1, "every icon-only control has a name", async ({ page }) => {
      for (const control of await icons(page).all()) {
        await expect(control).toHaveAccessibleName(/\S/u);
      }
    }),
    claim(2, "repeated icon buttons have distinct names", async ({ page }) => {
      const names: string[] = [];

      for (const control of await icons(page).all()) {
        const repeated = await control.evaluate(
          (node) => node.closest("li, tr, article") !== null
        );

        if (repeated) {
          names.push(await accessibleName(control));
        }
      }

      expect(new Set(names).size).toBe(names.length);
    }),
    claim(3, "icons inside named controls are hidden", async ({ page }) => {
      await expect(
        page.locator("[data-grader-icon] svg:not([aria-hidden='true'])")
      ).toHaveCount(0);
    }),
    claim(
      4,
      "a toggle keeps its name and flips aria-pressed",
      async ({ page, flow }) => {
        if (text(flow, "toggle", "yes") === "") {
          return;
        }

        const toggle = page.locator("[data-grader-icon][aria-pressed]").first();
        await expect(toggle).toHaveAttribute(
          "aria-pressed",
          /^(?:true|false)$/u
        );
        const before = await toggle.getAttribute("aria-pressed");

        const name = await accessibleName(toggle);

        await toggle.focus();
        await page.keyboard.press("Space");
        await expect(toggle).toHaveAttribute(
          "aria-pressed",
          before === "true" ? "false" : "true"
        );
        await expect(toggle).toHaveAccessibleName(name);
      }
    ),
    claim(5, "icon targets are at least 24 by 24", async ({ page }) => {
      for (const control of await icons(page).all()) {
        const box = await control.boundingBox();
        expect(box?.width ?? 0).toBeGreaterThanOrEqual(24);
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(24);
      }
    }),
  ],
  guide: "icon-buttons",
  start: async ({ open, page }) => {
    await open();
    expect(await markIconControls(page)).toBeGreaterThan(0);
  },
};
