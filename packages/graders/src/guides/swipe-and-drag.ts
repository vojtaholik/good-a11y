// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; graders hold no Effect code.
import type { Flow } from "@good-a11y/core";
import { expect } from "playwright/test";
import type { Page } from "playwright/test";

import { texts } from "../flow.js";
import { claim } from "../grader.js";
import type { Grader } from "../grader.js";

interface Box {
  readonly height: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
}

const items = (flow: Flow) =>
  texts(flow, "items", ["Rain jacket", "Hiking boot"]);

const present = async (page: Page, item: string): Promise<boolean> =>
  await page.evaluate((name) => {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT
    );

    for (
      let node = walker.nextNode();
      node !== null;
      node = walker.nextNode()
    ) {
      const parent = node.parentElement;

      if (
        (node.textContent ?? "").includes(name) &&
        parent !== null &&
        parent.closest(
          "[role=status], [role=alert], [role=log], [aria-live], button, script, title, head"
        ) === null
      ) {
        return true;
      }
    }

    return false;
  }, item);

const rowOf = async (page: Page, item: string): Promise<Box> => {
  const box = await page.evaluate((name) => {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT
    );

    for (
      let node = walker.nextNode();
      node !== null;
      node = walker.nextNode()
    ) {
      const parent = node.parentElement;

      if (
        (node.textContent ?? "").includes(name) &&
        parent !== null &&
        parent.closest("main") !== null &&
        parent.closest("button, h1, h2, h3, p") === null
      ) {
        const row =
          parent.closest("li, tr, [role=listitem], [role=row], article") ??
          parent;

        const rect = row.getBoundingClientRect();

        if (rect.width > 0) {
          row.scrollIntoView({ block: "center" });
          const placed = row.getBoundingClientRect();

          return {
            height: placed.height,
            width: placed.width,
            x: placed.x,
            y: placed.y,
          };
        }
      }
    }

    return null;
  }, item);

  expect(box, `no line shows "${item}"`).not.toBeNull();

  return box ?? { height: 0, width: 0, x: 0, y: 0 };
};

const swipe = async (
  page: Page,
  item: string,
  back: boolean
): Promise<void> => {
  const row = await rowOf(page, item);
  const y = row.y + row.height / 2;
  const from = row.x + row.width * 0.6;

  await page.mouse.move(from, y);
  await page.mouse.down();
  await page.mouse.move(from - row.width * 0.85, y, { steps: 20 });

  if (back) {
    await page.mouse.move(from, y, { steps: 20 });
  }

  await page.mouse.up();
  await page.waitForTimeout(700);
};

export const grader: Grader = {
  claims: [
    claim(
      1,
      "a line can be removed without swiping",
      async ({ page, flow }) => {
        const [first = ""] = items(flow);

        const remove = page
          .getByRole("button", { name: /remove|delete/iu })
          .or(page.getByRole("link", { name: /remove|delete/iu }))
          .filter({ visible: true })
          .first();

        expect(
          await remove.count(),
          "no remove control without a swipe"
        ).toBeGreaterThan(0);
        await remove.click();
        await page.waitForTimeout(700);
        expect(
          await present(page, first),
          "the remove control did not remove a line"
        ).toBe(false);
      }
    ),

    claim(
      2,
      "a swipe can be called off before release",
      async ({ page, flow }) => {
        const [first = ""] = items(flow);

        await swipe(page, first, true);
        expect(
          await present(page, first),
          "the line was removed although the swipe came back before release"
        ).toBe(true);
      }
    ),
  ],
  guide: "swipe-and-drag",
  start: async ({ flow, open, page }) => {
    await open();

    const last = items(flow).at(-1) ?? "";

    await swipe(page, last, false);
    expect(
      await present(page, last),
      "the task's feature is missing: swiping a line past half its width did not remove it"
    ).toBe(false);
  },
};
