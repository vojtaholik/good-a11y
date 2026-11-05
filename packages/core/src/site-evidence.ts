import { Schema } from "effect";

import { CheckResultSchema } from "./check.js";
import { CrawlRoleSchema, ROLE_SIGNS } from "./crawl.js";
import { FetchFailureReasonSchema } from "./fetch-result.js";
import { MAX_HREF, MAX_NAME, MAX_STRUCTURED_TYPES } from "./page-evidence.js";
import type { LinkEvidence, PageEvidence } from "./page-evidence.js";

export const MAX_CONTROL_NAMES = 200;

export const MAX_NAVIGATION_LINKS = 80;

export const MAX_HELP_LINKS = 10;

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

export const SiteLinkSchema = Schema.Struct({
  href: Href.annotate({
    description:
      "The link's address resolved against the page, fragment dropped",
  }),
  position: Count.annotate({
    description:
      "The link's index among the page's kept links (other-page http(s) links), in document order",
  }),
  text: Name,
});

export type SiteLink = typeof SiteLinkSchema.Type;

export const ControlNameSchema = Schema.Struct({
  href: Schema.NullOr(Href),
  kind: Schema.Literals(["link", "button"]),
  text: Name,
});

export type ControlName = typeof ControlNameSchema.Type;

export const PageSummarySchema = Schema.Struct({
  help: Capped(SiteLinkSchema, MAX_HELP_LINKS).annotate({
    description:
      "Help and contact links (by text or last path segment, mailto: and tel:) anywhere on the page whose address occurs once among the kept links",
  }),
  linkCount: Count,
  names: Capped(ControlNameSchema, MAX_CONTROL_NAMES).annotate({
    description:
      "Named links and buttons in document order, for consistent identification",
  }),
  navigation: Capped(SiteLinkSchema, MAX_NAVIGATION_LINKS).annotate({
    description:
      "Links inside nav and header landmarks in document order, same-page and language links left out",
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

const HELP_TEXT =
  /(?:^|[^\p{L}])(?:help|faq|support|customer service|hilfe|kundenservice|nápověda|pomoc|zákaznick[áý] (?:podpora|servis)|aide|ayuda|aiuto|assistenza|ajuda|klantenservice|hjälp|hjælp|ohje|segítség|ajutor|помощ|βοήθεια)(?:$|[^\p{L}])/iu;

const HELP_PATH =
  /^\/(?:help|faq|faqs|support|hilfe|napoveda|aide|ayuda|aiuto|hilfe-center|kundenservice)(?:$|[._-])/iu;

const WEB = /^https?:$/u;

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

const lastSegmentOf = (href: string): string =>
  `/${
    pathOf(href)
      .split("/")
      .findLast((segment) => segment !== "") ?? ""
  }`;

const withoutHash = (url: string): string =>
  URL.canParse(url) ? resolvedHref(url, url) : url;

const isOtherPage = (raw: string, href: string, page: string): boolean =>
  !raw.startsWith("#") &&
  URL.canParse(href) &&
  WEB.test(new URL(href).protocol) &&
  href !== withoutHash(page);

const isContact = (raw: string): boolean =>
  raw.startsWith("mailto:") || raw.startsWith("tel:");

const isHelp = (link: LinkEvidence, href: string): boolean => {
  const path = lastSegmentOf(href);

  return (
    HELP_TEXT.test(link.text) ||
    HELP_PATH.test(path) ||
    ROLE_SIGNS.contact.text.test(link.text) ||
    ROLE_SIGNS.contact.path.test(path)
  );
};

interface PlacedLink {
  readonly href: string;
  readonly link: LinkEvidence;
  readonly position: number;
  readonly raw: string;
}

const siteLink = ({ href, link, position }: PlacedLink): SiteLink => ({
  href,
  position,
  text: link.text,
});

const placedLinks = (
  url: string,
  evidence: PageEvidence
): readonly PlacedLink[] => {
  const kept = evidence.links.flatMap((link) => {
    const raw = link.href.trim();

    const href = resolvedHref(raw, url);

    return isOtherPage(raw, href, url) || isContact(raw)
      ? [{ href, link, raw }]
      : [];
  });

  return kept.map((item, position) => ({ ...item, position }));
};

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

  const placed = placedLinks(url, evidence);

  return {
    help: placed
      .filter(
        ({ href, link, raw }) =>
          (isContact(raw) || isHelp(link, href)) &&
          placed.filter((other) => other.href === href).length === 1
      )
      .slice(0, MAX_HELP_LINKS)
      .map(siteLink),
    linkCount: evidence.links.length,
    names: names.slice(0, MAX_CONTROL_NAMES),
    navigation: placed
      .filter(
        ({ link, raw }) =>
          !isContact(raw) &&
          !link.language &&
          (link.landmark === "nav" || link.landmark === "header")
      )
      .slice(0, MAX_NAVIGATION_LINKS)
      .map(siteLink),
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
