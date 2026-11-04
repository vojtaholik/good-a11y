// @effect-diagnostics nodeBuiltinImport:off -- The test reads the real labelled items and recorded model answers from disk.
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "@effect/vitest";
import { Schema } from "effect";

import { JUDGED_CHECKS, JudgeReplySchema, questionsOf } from "../src/index.js";
import type { JudgedId, PageEvidence } from "../src/index.js";

const fixture = (name: string): string =>
  readFileSync(path.join(import.meta.dirname, "fixtures", name), "utf-8");

const Labelled = Schema.Struct({ bad: Schema.Boolean, site: Schema.String });

const Text = Schema.Struct({ text: Schema.String, ...Labelled.fields });

const Items = Schema.fromJsonString(
  Schema.Struct({
    alt: Schema.Array(
      Schema.Struct({
        alt: Schema.String,
        file: Schema.String,
        ...Labelled.fields,
      })
    ),
    headings: Schema.Array(Text),
    labels: Schema.Array(Text),
  })
);

const Replies = Schema.fromJsonString(
  Schema.Struct({
    replies: Schema.Array(
      Schema.Struct({ key: Schema.String, reply: JudgeReplySchema })
    ),
  })
);

const items = Schema.decodeUnknownSync(Items)(
  fixture("judged-real-items.json")
);

const replies = Schema.decodeUnknownSync(Replies)(
  fixture("judged-real-replies.json")
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
  refreshes: [],
  search: false,
  structuredTypes: [],
  textSample: "",
  title: null,
  truncated: false,
  viewports: [],
};

interface Judgement {
  readonly bad: boolean;
  readonly noted: boolean;
  readonly sample: string;
}

const judge = (
  id: JudgedId,
  site: string,
  evidence: PageEvidence,
  labels: readonly boolean[]
): Judgement[] => {
  const asked = questionsOf(JUDGED_CHECKS, evidence).find(
    (each) => each.id === id
  );

  const check = JUDGED_CHECKS.find((each) => each.id === id);
  const recorded = replies.replies.find((each) => each.key === `${id}:${site}`);

  if (asked === undefined || check === undefined || recorded === undefined) {
    throw new Error(`${id} has no recorded batch for ${site}`);
  }

  expect(asked.items).toHaveLength(labels.length);

  const notes = check.decide(asked, recorded.reply).map(({ sample }) => sample);

  return asked.items.map(({ sample }, index) => ({
    bad: labels[index] ?? false,
    noted: notes.some(
      (note) => note === sample || note.startsWith(`${sample}, `)
    ),
    sample,
  }));
};

const sitesOf = (list: readonly { readonly site: string }[]): string[] =>
  [...new Set(list.map(({ site }) => site))].toSorted();

const altJudgements = sitesOf(items.alt).flatMap((site) => {
  const alts = items.alt.filter((each) => each.site === site);

  return judge(
    "alt-text-describes",
    site,
    {
      ...EMPTY,
      images: alts.map(({ alt, file }) => ({
        alt,
        file,
        kind: "img" as const,
        labelled: false,
        presentational: false,
        snippet: "<img>",
      })),
    },
    alts.map(({ bad }) => bad)
  );
});

const headingJudgements = sitesOf([...items.headings, ...items.labels]).flatMap(
  (site) => {
    const headings = items.headings.filter((each) => each.site === site);
    const labels = items.labels.filter((each) => each.site === site);

    return judge(
      "headings-labels-describe",
      site,
      {
        ...EMPTY,
        headings: headings.map(({ text }) => ({ level: 2, text })),
        labels: labels.map(({ text }) => text),
      },
      [...headings, ...labels].map(({ bad }) => bad)
    );
  }
);

const scoreOf = (results: readonly Judgement[]) => {
  const noted = results.filter((result) => result.noted);
  const bad = results.filter((result) => result.bad);
  const caught = noted.filter((result) => result.bad).length;

  return {
    bad: bad.length,
    caught,
    items: results.length,
    noted: noted.length,
  };
};

const precisionOf = (results: readonly Judgement[]): number => {
  const { caught, noted } = scoreOf(results);

  return noted === 0 ? 0 : caught / noted;
};

const real = {
  "alt-text-describes": altJudgements,
  "headings-labels-describe": headingJudgements,
};

describe("hidden judged checks on real labelled items", () => {
  it("scores what docs/judged-checks.md records", () => {
    expect({
      "alt-text-describes": scoreOf(altJudgements),
      "headings-labels-describe": scoreOf(headingJudgements),
    }).toEqual({
      "alt-text-describes": { bad: 7, caught: 1, items: 50, noted: 4 },
      "headings-labels-describe": { bad: 2, caught: 2, items: 56, noted: 12 },
    });
  });

  it.each(Object.entries(real))(
    "%s is shown only with a real-item precision of at least 0.9",
    (id, results) => {
      const check = JUDGED_CHECKS.find((each) => each.id === id);

      expect(check?.shown).toBe(precisionOf(results) >= 0.9);
    }
  );
});
