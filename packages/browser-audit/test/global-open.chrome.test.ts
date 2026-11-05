// @effect-diagnostics nodeBuiltinImport:off -- Serves one fixture page from disk to the user's own Chrome, as the local check opens a page.
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";

import { describe, expect, it } from "@effect/vitest";
import { Effect, Schema } from "effect";

import { localChromeSession } from "../src/node.js";

const PAGE = readFileSync(
  path.join(import.meta.dirname, "fixtures", "global-open.html"),
  "utf-8"
);

const pageServer = Effect.acquireRelease(
  Effect.callback<{ readonly port: number; readonly requests: string[] }>(
    (resume) => {
      const requests: string[] = [];

      const server = createServer((request, response) => {
        requests.push(request.url ?? "");
        response
          .writeHead(200, { "content-type": "text/html; charset=utf-8" })
          .end(PAGE);
      });

      server.listen(0, "127.0.0.1", () => {
        resume(
          Schema.decodeUnknownEffect(Schema.Struct({ port: Schema.Int }))(
            server.address()
          ).pipe(
            Effect.map(({ port }) => ({ port, requests })),
            Effect.orDie
          )
        );
      });

      return Effect.sync(() => server.close());
    }
  ),
  () => Effect.void
);

describe("the popup guard in a page that declares its own open", () => {
  it.live("lets the page's script run and still opens no window", () =>
    Effect.gen(function* globalOpen() {
      const { port, requests } = yield* pageServer;

      const session = yield* localChromeSession({ executablePath: null });

      const html = yield* session
        .open(`http://127.0.0.1:${port}/`)
        .pipe(
          Effect.andThen(session.html),
          Effect.ensuring(Effect.ignore(session.close))
        );

      expect(html).toContain('data-ran="yes"');
      expect(html).toContain('data-popup="null"');
      expect(requests).toEqual(["/"]);
    }).pipe(Effect.scoped)
  );
});
