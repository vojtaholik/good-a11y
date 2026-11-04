import { ReportSchema, SCAN_FAILED, ScanStageSchema } from "@good-a11y/core";
import type { Report, ScanView } from "@good-a11y/core";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { Context, Effect, Layer, Option, Schema } from "effect";

import { DAY_MILLIS } from "./daily-window.js";
import { failedDuring } from "./scan-store-error.js";
import type { ScanStoreError } from "./scan-store-error.js";
import { Scans } from "./schema/d1.js";
import { StoreDatabase } from "./store-database.js";

export interface NewScan {
  readonly caller: string;
  readonly dailyCap: number;
  readonly requestedAt: number;
  readonly reuseWithin: number;
  readonly scanId: string;
  readonly siteCap: number;
  readonly slug: string;
  readonly staleAfter: number;
  readonly url: string;
}

export type BeginOutcome =
  | { readonly kind: "begun" }
  | { readonly kind: "reused"; readonly scanId: string }
  | { readonly kind: "cap_reached" }
  | { readonly kind: "site_cap_reached" };

const UNSETTLED = ["queued", "scanning"];

const ReportJson = Schema.fromJsonString(ReportSchema);

export const OUTDATED_REPORT =
  "This report was made by an older version of the checker and can no longer be shown. Run a new scan.";

const PersistedScanSchema = Schema.Struct({
  failure: Schema.NullOr(Schema.String),
  id: Schema.String,
  reportJson: Schema.NullOr(Schema.String),
  requestedAt: Schema.Int,
  settledAt: Schema.NullOr(Schema.Int),
  slug: Schema.String,
  stage: ScanStageSchema,
  url: Schema.String,
});

type PersistedScan = typeof PersistedScanSchema.Type;

const viewOf = (scan: PersistedScan) =>
  Effect.gen(function* readView() {
    const report =
      scan.reportJson === null
        ? Option.some(null)
        : yield* Schema.decodeEffect(ReportJson)(scan.reportJson).pipe(
            Effect.option
          );

    const base = {
      requestedAt: scan.requestedAt,
      scanId: scan.id,
      slug: scan.slug,
      url: scan.url,
    };

    return Option.match(report, {
      onNone: (): ScanView => ({
        ...base,
        failure: OUTDATED_REPORT,
        report: null,
        stage: "failed",
      }),
      onSome: (decoded): ScanView => ({
        ...base,
        failure: scan.failure,
        report: decoded,
        stage: scan.stage,
      }),
    });
  });

const unsettledWindow = (next: NewScan): number =>
  Math.min(next.reuseWithin, next.staleAfter);

const isReusable = (
  scan: PersistedScan,
  view: ScanView,
  next: NewScan
): boolean => {
  if (scan.url !== next.url || view.stage === "failed") {
    return false;
  }

  if (view.stage === "published") {
    return (
      scan.settledAt !== null &&
      next.requestedAt - scan.settledAt <= next.reuseWithin
    );
  }

  return next.requestedAt - scan.requestedAt <= unsettledWindow(next);
};

export class ScanStore extends Context.Service<
  ScanStore,
  {
    readonly begin: (
      scan: NewScan
    ) => Effect.Effect<BeginOutcome, ScanStoreError>;
    readonly enter: (
      scanId: string,
      stage: "scanning"
    ) => Effect.Effect<void, ScanStoreError>;
    readonly fail: (
      scanId: string,
      failure: string,
      settledAt: number
    ) => Effect.Effect<void, ScanStoreError>;
    readonly latest: (
      slug: string
    ) => Effect.Effect<Option.Option<ScanView>, ScanStoreError>;
    readonly one: (
      slug: string,
      scanId: string
    ) => Effect.Effect<Option.Option<ScanView>, ScanStoreError>;
    readonly publish: (
      scanId: string,
      report: Report,
      settledAt: number
    ) => Effect.Effect<void, ScanStoreError>;
  }
