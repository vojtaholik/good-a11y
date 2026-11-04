import { ROLE_NAMES, siteSummary } from "@eaa-check/core/contracts";
import type { Report, SitePageResult } from "@eaa-check/core/contracts";
import * as stylex from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../client/model.js";
import { report as styles } from "./report-styles.js";
import { sx } from "./sx.js";

const LINE = "oklch(0.9 0.012 265)";

const local = stylex.create({
  page: {
    borderBlockStartColor: LINE,
    borderBlockStartStyle: "solid",
    borderBlockStartWidth: "1px",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    paddingBlock: "0.625rem",
  },
  pages: {
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  url: {
    overflowWrap: "anywhere",
  },
});

const resultText = (page: SitePageResult): string => {
  if (page.outcome === "failed") {
    return `Not read: ${page.detail ?? "the page could not be read."}`;
  }

  return page.failing.length === 0
    ? "No issue found by the static checks."
    : `Static checks found issues: ${page.failing.join("; ")}.`;
};

const pageView = (page: SitePageResult, h: HtmlBuilder<AppMessage>): Html =>
  h.keyed("li")(
    `${page.role}:${page.url}`,
    [sx(h, local.page)],
    [
      h.h3([sx(h, styles.cardTitle)], [ROLE_NAMES[page.role]]),
      h.a([h.Href(page.url), sx(h, styles.link, local.url)], [page.url]),
      h.p([sx(h, styles.meta)], [resultText(page)]),
    ]
  );

export const siteSection = (
  report: Report,
  h: HtmlBuilder<AppMessage>
): Html[] =>
  report.site === null || report.site.pages.length === 0
    ? []
    : [
        h.section(
          [sx(h, styles.section), h.AriaLabelledBy("site")],
          [
            h.h2(
              [h.Id("site"), sx(h, styles.sectionTitle)],
              ["Other pages of the site"]
            ),
            h.p([sx(h, styles.text)], [siteSummary(report.site)]),
            h.p(
              [sx(h, styles.meta)],
              [
                "Issues on these pages alone do not change the result for the page entered.",
              ]
            ),
            h.ul(
              [sx(h, local.pages)],
              report.site.pages.map((page) => pageView(page, h))
            ),
          ]
        ),
      ];
