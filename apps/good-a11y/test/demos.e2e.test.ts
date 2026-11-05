// @effect-diagnostics nodeBuiltinImport:off -- Black-box run of the committed bundle on every guide's demo: a local server serves the demo and the bundle checks it in Chrome, as an agent's check does.
import { spawn } from "node:child_process";
import { createServer } from "node:http";

import { describe, expect, it } from "@effect/vitest";
import { ReportSchema, issueGroupsOf } from "@good-a11y/core";
import { GUIDES } from "@good-a11y/guides";
import { Effect, Schema } from "effect";

import { BUNDLE_PATH } from "../scripts/bundle-options.ts";

const demoServer = Effect.acquireRelease(
  Effect.callback<number>((resume) => {
    const server = createServer((request, response) => {
      const id = /^\/(?<id>[a-z\d-]+)\/demo\.html$/u.exec(request.url ?? "")
        ?.groups?.id;

      const guide = GUIDES.find((candidate) => candidate.id === id);

      if (guide === undefined) {
        response.writeHead(404).end();

        return;
      }

      response
        .writeHead(200, { "content-type": "text/html; charset=utf-8" })
        .end(guide.demo);
    });

    server.listen(0, "127.0.0.1", () => {
      resume(
        Schema.decodeUnknownEffect(Schema.Struct({ port: Schema.Int }))(
          server.address()
        ).pipe(
          Effect.map(({ port }) => port),
          Effect.orDie
        )
      );
    });

    return Effect.sync(() => server.close());
  }),
  () => Effect.void
);

const checkJson = (url: string) =>
  Effect.callback<string>((resume) => {
    const child = spawn(process.execPath, [
      BUNDLE_PATH,
      "check",
      "--json",
      url,
    ]);

    let stdout = "";

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.on("close", () => {
      resume(Effect.succeed(stdout));
    });
  });

const issueKeysOf = (report: typeof ReportSchema.Type): readonly string[] => {
  const { benchmark, newer } = issueGroupsOf(report);

  return [...benchmark, ...newer].map((issue) => issue.key);
};

const SECONDS_PER_DEMO = 15;

describe("every guide's demo", () => {
  it.live(
    "passes our own checker, rendered page included",
    () =>
      Effect.gen(function* checksDemos() {
        const port = yield* demoServer;

        const results: {
          id: string;
          issues: readonly string[];
          rendered: string | undefined;
        }[] = [];

        for (const guide of GUIDES) {
          const report = yield* Schema.decodeEffect(
            Schema.fromJsonString(ReportSchema)
          )(yield* checkJson(`127.0.0.1:${port}/${guide.id}/demo.html`));

          results.push({
            id: guide.id,
            issues: issueKeysOf(report),
            rendered: report.rendered?.status,
          });
        }

        expect(results).toStrictEqual(
          GUIDES.map((guide) => ({ id: guide.id, issues: [], rendered: "ran" }))
        );
      }).pipe(Effect.scoped),
    GUIDES.length * SECONDS_PER_DEMO * 1000
  );
});
