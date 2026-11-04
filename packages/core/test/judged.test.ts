// @effect-diagnostics nodeBuiltinImport:off -- The test reads recorded page evidence and recorded model answers from disk.
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "@effect/vitest";
import { VERIFIED_FACTS } from "@good-a11y/facts";
import { Schema } from "effect";

import {
  JUDGED_CHECKS,
  JudgeReplySchema,
  REFERENCE,
  JudgedSchema,
  MAX_JUDGED_ITEMS,
  PageEvidenceSchema,
  judgedOf,
  questionsFor,
  questionsOf,
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
  questionsOf(JUDGED_CHECKS, {
    entered: page,
    rendered: null,
    statement: null,
  }).flatMap((asked) => {
    const recorded = replies.find(({ id }) => id === asked.id);

    return recorded === undefined ? [] : [{ asked, reply: recorded.reply }];
  });

const idsAskedFor = (page: PageEvidence) =>
  questionsOf(JUDGED_CHECKS, {
    entered: page,
    rendered: null,
    statement: null,
  }).map(({ id }) => id);

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

describe("link purpose", () => {
  it("does not ask about links that name another language", () => {
    const languageLinks: PageEvidence = {
      ...evidence,
      links: ["Français", "Euskara"].map((text) => ({
        context: text,
        href: "/",
        labelled: false,
        landmark: null,
        language: true,
        snippet: `<a hreflang="x" href="/">${text}</a>`,
        text,
      })),
    };

    expect(idsAskedFor(languageLinks)).not.toContain("link-purpose");
  });
});

const linkIn = (
  text: string,
  landmark: PageEvidence["links"][number]["landmark"]
) => ({
  context: "",
  href: "/",
  labelled: false,
  landmark,
  language: false,
  snippet: "<a>",
  text,
});

describe("link purpose in the page content", () => {
  it("leaves out navigation, header and footer links, asks each text once and main content first", () => {
    const page: PageEvidence = {
      ...evidence,
      links: [
        linkIn("Menu", "nav"),
        linkIn("Log in", "header"),
        linkIn("Imprint", "footer"),
        linkIn("Sidebar", "aside"),
        linkIn("More", null),
        linkIn("more", "main"),
        linkIn("Read more", "main"),
      ],
    };

    expect(
      questionsOf(JUDGED_CHECKS, {
        entered: page,
        rendered: null,
        statement: null,
      })
        .find(({ id }) => id === "link-purpose")
        ?.items.map(({ sample }) => sample)
    ).toEqual(['"more"', '"Read more"', '"Sidebar"']);
  });
});

describe("the accessibility statement against Annex V", () => {
  const statement = (text: string): PageEvidence => ({
    ...evidence,
    passages: [
      { landmark: "nav", lang: "en", text: "Shop Help Contact ".repeat(40) },
      { landmark: "main", lang: "en", text },
    ],
  });

  it("is asked only when the crawl found a statement with enough text", () => {
    expect(idsAskedFor(evidence)).not.toContain("statement-annex-v");
    expect(
      questionsOf(JUDGED_CHECKS, {
        entered: evidence,
        rendered: null,
        statement: statement("Too short."),
      }).map(({ id }) => id)
    ).not.toContain("statement-annex-v");
  });

  it("asks one question per Annex V point about the statement text outside navigation", () => {
    const asked = questionsOf(JUDGED_CHECKS, {
      entered: evidence,
      rendered: null,
      statement: statement("We sell bikes online. ".repeat(20)),
    }).find(({ id }) => id === "statement-annex-v");

    expect(asked?.items.map(({ key }) => key)).toEqual([
      "statement_1",
      "statement_2",
      "statement_3",
    ]);
    expect(asked?.request.state).not.toContain("Shop Help Contact");
  });
});

describe("checks hidden until calibrated on real pages", () => {
  it("are not asked and not reported", () => {
    expect(
      questionsFor({ entered: evidence, rendered: null, statement: null }).map(
        ({ id }) => id
      )
    ).toEqual(["link-purpose", "page-language-matches", "sells-to-consumers"]);
    expect(
      ran(judgedOf(answeredFor(evidence))).observations.map(({ id }) => id)
    ).toEqual(["link-purpose", "page-language-matches", "sells-to-consumers"]);
  });
});

describe("questionsFor", () => {
  it("asks one question per distinct item, for each judged check", () => {
    const asked = questionsOf(JUDGED_CHECKS, {
      entered: evidence,
      rendered: null,
      statement: null,
    });

    expect(asked.map(({ id }) => id)).toEqual([
      "alt-text-describes",
      "link-purpose",
      "headings-labels-describe",
      "page-language-matches",
      "sells-to-consumers",
    ]);
    expect(asked.map(({ items }) => items.length)).toEqual([4, 3, 7, 1, 1]);
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

    expect(
      questionsOf(JUDGED_CHECKS, {
        entered: many,
        rendered: null,
        statement: null,
      })[0]?.items
    ).toHaveLength(MAX_JUDGED_ITEMS);
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

    expect(
      tokensToReserve(
        questionsOf(JUDGED_CHECKS, {
          entered: evidence,
          rendered: null,
          statement: null,
        })
      )
    ).toBeGreaterThanOrEqual(used);
  });
});

describe("judgedOf", () => {
  const judged = judgedOf(answeredFor(evidence), REFERENCE, JUDGED_CHECKS);

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
      ran(judgedOf(unanswered, REFERENCE, JUDGED_CHECKS)).observations.every(
        ({ noted }) => noted === 0
      )
    ).toBe(true);
  });

  it("sums the input tokens the model counted", () => {
    expect(ran(judged).inputTokens).toBe(3123);
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

    const judged = withJudged(
      report,
      judgedOf(answeredFor(evidence), REFERENCE, JUDGED_CHECKS)
    );

    expect(judged.findings).toEqual(report.findings);
    expect(judged.headline).toBe(report.headline);
    expect(judged.verdict).toEqual(report.verdict);
    expect(judged.judged?.status).toBe("ran");
  });
});
