import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, Schema } from "effect";
import type { Command } from "effect/cli";
import { HttpRouter } from "effect/http";
import { RpcSerialization, RpcServer, RpcTest } from "effect/rpc";
import type * as Rpc from "effect/rpc/Rpc";

import {
  Approval,
  ApprovalDenied,
  defineContract,
  implement,
  toCommand,
  toRpc,
  toRpcGroup,
} from "../src/index.js";
import type {
  AnyCapability,
  ContractsOf,
  RpcProjection,
  RpcsOf,
} from "../src/index.js";
import {
  CALLER_HEADER,
  CallerMiddleware,
  callerMiddlewareLayer,
} from "./caller-middleware.js";
import { Caller } from "./caller.js";
import { Greeter, approved, echo, greet } from "./fixtures.js";
import { NotFound } from "./not-found.js";

type Assert<Condition extends true> = Condition;

type ApprovedHandler = Parameters<
  typeof implement<typeof approved.contract, never>
>[1];

type ForgedApprovalHandler = () => Effect.Effect<never, ApprovalDenied>;

export type ApprovalDeniedIsReservedForTheGate = Assert<
  ForgedApprovalHandler extends ApprovedHandler ? false : true
>;

const InvalidStrictRpcRequest = Schema.TaggedStruct("Request", {
  headers: Schema.Array(Schema.Tuple([Schema.String, Schema.String])),
  id: Schema.String,
  payload: Schema.Struct({ name: Schema.Finite }),
  tag: Schema.String,
});

const whoCallsContract = defineContract("whoCalls", {
  description: "Name the caller the middleware recognised",
  failure: NotFound,
  input: Schema.Struct({}),
  output: Schema.Struct({ caller: Schema.String }),
});

const whoCalls = implement(whoCallsContract, () =>
  Caller.use((caller) => Effect.succeed({ caller: caller.name }))
);

const guardedProjection = toRpc([echo, whoCalls], {
  middleware: CallerMiddleware,
  on: ["whoCalls"],
});

const unguardedProjection = toRpc([whoCalls]);

const whoCallsCommand = toCommand(whoCalls);

type NeedsOfLayer<Built> =
  Built extends Layer.Layer<infer _Provided, infer _Failure, infer Needs>
    ? Needs
    : never;

type NeedsOfCommand<Built> =
  Built extends Command.Command<
    infer _Name,
    infer _Input,
    infer _Context,
    infer _Failure,
    infer Needs
  >
    ? Needs
    : never;

export type GuardProvidesWhatItsHandlersNeed = Assert<
  [NeedsOfLayer<typeof guardedProjection.layer>] extends [never] ? true : false
>;

type Exactly<Left, Right> = [Left] extends [Right]
  ? [Right] extends [Left]
    ? true
    : false
  : false;

export type UnguardedHandlersStillNeedIt = Assert<
  Exactly<NeedsOfLayer<typeof unguardedProjection.layer>, Caller>
>;

export type ACommandStillNeedsIt = Assert<
  Exactly<NeedsOfCommand<typeof whoCallsCommand>, Caller>
>;

const makeInMemoryRpc = <Caps extends readonly AnyCapability[]>(
  projection: RpcProjection<Caps>,
  handlers: Layer.Layer<Rpc.ToHandler<RpcsOf<ContractsOf<Caps>>[number]>>
) => RpcTest.makeClient(projection.group).pipe(Effect.provide(handlers));

const projection = toRpc([echo, greet]);

const clientGroup = toRpcGroup([echo.contract, greet.contract]);

const greeterLayer = projection.layer.pipe(Layer.provide(Greeter.layer));

const approvalProjection = toRpc([approved]);

const deniedApprovalLayer = approvalProjection.layer.pipe(
  Layer.provide(Approval.denyAll)
);

const allowedApprovalLayer = approvalProjection.layer.pipe(
  Layer.provide(Approval.allowAll)
);

