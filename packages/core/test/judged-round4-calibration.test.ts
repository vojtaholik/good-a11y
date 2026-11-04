// @effect-diagnostics nodeBuiltinImport:off -- The test reads the real labelled items and recorded model answers from disk.
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "@effect/vitest";
import { Schema } from "effect";

import {
  EmptySubmitsSchema,
  JUDGED_CHECKS,
  JudgeReplySchema,
  questionsOf,
} from "../src/index.js";
import type { PageEvidence, RenderedEvidence } from "../src/index.js";

const fixtures = path.join(import.meta.dirname, "fixtures");

const read = (...parts: string[]): string =>
  readFileSync(path.join(fixtures, ...parts), "utf-8");

const EmptySubmits = Schema.toType(EmptySubmitsSchema);

const Evidence = Schema.fromJsonString(
  Schema.Struct({ emptySubmits: Schema.NullOr(EmptySubmits) })
);

const Run2 = Schema.fromJsonString(
  Schema.Struct({
    sites: Schema.Array(
      Schema.Struct({
        emptySubmits: Schema.NullOr(EmptySubmits),
        site: Schema.String,
      })
    ),
  })
);

const Labels = Schema.fromJsonString(
  Schema.Struct({
    fields: Schema.Array(
      Schema.Struct({
        field: Schema.String,
        form: Schema.Int,
        identified: Schema.NullOr(Schema.Boolean),
        site: Schema.String,
        suggested: Schema.NullOr(Schema.Boolean),
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

const run1 = readdirSync(path.join(fixtures, "form-run", "evidence")).map(
  (file) => ({
    emptySubmits: Schema.decodeUnknownSync(Evidence)(
      read("form-run", "evidence", file)
    ).emptySubmits,
    site: file.split(".scan-")[0] ?? file,
  })
);

const run2 = Schema.decodeUnknownSync(Run2)(
  read("form-run-2", "evidence.json")
).sites;

const labels = [
  ...Schema.decodeUnknownSync(Labels)(read("form-run", "labels.json")).fields,
  ...Schema.decodeUnknownSync(Labels)(read("form-run-2", "labels.json")).fields,
];

const { replies } = Schema.decodeUnknownSync(Replies)(
  read("judged-round4-errors-replies.json")
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

const renderedOf = (
  emptySubmits: RenderedEvidence["emptySubmits"]
): RenderedEvidence => ({
  emptySubmits,
  foreignBlocks: null,
  formInstructions: null,
  visualHeadings: null,
});

const sites = [...run1, ...run2]
  .flatMap(({ emptySubmits, site }) => {
    const asked = questionsOf(JUDGED_CHECKS, {
      entered: EMPTY,
      rendered: renderedOf(emptySubmits),
      statement: null,
    });

    return asked.some(({ id }) => id === "error-identified")
      ? [{ asked, site }]
      : [];
  })
  .toSorted((one, other) => one.site.localeCompare(other.site));

const setOf = (site: string): "design" | "holdout" =>
  sites.findIndex((each) => each.site === site) % 2 === 0
    ? "design"
    : "holdout";

const judgementsOf = (
  id: "error-identified" | "error-suggestion",
  set: "design" | "holdout"
) => {
  const check = JUDGED_CHECKS.find((each) => each.id === id);

  return sites
    .filter(({ site }) => setOf(site) === set)
    .flatMap(({ asked, site }) => {
      const batch = asked.find((each) => each.id === id);
      const recorded = replies.find(({ key }) => key === `${id}:${site}`);
      const own = labels.filter((label) => label.site === site);

      if (
        batch === undefined ||
        recorded === undefined ||
        check === undefined
      ) {
        throw new Error(`${id} has no recorded batch for ${site}`);
      }

      expect(batch.items).toHaveLength(own.length);

      const noted = new Set(
        check.decide(batch, recorded.reply).map(({ item }) => item)
      );

      return own.flatMap((label, index) => {
        const right =
          id === "error-identified" ? label.identified : label.suggested;

        return right === null
          ? []
          : [{ bad: !right, noted: noted.has(`field_${index + 1}`) }];
      });
    });
};

const scoreOf = (results: readonly { bad: boolean; noted: boolean }[]) => {
  const noted = results.filter((result) => result.noted);

  return {
    bad: results.filter((result) => result.bad).length,
    caught: noted.filter((result) => result.bad).length,
    items: results.length,
    noted: noted.length,
  };
};

const shownIff = (id: "error-identified" | "error-suggestion") => {
  const all =
    scoreOf(judgementsOf(id, "design")).items +
    scoreOf(judgementsOf(id, "holdout")).items;

  const { caught, noted } = scoreOf(judgementsOf(id, "holdout"));

  expect(JUDGED_CHECKS.find((each) => each.id === id)?.shown).toBe(
    all >= 30 && noted > 0 && caught / noted >= 0.9
  );
};

describe("error-message questions on the two form runs", () => {
  it("label every field the questions ask, in order", () => {
    expect(sites.length).toBeGreaterThan(0);
    expect(
      sites.every(({ site }) =>
        replies.some(({ key }) => key === `error-identified:${site}`)
      )
    ).toBe(true);
  });

  it("ask nothing without empty submits, or when only the browser spoke", () => {
    const asked = (site: string) =>
      [...run1, ...run2]
        .filter((each) => each.site === site)
        .flatMap(({ emptySubmits }) =>
          questionsOf(JUDGED_CHECKS, {
            entered: EMPTY,
            rendered: renderedOf(emptySubmits),
            statement: null,
          })
        )
        .map(({ id }) => id);

    expect(
      questionsOf(JUDGED_CHECKS, {
        entered: EMPTY,
        rendered: renderedOf(null),
        statement: null,
      }).map(({ id }) => id)
    ).not.toContain("error-identified");
    expect(asked("bonprix.de")).not.toContain("error-identified");
    expect(asked("mozilla.org")).not.toContain("error-suggestion");
  });

  it("score what docs/judged-checks.md records", () => {
    expect({
      identified: {
        design: scoreOf(judgementsOf("error-identified", "design")),
        holdout: scoreOf(judgementsOf("error-identified", "holdout")),
      },
      suggested: {
        design: scoreOf(judgementsOf("error-suggestion", "design")),
        holdout: scoreOf(judgementsOf("error-suggestion", "holdout")),
      },
    }).toEqual({
      identified: {
        design: { bad: 11, caught: 11, items: 26, noted: 11 },
        holdout: { bad: 6, caught: 4, items: 22, noted: 4 },
      },
      suggested: {
        design: { bad: 11, caught: 11, items: 26, noted: 11 },
        holdout: { bad: 6, caught: 5, items: 22, noted: 5 },
      },
    });
  });

  it("are shown only with a holdout precision of at least 0.9", () => {
    shownIff("error-identified");
    shownIff("error-suggestion");
  });
});
