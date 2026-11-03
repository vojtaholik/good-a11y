import { VERIFIED_FACTS } from "@eaa-check/facts";

import { AXE_RULES } from "./axe-rules.js";
import { CATALOGUE } from "./catalogue.js";
import { SHOWN_JUDGED_CHECKS } from "./judged.js";
import { PROBES } from "./probes.js";
import type { Sourced } from "./reference.js";
import { DROPPED_RULES } from "./rendered.js";

export type TestMethod = "served_html" | "rendered_page" | "model";

export const TEST_METHOD_NAMES: Readonly<Record<TestMethod, string>> = {
  model: "asked of a model (labelled, never counted as an issue)",
  rendered_page: "rendered page",
  served_html: "served HTML",
};

export interface TestedBy {
  readonly method: TestMethod;
  readonly titles: readonly string[];
}

export interface ScCoverageRow {
  readonly criterion: Sourced;
  readonly newer: boolean;
  readonly note: string | null;
  readonly number: string;
  readonly tests: readonly TestedBy[];
}

const MANUAL_NOTES = new Map<string, string>([
  ["1.2.1", "A person compares the audio or video with its alternative."],
  ["1.2.3", "A person watches the video and its description."],
  ["1.2.4", "A person watches the live captions."],
  ["1.2.5", "A person watches the video and its audio description."],
  [
    "1.3.2",
    "A person compares the reading order with the layout; layouts can reorder content and keep its meaning.",
  ],
  [
    "1.3.3",
    "A person reads instructions that may rely on shape, size or position.",
  ],
  ["1.3.4", "A person turns the screen; this is not checked yet."],
  ["1.4.5", "A person looks at each image for text that could be real text."],
  [
    "1.4.11",
    "A person checks borders and icons; shadows and gradients make automated results unreliable.",
  ],
  ["1.4.13", "A person hovers and focuses to see what appears."],
  ["2.1.4", "A person tries the single-key shortcuts."],
  ["2.3.1", "A person watches the page for flashing."],
  ["2.4.3", "A person compares the focus order with the reading order."],
  ["2.4.5", "Needs the whole site, not one page."],
  [
    "2.4.6",
    "A model question exists, but it stays hidden until it is accurate on real pages. A person reads the headings and labels.",
  ],
  ["2.5.1", "A person tries the gestures."],
  ["2.5.2", "A person tries pressing and releasing."],
  [
    "2.5.3",
    "The automated rule was wrong too often on real pages, so it is left out. A person compares visible labels with names.",
  ],
  ["2.5.4", "A person tries the motion controls."],
  ["2.5.7", "A person tries the dragging."],
  [
    "3.2.2",
    "Changing controls on someone else's site could set off real actions, so a person checks it.",
  ],
  ["3.2.3", "Needs several pages of the site."],
  ["3.2.4", "Needs several pages of the site."],
  ["3.2.6", "Needs several pages of the site."],
  ["3.3.1", "Needs a form to be sent, which the checker never does."],
  ["3.3.3", "Needs a form to be sent, which the checker never does."],
  ["3.3.4", "Needs a real transaction, which the checker never makes."],
  ["3.3.7", "Needs a process of several steps."],
  ["3.3.8", "Needs a login, which the checker never uses."],
  ["4.1.1", "Obsolete: WCAG 2.2 removes it."],
  ["4.1.3", "A person sets off the status messages and listens for them."],
]);

export const NO_CHECK_NOTE = "No automated check. A person reviews it.";

const WCAG21 = /^STD-SC-(?<number>\d+\.\d+\.\d+)$/u;

const WCAG22 = /^STD-SC22-(?<number>\d+\.\d+\.\d+)$/u;

const byNumber = (left: string, right: string): number =>
  left.localeCompare(right, "en", { numeric: true });

