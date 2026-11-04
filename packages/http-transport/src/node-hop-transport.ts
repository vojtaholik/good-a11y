import { HopTransport, LocalHopTransport } from "@eaa-check/core";
import type { HopRequest, VettedUrl } from "@eaa-check/core";
import { NodeHttpClient } from "@effect/platform-node";
import { Effect, Layer } from "effect";

import { decompressed } from "./decompress.js";
import {
  hopTransportLayerOn,
  localHopTransportLayerOn,
} from "./http-hop-transport.js";
import { publicLookup } from "./public-lookup.js";

const vettedTransport = hopTransportLayerOn(
  NodeHttpClient.layerNodeHttpNoAgent.pipe(
    Layer.provide(NodeHttpClient.layerAgentOptions({ lookup: publicLookup }))
  )
);

const localTransport = localHopTransportLayerOn(
  NodeHttpClient.layerNodeHttpNoAgent.pipe(
    Layer.provide(NodeHttpClient.layerAgentOptions())
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

export const localNodeHopTransportLayer = Layer.effect(
  LocalHopTransport,
  Effect.gen(function* makeLocalNodeHopTransport() {
    const transport = yield* LocalHopTransport;

    return LocalHopTransport.of({
      open: (request: HopRequest<VettedUrl>) =>
        Effect.map(transport.open(request), decompressed),
    });
  })
).pipe(Layer.provide(localTransport));
