import { Schema } from "effect";

import { ReportSchema } from "./report.js";
import { SCAN_FAILED } from "./scan-job.js";

export const ScanStageSchema = Schema.Literals([
  "queued",
  "scanning",
  "published",
  "failed",
]);

export type ScanStage = typeof ScanStageSchema.Type;

export const ScanViewSchema = Schema.Struct({
  failure: Schema.NullOr(Schema.String),
  report: Schema.NullOr(ReportSchema),
  requestedAt: Schema.Int,
  scanId: Schema.String,
  slug: Schema.String,
  stage: ScanStageSchema,
  url: Schema.String,
});

export type ScanView = typeof ScanViewSchema.Type;

export const slugKey = (hostname: string): string =>
  hostname
    .trim()
    .toLowerCase()
    .replace(/^www\./u, "");

export const slugOf = (url: string): string => slugKey(new URL(url).hostname);

export const STALE_AFTER_MILLIS = 600_000;

export const readAt = (view: ScanView, now: number): ScanView =>
  view.stage === "published" ||
  view.stage === "failed" ||
  now - view.requestedAt <= STALE_AFTER_MILLIS
    ? view
    : { ...view, failure: SCAN_FAILED, stage: "failed" };