>()("@good-a11y/scan-store/ScanStore", {
  make: Effect.gen(function* makeScanStore() {
    const db = yield* StoreDatabase;

    const newest = Effect.fn("ScanStore.newest")(function* newest(
      slug: string
    ) {
      const [row] = yield* db
        .select()
        .from(Scans)
        .where(eq(Scans.slug, slug))
        .orderBy(desc(Scans.requestedAt), desc(Scans.id))
        .limit(1);

      if (row === undefined) {
        return Option.none<PersistedScan>();
      }

      return Option.some(
        yield* Schema.decodeUnknownEffect(PersistedScanSchema)(row)
      );
    });

    return {
      begin: Effect.fn("ScanStore.begin")(
        function* begin(scan: NewScan) {
          const dayStart = scan.requestedAt - DAY_MILLIS;

          yield* db.run(
            sql`UPDATE scans SET caller = '' WHERE caller <> '' AND requested_at <= ${dayStart}`
          );

          yield* db.run(
            sql`UPDATE scans SET stage = 'failed', failure = ${SCAN_FAILED}, settled_at = ${scan.requestedAt} WHERE url = ${scan.url} AND stage IN ('queued', 'scanning') AND requested_at < ${scan.requestedAt - scan.staleAfter}`
          );

          const previous = yield* newest(scan.slug);

          if (Option.isSome(previous)) {
            const view = yield* viewOf(previous.value);

            if (isReusable(previous.value, view, scan)) {
              return { kind: "reused", scanId: previous.value.id } as const;
            }
          }

          const runningSince = scan.requestedAt - unsettledWindow(scan);

          const inserted = yield* db.all<{ readonly id: string }>(
            sql`INSERT OR IGNORE INTO scans (id, slug, url, caller, requested_at, stage) SELECT ${scan.scanId}, ${scan.slug}, ${scan.url}, ${scan.caller}, ${scan.requestedAt}, 'queued' WHERE (SELECT COUNT(*) FROM scans WHERE requested_at > ${dayStart}) < ${scan.dailyCap} AND (SELECT COUNT(*) FROM scans WHERE slug = ${scan.slug} AND caller = ${scan.caller} AND requested_at > ${dayStart}) < ${scan.siteCap} AND NOT EXISTS (SELECT 1 FROM scans WHERE url = ${scan.url} AND stage IN ('queued', 'scanning') AND requested_at >= ${runningSince}) RETURNING id`
          );

          if (inserted.length > 0) {
            return { kind: "begun" } as const;
          }

          const [blocker] = yield* db.all<{
            readonly id: string;
            readonly mine: number;
            readonly running: number;
            readonly site: number;
          }>(
            sql`SELECT (SELECT COUNT(*) FROM scans WHERE id = ${scan.scanId}) AS mine, (SELECT id FROM scans WHERE url = ${scan.url} AND stage IN ('queued', 'scanning') AND requested_at >= ${runningSince} ORDER BY requested_at DESC LIMIT 1) AS id, (SELECT COUNT(*) FROM scans WHERE url = ${scan.url} AND stage IN ('queued', 'scanning') AND requested_at >= ${runningSince}) AS running, (SELECT COUNT(*) FROM scans WHERE slug = ${scan.slug} AND caller = ${scan.caller} AND requested_at > ${dayStart}) AS site`
          );

          if (blocker === undefined || blocker.mine > 0) {
            return { kind: "begun" } as const;
          }

          if (blocker.running > 0) {
            return { kind: "reused", scanId: blocker.id } as const;
          }

          return blocker.site >= scan.siteCap
            ? ({ kind: "site_cap_reached" } as const)
            : ({ kind: "cap_reached" } as const);
        },
        Effect.mapError(failedDuring("begin"))
      ),
      enter: Effect.fn("ScanStore.enter")(
        function* enter(scanId: string, stage: "scanning") {
          yield* db
            .update(Scans)
            .set({ stage })
            .where(and(eq(Scans.id, scanId), inArray(Scans.stage, UNSETTLED)));
        },
        Effect.mapError(failedDuring("enter"))
      ),
      fail: Effect.fn("ScanStore.fail")(
        function* fail(scanId: string, failure: string, settledAt: number) {
          yield* db
            .update(Scans)
            .set({ failure, settledAt, stage: "failed" })
            .where(and(eq(Scans.id, scanId), inArray(Scans.stage, UNSETTLED)));
        },
        Effect.mapError(failedDuring("fail"))
      ),
      latest: Effect.fn("ScanStore.latest")(
        function* latest(slug: string) {
          const found = yield* newest(slug);

          if (Option.isNone(found)) {
            return Option.none<ScanView>();
          }

          const view = yield* viewOf(found.value);

          return Option.some(view);
        },
        Effect.mapError(failedDuring("latest"))
      ),
      one: Effect.fn("ScanStore.one")(
        function* one(slug: string, scanId: string) {
          const [row] = yield* db
            .select()
            .from(Scans)
            .where(and(eq(Scans.id, scanId), eq(Scans.slug, slug)))
            .limit(1);

          if (row === undefined) {
            return Option.none<ScanView>();
          }

          return Option.some(
            yield* viewOf(
              yield* Schema.decodeUnknownEffect(PersistedScanSchema)(row)
            )
          );
        },
        Effect.mapError(failedDuring("one"))
      ),
      publish: Effect.fn("ScanStore.publish")(
        function* publish(scanId: string, report: Report, settledAt: number) {
          const reportJson = yield* Schema.encodeEffect(ReportJson)(report);

          yield* db
            .update(Scans)
            .set({ reportJson, settledAt, stage: "published" })
            .where(and(eq(Scans.id, scanId), inArray(Scans.stage, UNSETTLED)));
        },
        Effect.mapError(failedDuring("publish"))
      ),
    };
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
