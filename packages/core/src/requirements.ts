import { VERIFIED_FACTS } from "@eaa-check/facts";
import type { VerifiedFact } from "@eaa-check/facts";

import { CATALOGUE } from "./catalogue.js";
import { shownObservations } from "./judged.js";
import type { Observation } from "./judged.js";
import { sourced } from "./reference.js";
import type { Sourced } from "./reference.js";
import { issuesOf } from "./report-sections.js";
import type { FindingReference, Report } from "./report.js";
import { SC_COVERAGE } from "./sc-coverage.js";
import type { ScCoverageRow } from "./sc-coverage.js";

export type RequirementStatus =
  | "fails"
  | "judged"
  | "needs_person"
  | "no_failure"
  | "not_checked";

export const REQUIREMENT_STATUS_NAMES: Readonly<
  Record<RequirementStatus, string>
> = {
  fails: "Fails",
  judged: "Judged by a model",
  needs_person: "Needs a person",
  no_failure: "No failure found",
  not_checked: "Not checked on this scan",
};

export type RequirementGroup = "eaa" | "wcag";

export interface RequirementRow {
  readonly citation: string;
  readonly example: Sourced | null;
  readonly group: RequirementGroup;
  readonly key: string;
  readonly newer: boolean;
  readonly note: string | null;
  readonly requirement: Sourced;
  readonly status: RequirementStatus;
}

export const EXAMPLE_LABEL = "Example from Annex II (non-binding)";

const REQUIREMENT_USE = /(?:^|[\s,])eaa\.requirement\.(?<key>[\w-]+)/u;

const STATEMENT_USE = /(?:^|[\s,])eaa\.statement\.(?<point>\d+)/u;

const EXAMPLE_USE = /(?:^|[\s,])eaa\.example\.(?<key>[\w-]+)/gu;

const SC_NUMBER = /^STD-SC(?:22)?-(?<number>\d+\.\d+\.\d+)$/u;

const STATEMENT_POINTS = ["a", "b", "c"];

const ROMAN = /^(?<section>[IVX]+)-(?<point>[a-z])(?:-(?<sub>[ivx]+))?$/u;

export const citationOf = (key: string): string => {
  const groups = ROMAN.exec(key)?.groups;

  if (groups?.section === undefined || groups.point === undefined) {
    return key;
  }

  return `Annex I, Section ${groups.section} (${groups.point})${groups.sub === undefined ? "" : `(${groups.sub})`}`;
};

const numbersOf = (references: readonly FindingReference[]): string[] =>
  references.flatMap((reference) => {
    const number = SC_NUMBER.exec(reference.factId)?.groups?.number;

    return number === undefined ? [] : [number];
  });

interface ScanResults {
  readonly failing: ReadonlySet<string>;
  readonly judged: readonly Observation[];
  readonly ran: ReadonlySet<string>;
}

const resultsOf = (report: Report): ScanResults => {
  const rendered = report.rendered?.status === "ran" ? report.rendered : null;

  return {
    failing: new Set(
      issuesOf(report).flatMap((issue) => numbersOf(issue.references))
    ),
    judged:
      report.judged?.status === "ran"
        ? shownObservations(report.judged.observations)
        : [],
    ran: new Set([
      ...(report.outcome === "checked"
        ? CATALOGUE.flatMap(({ criteria }) => criteria)
        : []),
      ...(rendered === null
        ? []
        : [
            ...rendered.criteria,
            ...rendered.probes.flatMap((probe) =>
              probe.status === "not_applicable" ? [] : [probe.criterion]
            ),
          ]),
    ]),
  };
};

const wcagStatus = (
  row: ScCoverageRow,
  results: ScanResults
): RequirementStatus => {
  const judged = results.judged.filter((observation) =>
    numbersOf(observation.relatesTo).includes(row.number)
  );

  if (results.failing.has(row.number)) {
    return "fails";
  }

  if (judged.some((observation) => observation.noted > 0)) {
    return "judged";
  }

  if (results.ran.has(row.number)) {
    return "no_failure";
  }

  if (judged.length > 0) {
    return "judged";
  }

  return row.tests.length > 0 ? "not_checked" : "needs_person";
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
  facts: readonly VerifiedFact[]
): RequirementRow => ({
  citation,
  example: exampleOf(key, facts),
  group: "eaa",
  key,
  newer: false,
  note: null,
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
            facts
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

export const requirementsFrom = (
  report: Report,
  coverage: readonly ScCoverageRow[],
  eaa: readonly RequirementRow[]
): readonly RequirementRow[] => {
  const results = resultsOf(report);

  return [
    ...coverage.map((row): RequirementRow => ({
      citation: row.number,
      example: null,
      group: "wcag",
      key: row.number,
      newer: row.newer,
      note: row.note,
      requirement: row.criterion,
      status: wcagStatus(row, results),
    })),
    ...eaa,
  ];
};

export const requirementsOf = (report: Report): readonly RequirementRow[] =>
  requirementsFrom(report, SC_COVERAGE, EAA_ROWS);

export const statusCounts = (
  rows: readonly RequirementRow[]
): Readonly<Record<RequirementStatus, number>> => {
  const count = (status: RequirementStatus) =>
    rows.filter((row) => row.status === status).length;

  return {
    fails: count("fails"),
    judged: count("judged"),
    needs_person: count("needs_person"),
    no_failure: count("no_failure"),
    not_checked: count("not_checked"),
  };
};
