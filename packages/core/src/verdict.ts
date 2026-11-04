import { Schema } from "effect";

import type { Coverage } from "./coverage.js";
import { SourcedSchema, verifiedText } from "./reference.js";
import type { Sourced } from "./reference.js";
import type { Issue } from "./report-sections.js";

export const VERDICT_FACT = "STD-WCAG21-3";

export const ALWAYS_MET_FACT = "STD-WCAG21-2";

export const ALWAYS_MET_CRITERION = "4.1.1";

export const alwaysMet = (): Sourced | null => verifiedText(ALWAYS_MET_FACT);

export const alwaysMetCount = (decided: ReadonlySet<string>): number =>
  alwaysMet() === null || decided.has(ALWAYS_MET_CRITERION) ? 0 : 1;

const Count = Schema.Int.check(Schema.isGreaterThanOrEqualTo(0));

export const VerdictSchema = Schema.Struct({
  checked: Count,
  fact: Schema.NullOr(SourcedSchema),
  failures: Count,
  kind: Schema.Literals(["fails", "no_failure"]),
  needPerson: Count,
  newer: Count,
  ofCriteria: Count,
  settled: Count,
});

export type Verdict = typeof VerdictSchema.Type;

const failsWcag21 = (issue: Issue): boolean => issue.level !== null;

const failsOnlyNewer = (issue: Issue): boolean =>
  issue.level === null &&
  issue.references.some((reference) => reference.kind === "wcag-newer");

export const verdictFrom = (
  issues: readonly Issue[],
  coverage: Coverage,
  fact: Sourced | null,
  settled = 0
): Verdict => {
  const failures = issues.filter(failsWcag21).length;

  return {
    checked: coverage.criteria,
    fact,
    failures,
    kind: failures > 0 ? "fails" : "no_failure",
    needPerson: coverage.ofCriteria - coverage.criteria - settled,
    newer: issues.filter(failsOnlyNewer).length,
    ofCriteria: coverage.ofCriteria,
    settled,
  };
};

const plural = (count: number, word: string): string =>
  `${count} ${count === 1 ? word : `${word}s`}`;

export const verdictText = (verdict: Verdict): string | null => {
  if (verdict.kind === "fails") {
    return verdict.fact === null
      ? null
      : `This page does not meet WCAG 2.1 Level AA, the reference benchmark. Automated checks found ${plural(verdict.failures, "failure")}.`;
  }

  const newer =
    verdict.newer === 0
      ? ""
      : `, and ${plural(verdict.newer, "issue")} against the newer WCAG 2.2`;

  return `Automated checks found no failures against WCAG 2.1 Level AA${newer}. That is not a pass: ${verdict.needPerson + verdict.checked} of ${verdict.ofCriteria} criteria still need a person.`;
};

export const verdictDetail = (verdict: Verdict): string => {
  const settled =
    verdict.settled === 0
      ? ""
      : ` ${ALWAYS_MET_CRITERION} Parsing is always met by HTML.`;

  return `Of the ${verdict.ofCriteria} WCAG 2.1 Level A and AA success criteria, ${verdict.needPerson} were not checked automatically on this scan and ${verdict.checked} only in part, so a person needs to review those ${verdict.needPerson + verdict.checked}.${settled}`;
};
