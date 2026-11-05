import { VERIFIED_FACTS } from "@good-a11y/facts";
import { Schema } from "effect";

import { APPLICABILITY, ApplicabilitySchema } from "./applicability.js";
import type { Applicability } from "./applicability.js";
import { CATALOGUE, criteriaOf, entryOf } from "./catalogue.js";
import type { CatalogueEntry } from "./catalogue.js";
import {
  CheckIdSchema,
  CheckResultSchema,
  CheckStatusSchema,
} from "./check.js";
import type { CheckResult } from "./check.js";
import type { Method } from "./coverage.js";
import { CoverageSchema, coverageFrom } from "./coverage.js";
import { CrawlRoleSchema } from "./crawl.js";
import { decidedOf } from "./decided.js";
import { FindingReferenceSchema, referencesFor } from "./finding-reference.js";
import type { FindingReference } from "./finding-reference.js";
import { JudgedSchema } from "./judged.js";
import type { Judged } from "./judged.js";
import type { PageEvidence } from "./page-evidence.js";
import { REFERENCE, ReferenceSchema, verifiedText } from "./reference.js";
import type { Reference } from "./reference.js";
import { RenderedSchema, renderedFrom } from "./rendered.js";
import type { RenderedOutcome } from "./rendered.js";
import { concernsRun, issuesFrom } from "./report-sections.js";
import { SiteFindingSchema, runSiteChecks } from "./site-checks.js";
import type { SiteEvidence, SitePage } from "./site-evidence.js";
import {
  VERDICT_FACT,
  alwaysMetCount,
  VerdictSchema,
  verdictFrom,
  verdictText,
} from "./verdict.js";

export const AUTOMATED_LIMIT_FACT = "STD-AUTO-1";

export const AUTOMATED_LIMIT =
  "Automated checks find only part of the accessibility issues WCAG covers, and only those visible to the checker in the page it read. This report does not show whether the page meets the European Accessibility Act. A manual review by a person is needed.";

export const CONTACT_SHOWN = false;

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

export const SitePageResultSchema = Schema.Struct({
  detail: Schema.NullOr(Schema.String),
  failing: Schema.Array(Schema.String),
  outcome: Schema.Literals(["read", "failed"]),
  role: CrawlRoleSchema,
  url: Schema.String,
});

export type SitePageResult = typeof SitePageResultSchema.Type;

export const SiteSchema = Schema.Struct({
  findings: Schema.Array(SiteFindingSchema),
  pages: Schema.Array(SitePageResultSchema),
  search: Schema.Boolean,
  sitemap: Schema.Boolean,
});

export type Site = typeof SiteSchema.Type;

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
  site: Schema.NullOr(SiteSchema),
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

const UNTESTED_HEADLINES: Readonly<
  Record<Exclude<Outcome, "checked">, string>
> = {
  not_html: NOT_HTML_HEADLINE,
  refused: BLOCKED_HEADLINE,
  unreachable: UNREACHABLE_HEADLINE,
};

const methodOf = (served: boolean, rendered: boolean): Method => {
  if (served && rendered) {
    return "static_html_and_rendered";
  }

  return served ? "static_html" : "rendered_page";
};

const assessed = (report: Report): Report => {
  const served = report.outcome === "checked";

  const rendered = report.rendered?.status === "ran" ? report.rendered : null;

  if (!served && rendered === null) {
    return report;
  }

  const findings = served ? report.findings : [];

  const site = served ? (report.site?.findings ?? []) : [];

  const coverage = coverageFrom(
    {
      checks: concernsRun(
        [
          ...findings.map((finding) => finding.id),
          ...site.flatMap((finding) =>
            finding.status === "not_applicable" ? [] : [`site:${finding.id}`]
          ),
        ],
        rendered
      ),
      criteria: [...decidedOf(report).decided].map(
        (number) => `STD-SC-${number}`
      ),
    },
    VERIFIED_FACTS,
    methodOf(served, rendered !== null)
  );

  const issues = issuesFrom(findings, rendered, site);

  const verdict = verdictFrom(
    issues,
    coverage,
    verifiedText(VERDICT_FACT),
    alwaysMetCount(decidedOf(report).decided)
  );

  return {
    ...report,
    coverage,
    headline:
      verdictText(verdict) ??
      `${issues.length} ${issues.length === 1 ? "issue" : "issues"} found by ${coverage.checks} automated checks`,
    verdict,
  };
};

export const reportOf = (
  visit: PageVisit,
  findings: readonly Finding[],
  applicability: Applicability = APPLICABILITY
): Report =>
  assessed({
    ...visit,
    applicability,
    contact: {
      placeholder: true,
      studio: "studio9",
      text: visit.outcome === "refused" ? BLOCKED_CONTACT_TEXT : CONTACT_TEXT,
    },
    coverage: null,
    findings,
    headline:
      visit.outcome === "checked" ? "" : UNTESTED_HEADLINES[visit.outcome],
    judged: null,
    reference: REFERENCE,
    rendered: null,
    site: null,
    statement: {
      factId: verifiedText(AUTOMATED_LIMIT_FACT)?.factId ?? null,
      text: AUTOMATED_LIMIT,
    },
    verdict: null,
  });

export const withRendered = (
  report: Report,
  outcome: RenderedOutcome
): Report => {
  const rendered = renderedFrom(outcome);

  if (report.outcome === "refused") {
    return rendered.status === "ran"
      ? assessed({
          ...report,
          contact: { ...report.contact, text: CONTACT_TEXT },
          outcomeDetail: `${REFUSED_THEN_RENDERED} ${report.outcomeDetail}`,
          rendered,
        })
      : report;
  }

  return report.outcome === "checked"
    ? assessed({ ...report, rendered })
    : report;
};

const pageOf = (page: SitePage): SitePageResult =>
  page.outcome === "read"
    ? {
        detail: null,
        failing: page.checks.flatMap((result) =>
          result.status === "fail"
            ? [entryOf(result.id)?.check.title ?? result.id]
            : []
        ),
        outcome: "read",
        role: page.role,
        url: page.finalUrl,
      }
    : {
        detail: page.detail,
        failing: [],
        outcome: "failed",
        role: page.role,
        url: page.url,
      };

export const withSite = (report: Report, evidence: SiteEvidence): Report =>
  assessed({
    ...report,
    site: {
      findings:
        report.outcome === "checked"
          ? runSiteChecks(evidence, report.reference)
          : [],
      pages: evidence.pages.map(pageOf),
      search: evidence.summaries.some((summary) => summary.search),
      sitemap: evidence.summaries.some((summary) => summary.sitemap),
    },
  });

export const withJudged = (report: Report, judged: Judged): Report => ({
  ...report,
  judged,
});
