import { HopTransport } from "@eaa-check/core";
import type { HopRequest } from "@eaa-check/core";
import { Effect, Layer, Stream } from "effect";
import { FetchHttpClient, HttpClient, HttpClientRequest } from "effect/http";

import { toTransportFailure } from "./classify.js";

const make = Effect.gen(function* makeHttpHopTransport() {
  const client = HttpClient.withScope(yield* HttpClient.HttpClient);

  const open = (request: HopRequest) =>
    client
      .execute(HttpClientRequest.get(request.url, { headers: request.headers }))
      .pipe(
        Effect.map((response) => ({
          body: Stream.mapError(response.stream, toTransportFailure),
          headers: { ...response.headers },
          status: response.status,
        })),
        Effect.mapError(toTransportFailure),
        Effect.provideService(FetchHttpClient.RequestInit, {
          redirect: "manual",
        }),
        Effect.provideService(HttpClient.TracerPropagationEnabled, false)
      );

  return HopTransport.of({ open });
});

export const httpHopTransportLayer = Layer.effect(HopTransport, make).pipe(
  Layer.provide(FetchHttpClient.layer)
);
