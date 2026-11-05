// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; graders hold no Effect code.
import type { Flow } from "@good-a11y/core";
import { expect } from "playwright/test";
import type { Locator, Page } from "playwright/test";

import { text, texts } from "../flow.js";
import { claim } from "../grader.js";
import type { Grader } from "../grader.js";

const REUSE = /same|copy|reuse|use (?:my|the|delivery)|as above|from step/iu;

const SOURCE = "data-eval-source";

const fieldsFor = (page: Page, label: string): Locator =>
  page.getByLabel(label, { exact: false });

const repeatOf = (page: Page, label: string): Locator =>
  fieldsFor(page, label)
    .and(page.locator(`:not([${SOURCE}])`))
    .filter({ visible: true });

const sample = (type: string | null, index: number): string => {
  if (type === "email") {
    return `walker${index}@example.com`;
  }

  if (type === "tel") {
    return `+420 777 000 00${index}`;
  }

  return `Entered ${index}`;
};

const fillRest = async (page: Page): Promise<void> => {
  const empty = page
    .locator(
      "input:not([type]), input[type=text], input[type=email], input[type=tel]"
    )
    .filter({ visible: true });

  const fields = await empty.all();

  for (const [index, field] of fields.entries()) {
    if ((await field.inputValue()) === "") {
      await field.fill(sample(await field.getAttribute("type"), index + 10));
    }
  }
};

const fillSources = async (
  page: Page,
  flow: Flow
): Promise<readonly string[]> => {
  const values: string[] = [];

  for (const [index, label] of texts(flow, "source").entries()) {
    const field = fieldsFor(page, label).first();
    const tag = await field.evaluate((node) => node.tagName);

    const type = await field.getAttribute("type");

    await (tag === "SELECT"
      ? field.selectOption({ index: 1 })
      : field.fill(sample(type, index + 1)));

    values.push(await field.inputValue());
    await field.evaluate((node, name) => {
      node.setAttribute(name, "");
    }, SOURCE);
  }

  const next = text(flow, "next");

  if (next !== "") {
    await fillRest(page);
    await page
      .getByRole("button", { exact: false, name: next })
      .first()
      .click();
  }

  return values;
};

const checkedReuse = (page: Page): Locator =>
  page
    .getByRole("checkbox", { checked: true, name: REUSE })
    .or(page.getByRole("switch", { checked: true, name: REUSE }))
    .or(page.getByRole("radio", { checked: true, name: REUSE }));

const reused = async (
  page: Page,
  values: readonly string[],
  flow: Flow
): Promise<boolean> => {
  const repeats = texts(flow, "repeat");
  let hidden = 0;

  for (const [index, label] of repeats.entries()) {
    const field = repeatOf(page, label).first();

    if ((await field.count()) === 0) {
      hidden += 1;
    } else if ((await field.inputValue()) !== values[index]) {
      return false;
    }
  }

  return hidden === 0 || (await checkedReuse(page).count()) > 0;
};

const reuse = async (page: Page, flow: Flow): Promise<readonly string[]> => {
  const values = await fillSources(page, flow);

  if (await reused(page, values, flow)) {
    return values;
  }

  const control = page
    .getByRole("checkbox", { name: REUSE })
    .or(page.getByRole("switch", { name: REUSE }))
    .or(page.getByRole("radio", { name: REUSE }))
    .or(page.getByRole("button", { name: REUSE }))
    .first();

  expect(
    await control.count(),
    "the later fields are empty and nothing offers the earlier values"
  ).toBeGreaterThan(0);
  await control.click();

  return values;
};

export const grader: Grader = {
  claims: [
    claim(
      1,
      "the earlier values are filled in or offered",
      async ({ page, flow }) => {
        const values = await reuse(page, flow);

        expect(await reused(page, values, flow)).toBe(true);
      }
    ),

    claim(
      2,
      "the later fields can still take different values",
      async ({ page, flow }) => {
        await reuse(page, flow);

        const choice = checkedReuse(page).first();

        if ((await choice.count()) > 0) {
          await choice.click();
        }

        for (const label of texts(flow, "repeat")) {
          const field = repeatOf(page, label).first();

          await expect(
            field,
            `${label} is not shown for a different value`
          ).toBeVisible();
          await field.fill("Different");
          expect(await field.inputValue()).toBe("Different");
        }
      }
    ),
  ],
  guide: "redundant-entry",
};
