// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; Effect wraps each call once, in attempt.
import {
  ALREADY_REACHED,
  DEFAULT_BUDGET,
  DRIVEN_RUNS,
  STUCK_REPEATS,
  ScenarioAudit,
  ScenarioAuditFailed,
  ScenarioDriver,
  reached,
  statusOf,
  treeOf,
  unknownInput,
} from "@good-a11y/core";
import type {
  DriverAction,
  LocalUrl,
  Scenario,
  ScenarioResult,
  ScenarioRun,
  ScenarioState,
  ScenarioStep,
} from "@good-a11y/core";
import { Cause, Effect, Layer } from "effect";
import type { Browser, Page } from "playwright";

import { attempt, contextFor, withBrowser } from "./browser.js";
import type { BrowserStepFailed, FlowChrome } from "./browser.js";

const REPLAY_TIMEOUT_MS = 60_000;

const DRIVE_TIMEOUT_MS = 15 * 60_000;

const POLL_MS = 100;

const SETTLE_POLLS = 20;

const FOCUS_MS = 1000;

const timedOut = (ms: number): string =>
  `The run did not finish within ${ms / 1000} seconds.`;

const STUCK = `The page stayed the same for ${STUCK_REPEATS} turns, so the run stopped: focus may be trapped or the keys do nothing here.`;

const outOfBudget = (budget: number): string =>
  `The run used its ${budget} keys without reaching the success condition. Raise "budget" if the task needs more.`;

interface Played {
  readonly focused: string | null;
  readonly problem: string | null;
  readonly reached: boolean;
  readonly trace: readonly ScenarioStep[];
}

const snapshotOf = (page: Page) =>
  attempt(async () => await page.locator("body").ariaSnapshot());

const stateOf = (page: Page) =>
  snapshotOf(page).pipe(
    Effect.map((snapshot): ScenarioState => ({
      ...treeOf(snapshot),
      path: new URL(page.url()).pathname,
    }))
  );

const settled = (page: Page) =>
  attempt(async () => {
    await page.waitForTimeout(POLL_MS);
    await page.waitForLoadState("load");
  });

const reachedWithin = (page: Page, scenario: Scenario, polls: number) =>
  Effect.gen(function* poll() {
    for (let round = 0; round < polls; round += 1) {
      if (reached(scenario.success, yield* stateOf(page))) {
        return true;
      }

      yield* settled(page);
    }

    return reached(scenario.success, yield* stateOf(page));
  });

const focusedOf = (page: Page) =>
  attempt(
    async () =>
      await page
        .locator(":focus")
        .first()
        .ariaSnapshot({ timeout: FOCUS_MS })
        .catch(() => null)
  );

const play = (page: Page, scenario: Scenario, step: ScenarioStep) =>
  Effect.gen(function* playStep() {
    if ("press" in step) {
      yield* attempt(async () => {
        await page.keyboard.press(step.press);
      });
    } else {
      const value = scenario.inputs?.[step.type];

      if (value === undefined) {
        return unknownInput(step.type);
      }

      yield* attempt(async () => {
        await page.keyboard.type(value);
      });
    }

    yield* settled(page);

    return null;
  });

const replay = (
  page: Page,
  scenario: Scenario,
  steps: readonly ScenarioStep[]
) =>
  Effect.gen(function* replaySteps() {
    if (reached(scenario.success, yield* stateOf(page))) {
      const already: Played = {
        focused: null,
        problem: ALREADY_REACHED,
        reached: false,
        trace: [],
      };

      return already;
    }

    for (const [index, step] of steps.entries()) {
      const problem = yield* play(page, scenario, step);
      const trace = steps.slice(0, index + 1);

      if (problem !== null) {
        const unplayable: Played = {
          focused: yield* focusedOf(page),
          problem,
          reached: false,
          trace: steps.slice(0, index),
        };

        return unplayable;
      }

      const last = index === steps.length - 1;

      if (yield* reachedWithin(page, scenario, last ? SETTLE_POLLS : 0)) {
        const done: Played = {
          focused: null,
          problem: null,
          reached: true,
          trace,
        };

        return done;
      }
    }

    const missed: Played = {
      focused: yield* focusedOf(page),
      problem: null,
      reached: false,
      trace: steps,
    };

    return missed;
  });

type Decision = DriverAction | { readonly failed: string };