describe("toRpc", () => {
  it("builds a client group from contracts without implementations", () => {
    expect([...clientGroup.group.requests.keys()]).toEqual(["echo", "greet"]);
    expect(clientGroup.group.requests.get("echo")?.payloadSchema).toBe(
      echo.contract.input
    );
    expect([...projection.group.requests.keys()]).toEqual([
      ...clientGroup.group.requests.keys(),
    ]);
    expect(projection.group.requests.get("echo")?.payloadSchema).toBe(
      clientGroup.group.requests.get("echo")?.payloadSchema
    );
    expect(projection.group.requests.get("echo")?.successSchema).toBe(
      clientGroup.group.requests.get("echo")?.successSchema
    );
    expect(projection.group.requests.get("echo")?.errorSchema).toBe(
      clientGroup.group.requests.get("echo")?.errorSchema
    );
  });

  it.effect("returns a decoded capability output from an in-memory RPC", () =>
    Effect.gen(function* success() {
      const client = yield* makeInMemoryRpc(projection, greeterLayer);
      const echoed = yield* client.echo({ text: "ab", times: 2 });
      const greeting = yield* client.greet({ name: "rat" });

      expect(echoed).toEqual({ text: "abab" });
      expect(greeting).toEqual({ greeting: "hello rat" });
    })
  );

  it.effect("decodes declared failures as their tagged error class", () =>
    Effect.gen(function* declaredFailure() {
      const client = yield* makeInMemoryRpc(projection, greeterLayer);
      const error = yield* client.greet({ name: "nobody" }).pipe(Effect.flip);

      expect(Schema.is(NotFound)(error)).toBe(true);
    })
  );

  it.effect("propagates approval requirements to handlers", () =>
    Effect.gen(function* approval() {
      const deniedClient = yield* makeInMemoryRpc(
        approvalProjection,
        deniedApprovalLayer
      );

      const deniedError = yield* deniedClient
        .approved({ message: "run" })
        .pipe(Effect.flip);

      expect(Schema.is(ApprovalDenied)(deniedError)).toBe(true);

      const allowedClient = yield* makeInMemoryRpc(
        approvalProjection,
        allowedApprovalLayer
      );

      const output = yield* allowedClient.approved({ message: "run" });

      expect(output).toEqual({ ok: true });
    })
  );

  it.effect(
    "a guard's middleware provides its service to the capabilities it is put on, refuses a call it cannot serve before the handler runs, and leaves every other capability alone",
    () =>
      Effect.gen(function* guarded() {
        const client = yield* RpcTest.makeClient(guardedProjection.group).pipe(
          Effect.provide(
            Layer.mergeAll(guardedProjection.layer, callerMiddlewareLayer)
          )
        );

        const named = yield* client.whoCalls(
          {},
          { headers: { [CALLER_HEADER]: "rat" } }
        );

        const unnamed = yield* client.whoCalls({}).pipe(Effect.flip);
        const unguarded = yield* client.echo({ text: "ab" });

        expect(named).toEqual({ caller: "rat" });
        expect(unnamed).toEqual(new NotFound({ name: CALLER_HEADER }));
        expect(unguarded).toEqual({ text: "ab" });
        expect(
          [...guardedProjection.group.requests.values()].map((rpc) => [
            rpc._tag,
            rpc.middlewares.size,
          ])
        ).toEqual([
          ["echo", 0],
          ["whoCalls", 1],
        ]);
      })
  );

  it.effect("rejects invalid payloads before running the handler", () =>
    Effect.gen(function* invalidPayload() {
      let handlerRuns = 0;

      const strictContract = defineContract("strict", {
        description: "Accept a string name",
        failure: Schema.Never,
        input: Schema.Struct({ name: Schema.String }),
        output: Schema.Struct({ name: Schema.String }),
      });

      const strict = implement(strictContract, ({ name }) =>
        Effect.sync(() => {
          handlerRuns += 1;

          return { name };
        })
      );

      const strictProjection = toRpc([strict]);

      const serverLayer = RpcServer.layerHttp({
        group: strictProjection.group,
        path: "/rpc",
        protocol: "http",
      }).pipe(
        Layer.provideMerge(strictProjection.layer),
        Layer.provide(RpcSerialization.layerJson)
      );

      const { dispose, handler } = HttpRouter.toWebHandler(serverLayer, {
        disableLogger: true,
      });

      yield* Effect.addFinalizer(() => Effect.promise(dispose));

      // oxlint-disable-next-line typescript/promise-function-async -- HttpRouter exposes a Promise API for this in-memory RPC transport test.
      const response = yield* Effect.promise(() =>
        handler(
          new Request("http://localhost/rpc", {
            body: JSON.stringify(
              InvalidStrictRpcRequest.make({
                headers: [],
                id: "invalid-payload",
                payload: { name: 42 },
                tag: "strict",
              })
            ),
            headers: { "content-type": "application/json" },
            method: "POST",
          })
        )
      );

      // oxlint-disable-next-line typescript/promise-function-async -- Web Response.text returns a Promise at this in-memory transport boundary.
      const responseText = yield* Effect.promise(() => response.text());

      expect(handlerRuns).toBe(0);
      expect(responseText).toContain('"_tag":"Exit"');
      expect(responseText).toContain('"_tag":"Failure"');
    })
  );
});
