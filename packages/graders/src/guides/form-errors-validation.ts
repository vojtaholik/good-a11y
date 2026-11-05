// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; graders hold no Effect code.
import type { Flow } from "@good-a11y/core";
import { expect } from "playwright/test";
import type { Page } from "playwright/test";

import { target } from "../flow.js";
import { claim } from "../grader.js";
import type { Grader } from "../grader.js";

const submit = (page: Page, flow: Flow) => target(page, flow, "submit");

const form = (page: Page, flow: Flow) =>
  submit(page, flow).locator("xpath=ancestor::form");

const invalid = (page: Page, flow: Flow) =>
  form(page, flow).locator('[aria-invalid="true"]');

const submitEmpty = async (page: Page, flow: Flow) => {
  await submit(page, flow).focus();
  await page.keyboard.press("Enter");
};

const VALID = new Map([
  ["email", "name@example.com"],
  ["number", "12"],
  ["tel", "+420 601 234 567"],
  ["url", "https://example.com"],
]);

export const grader: Grader = {
  claims: [
    claim(
      1,
      "a failed submit stays and focuses the summary or a field",
      async ({ page, flow }) => {
        const before = page.url();
        await submitEmpty(page, flow);
        await expect(invalid(page, flow).first()).toBeAttached();
        expect(page.url()).toBe(before);

        const lands = await page.evaluate(() => {
          const node = document.activeElement;

          if (node === null) {
            return false;
          }

          if (node.getAttribute("aria-invalid") === "true") {
            return true;
          }

          const ids = [
            ...document.querySelectorAll('[aria-invalid="true"]'),
          ].flatMap((field) => (field.id === "" ? [] : [field.id]));

          let scope: Element | null = node;

          for (let depth = 0; depth < 3 && scope !== null; depth += 1) {
            const area: Element = scope;

            if (
              ids.some((id) => area.querySelector(`a[href="#${id}"]`) !== null)
            ) {
              return true;
            }

            scope = scope.parentElement;
          }

          return false;
        });

        expect(lands).toBe(true);
      }
    ),

    claim(
      2,
      "aria-invalid appears only after the failed submit",
      async ({ page, flow }) => {
        await expect(invalid(page, flow)).toHaveCount(0);
        await submitEmpty(page, flow);
        expect(await invalid(page, flow).count()).toBeGreaterThan(0);
      }
    ),

    claim(
      3,
      "each invalid field is described by a visible error",
      async ({ page, flow }) => {
        await submitEmpty(page, flow);
        await expect(invalid(page, flow).first()).toBeAttached();

        for (const field of await invalid(page, flow).all()) {
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
      }
    ),

    claim(
      4,
      "summary links move focus to their fields",
      async ({ page, flow }) => {
        await submitEmpty(page, flow);
        await expect(invalid(page, flow).first()).toBeAttached();

        const ids = await invalid(page, flow).evaluateAll((nodes) =>
          nodes.map((node) => node.id)
        );

        const links = page.locator(
          ids.map((id) => `a[href="#${id}"]`).join(", ")
        );

        await expect(links).toHaveCount(ids.length);
        await links.last().click();
        await expect(page.locator(`[id="${ids.at(-1) ?? ""}"]`)).toBeFocused();
      }
    ),

    claim(
      5,
      "a corrected field loses its error on resubmit",
      async ({ page, flow }) => {
        await submitEmpty(page, flow);
        const field = invalid(page, flow).first();
        await expect(field).toBeAttached();
        const id = await field.evaluate((node) => node.id);

        const type = await field.evaluate((node) =>
          node instanceof HTMLInputElement ? node.type : "text"
        );

        const fixed = page.locator(`[id="${id}"]`);
        await fixed.fill(VALID.get(type) ?? "Jana Novak");
        await submit(page, flow).click();
        await expect(fixed).not.toHaveAttribute("aria-invalid", "true");
      }
    ),

    claim(6, "the submit button stays enabled", async ({ page, flow }) => {
      await submitEmpty(page, flow);
      await expect(submit(page, flow)).toBeEnabled();
    }),
  ],
  guide: "form-errors-validation",
};
