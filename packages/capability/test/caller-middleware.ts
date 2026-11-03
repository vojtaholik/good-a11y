import { Effect, Layer } from "effect";
import * as RpcMiddleware from "effect/rpc/RpcMiddleware";

import { Caller } from "./caller.js";
import { NotFound } from "./not-found.js";

export const CALLER_HEADER = "x-caller";

export class CallerMiddleware extends RpcMiddleware.Service<
  CallerMiddleware,
  { provides: Caller }
>()("@eaa-check/capability/test/CallerMiddleware", { error: NotFound }) {}

export const callerMiddlewareLayer = Layer.succeed(
  CallerMiddleware,
  (effect, { headers }) => {
    const name = headers[CALLER_HEADER];

    return name === undefined
      ? Effect.fail(new NotFound({ name: CALLER_HEADER }))
      : Effect.provideService(effect, Caller, { name });
  }
);
