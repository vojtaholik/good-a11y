import { describe, expect, it } from "@effect/vitest";
import { Schema } from "effect";

import {
  ReportSchema,
  formatReport,
  issuesOf,
  judgePage,
  requirementsOf,
  withRendered,
  withSite,
} from "../src/index.js";
import type {
  FetchResult,
  PageEvidence,
  PageSummary,
  SiteEvidence,
  SiteLink,
} from "../src/index.js";
import { BUDGET_SPENT } from "../src/rendered.js";

const AT = "2026-11-04T08:00:00.000Z";

const EVIDENCE: PageEvidence = {
  buttons: [],
  controls: [],
  frames: [],
  headings: [],
  images: [],
  labelTargets: [],
  labels: [],
  lang: "en",
  links: [],
  refreshes: [],
  search: false,
  structuredTypes: [],
  textSample: "",
  title: "Shop",
  truncated: false,
  viewports: [],
};

const PAGE: FetchResult = {
  body: "<html></html>",
  contentType: "text/html",
  durationMs: 1,
  finalUrl: "https://shop.example/",
  headers: {},
  observedAt: AT,
  ok: true,
  redirects: [],
  requestedUrl: "https://shop.example/",
  status: 200,
  truncated: false,
};

const link = (text: string, path: string, position: number): SiteLink => ({
  href: `https://shop.example${path}`,
  landmark: "nav",
  position,
  text,
});

const NAV = ["Home:/", "Women:/women", "Men:/men", "Sale:/sale"].map(
  (item, position) => {
    const [text = "", path = ""] = item.split(":");

    return link(text, path, position);
  }
);

const summary = (
  role: PageSummary["role"],
  path: string,
  navigation: readonly SiteLink[]
): PageSummary => ({
  help: [],
  linkCount: navigation.length,
  names: [],
  navigation,
  role,
  search: role === "entered",
  sitemap: false,
  structuredTypes: [],
  truncated: false,
  url: `https://shop.example${path}`,
});

const SITE: SiteEvidence = {
  pages: [
    {
      checks: [
        {
          checked: 2,
          failing: 1,
          id: "image-alt",
          samples: ["<img>"],
          status: "fail",
        },
      ],
      finalUrl: "https://shop.example/contact",
      httpStatus: 200,
      outcome: "read",
      role: "contact",
      url: "https://shop.example/contact",
    },
    {
      detail: "The server refused the request (HTTP 403).",
      outcome: "failed",
      reason: "blocked",
      role: "product",
      url: "https://shop.example/p/1",
    },
  ],
  summaries: [
    summary("entered", "/", NAV),
    summary(
      "contact",
      "/contact",
      [NAV[0], NAV[2], NAV[1], NAV[3]].flatMap((item, position) =>
        item === undefined ? [] : [{ ...item, position }]
      )
    ),
  ],
};

const checked = judgePage(PAGE, { read: () => EVIDENCE }, AT);

const report = withSite(checked, SITE);

describe("withSite", () => {
  it("shows a cross-page difference as compared, not yet counted: no issue, no verdict, no coverage, no failing row", () => {
    const row = requirementsOf(report).find((item) => item.key === "3.2.3");

    expect(
      report.site?.findings.find((item) => item.id === "consistent-navigation")
        ?.status
    ).toBe("fail");
    expect(issuesOf(report)).toEqual(issuesOf(checked));
    expect(report.verdict).toEqual(checked.verdict);
    expect(report.coverage).toEqual(checked.coverage);
    expect(row?.status).toBe("needs_person");
    expect(row?.compared).toBe(
      "Compared across pages, not yet counted: differences found"
    );
    expect(formatReport(report)).toContain(
      "Compared across pages, not yet counted: Navigation in the same order on every page: differences found"
    );
  });

  it("lists every page it tried, the static issues of each page read, and keeps them out of the verdict", () => {
    expect(report.site?.pages).toEqual([
      {
        detail: null,
        failing: ["Images have a text alternative"],
        outcome: "read",
        role: "contact",
        url: "https://shop.example/contact",
      },
      {
        detail: "The server refused the request (HTTP 403).",
        failing: [],
        outcome: "failed",
        role: "product",
        url: "https://shop.example/p/1",
      },
    ]);
    expect(report.verdict?.failures).toBe(0);
    expect(report.site?.search).toBe(true);
    expect(formatReport(report)).toContain("Other pages of the site:");
  });

  it("keeps the site section when the rendered step comes after, and round-trips through the schema", () => {
    const later = withRendered(report, { skipped: BUDGET_SPENT });

    expect(later.site).toEqual(report.site);
    expect(
      Schema.decodeUnknownSync(ReportSchema)(
        Schema.encodeSync(ReportSchema)(later)
      )
    ).toEqual(later);
  });

  it("runs no cross-page check when the page entered was not read", () => {
    const refused = judgePage(
      {
        detail: "The server refused the request (HTTP 403).",
        observedAt: AT,
        ok: false,
        reason: "blocked",
        redirects: [],
        requestedUrl: "https://shop.example/",
        status: 403,
      },
      { read: () => EVIDENCE },
      AT
    );

    const blocked = withSite(refused, {
      ...SITE,
      summaries: SITE.summaries.slice(1),
    });

    expect(blocked.site?.findings).toEqual([]);
    expect(blocked.verdict).toBeNull();
    expect(blocked.headline).toBe(refused.headline);
  });
});
