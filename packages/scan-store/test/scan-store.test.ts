import { describe, expect, it } from "@effect/vitest";
import { reportOf } from "@good-a11y/core";
import { sql } from "drizzle-orm";
import { Effect, Option } from "effect";

import { OUTDATED_REPORT, ScanStore, StoreDatabase } from "../src/index.js";
import { localStores } from "./local-d1.js";

const HOUR = 3_600_000;

const STALE = 15 * 60_000;

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
  caller: "203.0.113.7",
  dailyCap,
  requestedAt,
  reuseWithin: HOUR,
  scanId,
  siteCap: 100,
  slug: "example.com",
  staleAfter: STALE,
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
    scoped.effect(
      "reads a report it can no longer decode as failed, and rescans",
      () =>
        Effect.gen(function* outdated() {
          const store = yield* ScanStore;
          const db = yield* StoreDatabase;

          yield* db.run(
            sql`INSERT INTO scans (id, slug, url, requested_at, settled_at, stage, report_json) VALUES ('old', 'old.example', 'https://old.example/', 10, 20, 'published', '{"version":0}')`
          );

          const latest = Option.getOrNull(yield* store.latest("old.example"));

          expect(latest?.stage).toBe("failed");
          expect(latest?.failure).toBe(OUTDATED_REPORT);

          expect(
            yield* store.begin({
              ...scanAt("new", 30, 100),
              slug: "old.example",
              url: "https://old.example/",
            })
          ).toEqual({ kind: "begun" });
        })
    );

    scoped.effect(
      "reads one scan by ID while a newer scan of the same site runs",
      () =>
        Effect.gen(function* oneScan() {
          const store = yield* ScanStore;

          yield* store.begin({
            ...scanAt("mine", 10 * HOUR, 100),
            url: "https://example.com/mine",
          });
          yield* store.publish("mine", report, 10 * HOUR + 1);
          yield* store.begin({
            ...scanAt("theirs", 10 * HOUR + 2, 100),
            url: "https://example.com/theirs",
          });

          const mine = Option.getOrNull(
            yield* store.one("example.com", "mine")
          );

          const latest = Option.getOrNull(yield* store.latest("example.com"));

          expect([mine?.scanId, mine?.stage]).toEqual(["mine", "published"]);
          expect(latest?.scanId).toBe("theirs");
          expect(Option.isNone(yield* store.one("other.example", "mine"))).toBe(
            true
          );
        })
    );

    scoped.effect(
      "reuses a scan another request began a moment earlier for the same URL",
      () =>
        Effect.gen(function* concurrent() {
          const store = yield* ScanStore;
          const at = 20 * HOUR;
          const site = { slug: "race.example", url: "https://race.example/" };

          const [first, second] = yield* Effect.all(
            [
              store.begin({ ...scanAt("race-1", at, 1000), ...site }),
              store.begin({ ...scanAt("race-2", at, 1000), ...site }),
            ],
            { concurrency: "unbounded" }
          );

          expect([first, second]).toEqual([
            { kind: "begun" },
            { kind: "reused", scanId: "race-1" },
          ]);
        })
    );

    scoped.effect(
      "fails a stuck scan once it is stale and starts a new one",
      () =>
        Effect.gen(function* stale() {
          const store = yield* ScanStore;
          const at = 30 * HOUR;
          const site = { slug: "stuck.example", url: "https://stuck.example/" };

          yield* store.begin({ ...scanAt("stuck", at, 1000), ...site });

          expect(
            yield* store.begin({
              ...scanAt("fresh", at + STALE - 1, 1000),
              ...site,
            })
          ).toEqual({ kind: "reused", scanId: "stuck" });

          expect(
            yield* store.begin({
              ...scanAt("fresh", at + STALE + 1, 1000),
              ...site,
            })
          ).toEqual({ kind: "begun" });

          const stuck = Option.getOrNull(
            yield* store.one("stuck.example", "stuck")
          );

          expect(stuck?.stage).toBe("failed");
        })
    );

    scoped.effect(
      "refuses one caller more scans of one site in a day than its site cap, whatever the query string, and still serves another caller",
      () =>
        Effect.gen(function* siteCap() {
          const store = yield* ScanStore;
          const at = 40 * HOUR;

          const outcomes = yield* Effect.forEach([1, 2, 3], (n) =>
            store.begin({
              ...scanAt(`site-${n}`, at + n, 1000),
              siteCap: 2,
              slug: "busy.example",
              url: `https://busy.example/?n=${n}`,
            })
          );

          expect(outcomes.map(({ kind }) => kind)).toEqual([
            "begun",
            "begun",
            "site_cap_reached",
          ]);

          expect(
            yield* store.begin({
              ...scanAt("site-other", at + 10, 1000),
              caller: "2001:db8:1:2::/64",
              siteCap: 2,
              slug: "busy.example",
              url: "https://busy.example/?n=9",
            })
          ).toEqual({ kind: "begun" });
        })
    );
  });
});
