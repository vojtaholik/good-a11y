// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; Effect wraps each scenario once, in attempt.
import {
  ALREADY_REACHED,
  ScenarioAudit,
  ScenarioAuditFailed,
  reached,
  treeOf,
  unknownInput,
} from "@good-a11y/core";
import type {
  LocalUrl,
  Scenario,
  ScenarioResult,
  ScenarioState,
} from "@good-a11y/core";
import { Cause, Effect, Layer } from "effect";
import type { Browser, Page } from "playwright";

import { attempt, contextFor, withBrowser } from "./browser.js";
import type { FlowChrome } from "./browser.js";

const SCENARIO_TIMEOUT_MS = 60_000;

const POLL_MS = 100;

const SETTLE_POLLS = 20;

const FOCUS_MS = 1000;

const TIMED_OUT = `The scenario did not finish within ${SCENARIO_TIMEOUT_MS / 1000} seconds.`;

interface Replayed {
  readonly focused: string | null;
  readonly problem: string | null;
  readonly reached: boolean;
  readonly steps: number;
}

const stateOf = async (page: Page): Promise<ScenarioState> => ({
  ...treeOf(await page.locator("body").ariaSnapshot()),
  path: new URL(page.url()).pathname,
});

const settled = async (page: Page): Promise<void> => {
  await page.waitForTimeout(POLL_MS);
  await page.waitForLoadState("load");
};

const reachedWithin = async (
  page: Page,
  scenario: Scenario,
  polls: number
): Promise<boolean> => {
  for (let poll = 0; poll < polls; poll += 1) {
    if (reached(scenario.success, await stateOf(page))) {
      return true;
    }

    await settled(page);
  }

  return reached(scenario.success, await stateOf(page));
};

const focusedOf = async (page: Page): Promise<string | null> =>
  await page
    .locator(":focus")
    .first()
    .ariaSnapshot({ timeout: FOCUS_MS })
    .catch(() => null);

const replay = async (page: Page, scenario: Scenario): Promise<Replayed> => {
  if (reached(scenario.success, await stateOf(page))) {
    return {
      focused: null,
      problem: ALREADY_REACHED,
      reached: false,
      steps: 0,
    };
  }

  for (const [index, step] of scenario.keys.entries()) {
    if ("press" in step) {
      await page.keyboard.press(step.press);
    } else {
      const value = scenario.inputs?.[step.type];

      if (value === undefined) {
        return {
          focused: await focusedOf(page),
          problem: unknownInput(step.type),
          reached: false,
          steps: index,
        };
      }

      await page.keyboard.type(value);
    }

    await settled(page);

    const last = index === scenario.keys.length - 1;

    if (await reachedWithin(page, scenario, last ? SETTLE_POLLS : 0)) {
      return { focused: null, problem: null, reached: true, steps: index + 1 };
    }
  }

  return {
    focused: await focusedOf(page),
    problem: null,
    reached: false,
    steps: scenario.keys.length,
  };
};

const runScenario = (browser: Browser, base: LocalUrl, scenario: Scenario) =>
  Effect.gen(function* runOne() {
    const url = new URL(scenario.path ?? base, base).href;
    const blocked = new Set<string>();

    const outcome = yield* Effect.acquireUseRelease(
      attempt(
        async () => await contextFor(browser, new URL(url).origin, blocked, {})
      ),
      (context) =>
        attempt(async () => {
          const page = await context.newPage();

          await page.goto(url, { waitUntil: "load" });

          return await replay(page, scenario);
        }).pipe(Effect.timeout(SCENARIO_TIMEOUT_MS)),
      (context) =>
        attempt(async () => {
          await context.close();
        }).pipe(Effect.ignore)
    ).pipe(
      Effect.match({
        onFailure: (failed): Replayed => ({
          focused: null,
          problem: Cause.isTimeoutError(failed) ? TIMED_OUT : failed.detail,
          reached: false,
          steps: 0,
        }),
        onSuccess: (replayed) => replayed,
      })
    );

    const result: ScenarioResult = {
      blocked: [...blocked],
      focused: outcome.focused,
      goal: scenario.goal,
      id: scenario.id,
      keys: scenario.keys.length,
      problem: outcome.problem,
      status: outcome.reached ? "finished" : "not_finished",
      steps: outcome.steps,
      url,
    };

    return result;
  });

export const playwrightScenarioAuditLayer = (chrome: FlowChrome) =>
  Layer.succeed(
    ScenarioAudit,
    ScenarioAudit.of({
      run: (base, scenarios) =>
        withBrowser(chrome, (browser) =>
          Effect.all(
            scenarios.map((scenario) => runScenario(browser, base, scenario))
          )
        ).pipe(
          Effect.mapError(
            (failed) => new ScenarioAuditFailed({ detail: failed.detail })
          )
        ),
    })
  );
