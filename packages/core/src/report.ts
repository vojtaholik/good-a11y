import { Schema } from "effect";

import { APPLICABILITY, ApplicabilitySchema } from "./applicability.js";
import type { Applicability } from "./applicability.js";
import { CATALOGUE, criteriaOf } from "./catalogue.js";
import type { CatalogueEntry } from "./catalogue.js";
import {
  CheckIdSchema,
  CheckResultSchema,
  CheckStatusSchema,
} from "./check.js";
import type { CheckResult } from "./check.js";
import type { PageEvidence } from "./page-evidence.js";
import {
  REFERENCE,
  ReferenceSchema,
  SourcedSchema,
  verifiedText,
} from "./reference.js";
import type { Reference } from "./reference.js";

export const AUTOMATED_LIMIT_FACT = "STD-AUTO-1";

export const AUTOMATED_LIMIT =
  "Automated checks find only part of the accessibility issues WCAG covers, and only those visible in the page's HTML as served. This report does not show whether the page meets the European Accessibility Act. A manual review by a person is needed.";

export const CONTACT = {
  placeholder: true,
  studio: "studio9",
  text: "TODO(Vojta): wording. studio9 can review this page by hand, explain what the findings mean for your site, and fix them. Get in touch with studio9.",
} as const;

export const ReferenceKindSchema = Schema.Literals([
  "wcag",
  "en-reference",
  "en-upcoming",
]);

export const FindingReferenceSchema = Schema.Struct({
  kind: ReferenceKindSchema,
  ...SourcedSchema.fields,
});

export type FindingReference = typeof FindingReferenceSchema.Type;

export const FindingSchema = Schema.Struct({
  ...CheckResultSchema.fields,
  id: CheckIdSchema,
  references: Schema.Array(FindingReferenceSchema),
  status: CheckStatusSchema,
  title: Schema.String,
  whatFails: Schema.String,
});

export type Finding = typeof FindingSchema.Type;

export const OutcomeSchema = Schema.Literals([
  "checked",
  "refused",
  "unreachable",
  "not_html",
]);

export type Outcome = typeof OutcomeSchema.Type;

export const ReportSchema = Schema.Struct({
  applicability: ApplicabilitySchema,
  contact: Schema.Struct({
    placeholder: Schema.Boolean,
    studio: Schema.String,
    text: Schema.String,
  }),
  finalUrl: Schema.NullOr(Schema.String),
  findings: Schema.Array(FindingSchema),
  httpStatus: Schema.NullOr(Schema.Int),
  outcome: OutcomeSchema,
  outcomeDetail: Schema.String,
  reference: ReferenceSchema,
  requestedUrl: Schema.String,
  scannedAt: Schema.String,
  statement: Schema.Struct({
    factId: Schema.NullOr(Schema.String),
    text: Schema.String,
  }),
  truncated: Schema.Boolean,
});

export type Report = typeof ReportSchema.Type;

const withKind = (
  kind: FindingReference["kind"],
  id: string
): FindingReference[] => {
  const text = verifiedText(id);

  return text === null ? [] : [{ kind, ...text }];
};

export const referencesOf = (
  entry: CatalogueEntry,
  reference: Reference
): FindingReference[] =>
  criteriaOf(entry).flatMap(({ en3, en4, sc }) => [
    ...withKind("wcag", sc),
    ...(reference.version === "V4.1.1"
      ? withKind("en-reference", en4)
      : [...withKind("en-reference", en3), ...withKind("en-upcoming", en4)]),
  ]);

const findingOf = (
  entry: CatalogueEntry,
  result: CheckResult,
  reference: Reference
): Finding => ({
  ...result,
  references: referencesOf(entry, reference),
  title: entry.check.title,
  whatFails: entry.check.whatFails,
});

export const runChecks = (evidence: PageEvidence): readonly Finding[] =>
  CATALOGUE.map((entry) =>
    findingOf(entry, entry.check.evaluate(evidence), REFERENCE)
  );

export interface PageVisit {
  readonly finalUrl: string | null;
  readonly httpStatus: number | null;
  readonly outcome: Outcome;
  readonly outcomeDetail: string;
  readonly requestedUrl: string;
  readonly scannedAt: string;
  readonly truncated: boolean;
}

export const reportOf = (
  visit: PageVisit,
  findings: readonly Finding[],
  applicability: Applicability = APPLICABILITY
): Report => ({
  ...visit,
  applicability,
  contact: CONTACT,
  findings,
  reference: REFERENCE,
  statement: {
    factId: verifiedText(AUTOMATED_LIMIT_FACT)?.factId ?? null,
    text: AUTOMATED_LIMIT,
  },
});
