import {
  SC_COVERAGE,
  TEST_METHOD_NAMES,
  newerWcagLabel,
  scCoverageSummary,
} from "@good-a11y/core/contracts";
import type { ScCoverageRow } from "@good-a11y/core/contracts";
import * as stylex from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../client/model.js";
import { homeRouter } from "./route.js";
import { sx } from "./sx.js";

const MUTED = "#4a5160";

const RULE = "#d5d9e2";

const local = stylex.create({
  cell: {
    borderBlockStartColor: RULE,
    borderBlockStartStyle: "solid",
    borderBlockStartWidth: "1px",
    paddingBlock: "0.75rem",
    paddingInlineEnd: "0.75rem",
    textAlign: "start",
    verticalAlign: "top",
  },
  criterion: {
    inlineSize: "40%",
  },
  head: {
    color: MUTED,
    fontSize: "0.875rem",
    fontWeight: 600,
    paddingBlockEnd: "0.5rem",
    paddingInlineEnd: "0.75rem",
    textAlign: "start",
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
    color: MUTED,
    display: "block",
    fontSize: "0.75rem",
  },
  none: {
    color: MUTED,
    margin: 0,
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
  h.main(
    [],
    [
      h.h1([], ["What we check"]),
      ...scCoverageSummary(SC_COVERAGE).map((line) => h.p([], [line])),
      h.table(
        [sx(h, local.table)],
        [
          h.caption(
            [sx(h, local.head)],
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
      h.p([], [h.a([h.Href(homeRouter({}))], ["Check a page"])]),
    ]
  );
