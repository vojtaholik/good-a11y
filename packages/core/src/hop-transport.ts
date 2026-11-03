import { Context } from "effect";
import type { Effect, Scope, Stream } from "effect";

import type { PublicUrl } from "./public-url.js";
import type { TransportFailure } from "./transport-failure.js";

export type HeaderMap = Readonly<Record<string, string>>;

export interface HopRequest {
  readonly headers: HeaderMap;
  readonly url: PublicUrl;
}

export interface HopResponse {
  readonly body: Stream.Stream<Uint8Array, TransportFailure>;
  readonly headers: HeaderMap;
  readonly status: number;
}

export class HopTransport extends Context.Service<
  HopTransport,
  {
    readonly open: (
      request: HopRequest
    ) => Effect.Effect<HopResponse, TransportFailure, Scope.Scope>;
  }
>()("@eaa-check/core/HopTransport") {}
