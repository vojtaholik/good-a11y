// @effect-diagnostics nodeBuiltinImport:off -- The hanging runner stands in for a model that never answers, using an unreferenced timer.
import { setTimeout as sleep } from "node:timers/promises";

import { describe, expect, it, vi } from "@effect/vitest";
import { JUDGE_MODEL } from "@good-a11y/core";
import type { JudgeRequest } from "@good-a11y/core";
import { Effect, Fiber } from "effect";
import { TestClock } from "effect/testing";

import { GATEWAY_ID, JUDGE_TIMEOUT, judgeWith } from "../src/index.js";
import type { ModelRunner } from "../src/index.js";

const REQUEST: JudgeRequest = {
  questions: { image_1: { instructions: "Is it described?", type: "noul" } },
  state: 'Image 1: alt text "IMG_2041.jpg".',
};

const RECORDED = {
  answers: { image_1: { noul: 0.0364, type: "noul" } },
  model: "clef",
  usage: { input_tokens: 700, output_tokens: 0 },
};

const runnerOf = (reply: Promise<object>) => ({
  run: vi.fn<ModelRunner["run"]>().mockReturnValue(reply),
});

const failureOf = (runner: ModelRunner) =>
  judgeWith(runner).ask(REQUEST).pipe(Effect.flip);

describe("the model judge", () => {
  it.effect(
    "asks the pinned model through the gateway and decodes its answers",
    () =>
      Effect.gen(function* decodes() {
        const runner = runnerOf(Promise.resolve(RECORDED));

        const reply = yield* judgeWith(runner).ask(REQUEST);

        expect(reply.answers.image_1).toEqual({ noul: 0.0364, type: "noul" });
        expect(reply.usage.input_tokens).toBe(700);
        expect(runner.run.mock.calls[0]?.slice(0, 3)).toEqual([
          JUDGE_MODEL,
          REQUEST,
          { gateway: { id: GATEWAY_ID } },
        ]);
      })
  );

  it.effect("names a thrown service error as unavailable", () =>
    Effect.gen(function* serviceFails() {
      const failure = yield* failureOf(
        runnerOf(Promise.reject(new Error("3040: capacity")))
      );

      expect(failure.kind).toBe("service");
      expect(failure.detail).toBe("3040: capacity");
    })
  );

  it.effect("names a reply that is not a decision as unreadable", () =>
    Effect.gen(function* unreadable() {
      const failure = yield* failureOf(
        runnerOf(Promise.resolve({ response: "Sure! Here you go." }))
      );

      expect(failure.kind).toBe("unreadable");
    })
  );

  it.effect("gives up after its hard timeout", () =>
    Effect.gen(function* timesOut() {
      const fiber = yield* Effect.forkChild(
        failureOf(runnerOf(sleep(120_000, RECORDED, { ref: false })))
      );

      yield* TestClock.adjust(JUDGE_TIMEOUT);

      expect((yield* Fiber.join(fiber)).kind).toBe("timeout");
    })
  );
});
