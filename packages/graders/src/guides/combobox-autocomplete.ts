// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; graders hold no Effect code.
import type { Flow } from "@good-a11y/core";
import { expect } from "playwright/test";
import type { Page } from "playwright/test";

import { target, text, textOf } from "../flow.js";
import { claim } from "../grader.js";
import type { Grader } from "../grader.js";
import { liveTexts, markLiveRegions } from "../live.js";

const field = (page: Page, flow: Flow) => target(page, flow, "field");

const typeQuery = async (page: Page, flow: Flow) => {
  await field(page, flow).focus();
  await page.keyboard.type(text(flow, "query"), { delay: 20 });
};

export const grader: Grader = {
  claims: [
    claim(1, "a labelled, collapsed combobox", async ({ page, flow }) => {
      await expect(field(page, flow)).toBeVisible();
      await expect(field(page, flow)).toHaveAttribute("aria-expanded", "false");
    }),

    claim(2, "typing opens the listbox", async ({ page, flow }) => {
      await typeQuery(page, flow);
      await page.clock.runFor(500);
      await expect(
        page.getByRole("listbox").filter({ visible: true })
      ).toHaveCount(1);
      await expect(field(page, flow)).toHaveAttribute("aria-expanded", "true");
    }),

    claim(
      3,
      "Arrow Down highlights an option without moving focus",
      async ({ page, flow }) => {
        await typeQuery(page, flow);
        await page.clock.runFor(500);
        await page.keyboard.press("ArrowDown");
        await expect(field(page, flow)).toBeFocused();

        const id = await field(page, flow).getAttribute(
          "aria-activedescendant"
        );

        expect(id ?? "").not.toBe("");
        const option = page.locator(`[id="${id ?? ""}"]`);
        await expect(option).toHaveAttribute("role", "option");
        await expect(option).toHaveAttribute("aria-selected", "true");
      }
    ),

    claim(4, "Enter accepts the highlighted option", async ({ page, flow }) => {
      await typeQuery(page, flow);
      await page.clock.runFor(500);
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowDown");
      const id = await field(page, flow).getAttribute("aria-activedescendant");

      const chosen = await textOf(page.locator(`[id="${id ?? ""}"]`));

      expect(chosen).not.toBe("");
      await page.keyboard.press("Enter");
      await expect(field(page, flow)).toHaveValue(chosen);
      await expect(field(page, flow)).toHaveAttribute("aria-expanded", "false");
    }),

    claim(
      5,
      "Escape closes the list and keeps focus",
      async ({ page, flow }) => {
        await typeQuery(page, flow);
        await page.clock.runFor(500);
        await page.keyboard.press("Escape");
        await expect(
          page.getByRole("listbox").filter({ visible: true })
        ).toHaveCount(0);
        await expect(field(page, flow)).toHaveAttribute(
          "aria-expanded",
          "false"
        );
        await expect(field(page, flow)).toBeFocused();
      }
    ),

    claim(
      6,
      "a pre-existing live region gives the result count",
      async ({ page, flow }) => {
        expect(await markLiveRegions(page)).toBeGreaterThan(0);
        await typeQuery(page, flow);
        await page.clock.runFor(1500);
        const said = await liveTexts(page);
        expect(said.some((line) => /\d|\bno\b/iu.test(line))).toBe(true);
      }
    ),
  ],
  guide: "combobox-autocomplete",
  start: async ({ open, page }) => {
    await page.clock.install();
    await open();
  },
};
