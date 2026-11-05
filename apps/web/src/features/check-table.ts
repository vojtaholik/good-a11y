import { SC_COVERAGE, scCoverageCounts } from "@good-a11y/core/contracts";
import type { ScCoverageRow, TestMethod } from "@good-a11y/core/contracts";

import { GUIDE_PAGES } from "./guides.js";
import type { GuidePage } from "./guides.js";

export interface CheckTableRow {
  readonly coverage: ScCoverageRow;
  readonly guides: readonly GuidePage[];
  readonly local: readonly string[];
}

const CRITERION_NUMBER = /^STD-SC(?:22)?-(?<number>\d+\.\d+\.\d+)$/u;

const numberOf = (factId: string): string | undefined =>
  CRITERION_NUMBER.exec(factId)?.groups?.number;

export const guidesFor = (number: string): readonly GuidePage[] =>
  GUIDE_PAGES.filter((guide) =>
    guide.criteria.some((factId) => numberOf(factId) === number)
  );

const uses = (row: ScCoverageRow, methods: readonly TestMethod[]): boolean =>
  row.tests.some((test) => methods.includes(test.method));

export const LOCAL_PAGE_CHECKS =
  "The same page checks, on localhost and on pages behind a login";

export const LOCAL_QUESTIONS = "Your agent answers the same model question";

export const LOCAL_FLOWS =
  "With --flow, the grader of each guide in the next column, on the feature your agent describes";

const localOf = (
  row: ScCoverageRow,
  guides: readonly GuidePage[]
): readonly string[] => [
  ...(uses(row, ["served_html", "rendered_page"]) ? [LOCAL_PAGE_CHECKS] : []),
  ...(uses(row, ["model"]) ? [LOCAL_QUESTIONS] : []),
  ...(guides.length > 0 ? [LOCAL_FLOWS] : []),
];

export const checkTableRow = (coverage: ScCoverageRow): CheckTableRow => {
  const guides = guidesFor(coverage.number);

  return { coverage, guides, local: localOf(coverage, guides) };
};

export const CHECK_TABLE: readonly CheckTableRow[] =
  SC_COVERAGE.map(checkTableRow);

interface ColumnCounts {
  readonly criteria: number;
  readonly guideOnly: number;
  readonly guided: number;
  readonly local: number;
  readonly none: number;
  readonly online: number;
}

const columnCounts = (rows: readonly CheckTableRow[]): ColumnCounts => ({
  criteria: rows.length,
  guideOnly: rows.filter(
    ({ coverage, guides }) => guides.length > 0 && coverage.tests.length === 0
  ).length,
  guided: rows.filter(({ guides }) => guides.length > 0).length,
  local: rows.filter(({ local }) => local.length > 0).length,
  none: rows.filter(
    ({ coverage, guides, local }) =>
      coverage.tests.length === 0 && local.length === 0 && guides.length === 0
  ).length,
  online: rows.filter(({ coverage }) => coverage.tests.length > 0).length,
});

export interface CheckTableSummary {
  readonly columns: readonly string[];
  readonly lead: string;
  readonly newer: string;
  readonly statement: string;
}

export const checkTableSummary = (
  rows: readonly CheckTableRow[]
): CheckTableSummary => {
  const { current: methods } = scCoverageCounts(
    rows.map(({ coverage }) => coverage)
  );

  const current = columnCounts(rows.filter(({ coverage }) => !coverage.newer));
  const newer = columnCounts(rows.filter(({ coverage }) => coverage.newer));

  return {
    columns: [
      `Online check: ${current.online} have at least one automated check, ${methods.byMethod.served_html} on the served HTML, ${methods.byMethod.rendered_page} on the rendered page, ${methods.byMethod.site} by comparing several pages of the site and ${methods.byMethod.model} asked of a model.`,
      `Local check: ${current.local} can be checked by your agent on its own machine, with the same page checks on localhost or with the grader of a guide.`,
      `Guide: ${current.guided} are covered by a guide, ${current.guideOnly} of them with no automated check.`,
      `${current.none} have none of the three, and a person reviews them.`,
    ],
    lead: `Of the ${current.criteria} WCAG 2.1 Level A and AA success criteria:`,
    newer: `WCAG 2.2 adds ${newer.criteria} criteria, newer than the reference benchmark: ${newer.online} have an online check, ${newer.local} a local check and ${newer.guided} a guide.`,
    statement:
      "A check covers only part of what its criterion asks, so a criterion with a check or a guide still needs a manual review. The rendered page is checked with axe-core and our own probes; a model's answers are shown apart and never counted as issues.",
  };
};
