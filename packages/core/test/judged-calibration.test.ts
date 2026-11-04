// @effect-diagnostics nodeBuiltinImport:off -- The test reads the labelled calibration set and recorded model answers from disk.
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "@effect/vitest";
import { Schema } from "effect";

import { JUDGED_CHECKS, JudgeReplySchema, questionsOf } from "../src/index.js";
import type { JudgedId, PageEvidence } from "../src/index.js";

const fixture = (name: string): string =>
  readFileSync(path.join(import.meta.dirname, "fixtures", name), "utf-8");

const Labelled = Schema.Struct({ bad: Schema.Boolean });

const Items = Schema.fromJsonString(
  Schema.Struct({
    alt: Schema.Array(
      Schema.Struct({
        alt: Schema.String,
        file: Schema.String,
        ...Labelled.fields,
      })
    ),
    headings: Schema.Array(
      Schema.Struct({ text: Schema.String, ...Labelled.fields })
    ),
    labels: Schema.Array(
      Schema.Struct({ text: Schema.String, ...Labelled.fields })
    ),
    language: Schema.Array(
      Schema.Struct({
        lang: Schema.String,
        text: Schema.String,
        ...Labelled.fields,
      })
    ),
    links: Schema.Array(
      Schema.Struct({
        context: Schema.String,
        text: Schema.String,
        ...Labelled.fields,
      })
    ),
  })
);

const Replies = Schema.fromJsonString(
  Schema.Struct({
    batches: Schema.Array(
      Schema.Struct({ id: Schema.String, reply: JudgeReplySchema })
    ),
    language: Schema.Array(
      Schema.Struct({ reply: JudgeReplySchema, text: Schema.String })
    ),
  })
);

const items = Schema.decodeUnknownSync(Items)(
  fixture("judged-calibration-items.json")
);

const replies = Schema.decodeUnknownSync(Replies)(
  fixture("judged-calibration-replies.json")
);

const EMPTY: PageEvidence = {
  buttons: [],
  controls: [],
  frames: [],
  headings: [],
  images: [],
  labelTargets: [],
  labels: [],
  lang: null,
  links: [],
  passages: [],
  prices: [],
  refreshes: [],
  search: false,
  structuredTypes: [],
  textSample: "",
  title: null,
  truncated: false,
  viewports: [],
};

const spread = (count: number): number[] =>
  Array.from({ length: count }, (_, index) => index).toSorted(
    (left, right) => ((left * 7) % count) - ((right * 7) % count)
  );

const chunks = (indexes: readonly number[], size: number): number[][] =>
  Array.from({ length: Math.ceil(indexes.length / size) }, (_, index) =>
    indexes.slice(index * size, index * size + size)
  );

interface Judgement {
  readonly bad: boolean;
  readonly noted: boolean;
}

const judge = (
  id: JudgedId,
  evidence: PageEvidence,
  labels: readonly boolean[],
  reply: typeof JudgeReplySchema.Type
): Judgement[] => {
  const asked = questionsOf(JUDGED_CHECKS, evidence).find(
    (each) => each.id === id
  );

  const check = JUDGED_CHECKS.find((each) => each.id === id);

  if (asked === undefined || check === undefined) {
    throw new Error(`${id} asked nothing for a calibration batch`);
  }

  expect(asked.items).toHaveLength(labels.length);

  const notes = check.decide(asked, reply).map(({ sample }) => sample);

  return asked.items.map(({ sample }, index) => ({
    bad: labels[index] ?? false,
    noted: notes.some(
      (note) => note === sample || note.startsWith(`${sample}, `)
    ),
  }));
};

const replyAt = (index: number, id: JudgedId) => {
  const batch = replies.batches[index];

  if (batch?.id !== id) {
    throw new Error(`recorded batch ${index} is not ${id}`);
  }

  return batch.reply;
};

const altBatches = chunks(spread(items.alt.length), 20);

const linkBatches = chunks(spread(items.links.length), 20);

const headingBatches = chunks(spread(items.headings.length), 12);

const labelBatches = chunks(spread(items.labels.length), 8);

const judgements: Partial<Record<JudgedId, Judgement[]>> = {
  "alt-text-describes": altBatches.flatMap((indexes, batch) =>
    judge(
      "alt-text-describes",
      {
        ...EMPTY,
        images: indexes.map((index) => ({
          alt: items.alt[index]?.alt ?? null,
          file: items.alt[index]?.file ?? null,
          kind: "img" as const,
          labelled: false,
          presentational: false,
          snippet: "<img>",
        })),
      },
      indexes.map((index) => items.alt[index]?.bad ?? false),
      replyAt(batch, "alt-text-describes")
    )
  ),
  "headings-labels-describe": headingBatches.flatMap((indexes, batch) => {
    const labelIndexes = labelBatches[batch] ?? [];

    return judge(
      "headings-labels-describe",
      {
        ...EMPTY,
        headings: indexes.map((index) => ({
          level: 2,
          text: items.headings[index]?.text ?? "",
        })),
        labels: labelIndexes.map((index) => items.labels[index]?.text ?? ""),
      },
      [
        ...indexes.map((index) => items.headings[index]?.bad ?? false),
        ...labelIndexes.map((index) => items.labels[index]?.bad ?? false),
      ],
      replyAt(
        altBatches.length + linkBatches.length + batch,
        "headings-labels-describe"
      )
    );
  }),
  "page-language-matches": items.language.flatMap(({ bad, lang, text }) => {
    const recorded = replies.language.find((each) => each.text === text);

    if (recorded === undefined) {
      throw new Error(`no recorded answer for ${text.slice(0, 30)}`);
    }

    return judge(
      "page-language-matches",
      { ...EMPTY, lang, textSample: text },
      [bad],
      recorded.reply
    );
  }),
};

const scoreOf = (results: readonly Judgement[]) => {
  const noted = results.filter((result) => result.noted);
  const bad = results.filter((result) => result.bad);
  const caught = noted.filter((result) => result.bad).length;

  return {
    precision: noted.length === 0 ? 0 : caught / noted.length,
    recall: bad.length === 0 ? 0 : caught / bad.length,
  };
};

describe("judged check calibration on the hand-written set", () => {
  it.each(Object.entries(judgements))(
    "%s notes with precision of at least 0.9 at its threshold",
    (_id, results) => {
      expect(scoreOf(results).precision).toBeGreaterThanOrEqual(0.9);
    }
  );

  it("reports the recall recorded in docs/judged-checks.md", () => {
    expect(
      Object.fromEntries(
        Object.entries(judgements).map(([id, results]) => {
          const { precision, recall } = scoreOf(results);

          return [
            id,
            { precision: precision.toFixed(2), recall: recall.toFixed(2) },
          ];
        })
      )
    ).toEqual({
      "alt-text-describes": { precision: "1.00", recall: "1.00" },
      "headings-labels-describe": { precision: "1.00", recall: "0.96" },
      "page-language-matches": { precision: "1.00", recall: "1.00" },
    });
  });
});
