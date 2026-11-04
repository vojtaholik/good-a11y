import type { ScanJob } from "@good-a11y/core";
import { Context } from "effect";
import type { Effect } from "effect";

import type { ScanLaunchFailed } from "./scan-launch-failed.js";

export class ScanLauncher extends Context.Service<
  ScanLauncher,
  {
    readonly launch: (job: ScanJob) => Effect.Effect<void, ScanLaunchFailed>;
  }
>()("@good-a11y/scanner/ScanLauncher") {}
