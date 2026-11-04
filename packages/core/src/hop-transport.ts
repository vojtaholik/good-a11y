import { Context } from "effect";
import type { Effect, Scope, Stream } from "effect";

import type { PublicUrl, VettedUrl } from "./public-url.js";
import type { TransportFailure } from "./transport-failure.js";

export type HeaderMap = Readonly<Record<string, string>>;

export interface HopRequest<Url extends VettedUrl = PublicUrl> {
  readonly headers: HeaderMap;
  readonly url: Url;
}

export interface HopResponse {
  readonly body: Stream.Stream<Uint8Array, TransportFailure>;
  readonly headers: HeaderMap;
  readonly status: number;
}

export type OpenHop<Url extends VettedUrl> = (
  request: HopRequest<Url>
) => Effect.Effect<HopResponse, TransportFailure, Scope.Scope>;

export class HopTransport extends Context.Service<
  HopTransport,
  { readonly open: OpenHop<PublicUrl> }
>()("@eaa-check/core/HopTransport") {}
