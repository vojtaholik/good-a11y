// @effect-diagnostics nodeBuiltinImport:off -- Black-box run of the committed check bundle on our own built pages: a local server serves dist/client through the site handler, and the bundle checks each page in Chrome, as an agent's check does.
import { spawn } from "node:child_process";
import path from "node:path";

import { describe, expect, it } from "@effect/vitest";
import { ReportSchema, issueGroupsOf } from "@good-a11y/core";
import { Effect, Schema } from "effect";

import { PAGES, siteServer } from "./site-server.js";

const BUNDLE = path.join(
  import.meta.dirname,
  "../../good-a11y/bundle/good-a11y.mjs"
);

const checkJson = (url: string) =>
  Effect.callback<string>((resume) => {
    const child = spawn(process.execPath, [BUNDLE, "check", "--json", url]);

    let stdout = "";

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.on("close", () => {
      resume(Effect.succeed(stdout));
    });
  });

describe("our own built pages", () => {
  it.live(
    "pass our own checker, rendered page included",
    () =>
      Effect.gen(function* checksPages() {
        const port = yield* siteServer;

        const results: {
          issues: readonly string[];
          path: string;
          rendered: string | undefined;
        }[] = [];

        for (const page of PAGES) {
          const report = yield* Schema.decodeEffect(
            Schema.fromJsonString(ReportSchema)
          )(yield* checkJson(`127.0.0.1:${port}${page}`));

          const { benchmark, newer } = issueGroupsOf(report);

          results.push({
            issues: [...benchmark, ...newer].map((issue) => issue.key),
            path: page,
            rendered: report.rendered?.status,
          });
        }

        expect(results).toStrictEqual(
          PAGES.map((page) => ({ issues: [], path: page, rendered: "ran" }))
        );
      }).pipe(Effect.scoped),
    300_000
  );
});
