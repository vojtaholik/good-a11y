import { toRpcGroup } from "@good-a11y/capability/rpc-group";
import {
  getScanContract,
  sendMessageContract,
  startScanContract,
} from "@good-a11y/core/contracts";
import { Context, Effect, Layer } from "effect";
import { FetchHttpClient } from "effect/http";
import { RpcClient, RpcSerialization } from "effect/rpc";

const { group } = toRpcGroup([
  startScanContract,
  getScanContract,
  sendMessageContract,
]);

const scanApiProtocol = (url: string) =>
  RpcClient.layerProtocolHttp({ url }).pipe(
    Layer.provide([FetchHttpClient.layer, RpcSerialization.layerJson])
  );

const makeScanApi = RpcClient.make(group);

export class ScanApi extends Context.Service<
  ScanApi,
  Effect.Success<typeof makeScanApi>
>()("@good-a11y/web/ScanApi", {
  make: makeScanApi.pipe(Effect.provide(scanApiProtocol("/rpc"))),
}) {
  static readonly layer = Layer.effect(this, this.make);

  static readonly layerAt = (url: string) =>
    Layer.effect(this, makeScanApi.pipe(Effect.provide(scanApiProtocol(url))));
}
