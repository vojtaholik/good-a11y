import { Option } from "effect";

import { guidePageOf } from "./guides.js";
import { AppRoute } from "./route.js";
import type { AppRouteState } from "./route.js";

export const SITE_NAME = "good-a11y";

export interface PageMeta {
  readonly description: string;
  readonly isIndexed: boolean;
  readonly title: string;
}

const HOME_DESCRIPTION =
  "Accessibility guides for coding agents, each with a live demo, and a checker that finds accessibility issues on one page.";

export const CHECK_DESCRIPTION =
  "Check one web page for accessibility issues: static HTML checks and axe-core in a real browser, each issue with its WCAG success criterion and a guide to fix it.";

export const ABOUT_DESCRIPTION =
  "Who makes good-a11y, why it writes guides for coding agents, and how the guides are tested.";

export const PRIVACY_DESCRIPTION =
  "What the checker stores when you check a page, for how long, and what goes to a model.";

export const pageMetaOf = (route: AppRouteState): PageMeta =>
  AppRoute.match<PageMeta>(route, {
    About: () => ({
      description: ABOUT_DESCRIPTION,
      isIndexed: true,
      title: `About | ${SITE_NAME}`,
    }),
    Check: () => ({
      description: CHECK_DESCRIPTION,
      isIndexed: true,
      title: `Check a page | ${SITE_NAME}`,
    }),
    Guide: ({ guideId }) =>
      Option.match(guidePageOf(guideId), {
        onNone: () => ({
          description: HOME_DESCRIPTION,
          isIndexed: false,
          title: `Guide not found | ${SITE_NAME}`,
        }),
        onSome: (page) => ({
          description: page.description.replace(/\.?$/u, "."),
          isIndexed: true,
          title: `${page.name} | ${SITE_NAME}`,
        }),
      }),
    Home: () => ({
      description: HOME_DESCRIPTION,
      isIndexed: true,
      title: `${SITE_NAME}: accessibility guides for coding agents`,
    }),
    NotFound: () => ({
      description: HOME_DESCRIPTION,
      isIndexed: false,
      title: `Page not found | ${SITE_NAME}`,
    }),
    Privacy: () => ({
      description: PRIVACY_DESCRIPTION,
      isIndexed: true,
      title: `Privacy | ${SITE_NAME}`,
    }),
    Report: ({ slug }) => ({
      description: `The newest automated accessibility check of ${slug}.`,
      isIndexed: false,
      title: `Report for ${slug} | ${SITE_NAME}`,
    }),
    Scan: ({ slug }) => ({
      description: `An automated accessibility check of ${slug}.`,
      isIndexed: false,
      title: `Report for ${slug} | ${SITE_NAME}`,
    }),
  });
