// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { targetUrl } from "./demo.ts";

const submit = (page: Page) =>
  page.getByRole("button", { name: "Create account" });

const submitEmpty = async (page: Page) => {
  await submit(page).focus();
  await page.keyboard.press("Enter");
};

test.beforeEach(async ({ page }) => {
  await page.goto(targetUrl("form-errors-validation"));
});

test("E1 a failed submit stays and focuses the error summary", async ({
  page,
}) => {
  const before = page.url();
  await submitEmpty(page);
  expect(page.url()).toBe(before);
  await expect(
    page.getByRole("heading", { name: /problems? with your details/u })
  ).toBeFocused();
});

test("E2 aria-invalid appears only after the failed submit", async ({
  page,
}) => {
  await expect(page.locator('[aria-invalid="true"]')).toHaveCount(0);
  await submitEmpty(page);
  await expect(page.locator('[aria-invalid="true"]')).toHaveCount(3);
});

test("E3 each invalid field is described by its error", async ({ page }) => {
  await submitEmpty(page);
  await expect(page.getByLabel("Email address")).toHaveAccessibleDescription(
    /Enter your email address/u
  );
  await expect(page.getByLabel("Full name")).toHaveAccessibleDescription(
    /Enter your full name/u
  );
});

test("E4 summary links move focus to their fields", async ({ page }) => {
  await submitEmpty(page);
  await expect(page.locator("#error-summary a")).toHaveCount(3);
  await page.getByRole("link", { name: /^Email address:/u }).click();
  await expect(page.getByLabel("Email address")).toBeFocused();
});

test("E5 a corrected field loses its error on resubmit", async ({ page }) => {
  await submitEmpty(page);
  await page.getByLabel("Email address").fill("name@example.com");
  await submit(page).click();
  await expect(page.getByLabel("Email address")).not.toHaveAttribute(
    "aria-invalid",
    "true"
  );
  await expect(page.locator("#email-error")).toBeHidden();
});

test("E6 the submit button stays enabled", async ({ page }) => {
  await submitEmpty(page);
  await expect(submit(page)).toBeEnabled();
});
