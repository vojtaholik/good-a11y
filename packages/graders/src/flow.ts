// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; graders hold no Effect code.
import { FlowTargetSchema } from "@good-a11y/core";
import type { Flow, FlowTarget } from "@good-a11y/core";
import { GUIDES } from "@good-a11y/guides";
import type { FlowValue } from "@good-a11y/guides";
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

const declared = (flow: Flow, key: string): FlowValue => {
  const entry = GUIDES.find((guide) => guide.id === flow.guide)?.flow.find(
    (candidate) => candidate.key === key
  );

  if (entry === undefined) {
    throw new Error(
      `The ${flow.guide} grader reads the target "${key}", which the guide's flow.json does not declare. Declare it there with what it means and its value on the demo.`
    );
  }

  return entry.demo;
};

const valueOf = <A>(
  flow: Flow,
  key: string,
  is: (value: unknown) => value is A,
  kind: string
): A => {
  const demo = declared(flow, key);
  const given = flow.targets?.[key];

  if (is(given)) {
    return given;
  }

  if (!is(demo)) {
    throw new Error(
      `The ${flow.guide} guide's flow.json gives "${key}" a demo value that is not ${kind}.`
    );
  }

  return demo;
};

export const target = (page: Page, flow: Flow, key: string): Locator =>
  locate(page, valueOf(flow, key, isTarget, "a target"));

export const text = (flow: Flow, key: string): string =>
  valueOf(flow, key, isText, "a string");

export const texts = (flow: Flow, key: string): readonly string[] =>
  valueOf(flow, key, isTexts, "a list of strings");

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
