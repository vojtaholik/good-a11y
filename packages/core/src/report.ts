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
import type { Coverage } from "./coverage.js";
import {
  CoverageSchema,
  STATIC_COVERAGE,
  STATIC_TESTED,
  coverageFrom,
} from "./coverage.js";
import { FindingReferenceSchema, referencesFor } from "./finding-reference.js";
import type { FindingReference } from "./finding-reference.js";
import { JudgedSchema } from "./judged.js";
import type { Judged } from "./judged.js";
import type { PageEvidence } from "./page-evidence.js";
import { REFERENCE, ReferenceSchema, verifiedText } from "./reference.js";
import type { Reference } from "./reference.js";
import { RenderedSchema, renderedFrom } from "./rendered.js";
import type { Rendered, RenderedOutcome } from "./rendered.js";
import { concernsRun, issuesFrom } from "./report-sections.js";
import {
  VERDICT_FACT,
  VerdictSchema,
  verdictFrom,
  verdictText,
} from "./verdict.js";
import type { Verdict } from "./verdict.js";

export const AUTOMATED_LIMIT_FACT = "STD-AUTO-1";

export const AUTOMATED_LIMIT =
  "Automated checks find only part of the accessibility issues WCAG covers, and only those visible to the checker in the page it read. This report does not show whether the page meets the European Accessibility Act. A manual review by a person is needed.";

export const CONTACT_TEXT =
  "studio9 can review this page by hand, explain what the findings mean for your site, and fix them. Get in touch with studio9.";

export const BLOCKED_CONTACT_TEXT =
  "studio9 can review it by hand. Get in touch with studio9.";

export const REFUSED_THEN_RENDERED =
  "The plain fetch was refused, so a browser opened the page and only the rendered page checks ran.";

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
  howToFix: Schema.String,
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
  judged: Schema.NullOr(JudgedSchema),
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
  verdict: Schema.NullOr(VerdictSchema),
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
  howToFix: entry.check.howToFix,
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

interface Judgement {
  readonly headline: string;
  readonly verdict: Verdict | null;
}

const UNTESTED_HEADLINES: Readonly<
  Record<Exclude<Outcome, "checked">, string>
> = {
  not_html: NOT_HTML_HEADLINE,
  refused: BLOCKED_HEADLINE,
  unreachable: UNREACHABLE_HEADLINE,
};

const judgementOf = (
  findings: readonly Finding[],
  rendered: Rendered | null,
  coverage: Coverage
): Judgement => {
  const issues = issuesFrom(findings, rendered);

  const verdict = verdictFrom(issues, coverage, verifiedText(VERDICT_FACT));

  const checks = concernsRun(
    findings.map((finding) => finding.id),
    rendered
  );

  return {
    headline:
      verdictText(verdict) ??
      `${issues.length} ${issues.length === 1 ? "issue" : "issues"} found by ${checks} automated checks`,
    verdict,
  };
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
  ...(visit.outcome === "checked"
    ? judgementOf(findings, null, STATIC_COVERAGE)
    : { headline: UNTESTED_HEADLINES[visit.outcome], verdict: null }),
  judged: null,
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
          checks: concernsRun(
            CATALOGUE.map(({ check }) => check.id),
            rendered
          ),
          criteria: [
            ...STATIC_TESTED.criteria,
            ...rendered.criteria.map((number) => `STD-SC-${number}`),
          ],
        },
        VERIFIED_FACTS,
        "static_html_and_rendered"
      )
    : STATIC_COVERAGE;

const renderedAfterRefusal = (report: Report, rendered: Rendered): Report => {
  if (rendered.status !== "ran") {
    return report;
  }

  const coverage = coverageFrom(
    {
      checks: concernsRun([], rendered),
      criteria: rendered.criteria.map((number) => `STD-SC-${number}`),
    },
    VERIFIED_FACTS,
    "rendered_page"
  );

  return {
    ...report,
    contact: { ...report.contact, text: CONTACT_TEXT },
    coverage,
    ...judgementOf([], rendered, coverage),
    outcomeDetail: `${REFUSED_THEN_RENDERED} ${report.outcomeDetail}`,
    rendered,
  };
};

export const withRendered = (
  report: Report,
  outcome: RenderedOutcome
): Report => {
  if (report.outcome === "refused") {
    return renderedAfterRefusal(report, renderedFrom(outcome));
  }

  if (report.outcome !== "checked") {
    return report;
  }

  const rendered = renderedFrom(outcome);

  const coverage = renderedCoverage(rendered);

  return {
    ...report,
    coverage,
    ...judgementOf(report.findings, rendered, coverage),
    rendered,
  };
};

export const withJudged = (report: Report, judged: Judged): Report => ({
  ...report,
  judged,
});
