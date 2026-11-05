import { RenderedAuditFailed } from "@good-a11y/core";
import { Clock, Effect, Result, Schema } from "effect";
import type { Duration } from "effect";

import { interactionSource } from "#page-scripts";

import { step } from "./browser-session.js";
import type { InteractionKey, SessionPage } from "./session-browser.js";

export const SHORTCUT_KEYS: readonly InteractionKey[] = [
  "/",
  "?",
  "s",
  "f",
  "k",
  "j",
  "m",
  "1",
];

export const PORTRAIT = { height: 1200, isLandscape: false, width: 800 };

export const LANDSCAPE = { height: 600, isLandscape: true, width: 800 };

const KEY_WAIT = "200 millis";

const HOVER_WAIT = "400 millis";

const ESCAPE_WAIT = "300 millis";

const QUIET_WAIT = "300 millis";

const MAX_HOVERED = 2;

const PERSIST_WAIT = "1 second";

const ORIENTATION_SETTLE = "500 millis";

const PART_TIMEOUT = "8 seconds";

const HOVER_MILLIS = 9000;

const KEYS_MILLIS = 8000;

const POINTER_STEPS = 8;

const Point = Schema.Struct({ x: Schema.Finite, y: Schema.Finite });

const decodePoints = Schema.decodeUnknownResult(Schema.Array(Point));

const decodeShown = Schema.decodeUnknownResult(
  Schema.NullOr(
    Schema.Struct({
      obscures: Schema.Boolean,
      onto: Point,
      snippet: Schema.String,
      trigger: Schema.String,
    })
  )
);

const decodeRead = Schema.decodeUnknownResult(
  Schema.Struct({
    changed: Schema.Array(Schema.String),
    focus: Schema.NullOr(Schema.String),
    snippet: Schema.NullOr(Schema.String),
  })
);

const decodeFlag = Schema.decodeUnknownResult(Schema.Boolean);

export interface Viewport {
  readonly height: number;
  readonly isLandscape?: boolean;
  readonly width: number;
}

export interface InteractionContext {
  readonly navigations: () => number;
  readonly page: SessionPage;
  readonly viewport: Viewport;
}

const within = <A>(
  duration: Duration.Input,
  probe: Effect.Effect<A, RenderedAuditFailed>,
  partial?: () => A
): Effect.Effect<A | null> =>
  probe.pipe(
    Effect.timeoutOrElse({
      duration,
      orElse: () =>
        partial === undefined
          ? Effect.fail(
              new RenderedAuditFailed({
                detail: "An interaction probe ran past its timeout.",
                kind: "timeout",
              })
            )
          : Effect.sync(partial),
    }),
    Effect.tapError((failure) =>
      Effect.logWarning(`Interaction probe skipped: ${failure.detail}`)
    ),
    Effect.orElseSucceed(() => null)
  );

