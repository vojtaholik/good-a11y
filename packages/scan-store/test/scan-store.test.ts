import { reportOf } from "@eaa-check/core";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Option } from "effect";

import { ScanStore } from "../src/index.js";
import { localStores } from "./local-d1.js";

const HOUR = 3_600_000;

const report = reportOf(
  {
    finalUrl: "https://example.com/",
    httpStatus: 200,
    outcome: "checked",
    outcomeDetail: "The page was read.",
    requestedUrl: "https://example.com/",
    scannedAt: "2026-11-03T00:00:00.000Z",
    truncated: false,
  },
  []
);

const scanAt = (scanId: string, requestedAt: number, dailyCap = 10) => ({
  dailyCap,
  requestedAt,
  reuseWithin: HOUR,
  scanId,
  slug: "example.com",
  url: "https://example.com/",
});

describe("ScanStore", () => {
  it.layer(localStores)((scoped) => {
    scoped.effect("reads back a published report", () =>
      Effect.gen(function* publishes() {
        const store = yield* ScanStore;

        expect(yield* store.begin(scanAt("a", 1000))).toEqual({
          kind: "begun",
        });
        yield* store.enter("a", "scanning");
        yield* store.publish("a", report, 2000);

        const latest = Option.getOrNull(yield* store.latest("example.com"));

        expect(latest?.stage).toBe("published");
        expect(latest?.report).toEqual(report);
      })
    );

    scoped.effect("reuses a recent scan of the same address", () =>
      Effect.gen(function* reuses() {
        const store = yield* ScanStore;

        expect(yield* store.begin(scanAt("b", 2000 + HOUR / 2))).toEqual({
          kind: "reused",
          scanId: "a",
        });
      })
    );

    scoped.effect("starts a new scan once the reuse window has passed", () =>
      Effect.gen(function* rescans() {
        const store = yield* ScanStore;

        expect(yield* store.begin(scanAt("c", 2000 + 2 * HOUR))).toEqual({
          kind: "begun",
        });
        yield* store.fail("c", "generated", 3000 + 2 * HOUR);
      })
    );

    scoped.effect("refuses a new scan when the daily cap is reached", () =>
      Effect.gen(function* capped() {
        const store = yield* ScanStore;

        expect(
          yield* store.begin({
            ...scanAt("d", 4000 + 2 * HOUR, 2),
            slug: "other.example",
            url: "https://other.example/",
          })
        ).toEqual({ kind: "cap_reached" });
      })
    );
  });
});
