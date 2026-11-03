import { RenderedAuditFailed, vetUrl } from "@eaa-check/core";
import type { PublicUrl } from "@eaa-check/core";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Fiber, Ref, Result } from "effect";
import { TestClock } from "effect/testing";

import { HARD_TIMEOUT, renderedAuditWith } from "../src/index.js";
import type { BrowserSession } from "../src/index.js";

const URL: PublicUrl = Result.getOrThrow(vetUrl("https://www.example.com/"));

const fakeSession = (
  closed: Ref.Ref<number>,
  overrides: Partial<BrowserSession> = {}
): BrowserSession => ({
  close: Ref.update(closed, (count) => count + 1),
  html: Effect.succeed("<html>Shop</html>"),
  open: () => Effect.succeed({ headers: { server: "x" }, status: 200 }),
  probe: Effect.succeed('{"probes":true}'),
  runAxe: Effect.succeed('{"violations":[]}'),
  ...overrides,
});

const auditWith = (session: BrowserSession) =>
  renderedAuditWith(Effect.succeed(session)).audit(URL);

describe("the rendered audit", () => {
  it.effect(
    "returns the raw axe JSON, the landing status and the rendered HTML, and closes the browser",
    () =>
      Effect.gen(function* returnsAndCloses() {
        const closed = yield* Ref.make(0);

        const fiber = yield* Effect.forkChild(auditWith(fakeSession(closed)));

        yield* TestClock.adjust("3 seconds");

        const page = yield* Fiber.join(fiber);

        expect(page).toEqual({
          axe: '{"violations":[]}',
          headers: { server: "x" },
          html: "<html>Shop</html>",
          probes: '{"probes":true}',
          status: 200,
        });
        expect(yield* Ref.get(closed)).toBe(1);
      })
  );

  it.effect(
    "keeps the axe results when the probes fail, and closes the browser",
    () =>
      Effect.gen(function* keepsAxe() {
        const closed = yield* Ref.make(0);

        const fiber = yield* Effect.forkChild(
          auditWith(
            fakeSession(closed, {
              probe: Effect.fail(
                new RenderedAuditFailed({
                  detail: "Execution context was destroyed.",
                  kind: "audit",
                })
              ),
            })
          )
        );

        yield* TestClock.adjust("3 seconds");

        const page = yield* Fiber.join(fiber);

        expect(page.axe).toBe('{"violations":[]}');
        expect(page.probes).toBeNull();
        expect(yield* Ref.get(closed)).toBe(1);
      })
  );

  it.effect("closes the browser when axe fails", () =>
    Effect.gen(function* closesOnFailure() {
      const closed = yield* Ref.make(0);

      const fiber = yield* Effect.forkChild(
        auditWith(
          fakeSession(closed, {
            runAxe: Effect.fail(
              new RenderedAuditFailed({ detail: "boom", kind: "audit" })
            ),
          })
        ).pipe(Effect.flip)
      );

      yield* TestClock.adjust("3 seconds");

      const failure = yield* Fiber.join(fiber);

      expect(failure.kind).toBe("audit");
      expect(yield* Ref.get(closed)).toBe(1);
    })
  );

  it.effect(
    "fails as a timeout past the hard limit and still closes the browser",
    () =>
      Effect.gen(function* timesOut() {
        const closed = yield* Ref.make(0);

        const fiber = yield* Effect.forkChild(
          auditWith(fakeSession(closed, { open: () => Effect.never })).pipe(
            Effect.flip
          )
        );

        yield* TestClock.adjust(HARD_TIMEOUT);

        const failure = yield* Fiber.join(fiber);

        expect(failure.kind).toBe("timeout");
        expect(yield* Ref.get(closed)).toBe(1);
      })
  );

  it.effect("fails when axe does not return JSON text", () =>
    Effect.gen(function* notText() {
      const closed = yield* Ref.make(0);

      const fiber = yield* Effect.forkChild(
        auditWith(fakeSession(closed, { runAxe: Effect.succeed(42) })).pipe(
          Effect.flip
        )
      );

      yield* TestClock.adjust("3 seconds");

      expect((yield* Fiber.join(fiber)).kind).toBe("audit");
    })
  );
});
