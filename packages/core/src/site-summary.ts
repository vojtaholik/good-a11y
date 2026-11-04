import type { CrawlRole } from "./crawl.js";

export const ROLE_NAMES: Readonly<Record<CrawlRole, string>> = {
  contact: "Contact page",
  product: "Product page",
  sign_in: "Sign-in page",
  statement: "Accessibility statement",
};

export const siteSummary = (site: {
  readonly pages: readonly { readonly outcome: "failed" | "read" }[];
  readonly search: boolean;
  readonly sitemap: boolean;
}): string => {
  const read = site.pages.filter((page) => page.outcome === "read").length;

  const ways = [
    site.search ? "a search" : null,
    site.sitemap ? "a link to a site map" : null,
  ].filter((way) => way !== null);

  return `Besides the page entered, the scan read ${read} of ${site.pages.length} pages it picked from the page's links. ${ways.length === 0 ? "It saw no search and no site map link." : `It saw ${ways.join(" and ")}.`}`;
};
