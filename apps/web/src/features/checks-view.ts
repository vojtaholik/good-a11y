import { TEST_METHOD_NAMES, newerWcagLabel } from "@good-a11y/core/contracts";
import type { ScCoverageRow } from "@good-a11y/core/contracts";
import * as stylex from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../client/message.js";
import { CHECK_TABLE, checkTableSummary } from "./check-table.js";
import type { CheckTableRow } from "./check-table.js";
import { guideRouter } from "./route.js";
import { sx } from "./sx.js";
import { colors, radius } from "./tokens.stylex.js";

const TABLE_CAPTION_ID = "what-we-check-table";

const styles = stylex.create({
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
  column: {
    minInlineSize: "12rem",
  },
  criterion: {
    fontWeight: 400,
    inlineSize: "28%",
    minInlineSize: "12rem",
  },
  guideLink: {
    display: "inline-block",
    minBlockSize: "24px",
    paddingBlock: "2px",
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
    ? [h.p([sx(h, styles.none)], [`Not automated. ${row.note ?? ""}`.trim()])]
    : row.tests.flatMap(({ method, titles }) => [
        h.p([sx(h, styles.method)], [TEST_METHOD_NAMES[method]]),
        h.ul(
          [sx(h, styles.list, styles.titles)],
          titles.map((title) => h.li([], [title]))
        ),
      ]);

const localView = (
  { local }: CheckTableRow,
  h: HtmlBuilder<AppMessage>
): Html[] =>
  local.length === 0
    ? [h.p([sx(h, styles.none)], ["Nothing more than online."])]
    : [
        h.ul(
          [sx(h, styles.list, styles.titles)],
          local.map((line) => h.li([], [line]))
        ),
      ];

const guidesView = (
  { guides }: CheckTableRow,
  h: HtmlBuilder<AppMessage>
): Html[] =>
  guides.length === 0
    ? [h.p([sx(h, styles.none)], ["No guide yet."])]
    : [
        h.ul(
          [sx(h, styles.list, styles.titles)],
          guides.map((guide) =>
            h.keyed("li")(
              guide.id,
              [],
              [
                h.a(
                  [
                    h.Href(guideRouter({ guideId: guide.id })),
                    sx(h, styles.guideLink),
                  ],
                  [guide.name]
                ),
              ]
            )
          )
        ),
      ];

const rowView = (row: CheckTableRow, h: HtmlBuilder<AppMessage>): Html =>
  h.tr(
    [],
    [
      h.th(
        [h.Attribute("scope", "row"), sx(h, styles.cell, styles.criterion)],
        [
          h.a(
            [h.Href(row.coverage.criterion.source)],
            [row.coverage.criterion.text]
          ),
          ...(row.coverage.newer
            ? [h.span([sx(h, styles.newer)], [newerWcagLabel()])]
            : []),
        ]
      ),
      h.td([sx(h, styles.cell, styles.column)], testsView(row.coverage, h)),
      h.td([sx(h, styles.cell, styles.column)], localView(row, h)),
      h.td([sx(h, styles.cell, styles.column)], guidesView(row, h)),
    ]
  );

const headOf = (label: string, h: HtmlBuilder<AppMessage>): Html =>
  h.th([h.Attribute("scope", "col"), sx(h, styles.head)], [label]);

const summaryView = (h: HtmlBuilder<AppMessage>): Html[] => {
  const { columns, lead, newer, statement } = checkTableSummary(CHECK_TABLE);

  return [
    h.p([sx(h, styles.summary)], [lead]),
    h.ul(
      [sx(h, styles.summary, styles.list)],
      columns.map((line) => h.li([], [line]))
    ),
    h.p([sx(h, styles.summary)], [newer]),
    h.p([sx(h, styles.summary)], [statement]),
  ];
};

export const checksView = (h: HtmlBuilder<AppMessage>): Html =>
  h.section(
    [h.AriaLabelledBy("what-we-check"), sx(h, styles.section)],
    [
      h.div(
        [sx(h, styles.intro)],
        [
          h.h2(
            [h.Id("what-we-check"), sx(h, styles.heading)],
            ["What we check"]
          ),
          h.p(
            [sx(h, styles.note)],
            ["Anything not checked here needs a person to review it."]
          ),
        ]
      ),
      ...summaryView(h),
      h.div(
        [
          h.Role("region"),
          h.AriaLabelledBy(TABLE_CAPTION_ID),
          h.Tabindex(0),
          sx(h, styles.card),
        ],
        [
          h.table(
            [sx(h, styles.table)],
            [
              h.caption(
                [h.Id(TABLE_CAPTION_ID), sx(h, styles.visuallyHidden)],
                [
                  "Each success criterion: the online check, what the local check adds, and the guide that covers it",
                ]
              ),
              h.thead(
                [],
                [
                  h.tr(
                    [],
                    [
                      headOf("Success criterion", h),
                      headOf("Online check", h),
                      headOf("Local check (your agent)", h),
                      headOf("Guide", h),
                    ]
                  ),
                ]
              ),
              h.tbody(
                [],
                CHECK_TABLE.map((row) => rowView(row, h))
              ),
            ]
          ),
        ]
      ),
    ]
  );
