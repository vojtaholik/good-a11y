import { TargetType, launch } from "@cloudflare/puppeteer";
import type { BrowserWorker, HTTPRequest, Target } from "@cloudflare/puppeteer";
import {
  AXE_TAGS,
  RenderedAuditFailed,
  SCANNER_USER_AGENT,
  TRAP_PRESSES,
  TRAP_SIZE,
} from "@eaa-check/core";
import { Clock, Effect, Result, Schema } from "effect";
import type { Duration } from "effect";

import { axeSource, probesSource } from "#page-scripts";

import { navigationAllowed, step } from "./browser-session.js";
import type { BrowserSession, LaunchSession } from "./browser-session.js";

export const VIEWPORT = { height: 800, width: 1280 } as const;

export const NAVIGATION_TIMEOUT_MS = 30_000;

export const KEEP_ALIVE_MS = 60_000;

const NO_POPUPS =
  'Object.defineProperty(window, "open", { configurable: false, value: () => null, writable: false });';

const AXE_RUN = `axe.run(document, ${JSON.stringify({
  resultTypes: ["violations"],
  runOnly: { type: "tag", values: AXE_TAGS },
})}).then((results) => JSON.stringify(results))`;

export const REFLOW_VIEWPORT = { height: 256, width: 320 } as const;

export const MAX_PRESSES = 300;

const READ_EVERY = 10;

const REFLOW_SETTLE = "1 second";

const PROBE_TIMEOUT = "55 seconds";

const STEP_TIMEOUT = "8 seconds";

const CONFIRM_TIMEOUT = "15 seconds";

const NAVIGATION_WAIT = "150 millis";

const QUIET_WAIT = "1 second";

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

const optionalWithin = <A>(
  duration: Duration.Input,
  probe: Effect.Effect<A, RenderedAuditFailed>
) =>
  probe.pipe(
    Effect.timeoutOrElse({
      duration,
      orElse: () =>
        Effect.fail(
          new RenderedAuditFailed({
            detail: "A rendered probe ran past its timeout.",
            kind: "timeout",
          })
        ),
    }),
    Effect.tapError((failure) =>
      Effect.logWarning(`Rendered probe skipped: ${failure.detail}`)
    ),
    Effect.orElseSucceed(() => null)
  );

const optional = <A>(probe: Effect.Effect<A, RenderedAuditFailed>) =>
  optionalWithin(STEP_TIMEOUT, probe);

