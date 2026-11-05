import { describe, expect, it } from "@effect/vitest";
import type { VerifiedFact } from "@good-a11y/facts";

import { WCAG3_DRAFT_FACT, wcag3ReferencesFor } from "../src/index.js";

const fact = (id: string, usedBy: string, value: string): VerifiedFact => ({
  claim: value,
  excerpt: value,
  field: "other",
  file: "wcag3.md",
  id,
  retrieved: "2026-11-05",
  source: `https://www.w3.org/TR/2026/WD-wcag-3.0-20260910/#${id}`,
  usedBy,
  value,
});

const DRAFT = fact(
  WCAG3_DRAFT_FACT,
  "report.standard",
  "WCAG 3.0, W3C Working Draft 10 September 2026"
);

const TITLE = fact(
  "STD-W3-PAGE-VIEW-TITLE-AVAILABLE-1",
  "checks.document-title.wcag3, checks.title-generic.wcag3",
  "2.7.2.1 Page/view title available (core requirement)"
);

const LANGUAGE = fact(
  "STD-W3-HUMAN-LANGUAGE-DETECTABLE-1",
  "checks.html-lang.wcag3",
  "2.2.2.2 Human language detectable (core requirement)"
);

describe("WCAG 3 draft references", () => {
  it("names the verified requirements keyed to the check, as wcag3-draft references", () => {
    expect(
      wcag3ReferencesFor("title-generic", [DRAFT, TITLE, LANGUAGE])
    ).toEqual([
      {
        factId: TITLE.id,
        kind: "wcag3-draft",
        source: TITLE.source,
        text: TITLE.value,
      },
    ]);
  });

  it("shows nothing while the draft's own fact is not verified, since the line needs its date", () => {
    expect(wcag3ReferencesFor("document-title", [TITLE, LANGUAGE])).toEqual([]);
  });

  it("shows nothing for a check no verified requirement is keyed to", () => {
    expect(wcag3ReferencesFor("frame-title", [DRAFT, TITLE, LANGUAGE])).toEqual(
      []
    );
  });

  it("matches whole keys, so a check id that is a prefix of another is not mixed up", () => {
    expect(
      wcag3ReferencesFor("title", [
        DRAFT,
        fact("STD-W3-X-1", "checks.title-generic.wcag3", "x"),
      ])
    ).toEqual([]);
  });
});
