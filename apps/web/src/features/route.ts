import { pipe, Schema } from "effect";
import { Route } from "foldkit";
import { defineRouteUnion, literal, slash, string } from "foldkit/route";

export const AppRoute = defineRouteUnion({
  Home: {},
  NotFound: { path: Schema.String },
  Report: { slug: Schema.String },
});

export type AppRouteState = typeof AppRoute.Type;

export const homeRouter = pipe(Route.root, Route.mapTo(AppRoute.Home));

export const reportRouter = pipe(
  literal("report"),
  slash(string("slug")),
  Route.mapTo(AppRoute.Report)
);

export const parseRoute = Route.parseUrlWithFallback(
  Route.oneOf(reportRouter, homeRouter),
  AppRoute.NotFound
);
