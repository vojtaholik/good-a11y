import type { ScanView } from "@good-a11y/core/contracts";
import { Effect, Layer, Option } from "effect";
import { FetchHttpClient } from "effect/http";

import { ScanApi } from "../client/scan-api.js";
import { CALLER_HEADER } from "./handler.js";
import type { BackendFetch } from "./rpc.js";

export const BACKEND_RPC_URL = "https://backend.internal/rpc";

export interface ScanRequest {
  readonly scanId?: string;
  readonly slug: string;
}

const fetchOn =
  (backend: BackendFetch, caller: string | null): typeof globalThis.fetch =>
  // @effect-diagnostics-next-line asyncFunction:off -- fetch is a Promise boundary to the backend service binding.
  async (input, init) => {
    const request = new Request(input, init);

    if (caller !== null) {
      request.headers.set(CALLER_HEADER, caller);
    }

    return await backend(request);
  };

export const backendApi = (
  backend: BackendFetch,
  caller: string | null = null
) =>
  ScanApi.layerAt(BACKEND_RPC_URL).pipe(
    Layer.provide(
      Layer.succeed(FetchHttpClient.Fetch, fetchOn(backend, caller))
    )
  );

export const readScan = (
  backend: BackendFetch,
  request: ScanRequest
): Effect.Effect<Option.Option<ScanView>> =>
  ScanApi.use((api) => api.getScan(request)).pipe(
    Effect.provide(backendApi(backend)),
    Effect.matchCause({
      onFailure: () => Option.none(),
      onSuccess: Option.some,
    })
  );
