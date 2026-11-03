import { Number } from "effect";

import { AXE_REPORTS, axeTitleOf } from "./axe-titles.js";
import type { CheckId } from "./check.js";
import type { FindingReference } from "./finding-reference.js";
import { PROBES } from "./probes.js";
import type { Rendered, RenderedFinding } from "./rendered.js";
import type { Finding, Report } from "./report.js";

export const ISSUE_SAMPLES = 3;

export type Level = "A" | "AA";

export type SampleSource = "rendered" | "static";

export const SAMPLE_SOURCE_LABELS: Readonly<Record<SampleSource, string>> = {
  rendered: "rendered page",
  static: "served HTML",
};

export interface IssueSample {
  readonly source: SampleSource;
  readonly text: string;
}

export interface Issue {
  readonly checked: number | null;
  readonly failing: number;
  readonly howToFix: string | null;
  readonly key: string;
  readonly level: Level | null;
  readonly references: readonly FindingReference[];
  readonly samples: readonly IssueSample[];
  readonly sources: readonly SampleSource[];
  readonly title: string;
  readonly whatFails: string | null;
}

export const SAME_CONCERN = {
  "autocomplete-valid": "autocomplete-valid",
  "button-name": "button-name",
  "document-title": "document-title",
  "frame-title": "frame-title",
  "html-has-lang": "html-lang",
  "html-lang-valid": "html-lang",
  "image-alt": "image-alt",
  "input-button-name": "button-name",
  "input-image-alt": "image-alt",
  label: "form-labels",
  "link-name": "link-name",
  "meta-refresh": "meta-refresh",
  "meta-viewport": "meta-viewport-zoom",
  "select-name": "form-labels",
} satisfies Readonly<Record<string, CheckId>>;

const SAME: ReadonlyMap<string, CheckId> = new Map(
  Object.entries(SAME_CONCERN)
);

export const concernOf = (rule: string): string =>
  SAME.get(rule) ?? `axe:${rule}`;

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

const tagged = (
  source: SampleSource,
  samples: readonly string[]
): IssueSample[] => samples.map((text) => ({ source, text }));

const samplesOf = (
  served: readonly IssueSample[],
  rendered: readonly IssueSample[]
): IssueSample[] =>
  [
    ...served.slice(
      0,
      rendered.length === 0 ? ISSUE_SAMPLES : ISSUE_SAMPLES - 1
    ),
    ...rendered,
  ].slice(0, ISSUE_SAMPLES);

const staticIssue = (
  finding: Finding,
  rendered: readonly RenderedFinding[]
): Issue => {
  const renderedFailing = Number.sumAll(rendered.map((item) => item.failing));

  const served = finding.status === "fail" ? finding.failing : 0;

  return {
    checked: served >= renderedFailing ? finding.checked : null,
    failing: Math.max(served, renderedFailing),
    howToFix: finding.howToFix,
    key: finding.id,
    level: levelOf(finding.references),
    references: finding.references,
    samples: samplesOf(
      finding.status === "fail" ? tagged("static", finding.samples) : [],
      rendered.flatMap((item) => tagged("rendered", item.samples))
    ),
    sources: [
      ...(served > 0 ? (["static"] as const) : []),
      ...(renderedFailing > 0 ? (["rendered"] as const) : []),
    ],
    title: finding.title,
    whatFails: finding.whatFails,
  };
};

const PROBE_IDS: ReadonlySet<string> = new Set(Object.keys(PROBES));

const isProbe = (finding: RenderedFinding): boolean =>
  PROBE_IDS.has(finding.rule);

const renderedIssue = (finding: RenderedFinding): Issue => ({
  checked: null,
  failing: finding.failing,
  howToFix: null,
  key: `axe:${finding.rule}`,
  level: levelOf(finding.references),
  references: finding.references,
  samples: samplesOf([], tagged("rendered", finding.samples)),
  sources: ["rendered"],
  title: isProbe(finding) ? finding.help : axeTitleOf(finding.rule),
  whatFails: isProbe(finding) ? null : `${AXE_REPORTS} ${finding.help}`,
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

export const issuesFrom = (
  findings: readonly Finding[],
  rendered: Rendered | null
): readonly Issue[] => {
  const renderedFindings = rendered?.status === "ran" ? rendered.findings : [];

  const ofConcern = (id: string) =>
    renderedFindings.filter((finding) => concernOf(finding.rule) === id);

  const staticIds = new Set<string>(findings.map((finding) => finding.id));

  return [
    ...findings.flatMap((finding) => {
      const issue = staticIssue(finding, ofConcern(finding.id));

      return issue.failing === 0 ? [] : [issue];
    }),
    ...renderedFindings
      .filter((finding) => !staticIds.has(concernOf(finding.rule)))
      .map(renderedIssue),
  ].toSorted(worstFirst);
};

export const concernsRun = (
  staticIds: readonly string[],
  rendered: Rendered | null
): number =>
  new Set([
    ...staticIds,
    ...(rendered?.status === "ran"
      ? [
          ...rendered.rules.map(concernOf),
          ...rendered.probes.map((probe) => `axe:${probe.probe}`),
        ]
      : []),
  ]).size;

export const issuesOf = (report: Report): readonly Issue[] =>
  issuesFrom(report.findings, report.rendered);

export const isTested = (report: Report): boolean =>
  report.outcome === "checked" || report.rendered?.status === "ran";

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
