// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; graders hold no Effect code.
import type { Flow } from "@good-a11y/core";
import { expect } from "playwright/test";
import type { Page } from "playwright/test";

import { target } from "../flow.js";
import { claim } from "../grader.js";
import type { Grader } from "../grader.js";

const control = (page: Page, flow: Flow) => target(page, flow, "control");

const valueOf = async (page: Page, flow: Flow): Promise<string> =>
  await control(page, flow).evaluate((node) =>
    node instanceof HTMLSelectElement
      ? node.value
      : (node.textContent?.trim() ?? "")
  );

const typeAheadKey = async (page: Page, flow: Flow): Promise<string> =>
  await control(page, flow).evaluate((node) => {
    if (!(node instanceof HTMLSelectElement)) {
      return "";
    }

    const current = node.selectedOptions[0]?.text.trim().charAt(0) ?? "";

    const other = [...node.options].find(
      (option) =>
        !option.disabled &&
        option.text.trim().charAt(0).toLowerCase() !== current.toLowerCase()
    );

    return other?.text.trim().charAt(0).toLowerCase() ?? "";
  });

const change = async (page: Page, flow: Flow): Promise<string> => {
  const before = await valueOf(page, flow);
  const key = await typeAheadKey(page, flow);
  await control(page, flow).focus();

  if (key !== "") {
    await page.keyboard.press(key);

    return before;
  }

  await page.keyboard.press("ArrowDown");

  if ((await valueOf(page, flow)) === before) {
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
  }

  return before;
};

export const grader: Grader = {
  claims: [
    claim(1, "a combobox named by its label", async ({ page, flow }) => {
      await expect(control(page, flow)).toBeVisible();
    }),

    claim(2, "a native select's label focuses it", async ({ page, flow }) => {
      const native = await control(page, flow).evaluate(
        (node) => node instanceof HTMLSelectElement
      );

      if (native) {
        await control(page, flow).evaluate((node) => {
          if (node instanceof HTMLSelectElement) {
            node.labels[0]?.click();
          }
        });
        await expect(control(page, flow)).toBeFocused();
      }
    }),

    claim(3, "the keyboard changes the value", async ({ page, flow }) => {
      const before = await change(page, flow);
      expect(await valueOf(page, flow)).not.toBe(before);
    }),

    claim(4, "one Tab stop, options are not stops", async ({ page, flow }) => {
      await control(page, flow).focus();
      await page.keyboard.press("Tab");

      const stop = await page.evaluate(() => {
        const node = document.activeElement;

        return {
          option:
            node?.closest('[role="option"], [role="listbox"], option') !==
              null && node !== null,
          tag: node?.tagName ?? "",
        };
      });

      expect(stop.option).toBe(false);
      await expect(control(page, flow)).not.toBeFocused();
    }),

    claim(
      5,
      "a change neither navigates nor moves focus",
      async ({ page, flow }) => {
        const url = page.url();
        await change(page, flow);
        expect(page.url()).toBe(url);
        await expect(control(page, flow)).toBeFocused();
      }
    ),
  ],
  guide: "custom-select",
};
