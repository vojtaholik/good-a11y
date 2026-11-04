// @effect-diagnostics nodeBuiltinImport:off -- The test reads the real labelled items and recorded model answers from disk.
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "@effect/vitest";
import { Schema } from "effect";

import {
  ForeignBlocksSchema,
  JUDGED_CHECKS,
  JudgeReplySchema,
  VisualHeadingsSchema,
  questionsOf,
} from "../src/index.js";
import type { JudgedId, PageEvidence, RenderedEvidence } from "../src/index.js";

const Headings = Schema.fromJsonString(
  Schema.Struct({
    replies: Schema.Array(
      Schema.Struct({ key: Schema.String, reply: JudgeReplySchema })
    ),
    sites: Schema.Array(
      Schema.Struct({
        labels: Schema.Array(Schema.NullOr(Schema.Boolean)),
        set: Schema.Literals(["design", "holdout"]),
        site: Schema.String,
        visualHeadings: VisualHeadingsSchema,
      })
    ),
  })
);

const fixture = (name: string): string =>
  readFileSync(path.join(import.meta.dirname, "fixtures", name), "utf-8");

const headings = Schema.decodeUnknownSync(Headings)(
  fixture("judged-round3-headings.json")
);

const Passages = Schema.fromJsonString(
  Schema.Struct({
    replies: Schema.Array(
      Schema.Struct({ key: Schema.String, reply: JudgeReplySchema })
    ),
    sites: Schema.Array(
      Schema.Struct({
        foreignBlocks: ForeignBlocksSchema,
        labels: Schema.Array(Schema.NullOr(Schema.Boolean)),
        set: Schema.Literals(["design", "holdout"]),
        site: Schema.String,
      })
    ),
  })
);

const passages = Schema.decodeUnknownSync(Passages)(
  fixture("judged-round3-passages.json")
);

const NO_RENDERED: RenderedEvidence = {
  emptySubmits: null,
  foreignBlocks: null,
  formInstructions: null,
  visualHeadings: null,
};

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

interface Labelled {
  readonly labels: readonly (boolean | null)[];
  readonly rendered: RenderedEvidence;
  readonly set: "design" | "holdout";
  readonly site: string;
}

const judgementsOf = (
  id: JudgedId,
  itemKey: string,
  labelled: readonly Labelled[],
  replies: readonly {
    readonly key: string;
    readonly reply: typeof JudgeReplySchema.Type;
  }[],
  set: "design" | "holdout"
) => {
  const check = JUDGED_CHECKS.find((each) => each.id === id);

  return labelled
    .filter((site) => site.set === set)
    .flatMap(({ labels, rendered, site }) => {
      const asked = questionsOf(JUDGED_CHECKS, {
        entered: EMPTY,
        rendered,
        statement: null,
      }).find((each) => each.id === id);

      const recorded = replies.find(({ key }) => key === `${id}:${site}`);

      if (
        asked === undefined ||
        recorded === undefined ||
        check === undefined
      ) {
        throw new Error(`${id} has no recorded batch for ${site}`);
      }

      expect(asked.items).toHaveLength(labels.length);

      const noted = new Set(
        check.decide(asked, recorded.reply).map(({ item }) => item)
      );

      return labels.flatMap((bad, index) =>
        bad === null
          ? []
          : [{ bad, noted: noted.has(`${itemKey}_${index + 1}`) }]
      );
    });
};

const headingSites: readonly Labelled[] = headings.sites.map(
  ({ labels, set, site, visualHeadings }) => ({
    labels,
    rendered: { ...NO_RENDERED, visualHeadings },
    set,
    site,
  })
);

const passageSites: readonly Labelled[] = passages.sites.map(
  ({ foreignBlocks, labels, set, site }) => ({
    labels,
    rendered: { ...NO_RENDERED, foreignBlocks },
    set,
    site,
  })
);

const headingJudgements = (set: "design" | "holdout") =>
  judgementsOf(
    "visual-headings-marked",
    "text",
    headingSites,
    headings.replies,
    set
  );

const passageJudgements = (set: "design" | "holdout") =>
  judgementsOf(
    "passage-language-marked",
    "block",
    passageSites,
    passages.replies,
    set
  );

const scoreOf = (results: readonly { bad: boolean; noted: boolean }[]) => {
  const noted = results.filter((result) => result.noted);

  return {
    bad: results.filter((result) => result.bad).length,
    caught: noted.filter((result) => result.bad).length,
    items: results.length,
    noted: noted.length,
  };
};

const shownIff = (
  id: JudgedId,
  results: readonly { bad: boolean; noted: boolean }[]
) => {
  const { caught, noted } = scoreOf(results);

  expect(JUDGED_CHECKS.find((each) => each.id === id)?.shown).toBe(
    noted > 0 && caught / noted >= 0.9
  );
};

describe("rendered judged questions on the round 3 real labelled items", () => {
  it("score what docs/judged-checks.md records, on the design set and the holdout", () => {
    expect({
      headings: {
        design: scoreOf(headingJudgements("design")),
        holdout: scoreOf(headingJudgements("holdout")),
      },
      passages: {
        design: scoreOf(passageJudgements("design")),
        holdout: scoreOf(passageJudgements("holdout")),
      },
    }).toEqual({
      headings: {
        design: { bad: 140, caught: 74, items: 381, noted: 74 },
        holdout: { bad: 17, caught: 16, items: 38, noted: 16 },
      },
      passages: {
        design: { bad: 37, caught: 35, items: 106, noted: 35 },
        holdout: { bad: 33, caught: 32, items: 88, noted: 32 },
      },
    });
  });

  it("are shown only with a holdout precision of at least 0.9", () => {
    shownIff("visual-headings-marked", headingJudgements("holdout"));
    shownIff("passage-language-marked", passageJudgements("holdout"));
  });
});
