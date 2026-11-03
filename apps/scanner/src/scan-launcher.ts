import type { ScanJob } from "@eaa-check/core";
import { Context } from "effect";
import type { Effect } from "effect";

import type { ScanLaunchFailed } from "./scan-launch-failed.js";

export class ScanLauncher extends Context.Service<
  ScanLauncher,
  {
    readonly launch: (job: ScanJob) => Effect.Effect<void, ScanLaunchFailed>;
  }
>()("@eaa-check/scanner/ScanLauncher") {}
