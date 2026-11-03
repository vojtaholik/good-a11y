import { VERIFIED_FACTS } from "@eaa-check/facts";
import type { StateProfile } from "@eaa-check/facts";
import { describe, expect, it } from "@effect/vitest";
import { Schema } from "effect";

import {
  AUTOMATED_LIMIT,
  CATALOGUE,
  LOOKS_EMPTY,
  ReportSchema,
  applicabilityFrom,
  formatReport,
  judgePage,
  referenceFrom,
  referencesOf,
} from "../src/index.js";
import type {
  FetchResult,
  PageEvidence,
  PageReading,
  Reference,
} from "../src/index.js";

const NOTHING: PageEvidence = {
  buttons: [],
  controls: [],
  frames: [],
  images: [],
  labelTargets: [],
  lang: null,
  links: [],
  refreshes: [],
  title: null,
  truncated: false,
  viewports: [],
};

const FAILING: PageEvidence = {
  ...NOTHING,
  buttons: [{ labelled: false, snippet: "<button>", text: "" }],
  controls: [
    { id: null, insideLabel: false, labelled: false, snippet: "<input>" },
  ],
  frames: [{ labelled: false, snippet: "<iframe>" }],
  images: [
    {
      alt: null,
      kind: "img",
      labelled: false,
      presentational: false,
      snippet: "<img>",
    },
  ],
  links: [{ labelled: false, snippet: '<a href="/">', text: "" }],
  refreshes: ["5; url=/next"],
  viewports: ["width=device-width, user-scalable=no"],
};

const readerOf = (evidence: PageEvidence): PageReading => ({
  read: () => evidence,
});

const AT = "2026-11-03T20:00:00.000Z";

const page = (status = 200, contentType = "text/html"): FetchResult => ({
  body: "<html></html>",
  contentType,
  durationMs: 1,
  finalUrl: "https://example.com/",
  headers: {},
  observedAt: AT,
  ok: true,
  redirects: [],
  requestedUrl: "https://example.com/",
  status,
  truncated: false,
});

const refused: FetchResult = {
  detail: "The server refused the request (HTTP 403).",
  observedAt: AT,
  ok: false,
  reason: "blocked",
  redirects: [],
  requestedUrl: "https://example.com/",
  status: 403,
};

const reports = [
  judgePage(page(), readerOf(NOTHING), AT),
  judgePage(page(), readerOf(FAILING), AT),
  judgePage(page(404), readerOf(FAILING), AT),
  judgePage(page(200, "application/pdf"), readerOf(FAILING), AT),
  judgePage(refused, readerOf(FAILING), AT),
];

const FORBIDDEN = /complian(?:t|ce score)/iu;

describe("the report", () => {
  it("never says compliant or compliance score, in text or JSON", () => {
    for (const report of reports) {
      expect(formatReport(report)).not.toMatch(FORBIDDEN);
      expect(
        JSON.stringify(Schema.encodeSync(ReportSchema)(report))
      ).not.toMatch(FORBIDDEN);
    }
  });

  it("always states that automated checks cover only part of WCAG and that a manual review is needed", () => {
    for (const report of reports) {
      expect(formatReport(report)).toContain(AUTOMATED_LIMIT);
    }

    expect(AUTOMATED_LIMIT).toContain("only part");
    expect(AUTOMATED_LIMIT).toContain("manual review");
  });

  it("ends with the studio9 contact, marked as a placeholder", () => {
    const [, report] = reports;

    expect(report?.contact.placeholder).toBe(true);
    expect(
      report === undefined
        ? false
        : formatReport(report).trimEnd().endsWith(report.contact.text)
    ).toBe(true);
  });

  it("runs every check on a page and reports what failed", () => {
    const [, report] = reports;

    expect(report?.outcome).toBe("checked");
    expect(report?.findings.map((finding) => finding.status)).toEqual(
      CATALOGUE.map(() => "fail")
    );
  });

  it("says a page with nothing to judge probably renders with JavaScript", () => {
    expect(reports[0]?.outcomeDetail).toContain(LOOKS_EMPTY);
    expect(reports[1]?.outcomeDetail).not.toContain(LOOKS_EMPTY);
  });

  it("gives a refused or non-HTML page no findings", () => {
    expect(reports[3]?.outcome).toBe("not_html");
    expect(reports[4]?.outcome).toBe("refused");
    expect(reports[3]?.findings).toEqual([]);
    expect(reports[4]?.findings).toEqual([]);
  });

  it("shows a criterion or clause only from a verified fact", () => {
    const verified = new Map(VERIFIED_FACTS.map((fact) => [fact.id, fact]));

    for (const report of reports) {
      for (const finding of report.findings) {
        for (const reference of finding.references) {
          expect(verified.get(reference.factId)?.value).toBe(reference.text);
        }
      }
    }
  });
});

