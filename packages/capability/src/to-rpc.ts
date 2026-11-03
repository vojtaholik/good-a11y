// @effect-diagnostics anyUnknownInErrorContext:off unsafeEffectTypeAssertion:off missingEffectContext:off -- This projection erases each capability's schema and requirement types while building the heterogeneous RpcGroup and recovers them at its public boundary.
import type { Layer } from "effect";
import { Effect } from "effect";
import type * as Rpc from "effect/rpc/Rpc";
import * as RpcGroup from "effect/rpc/RpcGroup";
import type * as RpcMiddleware from "effect/rpc/RpcMiddleware";

import type {
  AnyCapability,
  ContractOf,
  NameOf,
  RequirementsOf,
} from "./contract.js";
import { toRpcGroup } from "./to-rpc-group.js";
import type { RpcOf, RpcsOf } from "./to-rpc-group.js";

export type ContractsOf<Caps extends readonly AnyCapability[]> = {
  readonly [K in keyof Caps]: ContractOf<Caps[K]>;
};

export interface RpcGuard<
  Caps extends readonly AnyCapability[],
  Guarded extends NameOf<Caps[number]>,
  Middleware extends RpcMiddleware.AnyService,
> {
  readonly middleware: Middleware;
  readonly on: readonly Guarded[];
}

export type GuardedRpcOf<
  Capability,
  Guarded extends string,
  Middleware extends RpcMiddleware.AnyService,
> =
  NameOf<Capability> extends Guarded
    ? Rpc.AddMiddleware<RpcOf<ContractOf<Capability>>, Middleware>
    : RpcOf<ContractOf<Capability>>;

export type GuardedRequirementsOf<
  Capability,
  Guarded extends string,
  Middleware extends RpcMiddleware.AnyService,
> =
  NameOf<Capability> extends Guarded
    ? Exclude<
        RequirementsOf<Capability>,
        RpcMiddleware.Provides<Middleware["Identifier"]>
      >
    : RequirementsOf<Capability>;

type EachOf<Caps extends readonly AnyCapability[]> = Caps[number];

export interface RpcProjection<Caps extends readonly AnyCapability[]> {
  readonly group: RpcGroup.RpcGroup<RpcsOf<ContractsOf<Caps>>[number]>;
  readonly layer: Layer.Layer<
    Rpc.ToHandler<RpcsOf<ContractsOf<Caps>>[number]>,
    never,
    RequirementsOf<Caps>
  >;
}

export interface GuardedRpcProjection<
  Caps extends readonly AnyCapability[],
  Guarded extends string,
  Middleware extends RpcMiddleware.AnyService,
> {
  readonly group: RpcGroup.RpcGroup<
    EachOf<Caps> extends infer Capability
      ? Capability extends AnyCapability
        ? GuardedRpcOf<Capability, Guarded, Middleware>
        : never
      : never
  >;
  readonly layer: Layer.Layer<
    Rpc.ToHandler<RpcsOf<ContractsOf<Caps>>[number]>,
    never,
    EachOf<Caps> extends infer Capability
      ? Capability extends AnyCapability
        ? GuardedRequirementsOf<Capability, Guarded, Middleware>
        : never
      : never
  >;
}

interface ErasedGuard {
  readonly middleware: RpcMiddleware.AnyService;
  readonly on: readonly string[];
}

interface ErasedProjection {
  readonly group: unknown;
  readonly layer: unknown;
}

export function toRpc<const Caps extends readonly AnyCapability[]>(
  capabilities: Caps
): RpcProjection<Caps>;
export function toRpc<
  const Caps extends readonly AnyCapability[],
  const Guarded extends NameOf<Caps[number]>,
  Middleware extends RpcMiddleware.AnyService,
>(
  capabilities: Caps,
  guard: RpcGuard<Caps, Guarded, Middleware>
): GuardedRpcProjection<Caps, Guarded, Middleware>;
export function toRpc(
  capabilities: readonly AnyCapability[],
  guard?: ErasedGuard
): ErasedProjection {
  const contracts = capabilities.map((capability) => capability.contract);
  const plain = toRpcGroup(contracts).group;

  const guarded: unknown = RpcGroup.make(
    ...[...plain.requests.values()].map((rpc) =>
      guard?.on.includes(rpc._tag) === true
        ? rpc.middleware(guard.middleware)
        : rpc
    )
  );

  // SAFETY: the group holds the same RPCs in the same order; only the middleware set of the guarded ones differs, and the public overload states that difference.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const group = guarded as typeof plain;

  const layer = group.toLayer(
    Effect.gen(function* buildHandlers() {
      const context = yield* Effect.context();

      const handlers: Record<
        string,
        (
          // oxlint-disable-next-line anti-slop/no-unknown-parameters -- RpcGroup invokes this only after decoding the RPC payload schema.
          payload: unknown
        ) => Effect.Effect<unknown, unknown>
      > = {};

      for (const capability of capabilities) {
        // SAFETY: the server decodes this RPC's payload schema before dispatch, and each requirement of the capability is either captured in `context` here or provided around the handler by the guard's middleware, which is what the public overloads declare.
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion
        const run = capability.handler as (
          // oxlint-disable-next-line anti-slop/no-unknown-parameters -- RpcGroup invokes this only after decoding the RPC payload schema.
          input: unknown
        ) => Effect.Effect<unknown, unknown>;

        handlers[capability.contract.name] = (payload) =>
          run(payload).pipe(Effect.provideContext(context));
      }

      return handlers;
    })
  );

  return { group, layer };
}
