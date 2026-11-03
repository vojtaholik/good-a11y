import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";

import { JudgeBudget } from "../src/index.js";
import { localStores } from "./local-d1.js";

const DAILY = 10_000;

const reserveOn = (day: string, tokens: number) =>
  JudgeBudget.use((budget) =>
    budget.reserve({ dailyTokens: DAILY, day, tokens })
  );

describe("JudgeBudget", () => {
  it.layer(localStores)((scoped) => {
    scoped.effect("reserves until the day's tokens are spent", () =>
      Effect.gen(function* spends() {
        expect(yield* reserveOn("2026-11-03", 6000)).toBe(true);
        expect(yield* reserveOn("2026-11-03", 4000)).toBe(true);
        expect(yield* reserveOn("2026-11-03", 1)).toBe(false);
      })
    );

    scoped.effect("keeps each day's budget apart", () =>
      Effect.gen(function* nextDay() {
        expect(yield* reserveOn("2026-11-04", DAILY)).toBe(true);
      })
    );

    scoped.effect("refuses a reservation larger than a whole day", () =>
      Effect.gen(function* tooLarge() {
        expect(yield* reserveOn("2026-11-05", DAILY + 1)).toBe(false);
      })
    );

    scoped.effect(
      "settles a reservation to the tokens the model really used",
      () =>
        Effect.gen(function* settles() {
          const day = "2026-11-06";

          expect(yield* reserveOn(day, 6000)).toBe(true);
          yield* JudgeBudget.use((budget) =>
            budget.settle({ day, reserved: 6000, used: 9000 })
          );
          expect(yield* reserveOn(day, 1001)).toBe(false);
          expect(yield* reserveOn(day, 1000)).toBe(true);
          yield* JudgeBudget.use((budget) =>
            budget.settle({ day, reserved: 1000, used: 0 })
          );
          expect(yield* reserveOn(day, 1000)).toBe(true);
        })
    );
  });
});
