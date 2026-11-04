import * as stylex from "@stylexjs/stylex";
import { Option } from "effect";
import type { Document, Html, HtmlBuilder } from "foldkit/html";

import { Message } from "../client/message.js";
import type { AppMessage } from "../client/message.js";
import { StartState } from "../client/model.js";
import type { AppModel } from "../client/model.js";
import { checksView } from "./checks-view.js";
import { guideView } from "./guide-view.js";
import { categoryName, guidePageOf, guidesByCategory } from "./guides.js";
import { MAIN_ID } from "./landmarks.js";
import { pageMetaOf } from "./page-meta.js";
import { reportView } from "./report-view.js";
import {
  AppRoute,
  checkRouter,
  guideRouter,
  homeRouter,
  pathOf,
} from "./route.js";
import { styles } from "./styles.js";
import { sx } from "./sx.js";

export const CLI = "npx -y github:vojtaholik/good-a11y";

export const SKILL_PATH = "/skills/good-a11y/SKILL.md";

const local = stylex.create({
  agents: {
    backgroundColor: "var(--code-bg)",
    borderRadius: "0.375rem",
    marginBlock: "1.5rem 0",
    paddingBlock: "0.75rem",
    paddingInline: "1rem",
  },
  brand: {
    color: "var(--ink)",
    fontWeight: 700,
    marginInlineEnd: "auto",
    textDecoration: "none",
  },
  category: {
    color: "var(--muted)",
    fontSize: "0.875rem",
    fontWeight: 600,
    letterSpacing: "0.02em",
    marginBlock: "2rem 0.25rem",
    textTransform: "uppercase",
  },
  command: {
    display: "block",
    marginBlockStart: "0.25rem",
    overflowWrap: "anywhere",
  },
  guide: {
    borderBlockStartColor: "var(--rule)",
    borderBlockStartStyle: "solid",
    borderBlockStartWidth: "1px",
    paddingBlock: "0.75rem",
  },
  guideDescription: {
    color: "var(--muted)",
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
    fontSize: "var(--text-hero)",
    lineHeight: 1.15,
    marginBlock: "0 0.75rem",
  },
  nav: {
    alignItems: "baseline",
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem 1.25rem",
    marginBlockEnd: "2.5rem",
  },
  skip: {
    backgroundColor: "var(--code-bg)",
    borderRadius: "0.375rem",
    insetBlockStart: "0.5rem",
    insetInlineStart: "0.5rem",
    paddingBlock: "0.5rem",
    paddingInline: "0.75rem",
    position: "absolute",
    transform: { ":focus": "none", default: "translateY(-200%)" },
  },
});

const startStatus = (model: AppModel): string =>
  StartState.match<string>(model.start, {
    Idle: () => "",
    Refused: ({ message }) => message,
    Submitting: () => "Starting the scan…",
    Unavailable: () =>
      "The scan could not start because the server did not answer. Your address is still in the form; try again.",
  });

const isSubmitting = (model: AppModel): boolean =>
  StartState.matchOrElse<boolean>(
    model.start,
    { Submitting: () => true },
    () => false
  );

const scanForm = (model: AppModel, h: HtmlBuilder<AppMessage>): Html[] => [
  h.form(
    [h.OnSubmit(Message.SubmittedScanForm())],
    [
      h.label([h.For("scan-url")], ["Page address"]),
      h.input([
        h.Id("scan-url"),
        h.Name("url"),
        h.Type("text"),
        h.Autocomplete("url"),
        h.Placeholder("example.com"),
        h.Value(model.url),
        h.AriaDescribedBy("scan-status"),
        h.OnInput((value) => Message.UpdatedScanUrl({ value })),
        sx(h, styles.input),
      ]),
      h.button(
        [
          h.Type("submit"),
          h.Disabled(isSubmitting(model)),
          sx(h, styles.button),
        ],
        ["Check the page"]
      ),
    ]
  ),
  h.p([h.Id("scan-status"), h.Role("status")], [startStatus(model)]),
];

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
      ...scanForm(model, h),
      h.div(
        [sx(h, local.agents)],
        [
          h.strong([], ["For agents"]),
          h.code([sx(h, local.command)], [`${CLI} search "modal dialog"`]),
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
          "Paste the address of a web page. We read its HTML and open it in a browser, then list the issues the automated checks found, worst first, each with its WCAG success criterion, its EN 301 549 clause and the guide that fixes it. Automated checks find only part of the issues; a person reviews the rest. To check a page on your own machine, run ",
          h.code([], [`${CLI} check localhost:5173`]),
          ".",
        ]
      ),
      ...scanForm(model, h),
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
  body: h.div(
    [sx(h, styles.page)],
    [
      h.header(
        [],
        [
          h.a([h.Href(`#${MAIN_ID}`), sx(h, local.skip)], ["Skip to content"]),
          h.nav(
            [sx(h, local.nav), h.AriaLabel("Site")],
            [
              h.a([h.Href(homeRouter()), sx(h, local.brand)], ["good-a11y"]),
              h.a([h.Href(`${homeRouter()}#guides`)], ["Guides"]),
              h.a([h.Href(checkRouter({}))], ["Check a page"]),
            ]
          ),
        ]
      ),
      routeView(model, h),
    ]
  ),
  canonical: `${model.origin}${pathOf(model.route)}`,
  lang: "en",
  title: pageMetaOf(model.route).title,
});
