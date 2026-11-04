import { Schema } from "effect";

import { CheckResultSchema } from "./check.js";
import { CrawlRoleSchema } from "./crawl.js";
import { FetchFailureReasonSchema } from "./fetch-result.js";
import { MAX_HREF, MAX_NAME, MAX_STRUCTURED_TYPES } from "./page-evidence.js";
import type { PageEvidence } from "./page-evidence.js";

export const MAX_CONTROL_NAMES = 200;

export const PageRoleSchema = Schema.Literals([
  "entered",
  ...CrawlRoleSchema.literals,
]);

export type PageRole = typeof PageRoleSchema.Type;

const Name = Schema.String.check(Schema.isMaxLength(MAX_NAME));

const Href = Schema.String.check(Schema.isMaxLength(MAX_HREF));

const Count = Schema.Int.check(Schema.isGreaterThanOrEqualTo(0));

const Capped = <S extends Schema.Top>(item: S, most: number) =>
  Schema.Array(item).check(Schema.isMaxLength(most));

export const ControlNameSchema = Schema.Struct({
  href: Schema.NullOr(Href),
  kind: Schema.Literals(["link", "button"]),
  text: Name,
});

export type ControlName = typeof ControlNameSchema.Type;

export const PageSummarySchema = Schema.Struct({
  linkCount: Count,
  names: Capped(ControlNameSchema, MAX_CONTROL_NAMES).annotate({
    description:
      "Named links and buttons in document order, for consistent identification",
  }),
  role: PageRoleSchema,
  search: Schema.Boolean,
  sitemap: Schema.Boolean.annotate({
    description: "The page links to a site map",
  }),
  structuredTypes: Capped(Name, MAX_STRUCTURED_TYPES),
  truncated: Schema.Boolean,
  url: Schema.String,
});

export type PageSummary = typeof PageSummarySchema.Type;

export const SitePageSchema = Schema.Union([
  Schema.Struct({
    checks: Schema.Array(CheckResultSchema),
    finalUrl: Schema.String,
    httpStatus: Schema.Int,
    outcome: Schema.Literal("read"),
    role: CrawlRoleSchema,
    url: Schema.String,
  }),
  Schema.Struct({
    detail: Schema.String,
    outcome: Schema.Literal("failed"),
    reason: Schema.Union([
      FetchFailureReasonSchema,
      Schema.Literals(["http_error", "not_html", "off_site"]),
    ]),
    role: CrawlRoleSchema,
    url: Schema.String,
  }),
]);

export type SitePage = typeof SitePageSchema.Type;

export const SiteEvidenceSchema = Schema.Struct({
  pages: Schema.Array(SitePageSchema).annotate({
    description:
      "The pages the crawl tried besides the entered one, read or failed",
  }),
  summaries: Schema.Array(PageSummarySchema).annotate({
    description: "The entered page first, then every page that was read",
  }),
});

export type SiteEvidence = typeof SiteEvidenceSchema.Type;

const SITEMAP_TEXT =
  /(?:^|[^\p{L}])(?:site ?map|sitemap|mapa (?:stránek|webu|del sitio|do site|strony|stránok)|plan du site|seitenübersicht|mappa del sito|sitemappe|webhelykérkép|oversigt|sivukartta|harta site-ului|карта на сайта|χάρτης ιστοτόπου)(?:$|[^\p{L}])/iu;

const SITEMAP_PATH =
  /(?:^|\/)(?:site-?map|plan-du-site|mapa-stranek|mapa-webu)(?:$|[/._-])/iu;

const resolvedHref = (href: string, base: string): string => {
  if (!URL.canParse(href, base)) {
    return href;
  }

  const url = new URL(href, base);

  url.hash = "";

  return url.href.slice(0, MAX_HREF);
};

const pathOf = (href: string): string =>
  URL.canParse(href) ? new URL(href).pathname : "";

export const summaryOf = (
  role: PageRole,
  url: string,
  evidence: PageEvidence
): PageSummary => {
  const links = evidence.links.map((link) => ({
    href: resolvedHref(link.href, url),
    link,
  }));

  const names: ControlName[] = [
    ...links.flatMap(({ href, link }) =>
      link.text === "" ? [] : [{ href, kind: "link" as const, text: link.text }]
    ),
    ...evidence.buttons.flatMap((button) =>
      button.text === ""
        ? []
        : [{ href: null, kind: "button" as const, text: button.text }]
    ),
  ];

  return {
    linkCount: evidence.links.length,
    names: names.slice(0, MAX_CONTROL_NAMES),
    role,
    search: evidence.search,
    sitemap: links.some(
      ({ href, link }) =>
        SITEMAP_TEXT.test(link.text) || SITEMAP_PATH.test(pathOf(href))
    ),
    structuredTypes: evidence.structuredTypes,
    truncated: evidence.truncated || names.length > MAX_CONTROL_NAMES,
    url,
  };
};
