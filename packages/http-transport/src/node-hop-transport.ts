import { HopTransport } from "@eaa-check/core";
import type { HopRequest } from "@eaa-check/core";
import { NodeHttpClient } from "@effect/platform-node";
import { Effect, Layer } from "effect";

import { decompressed } from "./decompress.js";
import { hopTransportLayerOn } from "./http-hop-transport.js";
import { publicLookup } from "./public-lookup.js";

const vettedTransport = hopTransportLayerOn(
  NodeHttpClient.layerNodeHttpNoAgent.pipe(
    Layer.provide(NodeHttpClient.layerAgentOptions({ lookup: publicLookup }))
  )
);

export const nodeHopTransportLayer = Layer.effect(
  HopTransport,
  Effect.gen(function* makeNodeHopTransport() {
    const transport = yield* HopTransport;

    return HopTransport.of({
      open: (request: HopRequest) =>
        Effect.map(transport.open(request), decompressed),
    });
  })
).pipe(Layer.provide(vettedTransport));
