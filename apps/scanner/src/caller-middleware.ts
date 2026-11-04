import { Effect, Layer } from "effect";
import * as RpcMiddleware from "effect/rpc/RpcMiddleware";

import { CALLER_HEADER, Caller, UNKNOWN_CALLER } from "./caller.js";

export class CallerMiddleware extends RpcMiddleware.Service<
  CallerMiddleware,
  { provides: Caller }
>()("@good-a11y/scanner/CallerMiddleware") {}

export const callerMiddlewareLayer = Layer.succeed(
  CallerMiddleware,
  (effect, { headers }) =>
    Effect.provideService(effect, Caller, {
      key: headers[CALLER_HEADER] ?? UNKNOWN_CALLER,
    })
);
