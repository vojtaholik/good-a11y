// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";

import { open, texts } from "./task.ts";

const FIELDS =
  "input:not([type=hidden]):not([type=submit]):not([type=button]), select, textarea";

const required = () =>
  texts("required", [
    "Full name",
    "Email address",
    "Phone number",
    "Postal code",
  ]);

const hinted = () => texts("hinted", ["Email address", "Phone number"]);

test.beforeEach(async ({ page }) => {
  await open(page, "required-and-hints");
});

test("E1 every field has a real, visible label", async ({ page }) => {
  const bare = await page.locator(FIELDS).evaluateAll((nodes) =>
    nodes
      .filter((node) => node instanceof HTMLElement && node.checkVisibility())
      .filter((node) => {
        const labels =
          node instanceof HTMLInputElement ||
          node instanceof HTMLSelectElement ||
          node instanceof HTMLTextAreaElement
            ? node.labels
            : null;

        const byLabel =
          labels !== null &&
          [...labels].some((label) => (label.textContent?.trim() ?? "") !== "");

        const byRef = (node.getAttribute("aria-labelledby") ?? "")
          .split(" ")
          .some(
            (id) =>
              id !== "" &&
              (document
                .querySelector(`#${CSS.escape(id)}`)
                ?.textContent?.trim() ?? "") !== ""
          );

        return !byLabel && !byRef;
      })
      .map((node) => node.outerHTML.slice(0, 80))
  );

  expect(bare).toEqual([]);
});

test("E2 required fields are required and marked in text", async ({ page }) => {
  for (const name of required()) {
    const field = page.getByLabel(name, { exact: false }).first();

    const state = await field.evaluate((node) => ({
      aria: node.getAttribute("aria-required") === "true",
      native: "required" in node && node.required === true,
    }));

    expect(state.native || state.aria).toBe(true);
  }

  const marked = await page.evaluate(() => {
    // oxlint-disable-next-line unicorn/consistent-function-scoping -- runs inside the page through page.evaluate, which cannot capture module scope
    const labelText = (node: Element) =>
      node instanceof HTMLInputElement ||
      node instanceof HTMLSelectElement ||
      node instanceof HTMLTextAreaElement
        ? Array.from(
            node.labels ?? [],
            (label) => label.textContent ?? ""
          ).join(" ")
        : "";

    const fields = [...document.querySelectorAll("input, select, textarea")];

    const requiredOnes = fields.filter(
      (node) =>
        node.hasAttribute("required") ||
        node.getAttribute("aria-required") === "true"
    );

    const optionalOnes = fields.filter(
      (node) =>
        !requiredOnes.includes(node) && node.getAttribute("type") !== "radio"
    );

    const everyRequiredSays = requiredOnes.every((node) =>
      /required|\*/iu.test(labelText(node))
    );

    const optionalSay = optionalOnes.some((node) =>
      /optional/iu.test(labelText(node))
    );

    return everyRequiredSays || optionalSay;
  });

  expect(marked).toBe(true);
});

test("E3 hints are part of the description", async ({ page }) => {
  for (const name of hinted()) {
    await expect(
      page.getByLabel(name, { exact: false }).first()
    ).toHaveAccessibleDescription(/\S/u);
  }
});

test("E4 radios are grouped under their question", async ({ page }) => {
  for (const radio of await page.getByRole("radio").all()) {
    const grouped = await radio.evaluate((node) => {
      const set = node.closest("fieldset");

      if (set !== null) {
        return (set.querySelector("legend")?.textContent?.trim() ?? "") !== "";
      }

      const group = node.closest('[role="radiogroup"], [role="group"]');

      return (
        group !== null &&
        (group.hasAttribute("aria-label") ||
          group.hasAttribute("aria-labelledby"))
      );
    });

    expect(grouped).toBe(true);
  }
});

test("E5 personal fields use autocomplete tokens", async ({ page }) => {
  const wrong = await page.locator(FIELDS).evaluateAll((nodes) =>
    nodes.flatMap((node) => {
      const labels =
        node instanceof HTMLInputElement
          ? Array.from(
              node.labels ?? [],
              (label) => label.textContent ?? ""
            ).join(" ")
          : "";

      const token = node.getAttribute("autocomplete") ?? "";

      const rules: [RegExp, RegExp][] = [
        [/e-?mail/iu, /\bemail\b/u],
        [/phone|telephone/iu, /\btel\b/u],
        [/^\s*(?:full )?name\b/iu, /\b(?:name|given-name|family-name)\b/u],
      ];

      return rules.flatMap(([label, want]) =>
        label.test(labels) && !want.test(token) ? [labels.trim()] : []
      );
    })
  );

  expect(wrong).toEqual([]);
});

test("E6 clicking a label focuses its field", async ({ page }) => {
  for (const label of await page.locator("label[for]").all()) {
    const id = await label.getAttribute("for");
    const field = page.locator(`[id="${id ?? ""}"]`);

    if (await field.isVisible()) {
      await label.click();
      await expect(field).toBeFocused();
    }
  }
});
