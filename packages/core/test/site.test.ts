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
  passages: [],
  prices: [],
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

const summary = (role: PageSummary["role"], path: string): PageSummary => ({
  linkCount: 4,
  names: [],
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
  summaries: [summary("entered", "/"), summary("contact", "/contact")],
};

const checked = judgePage(PAGE, { read: () => EVIDENCE }, AT);

const report = withSite(checked, SITE);

describe("withSite", () => {
  it("adds no issue, verdict, coverage or checklist result: 3.2.3, 3.2.4 and 3.2.6 need a person", () => {
    expect(issuesOf(report)).toEqual(issuesOf(checked));
    expect(report.verdict).toEqual(checked.verdict);
    expect(report.coverage).toEqual(checked.coverage);
    expect(
      requirementsOf(report)
        .filter((row) => ["3.2.3", "3.2.4", "3.2.6"].includes(row.key))
        .map((row) => row.status)
    ).toEqual(["needs_person", "needs_person", "needs_person"]);
    expect(formatReport(report)).not.toContain("compared");
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
});
