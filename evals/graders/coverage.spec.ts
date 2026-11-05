// @effect-diagnostics nodeBuiltinImport:off -- The graders read guide files from the repository with Node built-ins.
import { readFileSync } from "node:fs";
import path from "node:path";

import { graderFor } from "@good-a11y/graders";
import { expect, test } from "@playwright/test";

import { guideDirs } from "./demo.ts";

const numbered = (text: string): readonly number[] =>
  [...text.matchAll(/^(?<n>\d+)\. /gmu)].map((match) =>
    Number(match.groups?.n)
  );

for (const { dir, id } of guideDirs()) {
  test(`${id} has one grader claim per expectation`, () => {
    const grader = graderFor(id);

    expect(grader, `no grader for ${id} in packages/graders`).toBeDefined();

    const claims = numbered(
      readFileSync(path.join(dir, "expectations.md"), "utf-8")
    );

    expect(
      (grader?.claims ?? []).map((claim) => claim.n).toSorted((a, b) => a - b)
    ).toEqual(claims);
  });
}
