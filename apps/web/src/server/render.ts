import type { ScanView } from "@good-a11y/core/contracts";
import { Effect, Option, Schema } from "effect";
import { Server } from "foldkit/experimental";

import { Flags } from "../client/model.js";
import { guidePageOf } from "../features/guides.js";
import type { PageMeta } from "../features/page-meta.js";
import { AppRoute } from "../features/route.js";
import type { AppRouteState } from "../features/route.js";
import { init } from "../features/update.js";
import { view } from "../features/view.js";
import { readScan } from "./read-scan.js";
import type { BackendFetch } from "./rpc.js";

const escapeAttribute = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const withContent = (
  template: string,
  attribute: "name" | "property",
  key: string,
  value: string
): string =>
  template.replace(
    new RegExp(`(<meta ${attribute}="${key}" content=")[^"]*(")`, "u"),
    (_match, start: string, end: string) =>
      `${start}${escapeAttribute(value)}${end}`
  );

export const withPageMeta = (template: string, meta: PageMeta): string => {
  const described = withContent(
    template,
    "name",
    "description",
    meta.description
  );

  const titled = withContent(described, "property", "og:title", meta.title);

  const shared = withContent(
    titled,
    "property",
    "og:description",
    meta.description
  );

  return withContent(
    shared,
    "name",
    "robots",
    meta.isIndexed ? "index, follow" : "noindex"
  );
};

export const isMissing = (route: AppRouteState): boolean =>
  Schema.is(AppRoute.NotFound)(route) ||
  (Schema.is(AppRoute.Guide)(route) &&
    Option.isNone(guidePageOf(route.guideId)));

export const scanOf = (
  backend: BackendFetch,
  route: AppRouteState
): Effect.Effect<Option.Option<ScanView>> => {
  if (Schema.is(AppRoute.Scan)(route)) {
    return readScan(backend, {
      scanId: route.scanId,
      slug: route.slug.toLowerCase(),
    });
  }

  return Schema.is(AppRoute.Report)(route)
    ? readScan(backend, { slug: route.slug.toLowerCase() })
    : Effect.succeedNone;
};

const isReport = (route: AppRouteState): boolean =>
  Schema.is(AppRoute.Report)(route) || Schema.is(AppRoute.Scan)(route);

export const renderPage = (
  request: Request,
  route: AppRouteState,
  maybeScan: Option.Option<ScanView>
) =>
  Server.renderToString(
    { Flags, init, routing: true, view },
    {
      buildId: __BUILD_ID__,
      flags: { maybeScan, origin: new URL(request.url).origin },
      url: request.url,
    }
  ).pipe(
    Effect.map((application) =>
      Server.Rendered(application, {
        headers: {
          "cache-control": isReport(route) ? "no-store" : "public, max-age=300",
          "x-content-type-options": "nosniff",
        },
        status: isMissing(route) ? 404 : 200,
      })
    )
  );
