// @effect-diagnostics nodeBuiltinImport:off -- Black-box run of the committed check bundle on our own built pages: a local server serves dist/client through the site handler, and the bundle checks each page in Chrome, as an agent's check does.
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

import { describe, expect, it } from "@effect/vitest";
import { ReportSchema, issueGroupsOf } from "@good-a11y/core";
import { GUIDES } from "@good-a11y/guides/data";
import { Effect, Schema } from "effect";

import type { BackendFetch } from "../src/server/rpc.js";
import { siteHandler } from "../src/server/site.js";

const CLIENT = path.join(import.meta.dirname, "../dist/client");

const BUNDLE = path.join(
  import.meta.dirname,
  "../../good-a11y/bundle/good-a11y.mjs"
);

const TYPES = new Map([
  [".css", "text/css"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".woff2", "font/woff2"],
]);

// @effect-diagnostics-next-line asyncFunction:off -- Stands in for the Worker's Promise-returning ASSETS binding.
const assets: BackendFetch = async (request) => {
  const { pathname } = new URL(request.url);
  const file = path.join(CLIENT, pathname === "/" ? "index.html" : pathname);

  try {
    return new Response(await readFile(file), {
      headers: {
        "content-type": TYPES.get(path.extname(file)) ?? "text/plain",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
};

// @effect-diagnostics-next-line asyncFunction:off -- Stands in for the scanner's Promise-returning service binding.
const backendDown: BackendFetch = async () =>
  await Promise.resolve(new Response(null, { status: 503 }));

// @effect-diagnostics-next-line asyncFunction:off -- The local server is a Promise boundary.
const respond = async (request: Request) => {
  const { origin, pathname } = new URL(request.url);

  const response = pathname.startsWith("/assets/")
    ? await assets(request)
    : await siteHandler(backendDown, assets, origin)(request);

  return {
    body: Buffer.from(await response.arrayBuffer()),
    headers: Object.fromEntries(response.headers.entries()),
    status: response.status,
  };
};

const siteServer = Effect.acquireRelease(
  Effect.callback<number>((resume) => {
    const server = createServer((incoming, outgoing) => {
      void respond(
        new Request(`http://${incoming.headers.host}${incoming.url ?? "/"}`, {
          headers: { accept: incoming.headers.accept ?? "text/html" },
        })
      ).then(({ body, headers, status }) => {
        outgoing.writeHead(status, headers);
        outgoing.end(body);
      });
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
    const child = spawn(process.execPath, [BUNDLE, "check", "--json", url]);

    let stdout = "";

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.on("close", () => {
      resume(Effect.succeed(stdout));
    });
  });

const PAGES = [
  "/",
  "/check",
  "/about",
  "/privacy",
  "/no-such-page",
  ...GUIDES.map((guide) => `/guides/${guide.id}`),
];

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
