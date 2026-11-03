import { Result, Schema } from "effect";

import { AxeResultsJson } from "./axe-results.js";
import type { AxeResults, AxeRule } from "./axe-results.js";
import { criterion } from "./catalogue.js";
import { challengeIn } from "./challenge.js";
import { MAX_SAMPLES } from "./check.js";
import { FindingReferenceSchema, referencesFor } from "./finding-reference.js";
import { MAX_SNIPPET } from "./page-evidence.js";
import { REFERENCE, verifiedText } from "./reference.js";
import type { Reference } from "./reference.js";
import { refusesAPlainRequest } from "./refusal.js";
import type { RenderedAuditFailed } from "./rendered-audit-failed.js";
import { AXE_TAGS } from "./rendered-audit.js";
import type { RenderedPage } from "./rendered-audit.js";

const Count = Schema.Int.check(Schema.isGreaterThanOrEqualTo(0));

export const RenderedFindingSchema = Schema.Struct({
  failing: Count,
  help: Schema.String,
  helpUrl: Schema.String,
  impact: Schema.NullOr(Schema.String),
  references: Schema.Array(FindingReferenceSchema),
  rule: Schema.String,
  samples: Schema.Array(Schema.String).check(Schema.isMaxLength(MAX_SAMPLES)),
});

export type RenderedFinding = typeof RenderedFindingSchema.Type;

export const RenderedSchema = Schema.Union([
  Schema.Struct({
    criteria: Schema.Array(Schema.String),
    engine: Schema.String,
    findings: Schema.Array(RenderedFindingSchema),
    rules: Count,
    status: Schema.Literal("ran"),
  }),
  Schema.Struct({
    reason: Schema.String,
    status: Schema.Literal("skipped"),
  }),
]);

export type Rendered = typeof RenderedSchema.Type;

export type RenderedOutcome =
  | { readonly ran: RenderedPage }
  | { readonly skipped: string };

export const BUDGET_SPENT =
  "The daily budget for rendered page checks is spent. Try again tomorrow.";

export const RENDERED_BLOCKED =
  "The site blocked the browser, so the rendered page was not checked.";

export const RENDERED_UNREADABLE =
  "The rendered page check returned results the checker could not read.";

const AXE_SC_TAG = /^wcag(?<principle>\d)(?<guideline>\d)(?<criterion>\d+)$/u;

const IN_SCOPE = new Set<string>(AXE_TAGS);

export const criteriaOfRule = (rule: AxeRule): readonly string[] =>
  rule.tags.flatMap((tag) => {
    const match = AXE_SC_TAG.exec(tag);

    const groups = match?.groups;

    return groups === undefined
      ? []
      : [`${groups.principle}.${groups.guideline}.${groups.criterion}`];
  });

const verifiedCriteria = (rule: AxeRule): readonly string[] =>
  rule.tags.some((tag) => IN_SCOPE.has(tag))
    ? criteriaOfRule(rule).filter(
        (number) => verifiedText(`STD-SC-${number}`) !== null
      )
    : [];

const findingOf = (
  rule: AxeRule,
  criteria: readonly string[],
  reference: Reference
): RenderedFinding => ({
  failing: rule.nodes.length,
  help: rule.help,
  helpUrl: rule.helpUrl,
  impact: rule.impact ?? null,
  references: referencesFor(criteria.map(criterion), reference),
  rule: rule.id,
  samples: rule.nodes
    .slice(0, MAX_SAMPLES)
    .map((node) => node.html.slice(0, MAX_SNIPPET)),
});

export const renderedOf = (
  results: AxeResults,
  reference: Reference = REFERENCE
): Rendered => {
  const ran = [
    ...results.violations,
    ...results.passes,
    ...results.incomplete,
    ...results.inapplicable,
  ].filter((rule) => verifiedCriteria(rule).length > 0);

  return {
    criteria: [...new Set(ran.flatMap(verifiedCriteria))].toSorted(
      (left, right) => left.localeCompare(right, "en", { numeric: true })
    ),
    engine: `${results.testEngine.name} ${results.testEngine.version}`,
    findings: results.violations.flatMap((rule) => {
      const criteria = verifiedCriteria(rule);

      return criteria.length === 0 || rule.nodes.length === 0
        ? []
        : [findingOf(rule, criteria, reference)];
    }),
    rules: new Set(ran.map((rule) => rule.id)).size,
    status: "ran",
  };
};

const blocked = (page: RenderedPage): boolean =>
  (page.status !== null &&
    (refusesAPlainRequest(page.status) || page.status >= 500)) ||
  challengeIn(page.headers, page.html) !== undefined;

const decodeAxe = Schema.decodeUnknownResult(AxeResultsJson);

export const renderedFrom = (outcome: RenderedOutcome): Rendered => {
  if ("skipped" in outcome) {
    return { reason: outcome.skipped, status: "skipped" };
  }

  if (blocked(outcome.ran)) {
    return { reason: RENDERED_BLOCKED, status: "skipped" };
  }

  const decoded = decodeAxe(outcome.ran.axe);

  return Result.isSuccess(decoded)
    ? renderedOf(decoded.success)
    : { reason: RENDERED_UNREADABLE, status: "skipped" };
};

const FAILURE_REASONS: Readonly<Record<RenderedAuditFailed["kind"], string>> = {
  audit: "The accessibility engine failed on the rendered page.",
  browser: "The browser service failed, so the rendered page was not checked.",
  timeout: "The page took too long to render, so it was not checked.",
};

export const skippedBecause = (failure: RenderedAuditFailed): string =>
  FAILURE_REASONS[failure.kind];
