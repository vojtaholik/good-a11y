// @effect-diagnostics nodeBuiltinImport:off -- Black-box tests of the committed bundle: a local server serves the fixtures, the scenario file is written to a temporary directory, and the bundle runs as a child process.
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "@effect/vitest";
import {
  ALREADY_REACHED,
  LocalReportSchema,
  TASKS_LABEL,
  TASKS_PUBLIC,
} from "@good-a11y/core";
import { Effect, Schema } from "effect";

import { runBundle } from "./run-bundle.ts";

const PAGES = new Map([
  [
    "/keyboard",
    path.join(import.meta.dirname, "fixtures/keyboard-checkout.html"),
  ],
  [
    "/pointer",
    path.join(import.meta.dirname, "fixtures/pointer-checkout.html"),
  ],
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

const scenarioFile = (json: string): string => {
  const file = path.join(
    mkdtempSync(path.join(tmpdir(), "good-a11y-scenario-")),
    "a11y-tasks.json"
  );

  writeFileSync(file, json);

  return file;
};

const checkout = (id: string, page: string) => ({
  goal: "Place an order for the Rain jacket.",
  id,
  inputs: { name: "Jana Novakova" },
  keys: [
    { press: "Tab" },
    { type: "name" },
    { press: "Tab" },
    { press: "Enter" },
  ],
  path: page,
  success: {
    path: "/order-placed",
    present: [{ name: "Thank you", role: "heading" }],
  },
});

const decodeReport = Schema.decodeEffect(
  Schema.fromJsonString(LocalReportSchema)
);

describe("good-a11y check --scenarios", () => {
  it.live(
    "finishes checkout by keyboard on a real button, not on a clickable div, and keeps the verdict out of it",
    () =>
      Effect.gen(function* countsTasks() {
        const port = yield* pageServer;

        const file = scenarioFile(
          JSON.stringify([
            checkout("keyboard", "/keyboard"),
            checkout("pointer", "/pointer"),
          ])
        );

        const text = yield* runBundle([
          "check",
          `localhost:${port}/keyboard`,
          "--scenarios",
          file,
        ]);

        const json = yield* runBundle([
          "check",
          "--json",
          `localhost:${port}/keyboard`,
          "--scenarios",
          file,
        ]);

        const without = yield* runBundle([
          "check",
          "--json",
          `localhost:${port}/keyboard`,
        ]);

        expect(text.status).toBe(0);
        expect(text.stdout).toContain(
          "**Task completion: 1 of 2 tasks finished with the keyboard and the accessibility tree only.**"
        );
        expect(text.stdout).toContain(TASKS_LABEL);
        expect(text.stdout).not.toMatch(
          /compliant|compliance score|accessibility score|wcag score|conformance/iu
        );

        const report = yield* decodeReport(json.stdout);
        const unscored = yield* decodeReport(without.stdout);

        expect(report.tasks).toMatchObject({
          ran: [
            { id: "keyboard", keys: 4, status: "finished", steps: 4 },
            { id: "pointer", keys: 4, status: "not_finished", steps: 4 },
          ],
        });
        expect(report.verdict).toStrictEqual(unscored.verdict);
        expect(report.findings).toStrictEqual(unscored.findings);
        expect(unscored.tasks).toBeNull();
      }).pipe(Effect.scoped)
  );

  it.live("refuses a success condition that holds before the first key", () =>
    Effect.gen(function* refusesTrivial() {
      const port = yield* pageServer;

      const run = yield* runBundle([
        "check",
        "--json",
        `localhost:${port}/keyboard`,
        "--scenarios",
        scenarioFile(
          JSON.stringify({
            ...checkout("trivial", "/keyboard"),
            success: { present: [{ name: "Checkout", role: "heading" }] },
          })
        ),
      ]);

      const report = yield* decodeReport(run.stdout);

      expect(report.tasks).toMatchObject({
        ran: [{ problem: ALREADY_REACHED, status: "not_finished", steps: 0 }],
      });
    }).pipe(Effect.scoped)
  );

  it.live("skips the scenarios on a public page and says why", () =>
    Effect.gen(function* skipsPublic() {
      const run = yield* runBundle([
        "check",
        "https://good-a11y.invalid/",
        "--scenarios",
        scenarioFile(JSON.stringify(checkout("public", "/"))),
      ]);

      expect(run.status).toBe(0);
      expect(run.stdout).toContain(`Tasks skipped: ${TASKS_PUBLIC}`);
    })
  );

  it.live("names a scenario file it cannot read and exits one", () =>
    Effect.gen(function* refusesBadFile() {
      const run = yield* runBundle([
        "check",
        "localhost:9/",
        "--scenarios",
        scenarioFile(
          JSON.stringify({
            goal: "x",
            id: "x",
            keys: [{ press: "Tab" }],
            success: { present: [] },
          })
        ),
      ]);

      expect(run.status).toBe(1);
      expect(run.stderr).toContain("could not be read as a scenario");
    })
  );
});
