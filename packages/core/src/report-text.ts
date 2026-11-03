import type { StateRef } from "./applicability.js";
import { METHOD_NAMES } from "./coverage.js";
import type { FindingReference } from "./finding-reference.js";
import { NEWER_VERSION_LABEL } from "./reference.js";
import type { Sourced } from "./reference.js";
import { issuesOf, quietChecksOf, quietSummary } from "./report-sections.js";
import type { Issue } from "./report-sections.js";
import type { Report } from "./report.js";

const KIND_LABELS: Readonly<Record<FindingReference["kind"], string>> = {
  "en-newer": NEWER_VERSION_LABEL,
  "en-reference": "Reference benchmark",
  wcag: "WCAG 2.1",
};

const QUIET_MARKS = {
  not_applicable: "– nothing to check",
  pass: "· no issue found",
} as const;

const codes = (states: readonly StateRef[]): string =>
  states.length === 0
    ? "none"
    : states.map((state) => state.code.toUpperCase()).join(" ");

const sourced = (label: string, value: Sourced | null): string[] =>
  value === null ? [] : [`  ${label}: ${value.text}  (${value.factId})`];

const countOf = (issue: Issue): string =>
  issue.checked === null
    ? `${issue.failing} ${issue.failing === 1 ? "element" : "elements"}`
    : `${issue.failing} of ${issue.checked} failing`;

const issueLines = (issue: Issue): string[] => [
  `  ✗ ${issue.title}  [${issue.key}]  ${countOf(issue)}`,
  ...(issue.whatFails === null ? [] : [`      What fails: ${issue.whatFails}`]),
  ...(issue.howToFix === null ? [] : [`      How to fix: ${issue.howToFix}`]),
  ...issue.samples.map((sample) => `      · ${sample}`),
  ...issue.references.map(
    (reference) =>
      `      ${KIND_LABELS[reference.kind]}: ${reference.text}  (${reference.factId})`
  ),
  ...(issue.helpUrl === null ? [] : [`      More: ${issue.helpUrl}`]),
];

const issuesBlock = (report: Report): string[] => {
  const issues = issuesOf(report);

  return issues.length === 0
    ? []
    : [
        `Issues (${issues.length}), worst first:`,
        ...issues.flatMap(issueLines),
        "",
      ];
};

const statesBlock = (report: Report): string[] => {
  const { applies, exemption, unknown } = report.applicability;

  return [
    "Where the EAA applies (the same for every issue):",
    `  Covers e-commerce services (${applies.length}): ${codes(applies)}`,
    ...sourced("Exemption", exemption),
    `  Unknown (${unknown.length}):`,
    ...unknown.map(
      (state) =>
        `    ${state.code.toUpperCase()} ${state.name}: ${state.reason ?? ""}`
    ),
    "",
  ];
};

const quietBlock = (report: Report): string[] => {
  const quiet = quietChecksOf(report);

  return quiet.length === 0
    ? []
    : [
        `${quietSummary(quiet)}:`,
        ...quiet.map(
          (finding) =>
            `  ${QUIET_MARKS[finding.status === "pass" ? "pass" : "not_applicable"]}: ${finding.title}  [${finding.id}]`
        ),
        "",
      ];
};

const renderedBlock = (report: Report): string[] =>
  report.rendered?.status === "skipped"
    ? [`Rendered page check skipped: ${report.rendered.reason}`, ""]
    : [];

const rulesBlock = (report: Report): string[] => {
  const { benchmark, citation, newerVersion, requirements } = report.reference;

  return [
    "About the rules:",
    ...requirements.map(
      (requirement) =>
        `  What the EAA requires: ${requirement.text}  (${requirement.factId})`
    ),
    ...sourced("Reference benchmark", benchmark),
    ...sourced(
      "Official Journal citation of EN 301 549 under the EAA",
      citation
    ),
    ...(newerVersion === null
      ? []
      : [`  ${newerVersion.label}  (${newerVersion.factIds.join(", ")})`]),
    "",
  ];
};

const methodLine = (report: Report): string[] =>
  report.coverage === null
    ? []
    : [`Checks run: ${METHOD_NAMES[report.coverage.method]}`];

export const formatReport = (report: Report): string =>
  [
    `Page: ${report.finalUrl ?? report.requestedUrl}`,
    `Scanned: ${report.scannedAt}${report.httpStatus === null ? "" : `  HTTP ${report.httpStatus}`}`,
    ...methodLine(report),
    "",
    report.headline,
    ...(report.coverage === null ? [] : [report.coverage.text]),
    report.outcomeDetail,
    ...(report.truncated
      ? [
          "The page was larger than the checker reads; only its first part was checked.",
        ]
      : []),
    "",
    ...issuesBlock(report),
    ...(report.outcome === "checked" ? statesBlock(report) : []),
    ...quietBlock(report),
    ...renderedBlock(report),
    ...rulesBlock(report),
    report.statement.factId === null
      ? report.statement.text
      : `${report.statement.text}  (${report.statement.factId})`,
    "",
    report.contact.text,
  ].join("\n");
