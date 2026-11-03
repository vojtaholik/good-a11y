import type { StateRef } from "./applicability.js";
import type { CheckStatus } from "./check.js";
import type { Finding, FindingReference, Report } from "./report.js";

const MARKS: Readonly<Record<CheckStatus, string>> = {
  fail: "✗ issue found",
  not_applicable: "– nothing to check",
  pass: "· no issue found",
};

const KIND_LABELS: Readonly<Record<FindingReference["kind"], string>> = {
  "en-reference": "Reference benchmark",
  "en-upcoming": "Upcoming (EN 301 549 V4.1.1)",
  wcag: "WCAG 2.1",
};

const codes = (states: readonly StateRef[]): string =>
  states.length === 0
    ? "none"
    : states.map((state) => state.code.toUpperCase()).join(" ");

const countLine = (finding: Finding): string =>
  finding.status === "not_applicable"
    ? ""
    : `  ${finding.failing} of ${finding.checked} failing`;

const findingLines = (finding: Finding, report: Report): string[] => [
  `  ${MARKS[finding.status]}: ${finding.title}  [${finding.id}]${countLine(finding)}`,
  ...finding.references.map(
    (reference) =>
      `      ${KIND_LABELS[reference.kind]}: ${reference.text}  (${reference.factId})`
  ),
  ...(finding.status === "fail"
    ? [
        `      What fails: ${finding.whatFails}`,
        ...finding.samples.map((sample) => `      · ${sample}`),
        `      Applies in (${report.applicability.applies.length}): ${codes(report.applicability.applies)}`,
        `      Unknown (${report.applicability.unknown.length}): ${codes(report.applicability.unknown)}`,
      ]
    : []),
];

const sourcedLine = (
  label: string,
  sourced: Report["reference"]["benchmark"]
): string[] =>
  sourced === null ? [] : [`${label}: ${sourced.text}  (${sourced.factId})`];

export const formatReport = (report: Report): string =>
  [
    `Page: ${report.finalUrl ?? report.requestedUrl}`,
    `Scanned: ${report.scannedAt}${report.httpStatus === null ? "" : `  HTTP ${report.httpStatus}`}`,
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
    ...(report.reference.requirements.length === 0
      ? []
      : [
          "What the EAA requires:",
          ...report.reference.requirements.map(
            (requirement) => `  ${requirement.text}  (${requirement.factId})`
          ),
        ]),
    ...sourcedLine("Reference benchmark", report.reference.benchmark),
    ...sourcedLine(
      "Official Journal citation of EN 301 549 under the EAA",
      report.reference.citation
    ),
    "",
    ...(report.findings.length === 0
      ? []
      : [
          `Checks run: ${report.findings.length}`,
          ...report.findings.flatMap((finding) =>
            findingLines(finding, report)
          ),
          "",
        ]),
    report.statement.factId === null
      ? report.statement.text
      : `${report.statement.text}  (${report.statement.factId})`,
    "",
    report.contact.text,
  ].join("\n");
