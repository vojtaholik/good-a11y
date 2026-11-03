import { Schema } from "effect";

import type { PageEvidence } from "./page-evidence.js";

export const MAX_SAMPLES = 5;

export const CheckIdSchema = Schema.Literals([
  "html-lang",
  "document-title",
  "image-alt",
  "form-labels",
  "link-name",
  "button-name",
  "frame-title",
  "meta-viewport-zoom",
  "meta-refresh",
]);

export type CheckId = typeof CheckIdSchema.Type;

export const CheckStatusSchema = Schema.Literals([
  "pass",
  "fail",
  "not_applicable",
]);

export type CheckStatus = typeof CheckStatusSchema.Type;

const Count = Schema.Int.check(Schema.isGreaterThanOrEqualTo(0));

export const CheckResultSchema = Schema.Struct({
  checked: Count,
  failing: Count,
  id: CheckIdSchema,
  samples: Schema.Array(Schema.String).check(Schema.isMaxLength(MAX_SAMPLES)),
  status: CheckStatusSchema,
});

export type CheckResult = typeof CheckResultSchema.Type;

export interface Check {
  readonly evaluate: (evidence: PageEvidence) => CheckResult;
  readonly id: CheckId;
  readonly title: string;
  readonly whatFails: string;
}

const statusOf = (checked: number, failing: number): CheckStatus => {
  if (checked === 0) {
    return "not_applicable";
  }

  return failing === 0 ? "pass" : "fail";
};

export const counted = <T>(
  id: CheckId,
  items: readonly T[],
  fails: (item: T) => boolean,
  sampleOf: (item: T) => string
): CheckResult => {
  const failing = items.filter(fails);

  return {
    checked: items.length,
    failing: failing.length,
    id,
    samples: failing.slice(0, MAX_SAMPLES).map(sampleOf),
    status: statusOf(items.length, failing.length),
  };
};

export const single = (
  id: CheckId,
  fails: boolean,
  sample: string
): CheckResult => ({
  checked: 1,
  failing: fails ? 1 : 0,
  id,
  samples: fails ? [sample] : [],
  status: fails ? "fail" : "pass",
});

export const blank = (text: string | null): boolean =>
  text === null || text.trim() === "";
