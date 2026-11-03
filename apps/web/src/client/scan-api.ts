import { toRpcGroup } from "@eaa-check/capability/rpc-group";
import {
  getScanContract,
  sendMessageContract,
  startScanContract,
} from "@eaa-check/core/contracts";
import { Context, Effect, Layer } from "effect";
import { FetchHttpClient } from "effect/http";
import { RpcClient, RpcSerialization } from "effect/rpc";

const { group } = toRpcGroup([
  startScanContract,
  getScanContract,
  sendMessageContract,
]);

const protocol = RpcClient.layerProtocolHttp({ url: "/rpc" }).pipe(
  Layer.provide([FetchHttpClient.layer, RpcSerialization.layerJson])
);

const make = RpcClient.make(group).pipe(Effect.provide(protocol));

export class ScanApi extends Context.Service<
  ScanApi,
  Effect.Success<typeof make>
>()("@eaa-check/web/ScanApi", { make }) {
  static readonly layer = Layer.effect(this, this.make);
}
