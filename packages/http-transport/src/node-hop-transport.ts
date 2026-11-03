import { NodeHttpClient } from "@effect/platform-node";
import { Layer } from "effect";

import { hopTransportLayerOn } from "./http-hop-transport.js";
import { publicLookup } from "./public-lookup.js";

export const nodeHopTransportLayer = hopTransportLayerOn(
  NodeHttpClient.layerNodeHttpNoAgent.pipe(
    Layer.provide(NodeHttpClient.layerAgentOptions({ lookup: publicLookup }))
  )
);
