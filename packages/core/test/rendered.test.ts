// @effect-diagnostics nodeBuiltinImport:off -- The test reads a recorded axe-core result from disk.
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "@effect/vitest";
import { VERIFIED_FACTS } from "@good-a11y/facts";
import { Schema } from "effect";

import {
  AxeResultsJson,
  BUDGET_SPENT,
  REFUSED_THEN_RENDERED,
  RENDERED_BLOCKED,
  RENDERED_UNREADABLE,
  RenderedAuditFailed,
  ReportSchema,
  STATIC_COVERAGE,
  formatReport,
  isNewerOnly,
  issuesFrom,
  issuesOf,
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
  }),
};

const STATIC = judgePage(fetched, reader, AT);

const page = (overrides: Partial<RenderedPage> = {}): RenderedPage => ({
  axe: RAW,
  headers: {},
  html: "<html><body>Shop</body></html>",
  probes: null,
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

const contrastFindingIn = (result: ReturnType<typeof renderedOf>) =>
  result.status === "ran"
    ? result.findings.find((finding) => finding.rule === "color-contrast")
    : undefined;

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

  it("leaves out contrast results on content inside or slotted into a web component", () => {
    const contrast = (inComponent: readonly boolean[]) =>
      renderedOf({
        ...RESULTS,
        violations: [
          rule({
            id: "color-contrast",
            nodes: inComponent.map((flag, index) => ({
              html: `<span id="text-${index}">`,
              inComponent: flag,
            })),
            tags: ["wcag2aa", "wcag143"],
          }),
        ],
      });

    expect(contrastFindingIn(contrast([true, false, true]))).toMatchObject({
      failing: 1,
      samples: ['<span id="text-1">'],
    });
    expect(contrastFindingIn(contrast([true, true]))).toBeUndefined();
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

  it("leaves out rules outside WCAG 2.1 A and AA, rules whose criterion has no verified fact, and rules dropped as noisy", () => {
    const shown = renderedOf({
      ...RESULTS,
      passes: [],
      violations: [
        rule({ id: "best", tags: ["best-practice"] }),
        rule({ id: "newer", tags: ["wcag22aa", "wcag2411"] }),
        rule({ id: "unsourced", tags: ["wcag2a", "wcag999"] }),
        rule({
          id: "label-content-name-mismatch",
          tags: ["wcag21a", "wcag253"],
        }),
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
    expect(report.headline).toBe(
      `This page does not meet WCAG 2.1 Level AA, the reference benchmark. Automated checks found ${report.verdict?.failingCriteria} failing criteria.`
    );
    expect(report.verdict?.failingCriteria).toBeGreaterThan(1);
    expect(formatReport(report)).toContain("[axe:color-contrast]");
  });

  it("merges an axe rule into the static check for the same concern, with samples from both", () => {
    const merged = issuesOf(
      withRendered(
        judgePage(
          fetched,
          {
            read: () => ({
              ...reader.read(""),
              images: [
                {
                  alt: null,
                  file: "served.png",
                  kind: "img",
                  labelled: false,
                  presentational: false,
                  snippet: '<img src="served.png">',
                },
              ],
            }),
          },
          AT
        ),
        { ran: page() }
      )
    );

    const images = merged.filter((issue) => issue.key.includes("image-alt"));

    expect(images.map((issue) => issue.key)).toEqual(["image-alt"]);
    expect(images[0]?.sources).toEqual(["static", "rendered"]);
    expect(new Set(images[0]?.samples.map((sample) => sample.source))).toEqual(
      new Set(["static", "rendered"])
    );
  });

  it("drops a served-HTML failure, from the issues and the verdict, when the rendered page passes the same concern or no longer has it, and keeps it when axe could not decide", () => {
    const servedOnly = judgePage(
      fetched,
      {
        read: () => ({
          ...reader.read(""),
          images: [
            {
              alt: null,
              file: "named-by-script.png",
              kind: "img",
              labelled: false,
              presentational: false,
              snippet: '<img src="named-by-script.png">',
            },
          ],
        }),
      },
      AT
    );

    type Where = "inapplicable" | "incomplete" | "passes";

    const withoutImageAlt = (where: Where) =>
      JSON.stringify({
        ...RESULTS,
        inapplicable: [],
        incomplete: [],
        passes: [],
        violations: RESULTS.violations.filter(
          (violation) => violation.id !== "image-alt"
        ),
        [where]: [rule({ id: "image-alt" })],
      });

    const reportFor = (where: Where) =>
      withRendered(servedOnly, { ran: page({ axe: withoutImageAlt(where) }) });

    const imageIssues = (where: Where) =>
      issuesOf(reportFor(where)).filter((issue) => issue.key === "image-alt");

    expect(imageIssues("passes")).toEqual([]);
    expect(imageIssues("inapplicable")).toEqual([]);
    expect(reportFor("passes").verdict?.failures).toBe(
      issuesOf(reportFor("passes")).filter((issue) => issue.level !== null)
        .length
    );
    expect(imageIssues("incomplete").map((issue) => issue.sources)).toEqual([
      ["static"],
    ]);
  });

  it("says the rendered check was skipped, with the reason, and keeps the static findings", () => {
    const report = withRendered(STATIC, { skipped: BUDGET_SPENT });

    expect(report.rendered).toEqual({
      reason: BUDGET_SPENT,
      status: "skipped",
    });
    expect(report.findings).toEqual(STATIC.findings);
    expect(report.coverage).toEqual(STATIC.coverage);
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

  it("shows the rendered findings on a refused report when the browser got through", () => {
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
      reader,
      AT
    );

    const report = withRendered(refused, { ran: page() });

    expect(report.outcome).toBe("refused");
    expect(report.headline).toBe(
      `This page does not meet WCAG 2.1 Level AA, the reference benchmark. Automated checks found ${report.verdict?.failingCriteria} failing criteria.`
    );
    expect(report.verdict?.failingCriteria).toBeGreaterThan(1);
    expect(report.coverage?.method).toBe("rendered_page");
    expect(report.outcomeDetail).toContain(REFUSED_THEN_RENDERED);
    expect(formatReport(report)).toContain("Where the EAA applies");
    expect(report.contact.text).not.toBe(refused.contact.text);

    expect(withRendered(refused, { ran: page({ status: 403 }) })).toEqual(
      refused
    );
    expect(withRendered(refused, { skipped: BUDGET_SPENT })).toEqual(refused);
  });

  it("lists the WCAG 2.1 issues first and the newer WCAG 2.2 issues after them, under their own heading", () => {
    const rendered = renderedOf(RESULTS);

    const newerOnly = {
      failing: 99,
      help: "Targets are too small",
      helpUrl: "",
      impact: null,
      references: [
        {
          factId: "STD-SC22-2.5.8",
          kind: "wcag-newer" as const,
          source: "",
          text: "2.5.8 Target Size (Minimum) (AA)",
        },
      ],
      rule: "target-size",
      samples: ["<a>"],
    };

    const issues = issuesFrom(
      [],
      rendered.status === "ran"
        ? { ...rendered, findings: [...rendered.findings, newerOnly] }
        : rendered,
      []
    );

    expect(issues.at(-1)?.key).toBe("axe:target-size");
    expect(issues.slice(0, -1).every((issue) => issue.level !== null)).toBe(
      true
    );
    expect(issues.filter(isNewerOnly).map((issue) => issue.key)).toEqual([
      "axe:target-size",
    ]);
  });

  it("never says compliant, in text or JSON", () => {
    const report = withRendered(STATIC, { ran: page() });

    expect(formatReport(report)).not.toMatch(/complian(?:t|ce score)/iu);
    expect(JSON.stringify(Schema.encodeSync(ReportSchema)(report))).not.toMatch(
      /complian(?:t|ce score)/iu
    );
  });
});
