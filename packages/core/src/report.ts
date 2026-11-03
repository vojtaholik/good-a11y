import { VERIFIED_FACTS } from "@eaa-check/facts";
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
import {
  CoverageSchema,
  STATIC_COVERAGE,
  STATIC_TESTED,
  coverageFrom,
} from "./coverage.js";
import { FindingReferenceSchema, referencesFor } from "./finding-reference.js";
import type { FindingReference } from "./finding-reference.js";
import type { PageEvidence } from "./page-evidence.js";
import { REFERENCE, ReferenceSchema, verifiedText } from "./reference.js";
import type { Reference } from "./reference.js";
import { RenderedSchema, renderedFrom } from "./rendered.js";
import type { Rendered, RenderedOutcome } from "./rendered.js";

export const AUTOMATED_LIMIT_FACT = "STD-AUTO-1";

export const AUTOMATED_LIMIT =
  "Automated checks find only part of the accessibility issues WCAG covers, and only those visible to the checker in the page it read. This report does not show whether the page meets the European Accessibility Act. A manual review by a person is needed.";

export const CONTACT_TEXT =
  "studio9 can review this page by hand, explain what the findings mean for your site, and fix them. Get in touch with studio9.";

export const BLOCKED_CONTACT_TEXT =
  "studio9 can review it by hand. Get in touch with studio9.";

export const BLOCKED_HEADLINE =
  "This site blocked automated checks, so nothing was tested.";

export const NOT_HTML_HEADLINE =
  "The address is not a web page, so nothing was tested.";

export const UNREACHABLE_HEADLINE =
  "The page could not be read, so nothing was tested.";

export {
  FindingReferenceSchema,
  ReferenceKindSchema,
  type FindingReference,
} from "./finding-reference.js";

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
  coverage: Schema.NullOr(CoverageSchema),
  finalUrl: Schema.NullOr(Schema.String),
  findings: Schema.Array(FindingSchema),
  headline: Schema.String,
  httpStatus: Schema.NullOr(Schema.Int),
  outcome: OutcomeSchema,
  outcomeDetail: Schema.String,
  reference: ReferenceSchema,
  rendered: Schema.NullOr(RenderedSchema),
  requestedUrl: Schema.String,
  scannedAt: Schema.String,
  statement: Schema.Struct({
    factId: Schema.NullOr(Schema.String),
    text: Schema.String,
  }),
  truncated: Schema.Boolean,
});

export type Report = typeof ReportSchema.Type;

export const referencesOf = (
  entry: CatalogueEntry,
  reference: Reference
): FindingReference[] => referencesFor(criteriaOf(entry), reference);

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

interface Tally {
  readonly checks: number;
  readonly failing: number;
}

const tallyOf = (
  findings: readonly Finding[],
  rendered: Rendered | null
): Tally => {
  const failing = findings.filter((finding) => finding.status === "fail");

  return rendered?.status === "ran"
    ? {
        checks: findings.length + rendered.rules,
        failing: failing.length + rendered.findings.length,
      }
    : { checks: findings.length, failing: failing.length };
};

const headlineOf = (outcome: Outcome, { checks, failing }: Tally): string => {
  if (outcome === "refused") {
    return BLOCKED_HEADLINE;
  }

  if (outcome === "not_html") {
    return NOT_HTML_HEADLINE;
  }

  if (outcome === "unreachable") {
    return UNREACHABLE_HEADLINE;
  }

  return failing === 0
    ? "The automated checks found no issues of the kinds they look for."
    : `The automated checks found issues in ${failing} of ${checks} checks.`;
};

export const reportOf = (
  visit: PageVisit,
  findings: readonly Finding[],
  applicability: Applicability = APPLICABILITY
): Report => ({
  ...visit,
  applicability,
  contact: {
    placeholder: true,
    studio: "studio9",
    text: visit.outcome === "refused" ? BLOCKED_CONTACT_TEXT : CONTACT_TEXT,
  },
  coverage: visit.outcome === "checked" ? STATIC_COVERAGE : null,
  findings,
  headline: headlineOf(visit.outcome, tallyOf(findings, null)),
  reference: REFERENCE,
  rendered: null,
  statement: {
    factId: verifiedText(AUTOMATED_LIMIT_FACT)?.factId ?? null,
    text: AUTOMATED_LIMIT,
  },
});

const renderedCoverage = (rendered: Rendered) =>
  rendered.status === "ran"
    ? coverageFrom(
        {
          checks: STATIC_TESTED.checks + rendered.rules,
          criteria: [
            ...STATIC_TESTED.criteria,
            ...rendered.criteria.map((number) => `STD-SC-${number}`),
          ],
        },
        VERIFIED_FACTS,
        "static_html_and_rendered"
      )
    : STATIC_COVERAGE;

export const withRendered = (
  report: Report,
  outcome: RenderedOutcome
): Report => {
  if (report.outcome !== "checked") {
    return report;
  }

  const rendered = renderedFrom(outcome);

  return {
    ...report,
    coverage: renderedCoverage(rendered),
    headline: headlineOf(report.outcome, tallyOf(report.findings, rendered)),
    rendered,
  };
};
