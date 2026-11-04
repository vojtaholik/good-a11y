import { toRpc } from "@eaa-check/capability/rpc";
import { ScanJobSchema } from "@eaa-check/core";
import { scanStoreD1 } from "@eaa-check/scan-store/d1";
import * as Cloudflare from "alchemy/Cloudflare";
import { Effect, Layer, Schema } from "effect";
import { RpcSerialization, RpcServer } from "effect/rpc";

import {
  DAILY_BROWSER_SECONDS_NAME,
  EMPTY_SUBMITS_NAME,
  dailyBrowserSeconds,
  emptySubmitsSetting,
} from "./browser-limits.js";
import {
  CallerMiddleware,
  callerMiddlewareLayer,
} from "./caller-middleware.js";
import { siteCapabilities } from "./capabilities/index.js";
import { DAILY_JUDGE_TOKENS_NAME, dailyJudgeTokens } from "./judge-limits.js";
import { ScanLaunchFailed } from "./scan-launch-failed.js";
import { ScanLauncher } from "./scan-launcher.js";
import ScanWorkflow from "./scan-workflow.js";

export const rpcProjection = toRpc(siteCapabilities, {
  middleware: CallerMiddleware,
  on: ["startScan"],
});

export default class Scanner extends Cloudflare.Workers.RpcWorker<Scanner>()(
  "Scanner",
  {
    compatibility: { date: "2026-09-01" },
    env: {
      [DAILY_BROWSER_SECONDS_NAME]: dailyBrowserSeconds,
      [DAILY_JUDGE_TOKENS_NAME]: dailyJudgeTokens,
      [EMPTY_SUBMITS_NAME]: emptySubmitsSetting,
    },
    main: import.meta.url,
    observability: { enabled: true },
    schema: rpcProjection.group,
    workersDev: false,
  },
  Effect.gen(function* makeScanner() {
    const scans = yield* ScanWorkflow;
    const stores = yield* Layer.build(scanStoreD1);

    const launcher = ScanLauncher.of({
      launch: (job) =>
        Schema.encodeEffect(ScanJobSchema)(job).pipe(
          Effect.flatMap((params) => scans.create({ id: job.scanId, params })),
          Effect.asVoid,
          Effect.mapError(
            (cause) => new ScanLaunchFailed({ cause, scanId: job.scanId })
          )
        ),
    });

    const services = Layer.mergeAll(
      rpcProjection.layer,
      callerMiddlewareLayer,
      RpcSerialization.layerJson
    ).pipe(
      Layer.provide(
        Layer.mergeAll(
          Layer.succeedContext(stores),
          Layer.succeed(ScanLauncher, launcher)
        )
      )
    );

    return yield* Effect.succeed(
      RpcServer.toHttpEffect(rpcProjection.group).pipe(Effect.provide(services))
    );
  })
) {}
