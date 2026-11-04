// @effect-diagnostics nodeBuiltinImport:off -- The graders read guide files from the repository with Node built-ins.
// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { guideDirs } from "./demo.ts";

const numbered = (text: string, pattern: RegExp): readonly number[] =>
  [...text.matchAll(pattern)].map((match) => Number(match.groups?.n));

for (const { dir, id } of guideDirs()) {
  test(`${id} has one grader test per expectation`, () => {
    const grader = path.join(import.meta.dirname, `${id}.spec.ts`);
    expect(existsSync(grader), `missing evals/graders/${id}.spec.ts`).toBe(
      true
    );

    const claims = numbered(
      readFileSync(path.join(dir, "expectations.md"), "utf-8"),
      /^(?<n>\d+)\. /gmu
    );

    const tests = numbered(
      readFileSync(grader, "utf-8"),
      /test\("E(?<n>\d+) /gu
    );

    expect(tests.toSorted((a, b) => a - b)).toEqual(claims);
  });
}
