// @effect-diagnostics nodeBuiltinImport:off -- NodeHttpServer.make takes a Node http.Server factory; createServer is that boundary.
import { createServer } from "node:http";

import { NodeHttpPlatform, NodeHttpServer } from "@effect/platform-node";
import { Effect, Schema } from "effect";
import { HttpStaticServer } from "effect/http";

const TcpAddress = Schema.Struct({ port: Schema.Int });

export const serveDirectory = Effect.fn("serveDirectory")(
  function* serveDirectory(root: string) {
    const server = yield* NodeHttpServer.make(() => createServer(), {
      host: "127.0.0.1",
      port: 0,
    });

    const app = yield* HttpStaticServer.make({
      index: "index.html",
      root,
    }).pipe(Effect.provide(NodeHttpPlatform.layer));

    yield* server.serve(app);

    const { port } = yield* Schema.decodeUnknownEffect(TcpAddress)(
      server.address
    ).pipe(Effect.orDie);

    return `http://127.0.0.1:${port}`;
  }
);
