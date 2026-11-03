import { Option, pipe, Schema } from "effect";
import { Route } from "foldkit";
import { defineRouteUnion, literal, slash, string } from "foldkit/route";

export const AppRoute = defineRouteUnion({
  Checks: {},
  Home: {},
  NotFound: { path: Schema.String },
  Report: { slug: Schema.String },
  Scan: { scanId: Schema.String, slug: Schema.String },
});

export type AppRouteState = typeof AppRoute.Type;

export const homeRouter = pipe(Route.root, Route.mapTo(AppRoute.Home));

export const reportRouter = pipe(
  literal("report"),
  slash(string("slug")),
  Route.mapTo(AppRoute.Report)
);

export const scanRouter = pipe(
  literal("report"),
  slash(string("slug")),
  slash(string("scanId")),
  Route.mapTo(AppRoute.Scan)
);

export const reportSlugOf = (route: AppRouteState): Option.Option<string> =>
  Schema.is(AppRoute.Report)(route) || Schema.is(AppRoute.Scan)(route)
    ? Option.some(route.slug.toLowerCase())
    : Option.none();

export const checksRouter = pipe(
  literal("checks"),
  Route.mapTo(AppRoute.Checks)
);

export const parseRoute = Route.parseUrlWithFallback(
  Route.oneOf(scanRouter, reportRouter, checksRouter, homeRouter),
  AppRoute.NotFound
);
