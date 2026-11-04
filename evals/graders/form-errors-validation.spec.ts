// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { open, target } from "./task.ts";

const submit = (page: Page) =>
  target(page, "submit", { name: "Create account", role: "button" });

const form = (page: Page) => submit(page).locator("xpath=ancestor::form");

const invalid = (page: Page) => form(page).locator('[aria-invalid="true"]');

const submitEmpty = async (page: Page) => {
  await submit(page).focus();
  await page.keyboard.press("Enter");
};

const VALID = new Map([
  ["email", "name@example.com"],
  ["number", "12"],
  ["tel", "+420 601 234 567"],
  ["url", "https://example.com"],
]);

test.beforeEach(async ({ page }) => {
  await open(page, "form-errors-validation");
});

test("E1 a failed submit stays and focuses the summary or a field", async ({
  page,
}) => {
  const before = page.url();
  await submitEmpty(page);
  await expect(invalid(page).first()).toBeAttached();
  expect(page.url()).toBe(before);

  const lands = await page.evaluate(() => {
    const node = document.activeElement;

    if (node === null) {
      return false;
    }

    if (node.getAttribute("aria-invalid") === "true") {
      return true;
    }

    const ids = [...document.querySelectorAll('[aria-invalid="true"]')].flatMap(
      (field) => (field.id === "" ? [] : [field.id])
    );

    let scope: Element | null = node;

    for (let depth = 0; depth < 3 && scope !== null; depth += 1) {
      const area: Element = scope;

      if (ids.some((id) => area.querySelector(`a[href="#${id}"]`) !== null)) {
        return true;
      }

      scope = scope.parentElement;
    }

    return false;
  });

  expect(lands).toBe(true);
});

test("E2 aria-invalid appears only after the failed submit", async ({
  page,
}) => {
  await expect(invalid(page)).toHaveCount(0);
  await submitEmpty(page);
  expect(await invalid(page).count()).toBeGreaterThan(0);
});

test("E3 each invalid field is described by a visible error", async ({
  page,
}) => {
  await submitEmpty(page);
  await expect(invalid(page).first()).toBeAttached();

  for (const field of await invalid(page).all()) {
    await expect(field).toHaveAccessibleDescription(/\S/u);

    const shown = await field.evaluate((node) =>
      (node.getAttribute("aria-describedby") ?? "")
        .split(" ")
        .map((id) => document.querySelector(`#${CSS.escape(id)}`))
        .some(
          (error) =>
            error !== null &&
            error.checkVisibility() &&
            (error.textContent?.trim() ?? "") !== ""
        )
    );

    expect(shown).toBe(true);
  }
});

test("E4 summary links move focus to their fields", async ({ page }) => {
  await submitEmpty(page);
  await expect(invalid(page).first()).toBeAttached();

  const ids = await invalid(page).evaluateAll((nodes) =>
    nodes.map((node) => node.id)
  );

  const links = page.locator(ids.map((id) => `a[href="#${id}"]`).join(", "));
  await expect(links).toHaveCount(ids.length);
  await links.last().click();
  await expect(page.locator(`[id="${ids.at(-1) ?? ""}"]`)).toBeFocused();
});

test("E5 a corrected field loses its error on resubmit", async ({ page }) => {
  await submitEmpty(page);
  const field = invalid(page).first();
  await expect(field).toBeAttached();
  const id = await field.evaluate((node) => node.id);

  const type = await field.evaluate((node) =>
    node instanceof HTMLInputElement ? node.type : "text"
  );

  const fixed = page.locator(`[id="${id}"]`);
  await fixed.fill(VALID.get(type) ?? "Jana Novak");
  await submit(page).click();
  await expect(fixed).not.toHaveAttribute("aria-invalid", "true");
});

test("E6 the submit button stays enabled", async ({ page }) => {
  await submitEmpty(page);
  await expect(submit(page)).toBeEnabled();
});
