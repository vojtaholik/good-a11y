// @effect-diagnostics nodeBuiltinImport:off -- Serves the fixture pages from disk to the user's own Chrome, as the local check opens a page.
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";

import { describe, expect, it } from "@effect/vitest";
import { ProbesJson, probeResults } from "@good-a11y/core";
import type { ProbeId } from "@good-a11y/core";
import { Effect, Schema } from "effect";

import { headlessShellPath } from "../src/headless-shell.js";
import { localChromeSession } from "../src/node.js";

const FIXTURES = path.join(import.meta.dirname, "fixtures", "interaction");

const NAME = /^\/(?<name>[a-z-]+)\.html$/u;

const fixtureServer = Effect.acquireRelease(
  Effect.callback<number>((resume) => {
    const server = createServer((request, response) => {
      const name = NAME.exec(request.url ?? "")?.groups?.name;

      if (name === undefined) {
        response.writeHead(404).end();

        return;
      }

      response
        .writeHead(200, { "content-type": "text/html; charset=utf-8" })
        .end(readFileSync(path.join(FIXTURES, `${name}.html`), "utf-8"));
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

const probed = (name: string, probe: ProbeId) =>
  Effect.gen(function* probeFixture() {
    const port = yield* fixtureServer;

    const session = yield* localChromeSession({
      executablePath: headlessShellPath(),
    });

    const json = yield* session
      .open(`http://127.0.0.1:${port}/${name}.html`)
      .pipe(
        Effect.andThen(session.probe),
        Effect.ensuring(Effect.ignore(session.close))
      );

    const measured = yield* Schema.decodeEffect(ProbesJson)(json);

    return probeResults(measured).find((result) => result.probe === probe);
  }).pipe(Effect.scoped);

describe("interaction probes in Chrome", () => {
  it.live(
    "2.1.4: a slash that focuses search and a ? that opens help fail",
    () =>
      Effect.gen(function* keysFail() {
        const result = yield* probed("keys-fail", "character-keys");

        expect(result?.status).toBe("fail");
        expect(result?.samples).toEqual([
          'Pressing "/" with no field focused moves focus to <input id="q" type="search">',
          'Pressing "?" with no field focused changes the page: div#help.',
        ]);
      })
  );

  it.live(
    "2.1.4: a shortcut inside the editor, a ticking clock and keyboard-mode attributes pass",
    () =>
      Effect.gen(function* keysPass() {
        expect((yield* probed("keys-pass", "character-keys"))?.status).toBe(
          "pass"
        );
      })
  );

  it.live(
    "1.4.13: a CSS-only hover menu and a tooltip that hides on leaving its trigger fail",
    () =>
      Effect.gen(function* hoverFail() {
        const result = yield* probed("hover-fail", "hover-content");

        expect(result?.status).toBe("fail");
        expect(
          result?.samples.map((sample) => sample.split(") ").at(-1))
        ).toEqual([
          "covers other content and Escape does not close it",
          "disappears when the pointer moves onto it",
        ]);
      })
  );

  it.live(
    "1.4.13: a menu that stays while hovered and closes with Escape passes",
    () =>
      Effect.gen(function* hoverPass() {
        expect((yield* probed("hover-pass", "hover-content"))?.status).toBe(
          "pass"
        );
      })
  );

  it.live("1.3.4: a portrait style that hides the main content fails", () =>
    Effect.gen(function* orientationFail() {
      const result = yield* probed("orientation-fail", "orientation");

      expect(result?.status).toBe("fail");
      expect(result?.samples).toEqual([
        "In portrait orientation, @media (orientation: portrait) hides main",
      ]);
    })
  );

  it.live("1.3.4: a portrait style that hides a small aside passes", () =>
    Effect.gen(function* orientationPass() {
      expect((yield* probed("orientation-pass", "orientation"))?.status).toBe(
        "pass"
      );
    })
  );

  it.live("1.4.11: a #ddd field border and a #ccc icon on white fail", () =>
    Effect.gen(function* contrastFail() {
      const result = yield* probed("contrast-fail", "non-text-contrast");

      expect(result?.status).toBe("fail");
      expect(result?.samples.map((sample) => sample.split(": ")[0])).toEqual([
        "Field border 1.36:1 against its background",
        "Icon 1.61:1 against its background",
      ]);
    })
  );

  it.live(
    "1.4.11: dark borders, a dark field, and skipped gradients, photos and logos pass",
    () =>
      Effect.gen(function* contrastPass() {
        expect(
          (yield* probed("contrast-pass", "non-text-contrast"))?.status
        ).toBe("pass");
      })
  );
});
