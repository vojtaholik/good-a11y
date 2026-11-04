import { VERIFIED_FACTS } from "@eaa-check/facts";
import type { VerifiedFact } from "@eaa-check/facts";

import { decidedOf, numbersOf } from "./decided.js";
import type { Decided } from "./decided.js";
import { shownObservations } from "./judged.js";
import type { Observation } from "./judged.js";
import { newerWcagLabel, sourced } from "./reference.js";
import type { Sourced } from "./reference.js";
import { issuesOf } from "./report-sections.js";
import type { Report } from "./report.js";
import { SC_COVERAGE } from "./sc-coverage.js";
import type { ScCoverageRow } from "./sc-coverage.js";
import type { SiteFinding } from "./site-checks.js";
import { ALWAYS_MET_CRITERION, alwaysMet } from "./verdict.js";

export type RequirementStatus =
  | "always_met"
  | "fails"
  | "judged"
  | "needs_person"
  | "no_failure"
  | "not_checked"
  | "nothing_to_check";

export const REQUIREMENT_STATUS_NAMES: Readonly<
  Record<RequirementStatus, string>
> = {
  always_met: "Always met by HTML",
  fails: "Fails",
  judged: "Judged by a model",
  needs_person: "Needs a person",
  no_failure: "No failure found",
  not_checked: "Not checked on this scan",
  nothing_to_check: "Nothing to check on this page",
};

export const REQUIREMENT_STATUS_ORDER: readonly RequirementStatus[] = [
  "fails",
  "no_failure",
  "judged",
  "nothing_to_check",
  "always_met",
  "not_checked",
  "needs_person",
];

export type RequirementGroup = "eaa" | "statement" | "wcag";

export interface RequirementRow {
  readonly citation: string;
  readonly compared: string | null;
  readonly example: Sourced | null;
  readonly group: RequirementGroup;
  readonly judged: string | null;
  readonly key: string;
  readonly newer: boolean;
  readonly note: string | null;
  readonly noteFact: Sourced | null;
  readonly requirement: Sourced;
  readonly status: RequirementStatus;
}

export const EXAMPLE_LABEL = "Example from Annex II (non-binding)";

export const JUDGED_PREFIX = "Judged by a model, not counted:";

const REQUIREMENT_USE = /(?:^|[\s,])eaa\.requirement\.(?<key>[\w-]+)/u;

const STATEMENT_USE = /(?:^|[\s,])eaa\.statement\.(?<point>\d+)/u;

const EXAMPLE_USE = /(?:^|[\s,])eaa\.example\.(?<key>[\w-]+)/gu;

const STATEMENT_POINTS = ["a", "b", "c"];

const ROMAN = /^(?<section>[IVX]+)-(?<point>[a-z])(?:-(?<sub>[ivx]+))?$/u;

export const citationOf = (key: string): string => {
  const groups = ROMAN.exec(key)?.groups;

  if (groups?.section === undefined || groups.point === undefined) {
    return key;
  }

  return `Annex I, Section ${groups.section} (${groups.point})${groups.sub === undefined ? "" : `(${groups.sub})`}`;
};

interface ScanResults {
  readonly site: readonly SiteFinding[];
  readonly decided: Decided;
  readonly failing: ReadonlySet<string>;
  readonly judged: readonly Observation[];
}

const resultsOf = (report: Report): ScanResults => ({
  decided: decidedOf(report),
  failing: new Set(
    issuesOf(report).flatMap((issue) => numbersOf(issue.references))
  ),
  judged:
    report.judged?.status === "ran"
      ? shownObservations(report.judged.observations)
      : [],
  site: report.site?.findings ?? [],
});

const deterministic = (
  row: ScCoverageRow,
  { decided, failing }: ScanResults
): RequirementStatus | null => {
  if (failing.has(row.number)) {
    return "fails";
  }

  return decided.decided.has(row.number) ? "no_failure" : null;
};

const fallback = (
  row: ScCoverageRow,
  { decided }: ScanResults
): RequirementStatus => {
  if (row.number === ALWAYS_MET_CRITERION && alwaysMet() !== null) {
    return "always_met";
  }

  if (decided.empty.has(row.number)) {
    return "nothing_to_check";
  }

  if (decided.undecided.has(row.number)) {
    return "needs_person";
  }

  return row.tests.length > 0 ? "not_checked" : "needs_person";
};

export const COMPARED_PREFIX = "Compared across pages, not yet counted:";

export const COMPARED_RESULTS: Readonly<Record<SiteFinding["status"], string>> =
  {
    fail: "differences found",
    not_applicable: "too little shared to compare",
    pass: "no difference found",
  };

const comparedLine = (
  number: string,
  site: readonly SiteFinding[]
): string | null => {
  const found = site.filter((finding) =>
    numbersOf(finding.references).includes(number)
  );

  return found.length === 0
    ? null
    : `${COMPARED_PREFIX} ${found.map((finding) => COMPARED_RESULTS[finding.status]).join("; ")}`;
};

const judgedLine = (observations: readonly Observation[]): string | null =>
  observations.length === 0
    ? null
    : `${JUDGED_PREFIX} ${observations
        .map(
          (observation) =>
            `${observation.title}: noted for ${observation.noted} of ${observation.asked}`
        )
        .join("; ")}`;

