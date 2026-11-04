import { Context } from "effect";
import type { Effect } from "effect";

import type { Report } from "./report.js";
import type { ScanJob } from "./scan-job.js";
import type { ScanStepFailed } from "./scan-step-failed.js";

export class ScanSteps extends Context.Service<
  ScanSteps,
  {
    readonly crawl: (
      job: ScanJob,
      report: Report
    ) => Effect.Effect<Report, ScanStepFailed>;
    readonly fail: (
      job: ScanJob,
      failure: string
    ) => Effect.Effect<void, ScanStepFailed>;
    readonly judge: (
      job: ScanJob,
      report: Report
    ) => Effect.Effect<Report, ScanStepFailed>;
    readonly render: (
      job: ScanJob,
      report: Report
    ) => Effect.Effect<Report, ScanStepFailed>;
    readonly scan: (job: ScanJob) => Effect.Effect<Report, ScanStepFailed>;
    readonly store: (
      job: ScanJob,
      report: Report
    ) => Effect.Effect<void, ScanStepFailed>;
  }
>()("@eaa-check/core/ScanSteps") {}
