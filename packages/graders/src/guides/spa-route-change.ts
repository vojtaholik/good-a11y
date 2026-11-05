// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; graders hold no Effect code.
import type { Flow } from "@good-a11y/core";
import { expect } from "playwright/test";
import type { Page } from "playwright/test";

import { target, text, textOf } from "../flow.js";
import { claim } from "../grader.js";
import type { Grader } from "../grader.js";

const route = (page: Page, flow: Flow) =>
  target(page, flow, "link", { name: "Journal", role: "link" });

const heading = (page: Page) => page.locator("main h1, h1").first();

const go = async (page: Page, flow: Flow) => {
  const before = {
    h1: await textOf(heading(page)),
    title: await page.title(),
  };

  await route(page, flow).focus();
  await page.keyboard.press("Enter");
  await expect(heading(page)).not.toHaveText(before.h1);

  return before;
};

export const grader: Grader = {
  claims: [
    claim(1, "the title follows the new view", async ({ page, flow }) => {
      const before = await go(page, flow);
      const h1 = await textOf(heading(page));
      await expect(page).not.toHaveTitle(before.title);
      const title = await page.title();
      expect(title.toLowerCase()).toContain(h1.toLowerCase());
    }),

    claim(
      2,
      "focus lands on the new heading or main",
      async ({ page, flow }) => {
        await go(page, flow);

        const on = await page.evaluate(() => {
          const node = document.activeElement;

          return node?.matches("h1, main") === true;
        });

        expect(on).toBe(true);
      }
    ),

    claim(3, "the next Tab continues inside main", async ({ page, flow }) => {
      await go(page, flow);
      await page.keyboard.press("Tab");
      await expect(page.getByRole("main").locator(":focus")).toHaveCount(1);
    }),

    claim(
      4,
      "aria-current marks only the current view",
      async ({ page, flow }) => {
        await go(page, flow);
        const current = page.locator('[aria-current="page"]');
        expect(await current.count()).toBeLessThanOrEqual(1);
        const name = text(flow, "current", "Journal");

        if (name !== "") {
          await expect(current).toHaveCount(1);
          await expect(current).toHaveText(name);
        }
      }
    ),

    claim(5, "Back restores the view and title", async ({ page, flow }) => {
      const before = await go(page, flow);
      await page.goBack();
      await expect(page).toHaveTitle(before.title);
      await expect(heading(page)).toHaveText(before.h1);
    }),

    claim(6, "the first load leaves focus alone", async ({ page }) => {
      const tag = await page.evaluate(() => document.activeElement?.tagName);
      expect(tag).toBe("BODY");
    }),
  ],
  guide: "spa-route-change",
};
