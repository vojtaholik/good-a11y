import { Option, pipe, Schema } from "effect";
import { Route } from "foldkit";
import { defineRouteUnion, literal, slash, string } from "foldkit/route";

export const AppRoute = defineRouteUnion({
  About: {},
  Check: { url: Schema.optionalKey(Schema.String) },
  Guide: { guideId: Schema.String },
  Home: {},
  NotFound: { path: Schema.String },
  Privacy: {},
  Report: { slug: Schema.String },
  Scan: { scanId: Schema.String, slug: Schema.String },
});

export type AppRouteState = typeof AppRoute.Type;

export const homeRouter = pipe(Route.root, Route.mapTo(AppRoute.Home));

export const checkRouter = pipe(
  literal("check"),
  Route.query(Schema.Struct({ url: Schema.optionalKey(Schema.String) })),
  Route.mapTo(AppRoute.Check)
);

export const reportRouter = pipe(
  literal("check"),
  slash(string("slug")),
  Route.mapTo(AppRoute.Report)
);

export const scanRouter = pipe(
  literal("check"),
  slash(string("slug")),
  slash(string("scanId")),
  Route.mapTo(AppRoute.Scan)
);

export const aboutRouter = pipe(literal("about"), Route.mapTo(AppRoute.About));

export const privacyRouter = pipe(
  literal("privacy"),
  Route.mapTo(AppRoute.Privacy)
);

export const guideRouter = pipe(
  literal("guides"),
  slash(string("guideId")),
  Route.mapTo(AppRoute.Guide)
);

export const reportSlugOf = (route: AppRouteState): Option.Option<string> =>
  Schema.is(AppRoute.Report)(route) || Schema.is(AppRoute.Scan)(route)
    ? Option.some(route.slug.toLowerCase())
    : Option.none();

export const isSameRoute = Schema.toEquivalence(AppRoute);

export const pathOf = (route: AppRouteState): string =>
  AppRoute.match<string>(route, {
    About: () => aboutRouter(),
    Check: () => checkRouter({}),
    Guide: ({ guideId }) => guideRouter({ guideId }),
    Home: () => homeRouter(),
    NotFound: ({ path }) => path,
    Privacy: () => privacyRouter(),
    Report: ({ slug }) => reportRouter({ slug }),
    Scan: ({ scanId, slug }) => scanRouter({ scanId, slug }),
  });

export const parseRoute = Route.parseUrlWithFallback(
  Route.oneOf(
    scanRouter,
    reportRouter,
    checkRouter,
    guideRouter,
    aboutRouter,
    privacyRouter,
    homeRouter
  ),
  AppRoute.NotFound
);
