import type { StateRef } from "./applicability.js";
import { METHOD_NAMES } from "./coverage.js";
import type { FindingReference } from "./finding-reference.js";
import {
  NOT_SELLING_LEAD,
  notSellingBasis,
  sellsLine,
} from "./judged-placement.js";
import { NEWER_VERSION_LABEL, newerWcagLabel } from "./reference.js";
import type { Sourced } from "./reference.js";
import {
  NEWER_ISSUES_TITLE,
  SAMPLE_SOURCE_LABELS,
  isTested,
  issueGroupsOf,
  quietChecksOf,
  quietSummary,
} from "./report-sections.js";
import type { Issue } from "./report-sections.js";
import type { Report } from "./report.js";
import {
  EXAMPLE_LABEL,
  REQUIREMENT_STATUS_NAMES,
  checklistGroups,
  requirementsOf,
  tallyText,
} from "./requirements.js";
import type { RequirementRow } from "./requirements.js";
import { ROLE_NAMES, siteSummary } from "./site-summary.js";
import { verdictDetail } from "./verdict.js";

const KIND_LABELS: Readonly<Record<FindingReference["kind"], string>> = {
  "en-newer": NEWER_VERSION_LABEL,
  "en-reference": "Reference benchmark",
  wcag: "WCAG 2.1",
  "wcag-newer": newerWcagLabel(),
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
  ...issue.samples.map(
    (sample) =>
      `      · (${SAMPLE_SOURCE_LABELS[sample.source]}) ${sample.text}`
  ),
  ...issue.references.map(
    (reference) =>
      `      ${KIND_LABELS[reference.kind]}: ${reference.text}  (${reference.factId})`
  ),
];

const issuesBlock = (report: Report): string[] => {
  const { benchmark, newer } = issueGroupsOf(report);

  return benchmark.length + newer.length === 0
    ? []
    : [
        `Issues (${benchmark.length + newer.length}), worst first:`,
        ...benchmark.flatMap(issueLines),
        ...(newer.length === 0
          ? []
          : [`  ${NEWER_ISSUES_TITLE}:`, ...newer.flatMap(issueLines)]),
        "",
      ];
};

const STATUS_WIDTH = Math.max(
  ...Object.values(REQUIREMENT_STATUS_NAMES).map((name) => name.length)
);

const indent = (text: string): string =>
  `    ${"".padEnd(STATUS_WIDTH)}  ${text}`;

const sourcedText = (label: string, value: Sourced): string =>
  `${label}: ${value.text}  (${value.factId})`;

const rowLines = (row: RequirementRow): string[] => [
  `    ${REQUIREMENT_STATUS_NAMES[row.status].padEnd(STATUS_WIDTH)}  ${row.group === "wcag" ? "" : `${row.citation}: `}${row.requirement.text}  (${row.requirement.factId})`,
  ...(row.noteFact === null ? [] : [indent(sourcedText("Why", row.noteFact))]),
  ...(row.example === null
    ? []
    : [indent(sourcedText(EXAMPLE_LABEL, row.example))]),
  ...(row.judged === null ? [] : [indent(row.judged)]),
];

export const checklistBlock = (report: Report): string[] => [
  "Requirement checklist for this scan:",
  ...checklistGroups(requirementsOf(report)).flatMap((group) => [
    `  ${group.title} (${group.rows.length}): ${tallyText(group.rows)}`,
    ...group.basis.map((value) => `    ${sourcedText("Basis", value)}`),
    ...group.rows.flatMap(rowLines),
  ]),
  "",
];

const siteBlock = (report: Report): string[] =>
  report.site === null || report.site.pages.length === 0
    ? []
    : [
        "Other pages of the site:",
        `  ${siteSummary(report.site)}`,
        ...report.site.pages.map((page) =>
          page.outcome === "read"
            ? `  ${ROLE_NAMES[page.role]}: ${page.url}  ${page.failing.length === 0 ? "no issue found by the static checks" : `issues: ${page.failing.join("; ")}`}`
            : `  ${ROLE_NAMES[page.role]}: ${page.url}  not read: ${page.detail ?? ""}`
        ),
        "",
      ];

const statesBlock = (report: Report): string[] => {
  const { applies, exemption, unknown } = report.applicability;

  return [
    "Where the EAA applies (the same for every issue):",
    `  Covers e-commerce services (${applies.length}): ${codes(applies)}`,
    ...(sellsLine(report) === null ? [] : [`  ${sellsLine(report)}`]),
    ...(notSellingBasis(report) === null
      ? []
      : [
          `  ${NOT_SELLING_LEAD}`,
          ...sourced("Definition", notSellingBasis(report)),
        ]),
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
    report.verdict?.kind === "fails" && report.verdict.fact !== null
      ? `${report.headline}  (${[report.verdict.fact.factId, ...(report.reference.benchmark === null ? [] : [report.reference.benchmark.factId])].join(", ")})`
      : report.headline,
    ...(report.verdict === null ? [] : [verdictDetail(report.verdict)]),
    ...(report.coverage === null ? [] : [report.coverage.text]),
    report.outcomeDetail,
    ...(report.truncated
      ? [
          "The page was larger than the checker reads; only its first part was checked.",
        ]
      : []),
    "",
    ...issuesBlock(report),
    ...(isTested(report)
      ? [
          ...checklistBlock(report),
          ...siteBlock(report),
          ...statesBlock(report),
        ]
      : []),
    ...quietBlock(report),
    ...renderedBlock(report),
    ...rulesBlock(report),
    report.statement.factId === null
      ? report.statement.text
      : `${report.statement.text}  (${report.statement.factId})`,
    "",
    report.contact.text,
  ].join("\n");
