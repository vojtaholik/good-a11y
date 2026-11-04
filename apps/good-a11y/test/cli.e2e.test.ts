// @effect-diagnostics nodeBuiltinImport:off -- Black-box tests of the committed bundle: they spawn it as a child process, as npx does, and assert on stdout, stderr and exit codes.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { GUIDES } from "@eaa-check/guides";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { build } from "esbuild";

import { BUNDLE_PATH, bundleOptions } from "../scripts/bundle-options.ts";

const runBundle = (arguments_: readonly string[]) =>
  spawnSync(process.execPath, [BUNDLE_PATH, ...arguments_], {
    encoding: "utf-8",
  });

describe("the committed good-a11y bundle", () => {
  it.effect(
    "matches a fresh bundle of the sources; run `pnpm good-a11y:bundle` after a change",
    () =>
      Effect.gen(function* bundleIsCurrent() {
        const fresh = yield* Effect.tryPromise(
          build.bind(undefined, { ...bundleOptions, write: false })
        );

        expect(fresh.outputFiles?.[0]?.text).toBe(
          readFileSync(BUNDLE_PATH, "utf-8")
        );
      })
  );

  it("lists every guide as JSON", () => {
    const result = runBundle(["list"]);

    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual(
      GUIDES.map(({ description, id }) => ({ description, id }))
    );
  });

  it("prints a JSON array for a search", () => {
    const result = runBundle(["search", "modal dialog focus"]);

    expect(result.status).toBe(0);
    expect(Array.isArray(JSON.parse(result.stdout))).toBe(true);
  });

  it("names an unknown guide id on stderr and exits one", () => {
    const result = runBundle(["retrieve", "no-such-guide"]);

    expect(result.status).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr.trim()).toBe(
      'No guide with id "no-such-guide". Run `good-a11y list` for every id, or `good-a11y search "<2-5 words>"`.'
    );
  });

  it("names its commands in help", () => {
    const result = runBundle(["--help"]);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("search");
    expect(result.stdout).toContain("retrieve");
  });
});
