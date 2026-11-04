// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { accessibleName } from "./name.ts";
import { open, text } from "./task.ts";

const markIconControls = async (page: Page): Promise<number> =>
  await page.evaluate(() => {
    // oxlint-disable-next-line unicorn/consistent-function-scoping -- runs inside the page through page.evaluate, which cannot capture module scope
    const shown = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        const parent = node.parentElement;
        const box = parent?.getBoundingClientRect();

        return box !== undefined && box.width > 1 && box.height > 1
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

test.beforeEach(async ({ page }) => {
  await open(page, "icon-buttons");
  expect(await markIconControls(page)).toBeGreaterThan(0);
});

test("E1 every icon-only control has a name", async ({ page }) => {
  for (const control of await icons(page).all()) {
    await expect(control).toHaveAccessibleName(/\S/u);
  }
});

test("E2 repeated icon buttons have distinct names", async ({ page }) => {
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
});

test("E3 icons inside named controls are hidden", async ({ page }) => {
  await expect(
    page.locator("[data-grader-icon] svg:not([aria-hidden='true'])")
  ).toHaveCount(0);
});

test("E4 a toggle keeps its name and flips aria-pressed", async ({ page }) => {
  if (text("toggle", "yes") === "") {
    return;
  }

  const toggle = page.locator("[data-grader-icon][aria-pressed]").first();
  await expect(toggle).toHaveAttribute("aria-pressed", /^(?:true|false)$/u);
  const before = await toggle.getAttribute("aria-pressed");

  const name = await accessibleName(toggle);

  await toggle.focus();
  await page.keyboard.press("Space");
  await expect(toggle).toHaveAttribute(
    "aria-pressed",
    before === "true" ? "false" : "true"
  );
  await expect(toggle).toHaveAccessibleName(name);
});

test("E5 icon targets are at least 24 by 24", async ({ page }) => {
  for (const control of await icons(page).all()) {
    const box = await control.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(24);
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(24);
  }
});
