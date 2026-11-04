// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";

import { targetUrl } from "./demo.ts";

test.beforeEach(async ({ page }) => {
  await page.goto(targetUrl("icon-buttons"));
});

test("E1 every icon-only control has a name", async ({ page }) => {
  for (const control of await page.locator(".icon-button").all()) {
    const name = await control.evaluate(
      (node) =>
        node.getAttribute("aria-label") ??
        node.querySelector(".visually-hidden")?.textContent ??
        ""
    );

    expect(name.trim()).not.toBe("");
  }

  await expect(page.getByRole("link", { name: "Help" })).toBeVisible();
});

test("E2 repeated buttons name their item", async ({ page }) => {
  await expect(
    page.getByRole("button", { name: "Remove Rain jacket" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Remove Hiking boot" })
  ).toBeVisible();
});

test("E3 icons inside named buttons are hidden", async ({ page }) => {
  await expect(
    page.locator(".icon-button svg:not([aria-hidden='true'])")
  ).toHaveCount(0);
});

test("E4 a toggle keeps its name and flips aria-pressed", async ({ page }) => {
  const toggle = page.getByRole("button", {
    exact: true,
    name: "Save cart for later",
  });

  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await toggle.focus();
  await page.keyboard.press("Space");
  await expect(
    page.getByRole("button", {
      exact: true,
      name: "Save cart for later",
      pressed: true,
    })
  ).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
});

test("E5 icon targets are at least 24 by 24", async ({ page }) => {
  for (const control of await page.locator(".icon-button").all()) {
    const box = await control.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(24);
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(24);
  }
});
