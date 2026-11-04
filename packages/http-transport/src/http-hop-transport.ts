import { HopTransport, LocalHopTransport } from "@eaa-check/core";
import type { HopRequest, VettedUrl } from "@eaa-check/core";
import { Effect, Layer, Stream } from "effect";
import { FetchHttpClient, HttpClient, HttpClientRequest } from "effect/http";

import { toTransportFailure } from "./classify.js";

const openOn = Effect.gen(function* makeHttpHopTransport() {
  const client = HttpClient.withScope(yield* HttpClient.HttpClient);

  return (request: HopRequest<VettedUrl>) =>
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
});

export const hopTransportLayerOn = <E>(
  client: Layer.Layer<HttpClient.HttpClient, E>
): Layer.Layer<HopTransport, E> =>
  Layer.effect(
    HopTransport,
    openOn.pipe(Effect.map((open) => HopTransport.of({ open })))
  ).pipe(Layer.provide(client));

export const localHopTransportLayerOn = <E>(
  client: Layer.Layer<HttpClient.HttpClient, E>
): Layer.Layer<LocalHopTransport, E> =>
  Layer.effect(
    LocalHopTransport,
    openOn.pipe(Effect.map((open) => LocalHopTransport.of({ open })))
  ).pipe(Layer.provide(client));

export const httpHopTransportLayer = hopTransportLayerOn(FetchHttpClient.layer);
