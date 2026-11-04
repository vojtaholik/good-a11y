// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { open, texts } from "./task.ts";

interface Box {
  readonly height: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
}

const items = () => texts("items", ["Rain jacket", "Hiking boot"]);

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

test.beforeEach(async ({ page }) => {
  await open(page, "swipe-and-drag");

  const last = items().at(-1) ?? "";

  await swipe(page, last, false);
  expect(
    await present(page, last),
    "the task's feature is missing: swiping a line past half its width did not remove it"
  ).toBe(false);
});

test("E1 a line can be removed without swiping", async ({ page }) => {
  const [first = ""] = items();

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
});

test("E2 a swipe can be called off before release", async ({ page }) => {
  const [first = ""] = items();

  await swipe(page, first, true);
  expect(
    await present(page, first),
    "the line was removed although the swipe came back before release"
  ).toBe(true);
});
