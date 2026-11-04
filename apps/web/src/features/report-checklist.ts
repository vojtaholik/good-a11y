import {
  EXAMPLE_LABEL,
  REQUIREMENT_STATUS_NAMES,
  checklistGroups,
  requirementsOf,
  tallyText,
} from "@eaa-check/core/contracts";
import type {
  Report,
  RequirementGroupView,
  RequirementRow,
  Sourced,
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
  always_met: { color: MUTED },
  fails: { color: ISSUE },
  judged: { color: JUDGED },
  needs_person: { color: INK },
  no_failure: { color: MUTED },
  not_checked: { color: MUTED },
  nothing_to_check: { color: MUTED },
});

const secondary = (text: string, h: HtmlBuilder<AppMessage>): Html =>
  h.p([sx(h, local.example)], [text]);

const sourcedLine = (
  label: string,
  value: Sourced,
  h: HtmlBuilder<AppMessage>
): Html =>
  h.p(
    [sx(h, local.example)],
    [
      `${label}: `,
      h.a([h.Href(value.source), sx(h, styles.link)], [value.text]),
    ]
  );

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
              row.group === "wcag"
                ? row.requirement.text
                : `${row.citation}: ${row.requirement.text}`,
            ]
          ),
          ...(row.noteFact === null
            ? []
            : [sourcedLine("Why", row.noteFact, h)]),
          ...(row.example === null
            ? []
            : [secondary(`${EXAMPLE_LABEL}: ${row.example.text}`, h)]),
          ...(row.status === "needs_person" && row.note !== null
            ? [secondary(row.note, h)]
            : []),
          ...(row.judged === null ? [] : [secondary(row.judged, h)]),
        ]
      ),
    ]
  );

const groupView = (
  group: RequirementGroupView,
  h: HtmlBuilder<AppMessage>
): Html =>
  h.keyed("details")(
    group.key,
    [sx(h, styles.disclosure)],
    [
      h.summary(
        [sx(h, styles.summary)],
        [`${group.title} (${group.rows.length}): ${tallyText(group.rows)}`]
      ),
      ...group.basis.map((value) => sourcedLine("Basis", value, h)),
      h.ul(
        [sx(h, local.rows)],
        group.rows.map((row) => rowView(row, h))
      ),
    ]
  );

export const checklistSection = (
  report: Report,
  h: HtmlBuilder<AppMessage>
): Html =>
  h.section(
    [sx(h, styles.section), h.AriaLabelledBy("checklist")],
    [
      h.h2(
        [h.Id("checklist"), sx(h, styles.sectionTitle)],
        ["Requirement checklist for this scan"]
      ),
      h.p(
        [sx(h, styles.text)],
        [
          "Each WCAG 2.1 Level A and AA criterion, the WCAG 2.2 additions, and the EAA service requirements a website touches, with what this scan could say about each. Only a failure is certain; everything else still needs a person. ",
          h.a([h.Href(checksRouter()), sx(h, styles.link)], ["What we check"]),
        ]
      ),
      ...checklistGroups(requirementsOf(report)).map((group) =>
        groupView(group, h)
      ),
    ]
  );
