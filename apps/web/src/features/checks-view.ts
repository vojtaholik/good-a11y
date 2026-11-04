import {
  SC_COVERAGE,
  TEST_METHOD_NAMES,
  newerWcagLabel,
  scCoverageSummary,
} from "@good-a11y/core/contracts";
import type { ScCoverageRow } from "@good-a11y/core/contracts";
import * as stylex from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../client/message.js";
import { sx } from "./sx.js";
import { colors, radius } from "./tokens.stylex.js";

const local = stylex.create({
  card: {
    backgroundColor: colors["--surface"],
    borderColor: colors["--line"],
    borderRadius: radius["--radius-lg"],
    borderStyle: "solid",
    borderWidth: "1px",
    overflowX: "auto",
  },
  cell: {
    borderBlockStartColor: colors["--line"],
    borderBlockStartStyle: "solid",
    borderBlockStartWidth: "1px",
    paddingBlock: "12px",
    paddingInline: "20px",
    textAlign: "start",
    verticalAlign: "top",
  },
  criterion: {
    fontWeight: 400,
    inlineSize: "40%",
  },
  head: {
    backgroundColor: colors["--sunken"],
    fontWeight: 800,
    paddingBlock: "12px",
    paddingInline: "20px",
    textAlign: "start",
  },
  heading: {
    fontSize: "clamp(1.75rem, 1cqi + 1.375rem, 2.25rem)",
    fontWeight: 800,
    lineHeight: 1.15,
    margin: 0,
  },
  intro: {
    alignItems: "baseline",
    display: "flex",
    flexWrap: "wrap",
    gap: "8px 24px",
    justifyContent: "space-between",
  },
  list: {
    margin: 0,
    paddingInlineStart: "1.25rem",
  },
  method: {
    fontWeight: 600,
    margin: 0,
  },
  newer: {
    color: colors["--ink-muted"],
    display: "block",
    fontSize: "0.8125rem",
  },
  none: {
    color: colors["--ink-muted"],
    margin: 0,
  },
  note: {
    color: colors["--ink-muted"],
    margin: 0,
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  summary: {
    margin: 0,
    maxInlineSize: "72ch",
  },
  table: {
    borderCollapse: "collapse",
    fontSize: "0.9375rem",
    inlineSize: "100%",
  },
  titles: {
    fontSize: "0.875rem",
    marginBlock: "0 0.5rem",
  },
  visuallyHidden: {
    blockSize: "1px",
    clipPath: "inset(50%)",
    inlineSize: "1px",
    overflow: "clip",
    position: "absolute",
    whiteSpace: "nowrap",
  },
});

const testsView = (row: ScCoverageRow, h: HtmlBuilder<AppMessage>): Html[] =>
  row.tests.length === 0
    ? [h.p([sx(h, local.none)], [`Not automated. ${row.note ?? ""}`.trim()])]
    : row.tests.flatMap(({ method, titles }) => [
        h.p([sx(h, local.method)], [TEST_METHOD_NAMES[method]]),
        h.ul(
          [sx(h, local.list, local.titles)],
          titles.map((title) => h.li([], [title]))
        ),
      ]);

const rowView = (row: ScCoverageRow, h: HtmlBuilder<AppMessage>): Html =>
  h.tr(
    [],
    [
      h.th(
        [h.Attribute("scope", "row"), sx(h, local.cell, local.criterion)],
        [
          h.a([h.Href(row.criterion.source)], [row.criterion.text]),
          ...(row.newer
            ? [h.span([sx(h, local.newer)], [newerWcagLabel()])]
            : []),
        ]
      ),
      h.td([sx(h, local.cell)], testsView(row, h)),
    ]
  );

export const checksView = (h: HtmlBuilder<AppMessage>): Html =>
  h.section(
    [h.AriaLabelledBy("what-we-check"), sx(h, local.section)],
    [
      h.div(
        [sx(h, local.intro)],
        [
          h.h2(
            [h.Id("what-we-check"), sx(h, local.heading)],
            ["What we check"]
          ),
          h.p(
            [sx(h, local.note)],
            ["Anything not checked here needs a person to review it."]
          ),
        ]
      ),
      ...scCoverageSummary(SC_COVERAGE).map((line) =>
        h.p([sx(h, local.summary)], [line])
      ),
      h.div(
        [sx(h, local.card)],
        [
          h.table(
            [sx(h, local.table)],
            [
              h.caption(
                [sx(h, local.visuallyHidden)],
                ["Each success criterion, and how it is tested today"]
              ),
              h.thead(
                [],
                [
                  h.tr(
                    [],
                    [
                      h.th(
                        [h.Attribute("scope", "col"), sx(h, local.head)],
                        ["Success criterion"]
                      ),
                      h.th(
                        [h.Attribute("scope", "col"), sx(h, local.head)],
                        ["How we test it"]
                      ),
                    ]
                  ),
                ]
              ),
              h.tbody(
                [],
                SC_COVERAGE.map((row) => rowView(row, h))
              ),
            ]
          ),
        ]
      ),
    ]
  );
