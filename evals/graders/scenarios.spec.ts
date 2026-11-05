// @effect-diagnostics nodeBuiltinImport:off asyncFunction:off -- The spec reads each guide's scenario.json with Node built-ins and drives Playwright's Promise API; no Effect runs here.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { ScenarioSchema, reached, treeOf } from "@good-a11y/core";
import type { Scenario, ScenarioState } from "@good-a11y/core";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { Schema } from "effect";

import { demoUrl, guideDirs } from "./demo.ts";

const decode = Schema.decodeUnknownSync(Schema.fromJsonString(ScenarioSchema));

const SETTLE_MS = 100;

const TYPE_DELAY_MS = 50;

const stateOf = async (page: Page): Promise<ScenarioState> => ({
  ...treeOf(await page.locator("body").ariaSnapshot()),
  path: new URL(page.url()).pathname,
});

const finishes = async (page: Page, scenario: Scenario): Promise<boolean> =>
  reached({ ...scenario.success, path: undefined }, await stateOf(page));

for (const { dir, id } of guideDirs()) {
  const file = path.join(dir, "scenario.json");

  if (existsSync(file)) {
    test(`${id}: its scenario's keys finish the task on demo.html, and not before the first key`, async ({
      page,
    }) => {
      const scenario = decode(readFileSync(file, "utf-8"));

      await page.goto(demoUrl(id));

      expect(await finishes(page, scenario)).toBe(false);

      for (const step of scenario.keys ?? []) {
        if ("press" in step) {
          await page.keyboard.press(step.press);
        } else {
          const value = scenario.inputs?.[step.type];

          expect(value, `input "${step.type}" is in "inputs"`).toBeDefined();
          await page.keyboard.type(value ?? "", { delay: TYPE_DELAY_MS });
        }

        await page.waitForTimeout(SETTLE_MS);
      }

      await expect.poll(async () => await finishes(page, scenario)).toBe(true);
    });
  }
}
