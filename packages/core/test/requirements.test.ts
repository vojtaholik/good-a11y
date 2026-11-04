import type { VerifiedFact } from "@eaa-check/facts";
import { describe, expect, it } from "@effect/vitest";

import {
  EAA_ROWS,
  checklistGroups,
  citationOf,
  eaaRowsFrom,
  formatReport,
  judgePage,
  requirementsOf,
  withJudged,
} from "../src/index.js";
import type {
  FetchResult,
  PageEvidence,
  Report,
  RequirementStatus,
} from "../src/index.js";

const AT = "2026-11-04T08:00:00.000Z";

const EVIDENCE: PageEvidence = {
  buttons: [],
  controls: [],
  frames: [],
  headings: [],
  images: [
    {
      alt: null,
      file: "a.png",
      kind: "img",
      labelled: false,
      presentational: false,
      snippet: '<img src="a.png">',
    },
  ],
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
  finalUrl: "https://example.com/",
  headers: {},
  observedAt: AT,
  ok: true,
  redirects: [],
  requestedUrl: "https://example.com/",
  status: 200,
  truncated: false,
};

const report = judgePage(PAGE, { read: () => EVIDENCE }, AT);

const statusOf = (
  scanned: Report,
  key: string
): RequirementStatus | undefined =>
  requirementsOf(scanned).find((row) => row.key === key)?.status;

const fact = (id: string, usedBy: string, value: string): VerifiedFact => ({
  claim: value,
  excerpt: value,
  field: "other",
  file: "eu.md",
  id,
  retrieved: "2026-11-04",
  source: `https://eur-lex.europa.eu/${id}`,
  usedBy,
  value,
});

const observed = (scanned: Report) =>
  withJudged(scanned, {
    inputTokens: 1,
    label: "Judged by a model",
    model: "model",
    observations: [
      {
        about: "about",
        asked: 3,
        id: "link-purpose",
        noted: 1,
        notes: [{ confidence: 0.9, sample: "more" }],
        relatesTo: [
          {
            factId: "STD-SC-2.4.4",
            kind: "wcag",
            source: "https://www.w3.org/TR/WCAG21/#link-purpose-in-context",
            text: "2.4.4 Link Purpose (In Context) (Level A)",
          },
        ],
        title: "Links whose purpose may be unclear",
      },
    ],
    status: "ran",
  });

describe("the requirement checklist", () => {
  it("marks a criterion with a failing check as failing and one whose check found nothing as no failure found", () => {
    expect(statusOf(report, "1.1.1")).toBe("fails");
    expect(statusOf(report, "3.1.1")).toBe("no_failure");
  });

  it("says a criterion only the rendered page tests was not checked on a scan without it, and one with no automated test needs a person", () => {
    expect(statusOf(report, "1.4.3")).toBe("not_checked");
    expect(statusOf(report, "2.3.1")).toBe("needs_person");
  });

  it("says nothing to check, not no failure found, for a criterion whose checks found no item, and counts it as left for a person", () => {
    expect(statusOf(report, "2.2.1")).toBe("nothing_to_check");
    expect(statusOf(report, "2.4.4")).toBe("nothing_to_check");
    expect(report.coverage?.criteria).toBe(
      requirementsOf(report).filter(
        (row) =>
          row.group === "wcag" &&
          !row.newer &&
          (row.status === "fails" || row.status === "no_failure")
      ).length
    );
  });

  it("shows 4.1.1 as always met by HTML, from STD-WCAG21-2, and leaves it out of the criteria left for a person", () => {
    const row = requirementsOf(report).find((item) => item.key === "4.1.1");

    expect(row?.status).toBe("always_met");
    expect(row?.noteFact?.factId).toBe("STD-WCAG21-2");
    expect(report.verdict?.settled).toBe(1);
    expect(report.verdict?.needPerson).toBe(
      (report.coverage?.ofCriteria ?? 0) - (report.coverage?.criteria ?? 0) - 1
    );
  });

  it("puts the verified basis of the accessibility information above its Annex V rows", () => {
    const statement = checklistGroups(requirementsOf(report)).find(
      (group) => group.key === "statement"
    );

    expect(statement?.basis.map((value) => value.factId)).toContain(
      "EU-STMT-2"
    );
    expect(formatReport(report)).toContain("Basis: ");
  });

  it("has one row for every WCAG 2.1 A and AA criterion, and labels the WCAG 2.2 additions newer", () => {
    const rows = requirementsOf(report).filter((row) => row.group === "wcag");

    expect(rows.filter((row) => !row.newer)).toHaveLength(50);
    expect(rows.find((row) => row.key === "2.5.8")?.newer).toBe(true);
  });

  it("marks a criterion no check decided as judged when a shown model observation relates to it, never as failing", () => {
    const judged = observed(report);

    expect(statusOf(judged, "2.4.4")).toBe("judged");
    expect(judged.verdict).toEqual(report.verdict);
  });

  it("keeps a deterministic status when a model also judged the criterion, and shows the model's note under it", () => {
    const linked = judgePage(
      PAGE,
      {
        read: () => ({
          ...EVIDENCE,
          links: [
            {
              context: "",
              href: "/sale",
              labelled: false,
              landmark: null,
              language: false,
              snippet: '<a href="/sale">Sale</a>',
              text: "Sale",
            },
          ],
        }),
      },
      AT
    );

    const row = requirementsOf(observed(linked)).find(
      (item) => item.key === "2.4.4"
    );

    expect(row?.status).toBe("no_failure");
    expect(row?.judged).toContain("Judged by a model, not counted:");
  });

  it("builds the EAA rows only from the facts it is given, with Annex citations and their non-binding examples", () => {
    const rows = eaaRowsFrom([
      fact("EU-X-2", "eaa.requirement.III-b-ii", "Understandable"),
      fact("EU-X-1", "eaa.requirement.III-b-i", "More than one channel"),
      fact("EU-X-3", "eaa.statement.2", "How the service operates"),
      fact("EU-X-4", "eaa.example.III-b-i", "Say it in text and sound"),
      fact("EU-X-5", "eaa.statement-basis.where", "Terms and conditions"),
    ]);

    expect(rows.map((row) => row.citation)).toEqual([
      "Annex I, Section III (b)(i)",
      "Annex I, Section III (b)(ii)",
      "Art. 13 and Annex V, point 1(b)",
    ]);
    expect(rows[0]?.example?.factId).toBe("EU-X-4");
    expect(rows.every((row) => row.status === "needs_person")).toBe(true);
  });

  it("cites Annex I points without inventing ones it cannot parse", () => {
    expect(citationOf("IV-g-iii")).toBe("Annex I, Section IV (g)(iii)");
    expect(citationOf("III-d")).toBe("Annex I, Section III (d)");
    expect(citationOf("odd")).toBe("odd");
  });

  it("lists the checklist in the CLI report after the issues, with each row's fact", () => {
    const text = formatReport(report);

    expect(text.indexOf("Requirement checklist")).toBeGreaterThan(
      text.indexOf("Issues (")
    );
    expect(text).toContain("(STD-SC-1.1.1)");

    for (const row of EAA_ROWS) {
      expect(text).toContain(`(${row.requirement.factId})`);
    }
  });
});
