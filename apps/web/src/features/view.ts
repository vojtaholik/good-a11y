import { CONTACT_SHOWN } from "@good-a11y/core/contracts";
import { Option } from "effect";
import type { Document, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../client/message.js";
import type { AppModel } from "../client/model.js";
import { checkView } from "./check-view.js";
import { contactPageView } from "./contact-view.js";
import { EVALS } from "./evals-page.js";
import { guideView } from "./guide-view.js";
import { guidePageOf } from "./guides.js";
import { homeView } from "./home-view.js";
import { ABOUT, PRIVACY } from "./info-pages.js";
import { infoView } from "./info-view.js";
import { notFoundView } from "./not-found-view.js";
import { plainPage } from "./outline.js";
import type { PageLayout } from "./outline.js";
import { pageMetaOf } from "./page-meta.js";
import { reportView } from "./report-view.js";
import { AppRoute, pathOf } from "./route.js";
import { pageShell } from "./shell.js";

const routeView = (model: AppModel, h: HtmlBuilder<AppMessage>): PageLayout =>
  AppRoute.match<PageLayout>(model.route, {
    About: () => infoView(ABOUT, h),
    Check: () => checkView(model, h),
    Contact: () =>
      CONTACT_SHOWN
        ? plainPage(contactPageView(model, h))
        : plainPage(notFoundView(h)),
    Evals: () => infoView(EVALS, h),
    Guide: ({ guideId }) =>
      Option.match(guidePageOf(guideId), {
        onNone: () => plainPage(notFoundView(h)),
        onSome: (page) => guideView(page, model, h),
      }),
    Home: () => homeView(model, h),
    NotFound: () => plainPage(notFoundView(h)),
    Privacy: () => infoView(PRIVACY, h),
    Report: ({ slug }) => reportView(model, slug, h),
    Scan: ({ slug }) => reportView(model, slug, h),
  });

export const view = (
  model: AppModel,
  h: HtmlBuilder<AppMessage>
): Document => ({
  body: pageShell(model, routeView(model, h), h),
  canonical: `${model.origin}${pathOf(model.route)}`,
  lang: "en",
  title: pageMetaOf(model.route).title,
});
