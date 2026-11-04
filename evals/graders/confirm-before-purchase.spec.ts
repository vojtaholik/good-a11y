// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { accessibleName } from "./name.ts";
import { open, target, text } from "./task.ts";

const CONFIRM = /place|confirm|pay|order|book|buy|yes|complete|continue/iu;

const BACK_OUT = /cancel|back|close|no\b|not now|keep|edit|change/iu;

const CANCELLED = /cancel+ed/iu;

const placedText = () => text("placed", "Thank you");

const SHOWN_BEFORE = "data-eval-shown-before";

const shownBefore = new WeakMap<Page, number>();

const placedCount = async (page: Page): Promise<number> =>
  await page
    .getByText(placedText(), { exact: false })
    .filter({ visible: true })
    .count();

const isPlaced = async (page: Page): Promise<boolean> => {
  const shown = await placedCount(page);

  return shown > (shownBefore.get(page) ?? 0);
};

const buyNow = async (page: Page): Promise<string> => {
  const buy = target(page, "buy", {
    exact: false,
    name: "Buy now",
    role: "button",
  });

  const label = await accessibleName(buy);
  const name = label.trim().toLowerCase();

  shownBefore.set(page, await placedCount(page));
  await page.evaluate((marker) => {
    for (const node of document.querySelectorAll(
      "button, [role=button], input[type=button], input[type=submit]"
    )) {
      if (node instanceof HTMLElement && node.checkVisibility()) {
        node.setAttribute(marker, "");
      }
    }
  }, SHOWN_BEFORE);
  await buy.click();
  await page.waitForTimeout(400);

  return name;
};

const visibleButtons = async (
  page: Page,
  pattern: RegExp,
  except: string
): Promise<readonly Locator[]> => {
  const found: Locator[] = [];

  for (const button of await page
    .getByRole("button")
    .and(page.locator(`:not([${SHOWN_BEFORE}])`))
    .filter({ visible: true })
    .all()) {
    const label = await accessibleName(button);
    const name = label.trim();

    if (pattern.test(name) && name.toLowerCase() !== except) {
      found.push(button);
    }
  }

  return found;
};

const cancelOrder = (page: Page): Locator =>
  page
    .getByRole("button", { name: /cancel|undo/iu })
    .or(page.getByRole("link", { name: /cancel|undo/iu }))
    .filter({ visible: true })
    .first();

test.beforeEach(async ({ page }) => {
  await open(page, "confirm-before-purchase");
});

test("E1 one activation does not make the order final", async ({ page }) => {
  const buyName = await buyNow(page);

  if (await isPlaced(page)) {
    expect(
      await cancelOrder(page).count(),
      "the order was placed on one click and nothing offers to cancel it"
    ).toBeGreaterThan(0);

    return;
  }

  const confirmOnly: Locator[] = [];

  for (const button of await visibleButtons(page, CONFIRM, buyName)) {
    if (!BACK_OUT.test(await accessibleName(button))) {
      confirmOnly.push(button);
    }
  }

  expect(confirmOnly.length, "no review step asks to confirm").toBeGreaterThan(
    0
  );
  await confirmOnly[0]?.click();
  await page.waitForTimeout(400);
  expect(await isPlaced(page), "confirming did not place it").toBe(true);
});

test("E2 backing out leaves nothing ordered", async ({ page }) => {
  const buyName = await buyNow(page);

  if (await isPlaced(page)) {
    const cancel = cancelOrder(page);

    expect(
      await cancel.count(),
      "nothing offers to cancel the order"
    ).toBeGreaterThan(0);
    await cancel.click();
    await page.waitForTimeout(400);
    await expect(
      page.getByText(CANCELLED).filter({ visible: true }).first()
    ).toBeVisible();

    return;
  }

  const review = await visibleButtons(page, CONFIRM, buyName);

  expect(review.length, "no review step opened to back out of").toBeGreaterThan(
    0
  );

  const [backOut] = await visibleButtons(page, BACK_OUT, buyName);

  await (backOut === undefined
    ? page.keyboard.press("Escape")
    : backOut.click());
  await page.waitForTimeout(400);
  expect(await isPlaced(page)).toBe(false);
});
