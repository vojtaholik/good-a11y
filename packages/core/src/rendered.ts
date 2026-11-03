import { Result, Schema } from "effect";

import { AxeResultsJson } from "./axe-results.js";
import type { AxeResults, AxeRule } from "./axe-results.js";
import { criterion } from "./catalogue.js";
import { challengeIn } from "./challenge.js";
import { MAX_SAMPLES } from "./check.js";
import {
  FindingReferenceSchema,
  newerReferencesFor,
  referencesFor,
} from "./finding-reference.js";
import { MAX_SNIPPET } from "./page-evidence.js";
import {
  PROBES,
  ProbeResultSchema,
  ProbesJson,
  probeFact,
  probeResults,
  scFactOf,
} from "./probes.js";
import type { ProbeResult } from "./probes.js";
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
    passed: Schema.Array(Schema.String),
    probes: Schema.Array(ProbeResultSchema),
    rules: Schema.Array(Schema.String),
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

export const DROPPED_RULES: ReadonlySet<string> = new Set([
  "label-content-name-mismatch",
]);

const verifiedCriteria = (rule: AxeRule): readonly string[] =>
  !DROPPED_RULES.has(rule.id) && rule.tags.some((tag) => IN_SCOPE.has(tag))
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

const probeFindingOf = (
  probe: ProbeResult,
  reference: Reference
): RenderedFinding[] => {
  const fact = probeFact(probe.probe);

  return probe.status !== "fail" || fact === null
    ? []
    : [
        {
          failing: probe.failing,
          help: PROBES[probe.probe].help,
          helpUrl: fact.source,
          impact: null,
          references: probe.newer
            ? newerReferencesFor(scFactOf(probe.probe))
            : referencesFor([criterion(probe.criterion)], reference),
          rule: probe.probe,
          samples: probe.samples.map((sample) => sample.slice(0, MAX_SNIPPET)),
        },
      ];
};

const byNumber = (left: string, right: string): number =>
  left.localeCompare(right, "en", { numeric: true });

export const renderedOf = (
  results: AxeResults,
  reference: Reference = REFERENCE,
  probes: readonly ProbeResult[] = []
): Rendered => {
  const ran = [
    ...results.violations,
    ...results.passes,
    ...results.incomplete,
    ...results.inapplicable,
  ].filter((rule) => verifiedCriteria(rule).length > 0);

  const kept = probes.filter((probe) => probeFact(probe.probe) !== null);

  const undecided = new Set(
    [...results.violations, ...results.incomplete].map((rule) => rule.id)
  );

  const probedCriteria = kept.flatMap((probe) =>
    probe.newer || probe.status === "not_applicable" ? [] : [probe.criterion]
  );

  return {
    criteria: [
      ...new Set([...ran.flatMap(verifiedCriteria), ...probedCriteria]),
    ].toSorted(byNumber),
    engine: `${results.testEngine.name} ${results.testEngine.version}`,
    findings: [
      ...results.violations.flatMap((rule) => {
        const criteria = verifiedCriteria(rule);

        return criteria.length === 0 || rule.nodes.length === 0
          ? []
          : [findingOf(rule, criteria, reference)];
      }),
      ...kept.flatMap((probe) => probeFindingOf(probe, reference)),
    ],
    passed: [
      ...new Set(
        results.passes.map((rule) => rule.id).filter((id) => !undecided.has(id))
      ),
    ].toSorted(),
    probes: kept,
    rules: [...new Set(ran.map((rule) => rule.id))].toSorted(),
    status: "ran",
  };
};

const blocked = (page: RenderedPage): boolean =>
  (page.status !== null &&
    (refusesAPlainRequest(page.status) || page.status >= 500)) ||
  challengeIn(page.headers, page.html) !== undefined;

const decodeAxe = Schema.decodeUnknownResult(AxeResultsJson);

const decodeProbes = Schema.decodeUnknownResult(ProbesJson);

const probesOf = (json: string | null): readonly ProbeResult[] => {
  if (json === null) {
    return [];
  }

  const decoded = decodeProbes(json);

  return Result.isSuccess(decoded) ? probeResults(decoded.success) : [];
};

export const renderedFrom = (outcome: RenderedOutcome): Rendered => {
  if ("skipped" in outcome) {
    return { reason: outcome.skipped, status: "skipped" };
  }

  if (blocked(outcome.ran)) {
    return { reason: RENDERED_BLOCKED, status: "skipped" };
  }

  const decoded = decodeAxe(outcome.ran.axe);

  return Result.isSuccess(decoded)
    ? renderedOf(decoded.success, REFERENCE, probesOf(outcome.ran.probes))
    : { reason: RENDERED_UNREADABLE, status: "skipped" };
};

const FAILURE_REASONS: Readonly<Record<RenderedAuditFailed["kind"], string>> = {
  audit: "The accessibility engine failed on the rendered page.",
  browser: "The browser service failed, so the rendered page was not checked.",
  navigation:
    "The page sent the browser to an address the scanner does not open, so the rendered page was not checked.",
  timeout: "The page took too long to render, so it was not checked.",
};

export const skippedBecause = (failure: RenderedAuditFailed): string =>
  FAILURE_REASONS[failure.kind];
