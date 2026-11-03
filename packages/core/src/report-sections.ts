import type { FindingReference } from "./finding-reference.js";
import type { RenderedFinding } from "./rendered.js";
import type { Finding, Report } from "./report.js";

export const ISSUE_SAMPLES = 3;

export type Level = "A" | "AA";

export interface Issue {
  readonly checked: number | null;
  readonly failing: number;
  readonly helpUrl: string | null;
  readonly howToFix: string | null;
  readonly key: string;
  readonly level: Level | null;
  readonly method: "rendered" | "static";
  readonly references: readonly FindingReference[];
  readonly samples: readonly string[];
  readonly title: string;
  readonly whatFails: string | null;
}

const LEVEL = /\(Level (?<level>AA?)\)/u;

export const levelOf = (
  references: readonly FindingReference[]
): Level | null => {
  const levels = new Set(
    references.flatMap((reference) => {
      const level =
        reference.kind === "wcag" ? LEVEL.exec(reference.text) : null;

      return level?.groups?.level === undefined ? [] : [level.groups.level];
    })
  );

  if (levels.has("A")) {
    return "A";
  }

  return levels.has("AA") ? "AA" : null;
};

const staticIssue = (finding: Finding): Issue => ({
  checked: finding.checked,
  failing: finding.failing,
  helpUrl: null,
  howToFix: finding.howToFix,
  key: finding.id,
  level: levelOf(finding.references),
  method: "static",
  references: finding.references,
  samples: finding.samples.slice(0, ISSUE_SAMPLES),
  title: finding.title,
  whatFails: finding.whatFails,
});

const renderedIssue = (finding: RenderedFinding): Issue => ({
  checked: null,
  failing: finding.failing,
  helpUrl: finding.helpUrl,
  howToFix: null,
  key: `axe:${finding.rule}`,
  level: levelOf(finding.references),
  method: "rendered",
  references: finding.references,
  samples: finding.samples.slice(0, ISSUE_SAMPLES),
  title: finding.help,
  whatFails: null,
});

const LEVEL_RANK = new Map<Level | null, number>([
  ["A", 0],
  ["AA", 1],
  [null, 2],
]);

const worstFirst = (left: Issue, right: Issue): number =>
  right.failing - left.failing ||
  (LEVEL_RANK.get(left.level) ?? 2) - (LEVEL_RANK.get(right.level) ?? 2) ||
  left.key.localeCompare(right.key);

export const issuesOf = (report: Report): readonly Issue[] =>
  [
    ...report.findings.flatMap((finding) =>
      finding.status === "fail" ? [staticIssue(finding)] : []
    ),
    ...(report.rendered?.status === "ran"
      ? report.rendered.findings.map(renderedIssue)
      : []),
  ].toSorted(worstFirst);

export const quietChecksOf = (report: Report): readonly Finding[] =>
  report.findings.filter((finding) => finding.status !== "fail");

export const quietSummary = (quiet: readonly Finding[]): string => {
  const clean = quiet.filter((finding) => finding.status === "pass").length;

  const empty = quiet.length - clean;

  const parts = [
    ...(clean === 0
      ? []
      : [`${clean} ${clean === 1 ? "check" : "checks"} found no issues`]),
    ...(empty === 0 ? [] : [`${empty} had nothing to check`]),
  ];

  return parts.join(", ");
};
