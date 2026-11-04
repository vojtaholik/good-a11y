// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";

import { targetUrl } from "./demo.ts";

test.beforeEach(async ({ page }) => {
  await page.goto(targetUrl("disclosure-accordion"));
});

test("E1 each toggle is a collapsed button", async ({ page }) => {
  for (const name of ["Shipping", "Returns"]) {
    await expect(page.getByRole("button", { name })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  }
});

test("E2 Enter expands and shows the panel content", async ({ page }) => {
  const toggle = page.getByRole("button", { name: "Shipping" });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#ship-panel p")).toBeVisible();
});

test("E3 Space collapses and hides the panel content", async ({ page }) => {
  const toggle = page.getByRole("button", { name: "Shipping" });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Space");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#ship-panel p")).toBeHidden();
});

test("E4 Tab skips links inside a closed panel", async ({ page }) => {
  await page.getByRole("button", { name: "Shipping" }).focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Returns" })).toBeFocused();
});

test("E5 each toggle sits inside a heading of the same name", async ({
  page,
}) => {
  for (const name of ["Shipping", "Returns"]) {
    await expect(page.getByRole("heading", { name })).toBeVisible();
    await expect(
      page.getByRole("heading", { name }).getByRole("button", { name })
    ).toBeVisible();
  }
});
