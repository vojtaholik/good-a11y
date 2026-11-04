import { describe, expect, it } from "@effect/vitest";

import {
  STATIC_COVERAGE,
  VERDICT_FACT,
  verdictFrom,
  verdictDetail,
  verdictText,
} from "../src/index.js";
import type { Issue, Sourced } from "../src/index.js";

const FACT: Sourced = {
  factId: VERDICT_FACT,
  source: "https://www.w3.org/TR/WCAG21/#conformance-reqs",
  text: "Level AA conformance requires every Level A and AA success criterion to be satisfied",
};

const wcag = (number: string) => ({
  factId: `STD-SC-${number}`,
  kind: "wcag" as const,
  source: "",
  text: "",
});

const issue = (
  level: Issue["level"],
  newer = false,
  criteria: readonly string[] = []
): Issue => ({
  checked: null,
  failing: 2,
  howToFix: null,
  key: `issue-${level ?? "none"}-${String(newer)}`,
  level,
  references: newer
    ? [{ factId: "STD-SC22-2.5.8", kind: "wcag-newer", source: "", text: "" }]
    : criteria.map(wcag),
  samples: [],
  sources: ["rendered"],
  title: "An issue",
  whatFails: null,
});

describe("the verdict", () => {
  it("says the page does not meet WCAG 2.1 Level AA when a Level A or AA check fails, citing the conformance fact", () => {
    const verdict = verdictFrom(
      [
        issue("A", false, ["2.4.4", "4.1.2"]),
        issue("AA", false, ["1.4.3"]),
        issue(null, true),
      ],
      STATIC_COVERAGE,
      FACT
    );

    expect(verdict.kind).toBe("fails");
    expect(verdictText(verdict)).toBe(
      "This page does not meet WCAG 2.1 Level AA, the reference benchmark. Automated checks found 3 failing criteria."
    );
    expect(verdictDetail(verdict)).toMatch(
      /^2 issues below fail WCAG 2\.1 Level A or AA and 1 is against the newer WCAG 2\.2\. Of the 50 /u
    );
  });

  it("makes no conformance claim while the conformance fact is not verified", () => {
    expect(verdictText(verdictFrom([issue("A")], STATIC_COVERAGE, null))).toBe(
      null
    );
  });

  it("never reads a pass into no failure, and counts the criteria left for a person from the coverage", () => {
    const verdict = verdictFrom([], STATIC_COVERAGE, FACT);

    expect(verdict.kind).toBe("no_failure");
    expect(verdict.needPerson).toBe(
      STATIC_COVERAGE.ofCriteria - STATIC_COVERAGE.criteria
    );
    expect(verdictText(verdict)).toBe(
      `Automated checks found no failures against WCAG 2.1 Level AA. That is not a pass: ${STATIC_COVERAGE.ofCriteria} of ${STATIC_COVERAGE.ofCriteria} criteria still need a person.`
    );
    expect(verdictDetail(verdict)).toBe(
      `Of the ${STATIC_COVERAGE.ofCriteria} WCAG 2.1 Level A and AA success criteria, ${verdict.needPerson} were not checked automatically on this scan and ${STATIC_COVERAGE.criteria} only in part, so a person needs to review those ${STATIC_COVERAGE.ofCriteria}.`
    );
  });

  it("does not count a failure of a newer WCAG 2.2 criterion against WCAG 2.1", () => {
    const verdict = verdictFrom([issue(null, true)], STATIC_COVERAGE, FACT);

    expect(verdict.kind).toBe("no_failure");
    expect(verdict.newer).toBe(1);
    expect(verdictText(verdict)).toContain(
      "no failures against WCAG 2.1 Level AA, and 1 issue against the newer WCAG 2.2"
    );
  });
});
