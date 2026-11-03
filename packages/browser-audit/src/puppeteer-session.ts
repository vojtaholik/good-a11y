import { launch } from "@cloudflare/puppeteer";
import type { BrowserWorker } from "@cloudflare/puppeteer";
import {
  AXE_TAGS,
  RenderedAuditFailed,
  SCANNER_USER_AGENT,
  TRAP_PRESSES,
  TRAP_SIZE,
} from "@eaa-check/core";
import { Clock, Effect, Result, Schema } from "effect";

import { axeSource, probesSource } from "#page-scripts";

import { step } from "./browser-session.js";
import type { BrowserSession, LaunchSession } from "./browser-session.js";

export const VIEWPORT = { height: 800, width: 1280 } as const;

export const NAVIGATION_TIMEOUT_MS = 30_000;

const AXE_RUN = `axe.run(document, ${JSON.stringify({
  resultTypes: ["violations"],
  runOnly: { type: "tag", values: AXE_TAGS },
})}).then((results) => JSON.stringify(results))`;

export const REFLOW_VIEWPORT = { height: 256, width: 320 } as const;

export const MAX_PRESSES = 300;

const READ_EVERY = 10;

const REFLOW_SETTLE = "1 second";

const PROBE_TIMEOUT = "40 seconds";

const STEP_TIMEOUT = "8 seconds";

export const WALK_MILLIS = 15_000;

const TARGET_SIZE_RUN = `axe.run(document, ${JSON.stringify({
  resultTypes: ["violations"],
  runOnly: { type: "rule", values: ["target-size"] },
})}).then((results) => JSON.stringify(results))`;

const decodeKeys = Schema.decodeUnknownResult(
  Schema.Array(Schema.Struct({ key: Schema.Int }))
);

const decodeStops = Schema.decodeUnknownResult(Schema.Array(Schema.Unknown));

const keysOf = (stops: readonly unknown[]): readonly number[] => {
  const decoded = decodeKeys(stops);

  return Result.isSuccess(decoded) ? decoded.success.map(({ key }) => key) : [];
};

const optional = <A>(probe: Effect.Effect<A, RenderedAuditFailed>) =>
  probe.pipe(
    Effect.timeoutOrElse({
      duration: STEP_TIMEOUT,
      orElse: () =>
        Effect.fail(
          new RenderedAuditFailed({
            detail: `A rendered probe ran past ${STEP_TIMEOUT}.`,
            kind: "timeout",
          })
        ),
    }),
    Effect.tapError((failure) =>
      Effect.logWarning(`Rendered probe skipped: ${failure.detail}`)
    ),
    Effect.orElseSucceed(() => null)
  );

const decodeCount = Schema.decodeUnknownResult(Schema.Int);

const decodeText = Schema.decodeUnknownResult(Schema.String);

export const walkState = (keys: readonly number[], candidates: number) => {
  const [first] = keys;
  const distinct = new Set(keys.filter((key) => key >= 0)).size;
  const tail = new Set(keys.slice(-TRAP_PRESSES));

  return {
    cycled:
      first !== undefined &&
      first >= 0 &&
      keys.slice(1).includes(first) &&
      (distinct > TRAP_SIZE || distinct >= candidates),
    trapped: keys.length >= TRAP_PRESSES && tail.size <= TRAP_SIZE,
  };
};

