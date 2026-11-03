import { Effect, Layer, Stream } from "effect";

import { HopTransport, SafeFetch, TransportFailure } from "../src/index.js";
import type { HeaderMap, HopRequest } from "../src/index.js";

export interface Scripted {
  readonly body?: string;
  readonly chunks?: readonly Uint8Array[];
  readonly failure?: TransportFailure["kind"];
  readonly headers?: HeaderMap;
  readonly status?: number;
}

export type Site = (url: string, headers: HeaderMap) => Scripted | undefined;

export const scriptedTransport = (site: Site, requests: HopRequest[]) =>
  HopTransport.of({
    open: (request) =>
      Effect.suspend(() => {
        requests.push(request);
        const scripted = site(request.url, request.headers) ?? { status: 404 };

        if (scripted.failure !== undefined) {
          return Effect.fail(
            new TransportFailure({ detail: "scripted", kind: scripted.failure })
          );
        }

        return Effect.succeed({
          body: Stream.fromIterable(
            scripted.chunks ?? [new TextEncoder().encode(scripted.body ?? "")]
          ),
          headers: scripted.headers ?? {},
          status: scripted.status ?? 200,
        });
      }),
  });

export const scriptedFetch = (site: Site, requests: HopRequest[]) =>
  SafeFetch.layer.pipe(
    Layer.provide(
      Layer.succeed(HopTransport, scriptedTransport(site, requests))
    )
  );

export const redirectTo = (location: string, status = 302): Scripted => ({
  headers: { location },
  status,
});

export const html = (body: string): Scripted => ({
  body,
  headers: { "content-type": "text/html; charset=utf-8" },
});