export const interact = ({ navigations, page, viewport }: InteractionContext) =>
  Effect.gen(function* interactWithPage() {
    const evaluate = (expression: string) =>
      step("audit", page.evaluate.bind(page, expression));

    const shown = Effect.map(
      evaluate("__eaaInteract.contentShown()"),
      (value) => Result.getOrElse(decodeFlag(value), () => false)
    );

    const moveTo = (x: number, y: number, steps = 1) =>
      step("audit", page.mouse.move.bind(page.mouse, x, y, { steps }));

    const away = moveTo(viewport.width - 2, viewport.height - 2);

    const hoverOver = (point: { readonly x: number; readonly y: number }) =>
      moveTo(point.x, point.y, POINTER_STEPS).pipe(
        Effect.andThen(moveTo(point.x + 1, point.y))
      );

    const pressKey = (key: InteractionKey) =>
      step("audit", page.keyboard.press.bind(page.keyboard, key));

    yield* evaluate(interactionSource);

    const contrast = yield* within(
      PART_TIMEOUT,
      evaluate("__eaaInteract.nonTextContrast()")
    );

    const hovered: unknown[] = [];

    const hover = yield* within(
      `${HOVER_MILLIS + 4000} millis`,
      Effect.gen(function* hoverTriggers() {
        const points = Result.getOrElse(
          decodePoints(yield* evaluate("__eaaInteract.hoverTriggers()")),
          () => []
        );

        const startedAt = yield* Clock.currentTimeMillis;

        for (const [index, point] of points.entries()) {
          if (
            hovered.length >= MAX_HOVERED ||
            (yield* Clock.currentTimeMillis) - startedAt > HOVER_MILLIS
          ) {
            break;
          }

          yield* away;
          yield* evaluate("__eaaInteract.hoverStart()");
          yield* Effect.sleep(QUIET_WAIT);
          yield* evaluate("__eaaInteract.hoverQuiet()");
          yield* hoverOver(point);
          yield* Effect.sleep(HOVER_WAIT);

          const content = Result.getOrNull(
            decodeShown(yield* evaluate(`__eaaInteract.hoverShown(${index})`))
          );

          if (content !== null) {
            yield* pressKey("Escape");
            yield* Effect.sleep(ESCAPE_WAIT);
            const escapeClosed = !(yield* shown);

            yield* away;
            yield* Effect.sleep(HOVER_WAIT);
            const closedOnLeave = !(yield* shown);

            yield* hoverOver(point);
            yield* Effect.sleep(HOVER_WAIT);
            const reshown = yield* shown;

            yield* moveTo(content.onto.x, content.onto.y, POINTER_STEPS);
            yield* Effect.sleep(HOVER_WAIT);
            const stayedOnHover = yield* shown;

            yield* Effect.sleep(PERSIST_WAIT);
            const persisted = yield* shown;

            yield* away;
            yield* Effect.sleep(HOVER_WAIT);

            const focused = Result.getOrElse(
              decodeFlag(
                yield* evaluate(`__eaaInteract.focusTrigger(${index})`)
              ),
              () => false
            );

            yield* Effect.sleep(ESCAPE_WAIT);
            const focusShown = focused && (yield* shown);
            let focusEscapeClosed: boolean | null = null;

            if (focusShown) {
              yield* pressKey("Escape");
              yield* Effect.sleep(ESCAPE_WAIT);
              focusEscapeClosed = !(yield* shown);
            }

            yield* evaluate("__eaaInteract.blurAll()");

            hovered.push({
              closedOnLeave,
              escapeClosed,
              focusEscapeClosed,
              focusShown,
              obscures: content.obscures,
              persisted,
              reshown,
              snippet: content.snippet,
              stayedOnHover,
              trigger: content.trigger,
            });
          }
        }

        yield* away;

        return hovered;
      }),
      () => hovered
    );

    const keyRead = Effect.map(evaluate("__eaaInteract.keyRead()"), (value) =>
      Result.getOrNull(decodeRead(value))
    );

    const trial = (key: InteractionKey) =>
      Effect.gen(function* keyTrial() {
        yield* evaluate("__eaaInteract.keyReset()");
        yield* Effect.sleep(KEY_WAIT);
        const control = yield* keyRead;

        yield* evaluate("__eaaInteract.keyReset()");
        const before = navigations();
        yield* pressKey(key);
        yield* Effect.sleep(KEY_WAIT);
        const pressed = yield* keyRead;

        return { control, navigated: navigations() > before, pressed };
      });

    const keys = yield* within(
      `${KEYS_MILLIS + 4000} millis`,
      Effect.gen(function* pressShortcuts() {
        const startedAt = yield* Clock.currentTimeMillis;
        const measured: unknown[] = [];

        for (const key of SHORTCUT_KEYS) {
          if ((yield* Clock.currentTimeMillis) - startedAt > KEYS_MILLIS) {
            break;
          }

          const first = yield* trial(key);

          const effect =
            first.navigated ||
            (first.pressed !== null &&
              (first.pressed.focus !== null ||
                first.pressed.changed.length > 0));

          measured.push({
            key,
            trials: effect ? [first, yield* trial(key)] : [first],
          });
        }

        yield* evaluate("__eaaInteract.blurAll()");

        return measured;
      })
    );

    const read = (portrait: boolean) =>
      step(
        "audit",
        page.setViewport.bind(page, portrait ? PORTRAIT : LANDSCAPE)
      ).pipe(
        Effect.andThen(Effect.sleep(ORIENTATION_SETTLE)),
        Effect.andThen(evaluate("__eaaInteract.orientation()"))
      );

    const orientation = yield* within(
      PART_TIMEOUT,
      Effect.gen(function* turnScreen() {
        const portrait = yield* read(true);
        const landscape = yield* read(false);

        return { landscape, portrait };
      }).pipe(
        Effect.ensuring(
          step("audit", page.setViewport.bind(page, viewport)).pipe(
            Effect.andThen(Effect.sleep(ORIENTATION_SETTLE)),
            Effect.ignore
          )
        )
      )
    );

    return { contrast, hover, keys, orientation };
  });
