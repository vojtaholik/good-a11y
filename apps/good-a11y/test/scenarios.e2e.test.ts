// @effect-diagnostics nodeBuiltinImport:off -- Black-box tests of the committed bundle: a local server serves the fixtures, the scenario file is written to a temporary directory, and the bundle runs as a child process.
import { chmodSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "@effect/vitest";
import { headlessShellPath } from "@good-a11y/browser-audit/headless-shell";
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

const STUB_CLAUDE = `#!/usr/bin/env node
const prompt = process.argv[process.argv.indexOf("-p") + 1];
const taken = /^Your actions so far: (.*)$/mu.exec(prompt)[1];
const count = taken === "none" ? 0 : taken.split("; ").length;
const steps = JSON.parse(process.env.STUB_STEPS);
const decision = steps[count] ?? { action: "give_up", reason: "out of steps" };
process.stdout.write(JSON.stringify({ structured_output: decision }));
`;

const stubbedClaude = (): NodeJS.ProcessEnv => {
  const dir = mkdtempSync(path.join(tmpdir(), "good-a11y-stub-claude-"));
  const file = path.join(dir, "claude");

  writeFileSync(file, STUB_CLAUDE);
  chmodSync(file, 0o755);

  return {
    ...process.env,
    GOOD_A11Y_CHROME: headlessShellPath(),
    PATH: `${dir}${path.delimiter}${process.env.PATH ?? ""}`,
    STUB_STEPS: JSON.stringify([
      { action: "press", key: "Tab" },
      { action: "type", input: "name" },
      { action: "press", key: "Tab" },
      { action: "press", key: "Enter" },
    ]),
  };
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

        const allKeys = checkout("keys", "/").keys;

        expect(report.tasks).toMatchObject({
          ran: [
            {
              id: "keyboard",
              mode: "replayed",
              runs: [{ confirmed: true, trace: allKeys }],
              status: "finished",
            },
            {
              id: "pointer",
              mode: "replayed",
              runs: [{ confirmed: false, reached: false, trace: allKeys }],
              status: "not_finished",
            },
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
        ran: [
          {
            runs: [{ problem: ALREADY_REACHED, trace: [] }],
            status: "not_finished",
          },
        ],
      });
    }).pipe(Effect.scoped)
  );

  it.live(
    "drives a scenario without keys through the agent CLI in three runs, each confirmed by a replay without it",
    () =>
      Effect.gen(function* drivesTasks() {
        const port = yield* pageServer;

        const { keys: _keyboardKeys, ...keyboard } = checkout(
          "keyboard",
          "/keyboard"
        );

        const { keys: _pointerKeys, ...pointer } = checkout(
          "pointer",
          "/pointer"
        );

        const run = yield* runBundle(
          [
            "check",
            "--json",
            `localhost:${port}/keyboard`,
            "--scenarios",
            scenarioFile(JSON.stringify([keyboard, pointer])),
          ],
          stubbedClaude()
        );

        const report = yield* decodeReport(run.stdout);
        const confirmed = { confirmed: true, reached: true };

        expect(report.tasks).toMatchObject({
          ran: [
            {
              driver: "claude-sonnet-5-5",
              id: "keyboard",
              mode: "driven",
              runs: [confirmed, confirmed, confirmed],
              status: "finished",
            },
            {
              id: "pointer",
              mode: "driven",
              runs: [
                {
                  confirmed: false,
                  problem: "The model gave up: out of steps",
                },
                { confirmed: false },
                { confirmed: false },
              ],
              status: "not_finished",
            },
          ],
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
