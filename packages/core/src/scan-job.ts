import { Schema } from "effect";

import { ScanTargetSchema } from "./scan-target.js";

export const ScanJobSchema = Schema.Struct({
  scanId: Schema.String,
  slug: Schema.String,
  target: ScanTargetSchema,
});

export type ScanJob = typeof ScanJobSchema.Type;

export const ScanOutcomeSchema = Schema.Struct({
  stage: Schema.Literals(["published", "failed"]),
});

export type ScanOutcome = typeof ScanOutcomeSchema.Type;

export const SCAN_FAILED =
  "The scan could not finish. Try again in a few minutes.";
