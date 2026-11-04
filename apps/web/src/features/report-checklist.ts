import {
  EXAMPLE_LABEL,
  REQUIREMENT_STATUS_NAMES,
  newerWcagLabel,
  requirementsOf,
  statusCounts,
} from "@eaa-check/core/contracts";
import type {
  Report,
  RequirementRow,
  RequirementStatus,
} from "@eaa-check/core/contracts";
import * as stylex from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../client/model.js";
import { report as styles } from "./report-styles.js";
import { checksRouter } from "./route.js";
import { sx } from "./sx.js";

const MUTED = "oklch(0.47 0.02 265)";

const LINE = "oklch(0.9 0.012 265)";

const ISSUE = "oklch(0.5 0.18 28)";

const JUDGED = "oklch(0.48 0.1 75)";

const INK = "oklch(0.24 0.03 265)";

const local = stylex.create({
  example: {
    color: MUTED,
    fontSize: "0.8125rem",
    margin: 0,
  },
  row: {
    borderBlockStartColor: LINE,
    borderBlockStartStyle: "solid",
    borderBlockStartWidth: "1px",
    display: "grid",
    gap: "0.25rem 1rem",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 11rem), auto))",
    paddingBlock: "0.625rem",
  },
  rowBody: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    minInlineSize: 0,
  },
  rows: {
    listStyle: "none",
    margin: 0,
    marginBlockStart: "0.5rem",
    padding: 0,
  },
  status: {
    fontSize: "0.875rem",
    fontWeight: 600,
    margin: 0,
  },
  tally: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.25rem 1rem",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
});

const tone = stylex.create({
  fails: { color: ISSUE },
  judged: { color: JUDGED },
  needs_person: { color: INK },
  no_failure: { color: MUTED },
  not_checked: { color: MUTED },
});

const STATUS_ORDER: readonly RequirementStatus[] = [
  "fails",
  "judged",
  "no_failure",
  "not_checked",
  "needs_person",
];

const rowView = (row: RequirementRow, h: HtmlBuilder<AppMessage>): Html =>
  h.keyed("li")(
    row.key,
    [sx(h, local.row)],
    [
      h.p(
        [sx(h, local.status, tone[row.status])],
        [REQUIREMENT_STATUS_NAMES[row.status]]
      ),
      h.div(
        [sx(h, local.rowBody)],
        [
          h.a(
            [h.Href(row.requirement.source), sx(h, styles.link)],
            [
              row.group === "eaa"
                ? `${row.citation}: ${row.requirement.text}`
                : row.requirement.text,
            ]
          ),
          ...(row.example === null
            ? []
            : [
                h.p(
                  [sx(h, local.example)],
                  [`${EXAMPLE_LABEL}: ${row.example.text}`]
                ),
              ]),
          ...(row.status === "needs_person" && row.note !== null
            ? [h.p([sx(h, local.example)], [row.note])]
            : []),
        ]
      ),
    ]
  );

const tallyText = (rows: readonly RequirementRow[]): string => {
  const counts = statusCounts(rows);

  return STATUS_ORDER.flatMap((status) =>
    counts[status] === 0
      ? []
      : [`${counts[status]} ${REQUIREMENT_STATUS_NAMES[status].toLowerCase()}`]
  ).join(", ");
};

const groupView = (
  title: string,
  rows: readonly RequirementRow[],
  h: HtmlBuilder<AppMessage>
): Html[] =>
  rows.length === 0
    ? []
    : [
        h.details(
          [sx(h, styles.disclosure)],
          [
            h.summary(
              [sx(h, styles.summary)],
              [`${title} (${rows.length}): ${tallyText(rows)}`]
            ),
            h.ul(
              [sx(h, local.rows)],
              rows.map((row) => rowView(row, h))
            ),
          ]
        ),
      ];

export const checklistSection = (
  report: Report,
  h: HtmlBuilder<AppMessage>
): Html => {
  const rows = requirementsOf(report);

  const counts = statusCounts(rows);

  return h.section(
    [sx(h, styles.section), h.AriaLabelledBy("checklist")],
    [
      h.h2(
        [h.Id("checklist"), sx(h, styles.sectionTitle)],
        ["Requirement checklist for this scan"]
      ),
      h.p(
        [sx(h, styles.text)],
        [
          "Every WCAG criterion and EAA requirement, and what this scan could say about it. Only a failure is certain; everything else still needs a person. ",
          h.a([h.Href(checksRouter()), sx(h, styles.link)], ["What we check"]),
        ]
      ),
      h.ul(
        [sx(h, local.tally), h.AriaLabel("Requirements by status")],
        STATUS_ORDER.flatMap((status) =>
          counts[status] === 0
            ? []
            : [
                h.li(
                  [sx(h, local.status, tone[status])],
                  [`${REQUIREMENT_STATUS_NAMES[status]}: ${counts[status]}`]
                ),
              ]
        )
      ),
      ...groupView(
        "WCAG 2.1 Level A and AA",
        rows.filter((row) => row.group === "wcag" && !row.newer),
        h
      ),
      ...groupView(
        newerWcagLabel(),
        rows.filter((row) => row.group === "wcag" && row.newer),
        h
      ),
      ...groupView(
        "European Accessibility Act",
        rows.filter((row) => row.group === "eaa"),
        h
      ),
    ]
  );
};
