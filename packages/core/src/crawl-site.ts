import { Effect } from "effect";

import { CHECKS } from "./catalogue.js";
import { pickPages, siteOf } from "./crawl.js";
import type { CrawlPick } from "./crawl.js";
import type { PageEvidence } from "./page-evidence.js";
import { PageReader } from "./page-reader.js";
import { SafeFetch } from "./safe-fetch.js";
import { SCANNER_USER_AGENT, isHtml } from "./scan.js";
import { summaryOf } from "./site-evidence.js";
import type { SiteEvidence, SitePage } from "./site-evidence.js";

export const CRAWL_PAGES_AT_ONCE = 2;

export interface CrawledPage {
  readonly body: string;
  readonly evidence: PageEvidence;
  readonly page: Extract<SitePage, { readonly outcome: "read" }>;
}

export interface Crawl {
  readonly read: readonly CrawledPage[];
  readonly site: SiteEvidence;
}

type Visit =
  | { readonly crawled: CrawledPage }
  | { readonly failed: Extract<SitePage, { readonly outcome: "failed" }> };

const visit = Effect.fnUntraced(function* visit(pick: CrawlPick, site: string) {
  const safeFetch = yield* SafeFetch;
  const reader = yield* PageReader;

  const fetched = yield* safeFetch.fetch(pick.url, {
    userAgent: SCANNER_USER_AGENT,
  });

  if (!fetched.ok) {
    return {
      failed: {
        detail: fetched.detail,
        outcome: "failed",
        reason: fetched.reason,
        ...pick,
      },
    } satisfies Visit;
  }

  if (
    URL.canParse(fetched.finalUrl) &&
    siteOf(new URL(fetched.finalUrl).hostname) !== site
  ) {
    return {
      failed: {
        detail: `The page sent the scanner to ${fetched.finalUrl}, another site, so it was not read.`,
        outcome: "failed",
        reason: "off_site",
        ...pick,
      },
    } satisfies Visit;
  }

  if (fetched.status >= 400) {
    return {
      failed: {
        detail: `The page answered with HTTP ${fetched.status}, so it was not read.`,
        outcome: "failed",
        reason: "http_error",
        ...pick,
      },
    } satisfies Visit;
  }

  if (!isHtml(fetched.contentType)) {
    return {
      failed: {
        detail: `The address answered with ${fetched.contentType}, not an HTML page.`,
        outcome: "failed",
        reason: "not_html",
        ...pick,
      },
    } satisfies Visit;
  }

  const evidence = reader.read(fetched.body);

  return {
    crawled: {
      body: fetched.body,
      evidence,
      page: {
        checks: CHECKS.map((check) => check.evaluate(evidence)),
        finalUrl: fetched.finalUrl,
        httpStatus: fetched.status,
        outcome: "read",
        ...pick,
      },
    },
  } satisfies Visit;
});

export const crawlSite = Effect.fn("crawlSite")(function* crawlSite(
  pageUrl: string,
  entered: PageEvidence
) {
  const picks = pickPages(pageUrl, entered.links);
  const site = URL.canParse(pageUrl) ? siteOf(new URL(pageUrl).hostname) : "";

  const visits: readonly Visit[] = yield* Effect.forEach(
    picks,
    (pick) => visit(pick, site),
    { concurrency: CRAWL_PAGES_AT_ONCE }
  );

  const read = visits.flatMap((done) =>
    "crawled" in done ? [done.crawled] : []
  );

  return {
    read,
    site: {
      pages: visits.map((done) =>
        "crawled" in done ? done.crawled.page : done.failed
      ),
      summaries: [
        summaryOf("entered", pageUrl, entered),
        ...read.map(({ evidence, page }) =>
          summaryOf(page.role, page.finalUrl, evidence)
        ),
      ],
    },
  } satisfies Crawl;
});
