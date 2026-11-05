import type { ScanView } from "@good-a11y/core/contracts";
import type { Option } from "effect";
import { Effect, Schema } from "effect";
import { Server } from "foldkit/experimental";

import { Flags } from "../client/model.js";
import { isMissing } from "../features/missing.js";
import { SITE_NAME } from "../features/page-meta.js";
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

export const OG_IMAGE_PATH = "/assets/og.png";

const jsonLdOf = (origin: string, meta: PageMeta): string =>
  JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        description: meta.description,
        name: SITE_NAME,
        url: `${origin}/`,
      },
      {
        "@type": "SoftwareApplication",
        applicationCategory: "DeveloperApplication",
        description: meta.description,
        name: SITE_NAME,
        operatingSystem: "Any",
        url: `${origin}/`,
      },
    ],
  }).replaceAll("<", "\\u003c");

export const withPageMeta = (
  template: string,
  meta: PageMeta,
  route: AppRouteState,
  origin: string
): string => {
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

  const pictured = withContent(
    shared,
    "property",
    "og:image",
    `${origin}${OG_IMAGE_PATH}`
  );

  const indexed = withContent(
    pictured,
    "name",
    "robots",
    meta.isIndexed ? "index, follow" : "noindex"
  );

  return Schema.is(AppRoute.Home)(route)
    ? indexed.replace(
        "</head>",
        `<script type="application/ld+json">${jsonLdOf(origin, meta)}</script></head>`
      )
    : indexed;
};

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
  maybeScan: Option.Option<ScanView>,
  siteOrigin: string
) =>
  Server.renderToString(
    { Flags, init, routing: true, view },
    {
      buildId: __BUILD_ID__,
      flags: { maybeScan, origin: siteOrigin },
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
