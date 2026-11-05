// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; graders hold no Effect code.
import { FlowTargetSchema } from "@good-a11y/core";
import type { Flow, FlowTarget } from "@good-a11y/core";
import { Schema } from "effect";
import { expect } from "playwright/test";
import type { Locator, Page } from "playwright/test";

const isTarget = Schema.is(FlowTargetSchema);

const isText = Schema.is(Schema.String);

const isTexts = Schema.is(Schema.Array(Schema.String));

const AriaRoles = [
  "button",
  "checkbox",
  "combobox",
  "dialog",
  "heading",
  "img",
  "link",
  "listbox",
  "menu",
  "menuitem",
  "option",
  "radio",
  "region",
  "status",
  "tab",
  "tablist",
  "tabpanel",
  "textbox",
] as const;

type AriaRole = (typeof AriaRoles)[number];

const isAriaRole = (role: string): role is AriaRole =>
  AriaRoles.some((known) => known === role);

export const locate = (page: Page, target: FlowTarget): Locator => {
  if ("text" in target) {
    return page.getByText(target.text, { exact: false }).first();
  }

  if ("css" in target) {
    return page.locator(target.css).first();
  }

  if (!isAriaRole(target.role)) {
    throw new Error(
      `Target role "${target.role}" is not one the graders know (${AriaRoles.join(", ")}). Use one of those roles in the flow.`
    );
  }

  return page
    .getByRole(target.role, {
      exact: target.exact ?? true,
      name: target.name,
    })
    .nth(target.nth ?? 0);
};

export const target = (
  page: Page,
  flow: Flow,
  key: string,
  demo: FlowTarget
): Locator => {
  const given = flow.targets?.[key];

  return locate(page, isTarget(given) ? given : demo);
};

export const text = (flow: Flow, key: string, demo: string): string => {
  const given = flow.targets?.[key];

  return isText(given) ? given : demo;
};

export const texts = (
  flow: Flow,
  key: string,
  demo: readonly string[]
): readonly string[] => {
  const given = flow.targets?.[key];

  return isTexts(given) ? given : demo;
};

export const openFlow = async (
  page: Page,
  flow: Flow,
  url: string
): Promise<void> => {
  await page.goto(url);

  for (const step of flow.setup ?? []) {
    await ("press" in step
      ? page.keyboard.press(step.press)
      : locate(page, step.click).click());
  }

  for (const required of flow.requires ?? []) {
    await expect(
      locate(page, required),
      `The flow's feature is missing: nothing matches ${JSON.stringify(required)}`
    ).toBeAttached();
  }
};

export const textOf = async (locator: Locator): Promise<string> => {
  const raw = await locator.textContent();

  return raw?.trim() ?? "";
};