describe("referencesOf", () => {
  const v3: Reference = { benchmark: null, citation: null, version: "V3.2.1" };
  const v4: Reference = { benchmark: null, citation: null, version: "V4.1.1" };

  it("labels a V4.1.1 clause upcoming while V3.2.1 is the reference, and the reference once V4.1.1 is cited", () => {
    for (const entry of CATALOGUE) {
      for (const reference of referencesOf(entry, v3)) {
        expect(reference.factId.startsWith("STD-EN4-")).toBe(
          reference.kind === "en-upcoming"
        );
      }

      for (const reference of referencesOf(entry, v4)) {
        expect(reference.kind).not.toBe("en-upcoming");
        expect(reference.factId.startsWith("STD-EN-9.")).toBe(false);
      }
    }
  });
});

const fact = (id: string, usedBy: string, value: string) => ({
  claim: "claim",
  excerpt: "excerpt",
  field: "other" as const,
  file: "eu.md",
  id,
  retrieved: "2026-11-03",
  source: `https://eur-lex.europa.eu/${id}`,
  usedBy,
  value,
});

describe("referenceFrom", () => {
  it("takes V3.2.1 as the reference benchmark and shows the no-citation status when no fact names a cited version", () => {
    const reference = referenceFrom([
      fact("STD-EN-5", "checks.catalogue", "V3.2.1 = WCAG 2.1"),
      fact("EU-HS-1", "report.status", "No version found cited"),
    ]);

    expect(reference.version).toBe("V3.2.1");
    expect(reference.benchmark?.factId).toBe("STD-EN-5");
    expect(reference.citation?.factId).toBe("EU-HS-1");
  });

  it("follows the version a verified citation fact names", () => {
    const reference = referenceFrom([
      fact("STD-EN-6", "checks.catalogue", "V4.1.1 = WCAG 2.2"),
      fact("EU-HS-2", "report.reference-standard", "EN 301 549 V4.1.1"),
    ]);

    expect(reference.version).toBe("V4.1.1");
    expect(reference.benchmark?.factId).toBe("STD-EN-6");
    expect(reference.citation?.factId).toBe("EU-HS-2");
  });

  it("claims nothing when no fact backs it", () => {
    expect(referenceFrom([])).toEqual({
      benchmark: null,
      citation: null,
      version: "V3.2.1",
    });
  });
});

const known = (factId: string, value: string) => ({
  factId,
  known: true as const,
  source: "https://example.eu/",
  value,
});

const UNKNOWN = { known: false as const };

const profile = (
  code: StateProfile["code"],
  law: StateProfile["fields"]["transposing-law"],
  ecommerce: StateProfile["fields"]["scope-ecommerce"]
): StateProfile => ({
  code,
  fields: {
    "applies-from": UNKNOWN,
    authority: UNKNOWN,
    "disproportionate-burden": UNKNOWN,
    "microenterprise-exemption": UNKNOWN,
    penalties: UNKNOWN,
    "scope-ecommerce": ecommerce,
    "scope-products": UNKNOWN,
    "scope-services": UNKNOWN,
    "transposing-law": law,
  },
  name: code,
});

describe("applicabilityFrom", () => {
  it("lists a state as applying only with a verified law and e-commerce in scope, and every other state as unknown", () => {
    const result = applicabilityFrom([
      profile("at", known("AT-LAW-1", "BaFG"), known("AT-EC-1", "yes")),
      profile("de", known("DE-LAW-1", "BFSG"), UNKNOWN),
      profile("cz", UNKNOWN, known("CZ-EC-1", "yes")),
      profile("fr", known("FR-LAW-1", "Loi"), known("FR-EC-1", "unclear")),
    ]);

    expect(result.applies.map((state) => state.code)).toEqual(["at"]);
    expect(result.applies[0]?.factIds).toEqual(["AT-LAW-1", "AT-EC-1"]);
    expect(result.unknown.map((state) => state.code)).toEqual([
      "de",
      "cz",
      "fr",
    ]);
  });
});