const decodeSnippets = Schema.decodeUnknownResult(
  Schema.Array(Schema.Struct({ snippet: Schema.String }))
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
    const browser = yield* step(
      "browser",
      launch.bind(undefined, binding, { keep_alive: KEEP_ALIVE_MS })
    );

    const close = step("browser", browser.close.bind(browser));

    const page = yield* step("browser", browser.newPage.bind(browser)).pipe(
      Effect.tapError(() => Effect.ignore(close))
    );

    const refused: string[] = [];
    const held: string[] = [];
    const holding = { navigations: false };

    // @effect-diagnostics-next-line asyncFunction:off -- Puppeteer calls this request listener itself and awaits nothing, so it settles each paused request with a promise that never rejects.
    const guard = async (request: HTTPRequest): Promise<void> => {
      if (request.isInterceptResolutionHandled()) {
        return;
      }

      const allowed =
        !request.isNavigationRequest() ||
        navigationAllowed(request.url(), request.redirectChain().length);

      const hold =
        allowed &&
        holding.navigations &&
        request.isNavigationRequest() &&
        request.frame() === page.mainFrame();

      if (!allowed && request.frame() === page.mainFrame()) {
        refused.push(request.url());
      }

      if (hold) {
        held.push(request.url());
      }

      await Promise.allSettled([
        allowed && !hold
          ? request.continue()
          : request.abort("blockedbyclient"),
      ]);
    };

    // @effect-diagnostics-next-line asyncFunction:off -- Puppeteer calls this target listener itself and awaits nothing; a popup it cannot close is left to the browser's own close.
    const closePopup = async (target: Target): Promise<void> => {
      const opened =
        target.type() === TargetType.PAGE ? await target.page() : null;

      if (opened !== null && opened !== page) {
        await Promise.allSettled([opened.close()]);
      }
    };

    browser.on("targetcreated", (target: Target) => {
      void closePopup(target);
    });

    const session: BrowserSession = {
      close,
      html: step("browser", page.content.bind(page)),
      open: (url) =>
        Effect.gen(function* openPage() {
          yield* step("browser", page.setBypassServiceWorker.bind(page, true));
          yield* step(
            "browser",
            page.evaluateOnNewDocument.bind(page, NO_POPUPS)
          );
          yield* step("browser", page.setRequestInterception.bind(page, true));
          page.on("request", (request) => {
            void guard(request);
          });
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
          ).pipe(
            Effect.mapError((failure) =>
              refused.length === 0
                ? failure
                : new RenderedAuditFailed({
                    detail: `The browser was sent to ${refused[0]?.slice(0, 200)}, which vetUrl refuses.`,
                    kind: "navigation",
                  })
            )
          );

          return {
            headers: response?.headers() ?? {},
            status: response?.status() ?? null,
          };
        }),
      probe: Effect.gen(function* probePage() {
        const startUrl = page.url();

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
          let heldInChunk: number | null = null;
          const heldBefore = held.length;

          const startedAt = yield* Clock.currentTimeMillis;

          while (
            presses < MAX_PRESSES &&
            !state.cycled &&
            !state.trapped &&
            (yield* Clock.currentTimeMillis) - startedAt < WALK_MILLIS
          ) {
            yield* press(READ_EVERY);
            presses += READ_EVERY;

            if (heldInChunk === null && held.length > heldBefore) {
              heldInChunk = presses - READ_EVERY;
            }

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
            heldInChunk,
            presses,
          };
        });

        const reopen = Effect.gen(function* reopenPage() {
          holding.navigations = false;
          yield* step(
            "audit",
            page.goto.bind(page, startUrl, {
              timeout: NAVIGATION_TIMEOUT_MS,
              waitUntil: "load",
            })
          );
          holding.navigations = true;
          yield* evaluate(probesSource);
          yield* evaluate("__eaaProbes.walkStart()");

          return held.length;
        });

        const pressThenWait = (wait: Duration.Input) =>
          press(1).pipe(Effect.andThen(Effect.sleep(wait)));

        const triggerAfter = (chunkStart: number) =>
          Effect.gen(function* findTrigger() {
            const base = yield* reopen;

            if (chunkStart > 0) {
              yield* press(chunkStart);
              yield* Effect.sleep(NAVIGATION_WAIT);
            }

            if (held.length > base) {
              return null;
            }

            for (let extra = 1; extra <= READ_EVERY + 2; extra += 1) {
              yield* pressThenWait(NAVIGATION_WAIT);

              if (held.length > base) {
                const stops = Result.getOrElse(
                  decodeSnippets(yield* evaluate("__eaaProbes.walkStops(0)")),
                  () => []
                );

                return {
                  presses: chunkStart + extra,
                  snippet: stops.at(-1)?.snippet ?? "",
                  to: held[base] ?? "",
                };
              }
            }

            return null;
          });

        const confirmed = (trigger: {
          readonly presses: number;
          readonly snippet: string;
          readonly to: string;
        }) =>
          Effect.gen(function* confirmTrigger() {
            const base = yield* reopen;

            if (trigger.presses > 1) {
              yield* press(trigger.presses - 1);
            }

            yield* Effect.sleep(QUIET_WAIT);

            if (held.length > base) {
              return null;
            }

            yield* pressThenWait(NAVIGATION_WAIT);

            return held.length > base
              ? { snippet: trigger.snippet, to: trigger.to }
              : null;
          });

        const onFocusOf = (chunkStart: number) =>
          triggerAfter(chunkStart).pipe(
            Effect.flatMap((trigger) =>
              trigger === null ? Effect.succeed(null) : confirmed(trigger)
            )
          );

        yield* evaluate(probesSource);

        const textSpacing = yield* optional(
          evaluate("__eaaProbes.textSpacing()")
        );

        holding.navigations = true;

        const walkedRaw = yield* walk.pipe(
          Effect.tapError((failure) =>
            Effect.logWarning(`Rendered probe skipped: ${failure.detail}`)
          ),
          Effect.orElseSucceed(() => null)
        );

        const onFocus =
          walkedRaw === null || walkedRaw.heldInChunk === null
            ? null
            : yield* optionalWithin(
                CONFIRM_TIMEOUT,
                onFocusOf(walkedRaw.heldInChunk)
              );

        holding.navigations = false;

        const walked =
          walkedRaw === null
            ? null
            : {
                backward: walkedRaw.backward,
                candidates: walkedRaw.candidates,
                cycled: walkedRaw.cycled,
                forward: walkedRaw.forward,
                navigated: walkedRaw.heldInChunk !== null,
                onFocus,
                presses: walkedRaw.presses,
              };

        const stayed = page.url() === startUrl;

        const targetSize = stayed
          ? yield* optional(evaluate(TARGET_SIZE_RUN))
          : null;

        const reflow = stayed
          ? yield* optional(
              evaluate("document.activeElement?.blur()").pipe(
                Effect.andThen(
                  step("audit", page.setViewport.bind(page, REFLOW_VIEWPORT))
                ),
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
      url: Effect.sync(() => page.url()),
    };

    return session;
  });
