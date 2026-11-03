import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";

import { BrowserBudget, utcDayOf } from "../src/index.js";
import { localStores } from "./local-d1.js";

const DAILY = 120;

const reserveOn = (day: string, seconds: number) =>
  BrowserBudget.use((budget) =>
    budget.reserve({ dailySeconds: DAILY, day, seconds })
  );

describe("BrowserBudget", () => {
  it("names the UTC day of an instant", () => {
    expect(utcDayOf(Date.UTC(2026, 10, 3, 23, 59))).toBe("2026-11-03");
  });

  it.layer(localStores)((scoped) => {
    scoped.effect("reserves until the day's seconds are spent", () =>
      Effect.gen(function* spends() {
        expect(yield* reserveOn("2026-11-03", 60)).toBe(true);
        expect(yield* reserveOn("2026-11-03", 60)).toBe(true);
        expect(yield* reserveOn("2026-11-03", 1)).toBe(false);
      })
    );

    scoped.effect("starts every day with the whole budget", () =>
      Effect.gen(function* nextDay() {
        expect(yield* reserveOn("2026-11-04", 60)).toBe(true);
      })
    );

    scoped.effect("refuses a reservation larger than a whole day", () =>
      Effect.gen(function* tooLarge() {
        expect(yield* reserveOn("2026-11-05", DAILY + 1)).toBe(false);
      })
    );
  });
});
