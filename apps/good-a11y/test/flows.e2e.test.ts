// @effect-diagnostics nodeBuiltinImport:off -- Black-box tests of the committed bundle: a local server serves a guide's demo and a fixture, the flow file is written to a temporary directory, and the bundle runs as a child process in the user's Chrome.
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "@effect/vitest";
import { FLOWS_PUBLIC, LocalReportSchema } from "@good-a11y/core";
import { Effect, Schema } from "effect";

import { runBundle } from "./run-bundle.ts";

const PAGES = new Map([
  [
    "/demo",
    path.join(
      import.meta.dirname,
      "../../../guides/forms/confirm-before-purchase/demo.html"
    ),
  ],
  ["/one-click", path.join(import.meta.dirname, "fixtures/one-click-buy.html")],
]);

const pageServer = Effect.acquireRelease(
  Effect.callback<number>((resume) => {
    const server = createServer((request, response) => {
      const file = PAGES.get(request.url ?? "");

      if (file === undefined) {
        response.writeHead(404).end();

        return;
      }

      response
        .writeHead(200, { "content-type": "text/html; charset=utf-8" })
        .end(readFileSync(file));
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

const flowFile = (json: string): string => {
  const file = path.join(
    mkdtempSync(path.join(tmpdir(), "good-a11y-flow-")),
    "flows.json"
  );

  writeFileSync(file, json);

  return file;
};

const decodeReport = Schema.decodeEffect(
  Schema.fromJsonString(LocalReportSchema)
);

describe("good-a11y check --flow", () => {
  it.live("passes the guide's own demo on every claim of its grader", () =>
    Effect.gen(function* passesDemo() {
      const port = yield* pageServer;

      const run = yield* runBundle([
        "check",
        `localhost:${port}/demo`,
        "--flow",
        flowFile('{ "guide": "confirm-before-purchase" }'),
      ]);

      expect(run.status).toBe(0);
      expect(run.stdout).toContain("## From the flows you described");
      expect(run.stdout).toContain(
        `Ran on http://localhost:${port}/demo: every claim passed.`
      );
      expect(run.stdout).toContain(
        "Passed: `E1` one activation does not make the order final; `E2` backing out leaves nothing ordered."
      );
    }).pipe(Effect.scoped)
  );

  it.live(
    "fails a one-click order with the guide that fixes it, blocks requests to other origins, and keeps the verdict out of it",
    () =>
      Effect.gen(function* failsOneClick() {
        const port = yield* pageServer;

        const run = yield* runBundle([
          "check",
          "--json",
          `localhost:${port}/`,
          "--flow",
          flowFile(
            '[{ "guide": "confirm-before-purchase", "path": "/one-click" }]'
          ),
        ]);

        const without = yield* runBundle([
          "check",
          "--json",
          `localhost:${port}/`,
        ]);

        expect(run.status).toBe(0);

        const report = yield* decodeReport(run.stdout);
        const unflowed = yield* decodeReport(without.stdout);

        expect(report.flows).toMatchObject({
          ran: [
            {
              blocked: ["https://tracker.invalid/pixel.gif"],
              criteria: ["STD-SC-3.3.4"],
              guide: "confirm-before-purchase",
              url: `http://localhost:${port}/one-click`,
            },
          ],
        });

        const [flow] =
          report.flows !== null && "ran" in report.flows
            ? report.flows.ran
            : [];

        expect(
          flow?.claims.map(({ n, status }) => ({ n, status }))
        ).toStrictEqual([
          { n: 1, status: "fail" },
          { n: 2, status: "fail" },
        ]);
        expect(flow?.claims[0]?.detail).toContain(
          "the order was placed on one click and nothing offers to cancel it"
        );
        expect(report.verdict).toStrictEqual(unflowed.verdict);
        expect(report.findings).toStrictEqual(unflowed.findings);
        expect(unflowed.flows).toBeNull();
      }).pipe(Effect.scoped)
  );

  it.live("skips the flows on a public page and says why", () =>
    Effect.gen(function* skipsPublic() {
      const run = yield* runBundle([
        "check",
        "https://good-a11y.invalid/",
        "--flow",
        flowFile('{ "guide": "confirm-before-purchase" }'),
      ]);

      expect(run.status).toBe(0);
      expect(run.stdout).toContain(`Flows skipped: ${FLOWS_PUBLIC}`);
    })
  );

  it.live("names a flow file it cannot read and exits one", () =>
    Effect.gen(function* refusesBadFile() {
      const run = yield* runBundle([
        "check",
        "localhost:9/",
        "--flow",
        flowFile('{ "path": "/" }'),
      ]);

      expect(run.status).toBe(1);
      expect(run.stderr).toContain("could not be read as a flow");
    })
  );
});
