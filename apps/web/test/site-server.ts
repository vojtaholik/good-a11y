// @effect-diagnostics nodeBuiltinImport:off -- A local server for the black-box browser tests: it serves dist/client through the site handler, the way the Worker does.
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";

import { GUIDES } from "@good-a11y/guides/data";
import { Effect, Schema } from "effect";

import type { BackendFetch } from "../src/server/rpc.js";
import { siteHandler } from "../src/server/site.js";

const CLIENT = path.join(import.meta.dirname, "../dist/client");

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

// @effect-diagnostics-next-line asyncFunction:off -- Stands in for the Promise-returning rate limit binding.
const allowAll = async () => await Promise.resolve(true);

// @effect-diagnostics-next-line asyncFunction:off -- The local server is a Promise boundary.
const respond = async (request: Request) => {
  const { origin, pathname } = new URL(request.url);

  const response = pathname.startsWith("/assets/")
    ? await assets(request)
    : await siteHandler(backendDown, assets, origin, allowAll, "")(request);

  return {
    body: Buffer.from(await response.arrayBuffer()),
    headers: Object.fromEntries(response.headers.entries()),
    status: response.status,
  };
};

// @effect-diagnostics-next-line asyncFunction:off -- The local server is a Promise boundary.
const serve = async (incoming: IncomingMessage, outgoing: ServerResponse) => {
  const { body, headers, status } = await respond(
    new Request(`http://${incoming.headers.host}${incoming.url ?? "/"}`, {
      headers: { accept: incoming.headers.accept ?? "text/html" },
    })
  );

  outgoing.writeHead(status, headers);
  outgoing.end(body);
};

export const siteServer = Effect.acquireRelease(
  Effect.callback<number>((resume) => {
    const server = createServer((incoming, outgoing) => {
      void serve(incoming, outgoing);
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

export const PAGES = [
  "/",
  "/check",
  "/about",
  "/evals",
  "/privacy",
  "/no-such-page",
  ...GUIDES.map((guide) => `/${guide.id}`),
];
