import * as stylex from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../client/message.js";
import { Blocks } from "./info-pages.js";
import type { InfoBlock, InfoPage, InfoSection } from "./info-pages.js";
import { MAIN_ID } from "./landmarks.js";
import { item as outlineItem, plainPage } from "./outline.js";
import type { PageLayout } from "./outline.js";
import { sx } from "./sx.js";
import { colors, layout, radius } from "./tokens.stylex.js";

const info = stylex.create({
  cell: {
    borderBlockStartColor: colors["--line"],
    borderBlockStartStyle: "solid",
    borderBlockStartWidth: "1px",
    paddingBlock: "12px",
    paddingInline: "16px",
    textAlign: "start",
    verticalAlign: "top",
  },
  column: {
    display: "flex",
    flexDirection: "column",
    gap: "40px",
    maxInlineSize: "800px",
  },
  head: {
    backgroundColor: colors["--sunken"],
    fontWeight: 800,
    paddingBlock: "12px",
    paddingInline: "16px",
    textAlign: "start",
  },
  heading: {
    fontSize: "clamp(1.375rem, 0.5cqi + 1.2rem, 1.75rem)",
    fontWeight: 800,
    lineHeight: 1.2,
    margin: 0,
  },
  intro: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  lead: {
    color: colors["--ink-muted"],
    fontSize: "clamp(1.125rem, 0.4cqi + 1rem, 1.3125rem)",
    lineHeight: 1.55,
    margin: 0,
  },
  link: {
    color: colors["--accent"],
    textUnderlineOffset: "3px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    margin: 0,
    paddingInlineStart: "1.25rem",
  },
  main: {
    boxSizing: "content-box",
    marginInline: "auto",
    maxInlineSize: layout["--page"],
    paddingBlock: "0 clamp(48px, 6cqi, 88px)",
  },
  rowHead: {
    fontWeight: 600,
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  table: {
    backgroundColor: colors["--surface"],
    borderCollapse: "collapse",
    fontSize: "0.9375rem",
    inlineSize: "100%",
  },
  tableWrap: {
    borderColor: colors["--line"],
    borderRadius: radius["--radius-md"],
    borderStyle: "solid",
    borderWidth: "1px",
    overflowX: "auto",
  },
  text: {
    lineHeight: 1.7,
    margin: 0,
  },
  title: {
    fontSize: "clamp(2.25rem, 2.8cqi + 1.375rem, 3.75rem)",
    fontWeight: 800,
    letterSpacing: "-0.025em",
    lineHeight: 1.05,
    margin: 0,
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

const blockView = (block: InfoBlock, h: HtmlBuilder<AppMessage>): Html =>
  Blocks.$match(block, {
    Link: ({ before, href, label }) =>
      h.p(
        [sx(h, info.text)],
        [before, " ", h.a([h.Href(href), sx(h, info.link)], [label]), "."]
      ),
    List: ({ items }) =>
      h.ul(
        [sx(h, info.list)],
        items.map((item) => h.li([sx(h, info.text)], [item]))
      ),
    Table: ({ caption, head, rows }) =>
      h.div(
        [
          h.Role("region"),
          h.AriaLabel(caption),
          h.Tabindex(0),
          sx(h, info.tableWrap),
        ],
        [
          h.table(
            [sx(h, info.table)],
            [
              h.caption([sx(h, info.visuallyHidden)], [caption]),
              h.thead(
                [],
                [
                  h.tr(
                    [],
                    head.map((label) =>
                      h.th(
                        [h.Attribute("scope", "col"), sx(h, info.head)],
                        [label]
                      )
                    )
                  ),
                ]
              ),
              h.tbody(
                [],
                rows.map(([first = "", ...rest]) =>
                  h.tr(
                    [],
                    [
                      h.th(
                        [
                          h.Attribute("scope", "row"),
                          sx(h, info.cell, info.rowHead),
                        ],
                        [first]
                      ),
                      ...rest.map((cell) => h.td([sx(h, info.cell)], [cell])),
                    ]
                  )
                )
              ),
            ]
          ),
        ]
      ),
    Text: ({ text }) => h.p([sx(h, info.text)], [text]),
  });

const sectionView = (section: InfoSection, h: HtmlBuilder<AppMessage>): Html =>
  h.section(
    [h.AriaLabelledBy(section.id), sx(h, info.section)],
    [
      h.h2([h.Id(section.id), sx(h, info.heading)], [section.heading]),
      ...section.blocks.map((block) => blockView(block, h)),
    ]
  );

const infoMain = (page: InfoPage, h: HtmlBuilder<AppMessage>): Html =>
  h.main(
    [h.Id(MAIN_ID), sx(h, info.main)],
    [
      h.div(
        [sx(h, info.column)],
        [
          h.div(
            [sx(h, info.intro)],
            [
              h.h1([sx(h, info.title)], [page.title]),
              h.p([sx(h, info.lead)], [page.lead]),
            ]
          ),
          ...page.sections.map((section) => sectionView(section, h)),
        ]
      ),
    ]
  );

export const infoView = (
  page: InfoPage,
  h: HtmlBuilder<AppMessage>
): PageLayout =>
  plainPage(
    infoMain(page, h),
    page.sections.map((section) => outlineItem(section.id, section.heading))
  );
