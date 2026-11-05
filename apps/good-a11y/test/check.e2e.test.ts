// @effect-diagnostics nodeBuiltinImport:off -- Black-box tests of the committed bundle: a local static server serves fixture pages and the bundle runs as a child process in the user's Chrome, as npx does.
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";

import { describe, expect, it } from "@effect/vitest";
import { ReportSchema } from "@good-a11y/core";
import { Effect, Schema } from "effect";

import { runBundle } from "./run-bundle.ts";

const fixtures = path.join(import.meta.dirname, "fixtures");

const hits: string[] = [];

const pageServer = Effect.acquireRelease(
  Effect.callback<number>((resume) => {
    const server = createServer((request, response) => {
      const name = (request.url ?? "/").replace(/^\//u, "") || "clean.html";

      if (name.startsWith("hit/")) {
        hits.push(name);
      }

      if (
        ![
          "broken.html",
          "clean.html",
          "form.html",
          "hidden-content.html",
        ].includes(name)
      ) {
        response.writeHead(404).end();

        return;
      }

      response
        .writeHead(200, { "content-type": "text/html; charset=utf-8" })
        .end(readFileSync(path.join(fixtures, name)));
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

describe("good-a11y check", () => {
  it.live(
    "reports a local page's issues worst first, each with its fix prompt and guide",
    () =>
      Effect.gen(function* checksBrokenPage() {
        const port = yield* pageServer;

        const run = yield* runBundle([
          "check",
          `localhost:${port}/broken.html`,
        ]);

        expect(run.status).toBe(0);
        expect(run.stdout).toContain(
          "This page does not meet WCAG 2.1 Level AA, the reference benchmark."
        );
        expect(run.stdout).toContain(
          "Checks run: static HTML + rendered page."
        );
        expect(run.stdout).toContain("## Issues, worst first");
        expect(run.stdout).toContain(
          "Images have a text alternative `image-alt`"
        );
        expect(run.stdout).toContain(
          "Guide: https://good-a11y.com/image-alt.md"
        );
        expect(run.stdout).toContain('> <img src="late.png">');
        expect(run.stdout).toContain("1.1.1 Non-text Content (Level A)");
        expect(run.stdout).toContain("## Questions for you");
        expect(run.stdout).toContain("Judged by your agent, not calibrated.");
        expect(run.stdout).toContain('Link 1: text "Read more"');
        expect(run.stdout).not.toMatch(/compliant|compliance score/iu);
      }).pipe(Effect.scoped)
  );

  it.live(
    "finds nothing to fix on a clean local page and still says it is not a pass",
    () =>
      Effect.gen(function* checksCleanPage() {
        const port = yield* pageServer;
        const run = yield* runBundle(["check", `http://127.0.0.1:${port}/`]);

        expect(run.status).toBe(0);
        expect(run.stdout).toContain(
          "Automated checks found no failures against WCAG 2.1 Level AA."
        );
        expect(run.stdout).toContain("That is not a pass");
        expect(run.stdout).not.toContain("## Issues");
      }).pipe(Effect.scoped)
  );

  it.live(
    "submits a local form empty, sends nothing, and asks about its error text",
    () =>
      Effect.gen(function* submitsLocalForm() {
        const port = yield* pageServer;

        hits.length = 0;

        const run = yield* runBundle([
          "check",
          "--json",
          `localhost:${port}/form.html`,
        ]);

        const markdown = yield* runBundle([
          "check",
          `localhost:${port}/form.html`,
        ]);

        expect(run.status).toBe(0);
        expect(hits).toStrictEqual([]);
        expect(markdown.stdout).toContain("`error-identified`");
        expect(markdown.stdout).toContain("Wrong.");
      }).pipe(Effect.scoped)
  );

  it.live(
    "reports a link Tab never reaches, but not links in closed details, hidden=until-found or content-visibility: hidden",
    () =>
      Effect.gen(function* checksHiddenContent() {
        const port = yield* pageServer;

        const run = yield* runBundle([
          "check",
          `localhost:${port}/hidden-content.html`,
        ]);

        const [, keyboardReach = ""] = run.stdout.split(
          "Controls the Tab key never reaches `axe:keyboard-reach`"
        );

        const [section = ""] = keyboardReach.split("\n### ");

        expect(run.status).toBe(0);
        expect(section).toContain("1 failing element");
        expect(section).toContain(
          '> <a href="/contact" tabindex="-1">Contact the shop</a>'
        );
        expect(section).not.toContain("/holidays");
        expect(section).not.toContain("/repairs");
        expect(section).not.toContain("/rentals");
      }).pipe(Effect.scoped)
  );

  it.live("prints the schema-encoded report with --json", () =>
    Effect.gen(function* printsJson() {
      const port = yield* pageServer;

      const run = yield* runBundle([
        "check",
        "--json",
        `localhost:${port}/broken.html`,
      ]);

      expect(run.status).toBe(0);

      const report = yield* Schema.decodeEffect(
        Schema.fromJsonString(ReportSchema)
      )(run.stdout);

      expect(report.outcome).toBe("checked");
      expect(report.rendered?.status).toBe("ran");
    }).pipe(Effect.scoped)
  );

  it.live("names an address it cannot check and exits one", () =>
    Effect.gen(function* refusesBadAddress() {
      const run = yield* runBundle(["check", "ftp://localhost/"]);

      expect(run.status).toBe(1);
      expect(run.stderr).toContain("The ftp: scheme is not allowed.");
    })
  );
});