const drive = (
  page: Page,
  scenario: Scenario,
  driver: ScenarioDriver["Service"]
) =>
  Effect.gen(function* driveSteps() {
    const budget = scenario.budget ?? DEFAULT_BUDGET;
    const inputs = Object.keys(scenario.inputs ?? {});
    const taken: ScenarioStep[] = [];
    const seen = new Map<string, number>();

    const stop = (
      focused: string | null,
      problem: string | null,
      done: boolean
    ): Played => ({
      focused,
      problem,
      reached: done,
      trace: [...taken],
    });

    for (;;) {
      const tree = yield* snapshotOf(page);
      const path = new URL(page.url()).pathname;

      if (reached(scenario.success, { ...treeOf(tree), path })) {
        return taken.length === 0
          ? stop(null, ALREADY_REACHED, false)
          : stop(null, null, true);
      }

      const focused = yield* focusedOf(page);
      const state = `${path}\n${focused ?? ""}\n${tree}`;
      const repeats = (seen.get(state) ?? 0) + 1;

      seen.set(state, repeats);

      if (repeats >= STUCK_REPEATS) {
        return stop(focused, STUCK, false);
      }

      if (taken.length >= budget) {
        return stop(focused, outOfBudget(budget), false);
      }

      const decision: Decision = yield* driver
        .next({
          focused,
          goal: scenario.goal,
          inputs,
          left: budget - taken.length,
          path,
          taken: [...taken],
          tree,
        })
        .pipe(
          Effect.catchTag("ScenarioDriverFailed", (error) =>
            Effect.succeed({ failed: error.message })
          )
        );

      if ("failed" in decision) {
        return stop(focused, decision.failed, false);
      }

      if ("giveUp" in decision) {
        return stop(focused, `The model gave up: ${decision.giveUp}`, false);
      }

      const problem = yield* play(page, scenario, decision);

      if (problem !== null) {
        return stop(focused, problem, false);
      }

      taken.push(decision);
    }
  });

const onFreshPage = (
  browser: Browser,
  url: string,
  blocked: Set<string>,
  timeoutMs: number,
  use: (page: Page) => Effect.Effect<Played, BrowserStepFailed>
) =>
  Effect.acquireUseRelease(
    attempt(
      async () => await contextFor(browser, new URL(url).origin, blocked, {})
    ),
    (context) =>
      attempt(async () => {
        const page = await context.newPage();

        await page.goto(url, { waitUntil: "load" });

        return page;
      }).pipe(Effect.flatMap(use), Effect.timeout(timeoutMs)),
    (context) =>
      attempt(async () => {
        await context.close();
      }).pipe(Effect.ignore)
  ).pipe(
    Effect.match({
      onFailure: (failed): Played => ({
        focused: null,
        problem: Cause.isTimeoutError(failed)
          ? timedOut(timeoutMs)
          : failed.detail,
        reached: false,
        trace: [],
      }),
      onSuccess: (played) => played,
    })
  );

const runOf = (played: Played, confirmed: boolean): ScenarioRun => ({
  confirmed,
  focused: played.focused,
  problem: played.problem,
  reached: played.reached,
  trace: played.trace,
});

const drivenRun = (
  browser: Browser,
  url: string,
  blocked: Set<string>,
  scenario: Scenario,
  driver: ScenarioDriver["Service"]
) =>
  Effect.gen(function* driveAndConfirm() {
    const driven = yield* onFreshPage(
      browser,
      url,
      blocked,
      DRIVE_TIMEOUT_MS,
      (page) => drive(page, scenario, driver)
    );

    if (!driven.reached) {
      return runOf(driven, false);
    }

    const replayed = yield* onFreshPage(
      browser,
      url,
      blocked,
      REPLAY_TIMEOUT_MS,
      (page) => replay(page, scenario, driven.trace)
    );

    return runOf(
      { ...driven, focused: replayed.focused, problem: replayed.problem },
      replayed.reached
    );
  });

const runScenario = (
  browser: Browser,
  base: LocalUrl,
  scenario: Scenario,
  driver: ScenarioDriver["Service"]
) =>
  Effect.gen(function* runOne() {
    const url = new URL(scenario.path ?? base, base).href;
    const blocked = new Set<string>();
    const { keys } = scenario;

    const runs =
      keys === undefined
        ? yield* Effect.all(
            Array.from({ length: DRIVEN_RUNS }, () =>
              drivenRun(browser, url, blocked, scenario, driver)
            ),
            { concurrency: DRIVEN_RUNS }
          )
        : [
            yield* onFreshPage(
              browser,
              url,
              blocked,
              REPLAY_TIMEOUT_MS,
              (page) => replay(page, scenario, keys)
            ).pipe(Effect.map((played) => runOf(played, played.reached))),
          ];

    const mode = keys === undefined ? "driven" : "replayed";

    const result: ScenarioResult = {
      blocked: [...blocked],
      driver: mode === "driven" ? driver.model : null,
      goal: scenario.goal,
      id: scenario.id,
      mode,
      runs,
      status: statusOf(mode, runs),
      url,
    };

    return result;
  });

export const playwrightScenarioAuditLayer = (chrome: FlowChrome) =>
  Layer.effect(
    ScenarioAudit,
    Effect.gen(function* scenarioAudit() {
      const driver = yield* ScenarioDriver;

      return ScenarioAudit.of({
        run: (base, scenarios) =>
          withBrowser(chrome, (browser) =>
            Effect.all(
              scenarios.map((scenario) =>
                runScenario(browser, base, scenario, driver)
              )
            )
          ).pipe(
            Effect.mapError(
              (failed) => new ScenarioAuditFailed({ detail: failed.detail })
            )
          ),
      });
    })
  );
