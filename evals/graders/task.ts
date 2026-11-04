// @effect-diagnostics nodeBuiltinImport:off asyncFunction:off -- The graders read the task file with Node built-ins and drive Playwright's Promise API; no Effect runs here.
import { readFileSync } from "node:fs";

import type { Locator, Page } from "@playwright/test";
import { Schema } from "effect";

import { targetUrl } from "./demo.ts";

const RoleTargetSchema = Schema.Struct({
  exact: Schema.optional(Schema.Boolean),
  name: Schema.String,
  nth: Schema.optional(Schema.Int),
  role: Schema.String,
});

const TextTargetSchema = Schema.Struct({ text: Schema.String });

const TargetSchema = Schema.Union([RoleTargetSchema, TextTargetSchema]);

export type Target = typeof TargetSchema.Type;

const isTarget = Schema.is(TargetSchema);

const isText = Schema.is(Schema.String);

const isTexts = Schema.is(Schema.Array(Schema.String));

const Step = Schema.Union([
  Schema.Struct({ click: TargetSchema }),
  Schema.Struct({ press: Schema.String }),
]);

const TaskTargetsSchema = Schema.Struct({
  setup: Schema.optional(Schema.Array(Step)),
  targets: Schema.optional(
    Schema.Record(
      Schema.String,
      Schema.Union([TargetSchema, Schema.String, Schema.Array(Schema.String)])
    )
  ),
});

type TaskTargets = typeof TaskTargetsSchema.Type;

const decode = Schema.decodeUnknownSync(
  Schema.fromJsonString(TaskTargetsSchema)
);

const readTask = (): TaskTargets => {
  const file = process.env.EVAL_TASK;

  if (file === undefined || file === "") {
    return {};
  }

  try {
    return decode(readFileSync(file, "utf-8"));
  } catch (error) {
    throw new Error(
      `EVAL_TASK ${file} is not a readable task with valid targets and setup: ${String(error)}. Fix the task json or unset EVAL_TASK to grade the demo.`,
      { cause: error }
    );
  }
};

const task = readTask();

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

export const locate = (page: Page, target: Target): Locator => {
  if ("text" in target) {
    return page.getByText(target.text, { exact: false }).first();
  }

  if (!isAriaRole(target.role)) {
    throw new Error(
      `Target role "${target.role}" is not one the graders know (${AriaRoles.join(", ")}). Use one of those roles in the task json.`
    );
  }

  return page
    .getByRole(target.role, {
      exact: target.exact ?? true,
      name: target.name,
    })
    .nth(target.nth ?? 0);
};

export const target = (page: Page, key: string, demo: Target): Locator => {
  const given = task.targets?.[key];

  return locate(page, isTarget(given) ? given : demo);
};

export const text = (key: string, demo: string): string => {
  const given = task.targets?.[key];

  return isText(given) ? given : demo;
};

export const texts = (
  key: string,
  demo: readonly string[]
): readonly string[] => {
  const given = task.targets?.[key];

  return isTexts(given) ? given : demo;
};

export const open = async (page: Page, guide: string): Promise<void> => {
  await page.goto(targetUrl(guide));

  for (const step of task.setup ?? []) {
    await ("press" in step
      ? page.keyboard.press(step.press)
      : locate(page, step.click).click());
  }
};

export const textOf = async (locator: Locator): Promise<string> => {
  const raw = await locator.textContent();

  return raw?.trim() ?? "";
};
