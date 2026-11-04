// @effect-diagnostics nodeBuiltinImport:off -- The test reads the real labelled items and recorded model answers from disk.
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "@effect/vitest";
import { Schema } from "effect";

import {
  DOES_NOT_SELL,
  JUDGED_CHECKS,
  JudgeReplySchema,
  SELLS,
  questionsOf,
} from "../src/index.js";
import type { JudgedId, PageEvidence } from "../src/index.js";

const fixture = (name: string): string =>
  readFileSync(path.join(import.meta.dirname, "fixtures", name), "utf-8");

const Label = Schema.NullOr(Schema.Boolean);

const Items = Schema.fromJsonString(
  Schema.Struct({
    language: Schema.Array(
      Schema.Struct({
        bad: Schema.Boolean,
        lang: Schema.String,
        site: Schema.String,
        textSample: Schema.String,
      })
    ),
    links: Schema.Array(
      Schema.Struct({
        items: Schema.Array(
          Schema.Struct({
            bad: Label,
            context: Schema.String,
            landmark: Schema.NullOr(
              Schema.Literals(["nav", "header", "footer", "main", "aside"])
            ),
            text: Schema.String,
          })
        ),
        site: Schema.String,
      })
    ),
    scope: Schema.Array(
      Schema.Struct({
        links: Schema.Array(
          Schema.Struct({ href: Schema.String, text: Schema.String })
        ),
        prices: Schema.Array(Schema.String),
        sells: Schema.Boolean,
        site: Schema.String,
        structuredTypes: Schema.Array(Schema.String),
        textSample: Schema.String,
        title: Schema.NullOr(Schema.String),
      })
    ),
    statements: Schema.Array(
      Schema.Struct({
        missing: Schema.Array(Label),
        passages: Schema.Array(Schema.String),
        site: Schema.String,
      })
    ),
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
  fixture("judged-round2-items.json")
);

const { replies } = Schema.decodeUnknownSync(Replies)(
  fixture("judged-round2-replies.json")
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

const link = (
  text: string,
  context = "",
  landmark: PageEvidence["links"][number]["landmark"] = null,
  href = "/"
) => ({
  context,
  href,
  labelled: false,
  landmark,
  language: false,
  snippet: "<a>",
  text,
});

interface Judgement {
  readonly bad: boolean;
  readonly noted: boolean;
}

const notesFor = (
  id: JudgedId,
  site: string,
  entered: PageEvidence,
  statement: PageEvidence | null,
  asking: number
) => {
  const asked = questionsOf(JUDGED_CHECKS, entered, statement).find(
    (each) => each.id === id
  );

  const check = JUDGED_CHECKS.find((each) => each.id === id);
  const recorded = replies.find((each) => each.key === `${id}:${site}`);

  if (asked === undefined || check === undefined || recorded === undefined) {
    throw new Error(`${id} has no recorded batch for ${site}`);
  }

  expect(asked.items).toHaveLength(asking);

  return check.decide(asked, recorded.reply);
};

const judged = (
  labels: readonly (boolean | null)[],
  notedKeys: ReadonlySet<string>,
  keyOf: (index: number) => string
): Judgement[] =>
  labels.flatMap((bad, index) =>
    bad === null ? [] : [{ bad, noted: notedKeys.has(keyOf(index)) }]
  );

const linkJudgements = items.links.flatMap(({ items: links, site }) => {
  const notes = notesFor(
    "link-purpose",
    site,
    {
      ...EMPTY,
      links: links.map(({ context, landmark, text }) =>
        link(text, context, landmark)
      ),
    },
    null,
    links.length
  );

  return judged(
    links.map(({ bad }) => bad),
    new Set(notes.map(({ item }) => item)),
    (index) => `link_${index + 1}`
  );
});

const languageJudgements = items.language.flatMap(
  ({ bad, lang, site, textSample }) =>
    judged(
      [bad],
      new Set(
        notesFor(
          "page-language-matches",
          site,
          { ...EMPTY, lang, textSample },
          null,
          1
        ).map(({ item }) => item)
      ),
      () => "language"
    )
);

const scopeAnswers = items.scope.map(
  ({ links, prices, sells, site, structuredTypes, textSample, title }) => {
    const [note] = notesFor(
      "sells-to-consumers",
      site,
      {
        ...EMPTY,
        links: links.map(({ href, text }) => link(text, "", null, href)),
        prices,
        structuredTypes,
        textSample,
        title,
      },
      null,
      1
    );

    return { said: note?.sample ?? null, sells };
  }
);

const statementJudgements = items.statements.flatMap(
  ({ missing, passages, site }) => {
    const notes = notesFor(
      "statement-annex-v",
      site,
      EMPTY,
      {
        ...EMPTY,
        passages: passages.map((text) => ({
          landmark: null,
          lang: null,
          text,
        })),
      },
      3
    );

    return judged(
      missing,
      new Set(notes.map(({ item }) => item)),
      (index) => `statement_${index + 1}`
    );
  }
);

const scoreOf = (results: readonly Judgement[]) => {
  const noted = results.filter((result) => result.noted);

  return {
    bad: results.filter((result) => result.bad).length,
    caught: noted.filter((result) => result.bad).length,
    items: results.length,
    noted: noted.length,
  };
};

const scopeScore = {
  covered: scopeAnswers.filter(({ said }) => said !== null).length,
  items: scopeAnswers.length,
  right: scopeAnswers.filter(
    ({ said, sells }) =>
      (said === SELLS && sells) || (said === DOES_NOT_SELL && !sells)
  ).length,
};

const precisionOf = ({
  caught,
  noted,
}: {
  readonly caught: number;
  readonly noted: number;
}): number => (noted === 0 ? 0 : caught / noted);

describe("judged checks on the round 2 real labelled items", () => {
  it("scores what docs/judged-checks.md records", () => {
    expect({
      "link-purpose": scoreOf(linkJudgements),
      "page-language-matches": scoreOf(languageJudgements),
      "sells-to-consumers": scopeScore,
      "statement-annex-v": scoreOf(statementJudgements),
    }).toEqual({
      "link-purpose": { bad: 44, caught: 29, items: 209, noted: 31 },
      "page-language-matches": { bad: 0, caught: 0, items: 60, noted: 0 },
      "sells-to-consumers": { covered: 60, items: 71, right: 60 },
      "statement-annex-v": { bad: 29, caught: 27, items: 64, noted: 27 },
    });
  });

  it.each([
    ["link-purpose", precisionOf(scoreOf(linkJudgements))],
    ["statement-annex-v", precisionOf(scoreOf(statementJudgements))],
    [
      "sells-to-consumers",
      precisionOf({ caught: scopeScore.right, noted: scopeScore.covered }),
    ],
  ])(
    "%s is shown only with a real-item precision of at least 0.9",
    (id, precision) => {
      expect(JUDGED_CHECKS.find((each) => each.id === id)?.shown).toBe(
        precision >= 0.9
      );
    }
  );

  it("notes no page of the real set for its language", () => {
    expect(scoreOf(languageJudgements).noted).toBe(0);
  });
});