const wcagRow = (row: ScCoverageRow, results: ScanResults): RequirementRow => {
  const judged = results.judged.filter((observation) =>
    numbersOf(observation.relatesTo).includes(row.number)
  );

  const status =
    deterministic(row, results) ??
    (judged.length > 0 ? "judged" : fallback(row, results));

  return {
    citation: row.number,
    compared: comparedLine(row.number, results.site),
    example: null,
    group: "wcag",
    judged: judgedLine(judged),
    key: row.number,
    newer: row.newer,
    note: status === "always_met" ? null : row.note,
    noteFact: status === "always_met" ? alwaysMet() : null,
    requirement: row.criterion,
    status,
  };
};

const exampleOf = (
  key: string,
  facts: readonly VerifiedFact[]
): Sourced | null =>
  sourced(
    facts.find((fact) =>
      [...fact.usedBy.matchAll(EXAMPLE_USE)].some(
        (match) => match.groups?.key === key
      )
    )
  );

const eaaRow = (
  key: string,
  citation: string,
  fact: VerifiedFact,
  facts: readonly VerifiedFact[],
  group: RequirementGroup = "eaa"
): RequirementRow => ({
  citation,
  compared: null,
  example: exampleOf(key, facts),
  group,
  judged: null,
  key,
  newer: false,
  note: null,
  noteFact: null,
  requirement: { factId: fact.id, source: fact.source, text: fact.value },
  status: "needs_person",
});

export const eaaRowsFrom = (
  facts: readonly VerifiedFact[]
): readonly RequirementRow[] => {
  const requirements = facts.flatMap((fact) => {
    const key = REQUIREMENT_USE.exec(fact.usedBy)?.groups?.key;

    return key === undefined ? [] : [eaaRow(key, citationOf(key), fact, facts)];
  });

  const statement = facts.flatMap((fact) => {
    const point = STATEMENT_USE.exec(fact.usedBy)?.groups?.point;

    const letter = STATEMENT_POINTS[Number(point) - 1];

    return point === undefined || letter === undefined
      ? []
      : [
          eaaRow(
            `statement-${point}`,
            `Art. 13 and Annex V, point 1(${letter})`,
            fact,
            facts,
            "statement"
          ),
        ];
  });

  return [
    ...requirements.toSorted((left, right) =>
      left.key.localeCompare(right.key, "en")
    ),
    ...statement.toSorted((left, right) =>
      left.key.localeCompare(right.key, "en", { numeric: true })
    ),
  ];
};

export const EAA_ROWS: readonly RequirementRow[] = eaaRowsFrom(VERIFIED_FACTS);

const STATEMENT_BASIS_USE = /(?:^|[\s,])eaa\.statement-basis\./u;

export const statementBasisFrom = (
  facts: readonly VerifiedFact[]
): readonly Sourced[] =>
  facts
    .filter((fact) => STATEMENT_BASIS_USE.test(fact.usedBy))
    .toSorted((left, right) =>
      left.id.localeCompare(right.id, "en", { numeric: true })
    )
    .map((fact) => ({
      factId: fact.id,
      source: fact.source,
      text: fact.value,
    }));

export const STATEMENT_BASIS: readonly Sourced[] =
  statementBasisFrom(VERIFIED_FACTS);

export const requirementsFrom = (
  report: Report,
  coverage: readonly ScCoverageRow[],
  eaa: readonly RequirementRow[]
): readonly RequirementRow[] => {
  const results = resultsOf(report);

  return [...coverage.map((row) => wcagRow(row, results)), ...eaa];
};

export const requirementsOf = (report: Report): readonly RequirementRow[] =>
  requirementsFrom(report, SC_COVERAGE, EAA_ROWS);

export const statusCounts = (
  rows: readonly RequirementRow[]
): Readonly<Record<RequirementStatus, number>> => {
  const count = (status: RequirementStatus) =>
    rows.filter((row) => row.status === status).length;

  return {
    always_met: count("always_met"),
    fails: count("fails"),
    judged: count("judged"),
    needs_person: count("needs_person"),
    no_failure: count("no_failure"),
    not_checked: count("not_checked"),
    nothing_to_check: count("nothing_to_check"),
  };
};

export interface RequirementGroupView {
  readonly basis: readonly Sourced[];
  readonly key: string;
  readonly rows: readonly RequirementRow[];
  readonly title: string;
}

export const checklistGroups = (
  rows: readonly RequirementRow[]
): readonly RequirementGroupView[] =>
  [
    {
      basis: [],
      key: "wcag21",
      rows: rows.filter((row) => row.group === "wcag" && !row.newer),
      title: "WCAG 2.1 Level A and AA success criteria",
    },
    {
      basis: [],
      key: "wcag22",
      rows: rows.filter((row) => row.group === "wcag" && row.newer),
      title: newerWcagLabel(),
    },
    {
      basis: [],
      key: "annex-1",
      rows: rows.filter((row) => row.group === "eaa"),
      title: "EAA service requirements (Annex I)",
    },
    {
      basis: STATEMENT_BASIS,
      key: "statement",
      rows: rows.filter((row) => row.group === "statement"),
      title: "EAA accessibility information (Art. 13 and Annex V)",
    },
  ].filter((group) => group.rows.length > 0);

const lowerFirst = (text: string): string =>
  `${text.slice(0, 1).toLowerCase()}${text.slice(1)}`;

export const tallyText = (rows: readonly RequirementRow[]): string => {
  const counts = statusCounts(rows);

  return REQUIREMENT_STATUS_ORDER.flatMap((status) =>
    counts[status] === 0
      ? []
      : [`${counts[status]} ${lowerFirst(REQUIREMENT_STATUS_NAMES[status])}`]
  ).join(", ");
};
