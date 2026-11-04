import { Option } from "effect";
import type { Document, Html, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../client/message.js";
import type { AppModel } from "../client/model.js";
import { checkView } from "./check-view.js";
import { guideView } from "./guide-view.js";
import { guidePageOf } from "./guides.js";
import { homeView } from "./home-view.js";
import { notFoundView } from "./not-found-view.js";
import { pageMetaOf } from "./page-meta.js";
import { reportView } from "./report-view.js";
import { AppRoute, pathOf } from "./route.js";
import { pageShell } from "./shell.js";

const routeView = (model: AppModel, h: HtmlBuilder<AppMessage>): Html =>
  AppRoute.match<Html>(model.route, {
    Check: () => checkView(model, h),
    Guide: ({ guideId }) =>
      Option.match(guidePageOf(guideId), {
        onNone: () => notFoundView(h),
        onSome: (page) => guideView(page, model, h),
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
  body: pageShell(model.route, routeView(model, h), h),
  canonical: `${model.origin}${pathOf(model.route)}`,
  lang: "en",
  title: pageMetaOf(model.route).title,
});