const titlesFor = (number: string): readonly TestedBy[] => {
  const tests: readonly TestedBy[] = [
    {
      method: "served_html",
      titles: CATALOGUE.flatMap(({ check, criteria }) =>
        criteria.includes(number) ? [check.title] : []
      ),
    },
    {
      method: "rendered_page",
      titles: [
        ...[...AXE_RULES].flatMap(([rule, { criteria, title }]) =>
          !DROPPED_RULES.has(rule) && criteria.includes(number) ? [title] : []
        ),
        ...Object.values(PROBES).flatMap(({ criterion, title }) =>
          criterion === number ? [title] : []
        ),
      ],
    },
    {
      method: "model",
      titles: SHOWN_JUDGED_CHECKS.flatMap(({ criteria, title }) =>
        criteria.includes(number) ? [title] : []
      ),
    },
  ];

  return tests.filter(({ titles }) => titles.length > 0);
};

const rowOf = (
  number: string,
  criterion: Sourced,
  newer: boolean
): ScCoverageRow => {
  const tests = titlesFor(number);

  return {
    criterion,
    newer,
    note: tests.length > 0 ? null : (MANUAL_NOTES.get(number) ?? NO_CHECK_NOTE),
    number,
    tests,
  };
};

const sourcedOf = (fact: (typeof VERIFIED_FACTS)[number]): Sourced => ({
  factId: fact.id,
  source: fact.source,
  text: fact.value,
});

export const scCoverageFrom = (
  facts: typeof VERIFIED_FACTS
): readonly ScCoverageRow[] => {
  const wcag21 = facts.flatMap((fact) => {
    const number = WCAG21.exec(fact.id)?.groups?.number;

    return number === undefined ? [] : [rowOf(number, sourcedOf(fact), false)];
  });

  const known = new Set(wcag21.map(({ number }) => number));

  const added = facts.flatMap((fact) => {
    const number = WCAG22.exec(fact.id)?.groups?.number;

    return number === undefined || known.has(number)
      ? []
      : [rowOf(number, sourcedOf(fact), true)];
  });

  return [...wcag21, ...added].toSorted((left, right) =>
    byNumber(left.number, right.number)
  );
};

export const SC_COVERAGE: readonly ScCoverageRow[] =
  scCoverageFrom(VERIFIED_FACTS);

export interface ScCoverageCounts {
  readonly byMethod: Readonly<Record<TestMethod, number>>;
  readonly criteria: number;
  readonly tested: number;
  readonly untested: number;
}

const countsOf = (rows: readonly ScCoverageRow[]): ScCoverageCounts => {
  const using = (method: TestMethod) =>
    rows.filter(({ tests }) => tests.some((test) => test.method === method))
      .length;

  const tested = rows.filter(({ tests }) => tests.length > 0).length;

  return {
    byMethod: {
      model: using("model"),
      rendered_page: using("rendered_page"),
      served_html: using("served_html"),
    },
    criteria: rows.length,
    tested,
    untested: rows.length - tested,
  };
};

export interface ScCoverageTotals {
  readonly current: ScCoverageCounts;
  readonly newer: ScCoverageCounts;
}

export const scCoverageCounts = (
  rows: readonly ScCoverageRow[]
): ScCoverageTotals => ({
  current: countsOf(rows.filter(({ newer }) => !newer)),
  newer: countsOf(rows.filter(({ newer }) => newer)),
});

export const scCoverageSummary = (
  rows: readonly ScCoverageRow[]
): readonly string[] => {
  const { current, newer } = scCoverageCounts(rows);

  return [
    `Of the ${current.criteria} WCAG 2.1 Level A and AA success criteria, ${current.tested} have at least one automated check: ${current.byMethod.served_html} on the served HTML, ${current.byMethod.rendered_page} on the rendered page and ${current.byMethod.model} asked of a model. ${current.untested} have none, and a person reviews them.`,
    `WCAG 2.2 adds ${newer.criteria} criteria, newer than the reference benchmark: ${newer.byMethod.rendered_page} have a check on the rendered page, ${newer.untested} have none.`,
    "A check covers only part of what its criterion asks, so a criterion with a check still needs a manual review. The rendered page is checked with axe-core and our own probes; a model's answers are shown apart and never counted as issues.",
  ];
};
