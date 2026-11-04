// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";

import { targetUrl } from "./demo.ts";

test.beforeEach(async ({ page }) => {
  await page.goto(targetUrl("image-alt"));
});

test("E1 every img has an alt attribute", async ({ page }) => {
  await expect(page.locator("img:not([alt])")).toHaveCount(0);
});

test("E2 no alt is a file name or 'image of'", async ({ page }) => {
  const alts = await page
    .locator("img")
    .evaluateAll((images) =>
      images.map((image) => image.getAttribute("alt") ?? "")
    );

  for (const alt of alts) {
    expect(alt).not.toMatch(/\.(?:jpe?g|png|svg|webp|gif)$/iu);
    expect(alt).not.toMatch(/^(?:image|picture|photo) of/iu);
  }
});

test("E3 image-only links are named", async ({ page }) => {
  await expect(page.getByRole("link", { name: "Acme home" })).toBeVisible();
});

test("E4 a card is one link named by its title", async ({ page }) => {
  await expect(page.locator('a[href="#trail-shoe"]')).toHaveCount(1);
  await expect(
    page.getByRole("link", { exact: true, name: "Trail running shoe" })
  ).toBeVisible();
});

test("E5 inline SVGs are hidden or named images", async ({ page }) => {
  await expect(
    page.locator("svg:not([aria-hidden='true']):not([role='img'])")
  ).toHaveCount(0);
  await expect(
    page.getByRole("img", { name: "Rated 4 out of 5" })
  ).toBeVisible();
});

test("E6 the chart has its data as text", async ({ page }) => {
  await expect(page.locator("figure:has(img) table")).toHaveCount(1);
});
