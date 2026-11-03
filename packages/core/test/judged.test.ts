// @effect-diagnostics nodeBuiltinImport:off -- The test reads recorded page evidence and recorded model answers from disk.
import { readFileSync } from "node:fs";
import path from "node:path";

import { VERIFIED_FACTS } from "@eaa-check/facts";
import { describe, expect, it } from "@effect/vitest";
import { Schema } from "effect";

import {
  JudgeReplySchema,
  JudgedSchema,
  MAX_JUDGED_ITEMS,
  PageEvidenceSchema,
  judgedOf,
  questionsFor,
  reportOf,
  runChecks,
  tokensToReserve,
  withJudged,
} from "../src/index.js";
import type { Answered, Judged, JudgedId, PageEvidence } from "../src/index.js";

const fixture = (name: string): string =>
  readFileSync(path.join(import.meta.dirname, "fixtures", name), "utf-8");

const evidence: PageEvidence = Schema.decodeUnknownSync(
  Schema.fromJsonString(PageEvidenceSchema)
)(fixture("judged-evidence.json"));

const Recorded = Schema.fromJsonString(
  Schema.Struct({
    replies: Schema.Array(
      Schema.Struct({ id: Schema.String, reply: JudgeReplySchema })
    ),
  })
);

const { replies } = Schema.decodeUnknownSync(Recorded)(
  fixture("judged-replies.json")
);

const answeredFor = (page: PageEvidence): Answered[] =>
  questionsFor(page).flatMap((asked) => {
    const recorded = replies.find(({ id }) => id === asked.id);

    return recorded === undefined ? [] : [{ asked, reply: recorded.reply }];
  });

const idsAskedFor = (page: PageEvidence) =>
  questionsFor(page).map(({ id }) => id);

const ran = (judged: Judged) => {
  if (judged.status !== "ran") {
    throw new Error(`expected the judged step to run, got ${judged.reason}`);
  }

  return judged;
};

const notesOf = (judged: Judged, id: JudgedId) =>
  ran(judged)
    .observations.find((observation) => observation.id === id)
    ?.notes.map(({ sample }) => sample);

describe("questionsFor", () => {
  it("asks one question per distinct item, for each judged check", () => {
    const asked = questionsFor(evidence);

    expect(asked.map(({ id }) => id)).toEqual([
      "alt-text-describes",
      "link-purpose",
      "headings-labels-describe",
      "page-language-matches",
    ]);
    expect(asked.map(({ items }) => items.length)).toEqual([4, 6, 7, 1]);
  });

  it("caps the items asked about per check", () => {
    const many: PageEvidence = {
      ...evidence,
      images: Array.from({ length: 50 }, (_, index) => ({
        alt: `Photo of product ${index}`,
        file: `product-${index}.jpg`,
        kind: "img" as const,
        labelled: false,
        presentational: false,
        snippet: "<img>",
      })),
    };

    expect(questionsFor(many)[0]?.items).toHaveLength(MAX_JUDGED_ITEMS);
  });

  it("asks nothing about a page language it cannot compare", () => {
    expect(idsAskedFor({ ...evidence, lang: null })).not.toContain(
      "page-language-matches"
    );
    expect(
      idsAskedFor({ ...evidence, textSample: "Too short." })
    ).not.toContain("page-language-matches");
  });

  it("reserves at least the tokens the model counted", () => {
    const used = replies.reduce(
      (total, { reply }) => total + reply.usage.input_tokens,
      0
    );

    expect(tokensToReserve(questionsFor(evidence))).toBeGreaterThanOrEqual(
      used
    );
  });
});

describe("judgedOf", () => {
  const judged = judgedOf(answeredFor(evidence));

  it("notes only items the model answered no for with high confidence", () => {
    expect(notesOf(judged, "alt-text-describes")).toEqual([
      'alt="IMG_2041.jpg" (file IMG_2041.jpg)',
      'alt="image" (file hero-banner.png)',
    ]);
    expect(notesOf(judged, "link-purpose")).toEqual(['"More" in "More"']);
    expect(notesOf(judged, "headings-labels-describe")).toEqual([
      'h2 "Section 1"',
      'h3 "Untitled"',
      'label "Field 2"',
    ]);
    expect(notesOf(judged, "page-language-matches")).toEqual([
      'lang="de", text reads as English',
    ]);
  });

  it("carries the model's confidence on each note", () => {
    const [note] =
      ran(judged).observations.find(({ id }) => id === "alt-text-describes")
        ?.notes ?? [];

    expect(note?.confidence).toBe(0.96);
  });

  it("relates observations only to verified facts", () => {
    const verified = new Set(VERIFIED_FACTS.map(({ id }) => id));

    for (const observation of ran(judged).observations) {
      for (const { factId } of observation.relatesTo) {
        expect(verified.has(factId)).toBe(true);
      }
    }
  });

  it("notes nothing for a question the model left unanswered", () => {
    const unanswered = answeredFor(evidence).map(({ asked, reply }) => ({
      asked,
      reply: { ...reply, answers: {} },
    }));

    expect(
      ran(judgedOf(unanswered)).observations.every(({ noted }) => noted === 0)
    ).toBe(true);
  });

  it("sums the input tokens the model counted", () => {
    expect(ran(judged).inputTokens).toBe(3114);
  });

  it("round-trips through the report schema", () => {
    const encoded = Schema.encodeSync(JudgedSchema)(judged);

    expect(Schema.decodeUnknownSync(JudgedSchema)(encoded)).toEqual(judged);
  });
});

describe("withJudged", () => {
  it("never changes the findings or the headline", () => {
    const report = reportOf(
      {
        finalUrl: "https://example.com/",
        httpStatus: 200,
        outcome: "checked",
        outcomeDetail: "The checks ran on the HTML the page sent.",
        requestedUrl: "https://example.com/",
        scannedAt: "2026-11-03T00:00:00.000Z",
        truncated: false,
      },
      runChecks(evidence)
    );

    const judged = withJudged(report, judgedOf(answeredFor(evidence)));

    expect(judged.findings).toEqual(report.findings);
    expect(judged.headline).toBe(report.headline);
    expect(judged.judged?.status).toBe("ran");
  });
});
