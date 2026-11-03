// @effect-diagnostics nodeBuiltinImport:off -- The test reads a recorded axe-core result from disk.
import { readFileSync } from "node:fs";
import path from "node:path";

import { VERIFIED_FACTS } from "@eaa-check/facts";
import { describe, expect, it } from "@effect/vitest";
import { Schema } from "effect";

import {
  AxeResultsJson,
  BUDGET_SPENT,
  RENDERED_BLOCKED,
  RENDERED_UNREADABLE,
  RenderedAuditFailed,
  ReportSchema,
  STATIC_COVERAGE,
  formatReport,
  judgePage,
  renderedOf,
  skippedBecause,
  withRendered,
} from "../src/index.js";
import type {
  AxeResults,
  AxeRule,
  FetchResult,
  PageReading,
  RenderedPage,
} from "../src/index.js";

const RAW = readFileSync(
  path.join(import.meta.dirname, "fixtures", "axe-results.json"),
  "utf-8"
);

const RESULTS: AxeResults = Schema.decodeUnknownSync(AxeResultsJson)(RAW);

const AT = "2026-11-03T20:00:00.000Z";

const fetched: FetchResult = {
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

const reader: PageReading = {
  read: () => ({
    buttons: [],
    controls: [],
    frames: [],
    images: [],
    labelTargets: [],
    lang: "en",
    links: [],
    refreshes: [],
    title: "Shop",
    truncated: false,
    viewports: [],
  }),
};

const STATIC = judgePage(fetched, reader, AT);

const page = (overrides: Partial<RenderedPage> = {}): RenderedPage => ({
  axe: RAW,
  headers: {},
  html: "<html><body>Shop</body></html>",
  status: 200,
  ...overrides,
});

const rule = (overrides: Partial<AxeRule>): AxeRule => ({
  help: "Help",
  helpUrl: "https://dequeuniversity.com/rules/axe/4.14/x",
  id: "x",
  impact: "serious",
  nodes: [{ html: "<div>" }],
  tags: ["wcag2a", "wcag111"],
  ...overrides,
});

const VERIFIED = new Map(VERIFIED_FACTS.map((fact) => [fact.id, fact]));

describe("rendered findings from a recorded axe-core run", () => {
  const rendered = renderedOf(RESULTS);

  it("reports each violation with the elements that fail, including ones built by JavaScript", () => {
    expect(rendered.status).toBe("ran");
    expect(
      rendered.status === "ran"
        ? rendered.findings.map((finding) => [finding.rule, finding.failing])
        : []
    ).toEqual([
      ["button-name", 1],
      ["color-contrast", 1],
      ["html-has-lang", 1],
      ["image-alt", 2],
      ["label", 1],
      ["link-name", 2],
    ]);
    expect(
      rendered.status === "ran"
        ? rendered.findings.flatMap((finding) => finding.samples)
        : []
    ).toContain('<img src="rendered.png">');
  });

  it("shows a criterion or clause only from a verified fact", () => {
    const references =
      rendered.status === "ran"
        ? rendered.findings.flatMap((finding) => finding.references)
        : [];

    expect(references.length).toBeGreaterThan(0);

    for (const reference of references) {
      expect(VERIFIED.get(reference.factId)?.value).toBe(reference.text);
    }
  });

  it("maps axe's wcag tags to success criteria", () => {
    const contrast =
      rendered.status === "ran"
        ? rendered.findings.find((finding) => finding.rule === "color-contrast")
        : undefined;

    expect(contrast?.references.map((reference) => reference.factId)).toEqual(
      expect.arrayContaining(["STD-SC-1.4.3", "STD-EN-9.1.4.3"])
    );
  });

  it("leaves out rules outside WCAG 2.1 A and AA and rules whose criterion has no verified fact", () => {
    const shown = renderedOf({
      ...RESULTS,
      passes: [],
      violations: [
        rule({ id: "best", tags: ["best-practice"] }),
        rule({ id: "newer", tags: ["wcag22aa", "wcag2411"] }),
        rule({ id: "unsourced", tags: ["wcag2a", "wcag999"] }),
        rule({ id: "kept" }),
      ],
    });

    expect(
      shown.status === "ran"
        ? shown.findings.map((finding) => finding.rule)
        : []
    ).toEqual(["kept"]);
  });
});

describe("withRendered", () => {
  it("adds the rendered findings, widens the coverage line and counts them in the headline", () => {
    const report = withRendered(STATIC, { ran: page() });

    expect(report.rendered?.status).toBe("ran");
    expect(report.coverage?.method).toBe("static_html_and_rendered");
    expect(report.coverage?.criteria).toBeGreaterThan(STATIC_COVERAGE.criteria);
    expect(report.coverage?.text).toContain("static HTML + rendered page");
    expect(report.headline).toContain("found issues in 6 of");
    expect(formatReport(report)).toContain("[axe:image-alt]");
  });

  it("says the rendered check was skipped, with the reason, and keeps the static findings", () => {
    const report = withRendered(STATIC, { skipped: BUDGET_SPENT });

    expect(report.rendered).toEqual({
      reason: BUDGET_SPENT,
      status: "skipped",
    });
    expect(report.findings).toEqual(STATIC.findings);
    expect(report.coverage).toEqual(STATIC_COVERAGE);
    expect(formatReport(report)).toContain(
      `Rendered page check skipped: ${BUDGET_SPENT}`
    );
  });

  it("skips when the browser met a bot wall instead of the page", () => {
    expect(
      withRendered(STATIC, { ran: page({ status: 403 }) }).rendered
    ).toEqual({ reason: RENDERED_BLOCKED, status: "skipped" });
    expect(
      withRendered(STATIC, {
        ran: page({
          html: "<script>window.__blnChallengeStore = {}</script>",
        }),
      }).rendered
    ).toEqual({ reason: RENDERED_BLOCKED, status: "skipped" });
  });

  it("skips when axe returns something that is not its result", () => {
    expect(
      withRendered(STATIC, { ran: page({ axe: '{"violations":"no"}' }) })
        .rendered
    ).toEqual({ reason: RENDERED_UNREADABLE, status: "skipped" });
  });

  it("names why the browser step failed", () => {
    expect(
      skippedBecause(new RenderedAuditFailed({ detail: "x", kind: "timeout" }))
    ).toContain("too long");
  });

  it("never says compliant, in text or JSON", () => {
    const report = withRendered(STATIC, { ran: page() });

    expect(formatReport(report)).not.toMatch(/complian(?:t|ce score)/iu);
    expect(JSON.stringify(Schema.encodeSync(ReportSchema)(report))).not.toMatch(
      /complian(?:t|ce score)/iu
    );
  });
});
