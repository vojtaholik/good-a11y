import * as stylex from "@stylexjs/stylex";
import { Option } from "effect";
import type { Document, Html, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../client/message.js";
import type { AppModel } from "../client/model.js";
import { checksView } from "./checks-view.js";
import { commandBlock } from "./command-block.js";
import { guideView } from "./guide-view.js";
import { categoryName, guidePageOf, guidesByCategory } from "./guides.js";
import { MAIN_ID } from "./landmarks.js";
import { pageMetaOf } from "./page-meta.js";
import { reportView } from "./report-view.js";
import { AppRoute, guideRouter, homeRouter, pathOf } from "./route.js";
import { scanForm } from "./scan-form.js";
import { pageShell } from "./shell.js";
import { styles } from "./styles.js";
import { sx } from "./sx.js";
import { colors, size } from "./tokens.stylex.js";

export const CLI = "npx -y github:vojtaholik/good-a11y";

export const AGENT_COMMAND = `${CLI} search "modal dialog"`;

export const SKILL_PATH = "/skills/good-a11y/SKILL.md";

const local = stylex.create({
  agents: {
    backgroundColor: colors["--inverse"],
    borderRadius: "0.375rem",
    color: colors["--on-inverse"],
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    marginBlock: "1.5rem 0",
    paddingBlock: "0.75rem",
    paddingInline: "1rem",
  },
  category: {
    color: colors["--ink-muted"],
    fontSize: "0.875rem",
    fontWeight: 600,
    letterSpacing: "0.02em",
    marginBlock: "2rem 0.25rem",
    textTransform: "uppercase",
  },
  guide: {
    borderBlockStartColor: colors["--line"],
    borderBlockStartStyle: "solid",
    borderBlockStartWidth: "1px",
    paddingBlock: "0.75rem",
  },
  guideDescription: {
    color: colors["--ink-muted"],
    display: "block",
  },
  guideName: {
    fontSize: "1.125rem",
    fontWeight: 600,
  },
  guides: {
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  hero: {
    fontSize: size["--size-display"],
    lineHeight: 1.15,
    marginBlock: "0 0.75rem",
  },
});

const guideList = (h: HtmlBuilder<AppMessage>): Html[] =>
  guidesByCategory().flatMap(([category, pages]) => [
    h.h3([sx(h, local.category)], [categoryName(category)]),
    h.ul(
      [sx(h, local.guides)],
      pages.map((page) =>
        h.keyed("li")(
          page.id,
          [sx(h, local.guide)],
          [
            h.a(
              [
                h.Href(guideRouter({ guideId: page.id })),
                sx(h, local.guideName),
              ],
              [page.name]
            ),
            h.span([sx(h, local.guideDescription)], [page.description]),
          ]
        )
      )
    ),
  ]);

const homeView = (model: AppModel, h: HtmlBuilder<AppMessage>): Html =>
  h.main(
    [h.Id(MAIN_ID)],
    [
      h.h1([sx(h, local.hero)], ["Accessibility guides for coding agents"]),
      h.p(
        [],
        [
          "Each guide is what an agent needs to build one thing right: a dialog, a form, a menu. Each comes with a working demo. Check a page below: we read its HTML and open it in a browser, then list the issues worst first, each with its WCAG success criterion and the guide that fixes it.",
        ]
      ),
      scanForm(model, h),
      h.div(
        [sx(h, local.agents)],
        [
          h.strong([], ["For agents"]),
          commandBlock(model, AGENT_COMMAND, "inverse", h),
          h.span(
            [],
            [
              "Read ",
              h.a([h.Href(SKILL_PATH)], ["the skill"]),
              " for the search, retrieve, build and check loop.",
            ]
          ),
        ]
      ),
      h.section(
        [h.AriaLabelledBy("guides")],
        [h.h2([h.Id("guides")], ["Guides"]), ...guideList(h)]
      ),
    ]
  );

const checkView = (model: AppModel, h: HtmlBuilder<AppMessage>): Html =>
  h.main(
    [h.Id(MAIN_ID)],
    [
      h.h1([sx(h, local.hero)], ["Check a page"]),
      h.p(
        [],
        [
          "Paste the address of a web page. We read its HTML and open it in a browser, then list the issues the automated checks found, worst first, each with its WCAG success criterion, its EN 301 549 clause and the guide that fixes it. Automated checks find only part of the issues; a person reviews the rest. To check a page on your own machine, run:",
        ]
      ),
      commandBlock(model, `${CLI} check localhost:5173`, "light", h),
      scanForm(model, h),
      checksView(h),
    ]
  );

const notFoundView = (h: HtmlBuilder<AppMessage>): Html =>
  h.main(
    [h.Id(MAIN_ID)],
    [
      h.h1([], ["Page not found"]),
      h.p([], [h.a([h.Href(homeRouter())], ["Back to the start"])]),
    ]
  );

const routeView = (model: AppModel, h: HtmlBuilder<AppMessage>): Html =>
  AppRoute.match<Html>(model.route, {
    Check: () => checkView(model, h),
    Guide: ({ guideId }) =>
      Option.match(guidePageOf(guideId), {
        onNone: () => notFoundView(h),
        onSome: (page) => guideView(page, h),
      }),
    Home: () => homeView(model, h),
    NotFound: () => notFoundView(h),
    Report: ({ slug }) => reportView(model, slug, h),
    Scan: ({ slug }) => reportView(model, slug, h),
  });

export const view = (
  model: AppModel,
  h: HtmlBuilder<AppMessage>
): Document => ({
  body: pageShell(
    model.route,
    h.div([sx(h, styles.page)], [routeView(model, h)]),
    h
  ),
  canonical: `${model.origin}${pathOf(model.route)}`,
  lang: "en",
  title: pageMetaOf(model.route).title,
});
