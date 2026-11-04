import * as stylex from "@stylexjs/stylex";
import { Option } from "effect";
import type { Document, Html, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../client/message.js";
import type { AppModel } from "../client/model.js";
import { CLI } from "./agent-links.js";
import { checksView } from "./checks-view.js";
import { commandBlock } from "./command-block.js";
import { guideView } from "./guide-view.js";
import { guidePageOf } from "./guides.js";
import { homeView } from "./home-view.js";
import { MAIN_ID } from "./landmarks.js";
import { pageMetaOf } from "./page-meta.js";
import { reportView } from "./report-view.js";
import { AppRoute, homeRouter, pathOf } from "./route.js";
import { scanForm } from "./scan-form.js";
import { pageShell } from "./shell.js";
import { styles } from "./styles.js";
import { sx } from "./sx.js";
import { size } from "./tokens.stylex.js";

const local = stylex.create({
  hero: {
    fontSize: size["--size-display"],
    lineHeight: 1.15,
    marginBlock: "0 0.75rem",
  },
});

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

const narrow = (main: Html, h: HtmlBuilder<AppMessage>): Html =>
  h.div([sx(h, styles.page)], [main]);

const routeView = (model: AppModel, h: HtmlBuilder<AppMessage>): Html =>
  AppRoute.match<Html>(model.route, {
    Check: () => narrow(checkView(model, h), h),
    Guide: ({ guideId }) =>
      Option.match(guidePageOf(guideId), {
        onNone: () => narrow(notFoundView(h), h),
        onSome: (page) => guideView(page, model, h),
      }),
    Home: () => homeView(model, h),
    NotFound: () => narrow(notFoundView(h), h),
    Report: ({ slug }) => reportView(model, slug, h),
    Scan: ({ slug }) => reportView(model, slug, h),
  });

export const view = (
  model: AppModel,
  h: HtmlBuilder<AppMessage>
): Document => ({
  body: pageShell(model.route, routeView(model, h), h),
  canonical: `${model.origin}${pathOf(model.route)}`,
  lang: "en",
  title: pageMetaOf(model.route).title,
});
