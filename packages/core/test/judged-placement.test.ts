import { describe, expect, it } from "@effect/vitest";

import {
  DOES_NOT_SELL,
  SELLS,
  notSellingBasis,
  formatReport,
  judgePage,
  requirementsOf,
  sectionObservations,
  sellsLine,
  withJudged,
} from "../src/index.js";
import type { FetchResult, Observation, PageEvidence } from "../src/index.js";

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

const checked = judgePage(PAGE, { read: () => EVIDENCE }, AT);

const observation = (
  id: Observation["id"],
  asked: number,
  notes: Observation["notes"]
): Observation => ({
  about: "about",
  asked,
  id,
  noted: notes.length,
  notes,
  relatesTo: [],
  title: id,
});

const judgedWith = (observations: readonly Observation[]) =>
  withJudged(checked, {
    inputTokens: 1,
    label: "Judged by a model",
    model: "model",
    observations,
    status: "ran",
  });

const report = judgedWith([
  observation("sells-to-consumers", 1, [
    { confidence: 0.92, item: "sells", sample: SELLS },
  ]),
  observation("statement-annex-v", 3, [
    { confidence: 0.88, item: "statement_2", sample: "Annex V 1(b)" },
  ]),
  observation("link-purpose", 2, []),
]);

const statementRows = (scanned: typeof report) =>
  requirementsOf(scanned).filter((row) => row.group === "statement");

describe("placing judged observations", () => {
  it("shows the model's scope answer beside the states and never changes them", () => {
    expect(sellsLine(report)).toBe(
      `Judged by a model (Cloudflare Clef), not used for the list of states: ${SELLS} Model confidence 92%.`
    );
    expect(report.applicability).toEqual(checked.applicability);
    expect(formatReport(report)).toContain(SELLS);
    expect(sellsLine(checked)).toBeNull();
    expect(notSellingBasis(report)).toBeNull();
  });

  it("adds the sourced e-commerce definition when the model says the site does not sell to consumers", () => {
    const notSelling = judgedWith([
      observation("sells-to-consumers", 1, [
        { confidence: 0.99, item: "sells", sample: DOES_NOT_SELL },
      ]),
    ]);

    expect(notSellingBasis(notSelling)?.factId).toBe("EU-DEF-1");
    expect(notSelling.applicability).toEqual(checked.applicability);
    expect(formatReport(notSelling)).toContain(
      "If the model is right, the EAA's e-commerce rules may not apply to this site"
    );
    expect(formatReport(notSelling)).toContain("(EU-DEF-1)");
  });

  it("marks only the Annex V points the model judged missing, and leaves the others with a person", () => {
    const rows = statementRows(report);

    expect(rows.map((row) => [row.key, row.status])).toEqual([
      ["statement-1", "needs_person"],
      ["statement-2", "judged"],
      ["statement-3", "needs_person"],
    ]);
    expect(rows.find((row) => row.key === "statement-2")?.judged).toBe(
      "Judged by a model, not counted: the model judged this point missing from the statement (confidence 88%)"
    );
    expect(rows.find((row) => row.key === "statement-1")?.judged).toBeNull();
  });

  it("leaves the Annex V rows with a person when no statement was read", () => {
    const unread = judgedWith([observation("statement-annex-v", 0, [])]);

    expect(statementRows(unread).map((row) => row.status)).toEqual(
      statementRows(checked).map(() => "needs_person")
    );
  });

  it("keeps placed observations out of the judged section", () => {
    expect(sectionObservations(report).map((item) => item.id)).toEqual([
      "link-purpose",
    ]);
  });
});
