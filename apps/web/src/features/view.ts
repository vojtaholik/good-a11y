import { Option } from "effect";
import type { Document, Html, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../client/message.js";
import type { AppModel } from "../client/model.js";
import { checkView } from "./check-view.js";
import { guideView } from "./guide-view.js";
import { guidePageOf } from "./guides.js";
import { homeView } from "./home-view.js";
import { MAIN_ID } from "./landmarks.js";
import { pageMetaOf } from "./page-meta.js";
import { reportView } from "./report-view.js";
import { AppRoute, homeRouter, pathOf } from "./route.js";
import { pageShell } from "./shell.js";
import { styles } from "./styles.js";
import { sx } from "./sx.js";

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
    Check: () => checkView(model, h),
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