export const puppeteerSession = (binding: BrowserWorker): LaunchSession =>
  Effect.gen(function* launchPuppeteer() {
    const browser = yield* step("browser", launch.bind(undefined, binding));

    const close = Effect.ignore(step("browser", browser.close.bind(browser)));

    const page = yield* step("browser", browser.newPage.bind(browser)).pipe(
      Effect.tapError(() => close)
    );

    const session: BrowserSession = {
      close,
      html: step("browser", page.content.bind(page)),
      open: (url) =>
        Effect.gen(function* openPage() {
          yield* step("browser", page.setViewport.bind(page, VIEWPORT));
          yield* step(
            "browser",
            page.setUserAgent.bind(page, SCANNER_USER_AGENT)
          );

          const response = yield* step(
            "browser",
            page.goto.bind(page, url, {
              timeout: NAVIGATION_TIMEOUT_MS,
              waitUntil: "load",
            })
          );

          return {
            headers: response?.headers() ?? {},
            status: response?.status() ?? null,
          };
        }),
      probe: Effect.gen(function* probePage() {
        const evaluate = (expression: string) =>
          step("audit", page.evaluate.bind(page, expression));

        const press = (count: number) =>
          Effect.repeat(
            step("audit", page.keyboard.press.bind(page.keyboard, "Tab")),
            { times: count - 1 }
          );

        const stopsFrom = (from: number) =>
          evaluate(`__eaaProbes.walkStops(${from})`).pipe(
            Effect.map((stops) => {
              const decoded = decodeStops(stops);

              return Result.isSuccess(decoded) ? decoded.success : [];
            })
          );

        const walk = Effect.gen(function* tabWalk() {
          const candidates = yield* evaluate("__eaaProbes.walkStart()");

          const candidateCount = Result.getOrElse(
            decodeCount(candidates),
            () => 0
          );

          const forward: unknown[] = [];
          let presses = 0;
          let state = walkState([], candidateCount);

          const startedAt = yield* Clock.currentTimeMillis;

          while (
            presses < MAX_PRESSES &&
            !state.cycled &&
            !state.trapped &&
            (yield* Clock.currentTimeMillis) - startedAt < WALK_MILLIS
          ) {
            yield* press(READ_EVERY);
            presses += READ_EVERY;
            forward.push(...(yield* stopsFrom(forward.length)));
            state = walkState(keysOf(forward), candidateCount);
          }

          let backward: readonly unknown[] | null = null;

          if (state.trapped) {
            yield* step(
              "audit",
              page.keyboard.down.bind(page.keyboard, "Shift")
            );
            yield* press(TRAP_PRESSES);
            yield* step("audit", page.keyboard.up.bind(page.keyboard, "Shift"));
            backward = yield* stopsFrom(forward.length);
          }

          const end = yield* evaluate("__eaaProbes.walkEnd()");

          const ended = Schema.decodeUnknownResult(
            Schema.Struct({ candidates: Schema.Array(Schema.Unknown) })
          )(end);

          return {
            backward,
            candidates: Result.isSuccess(ended) ? ended.success.candidates : [],
            cycled: state.cycled,
            forward,
            presses,
          };
        });

        const startUrl = page.url();

        yield* evaluate(probesSource);

        const textSpacing = yield* optional(
          evaluate("__eaaProbes.textSpacing()")
        );

        const walked = yield* walk.pipe(
          Effect.tapError((failure) =>
            Effect.logWarning(`Rendered probe skipped: ${failure.detail}`)
          ),
          Effect.orElseSucceed(() => null)
        );

        const stayed = page.url() === startUrl;

        const targetSize = stayed
          ? yield* optional(evaluate(TARGET_SIZE_RUN))
          : null;

        const reflow = stayed
          ? yield* optional(
              step("audit", page.setViewport.bind(page, REFLOW_VIEWPORT)).pipe(
                Effect.andThen(Effect.sleep(REFLOW_SETTLE)),
                Effect.andThen(evaluate("__eaaProbes.reflow()"))
              )
            )
          : null;

        return JSON.stringify({
          reflow,
          targetSize: Result.getOrNull(decodeText(targetSize)),
          textSpacing,
          walk: walked,
        });
      }).pipe(
        Effect.timeoutOrElse({
          duration: PROBE_TIMEOUT,
          orElse: () =>
            Effect.fail(
              new RenderedAuditFailed({
                detail: "The rendered probes ran past their timeout.",
                kind: "timeout",
              })
            ),
        })
      ),
      runAxe: step("audit", page.evaluate.bind(page, axeSource)).pipe(
        Effect.andThen(step("audit", page.evaluate.bind(page, AXE_RUN)))
      ),
    };

    return session;
  });
