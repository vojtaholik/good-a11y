import {
  ReportSchema,
  ScanJobSchema,
  ScanStepFailed,
  ScanSteps,
  runScan,
  scanUrl,
} from "@eaa-check/core";
import type { Report, ScanJob } from "@eaa-check/core";
import { ScanStore } from "@eaa-check/scan-store";
import { scanStoreD1 } from "@eaa-check/scan-store/d1";
import * as Cloudflare from "alchemy/Cloudflare";
import type { RuntimeContext } from "alchemy/RuntimeContext";
import { Clock, Context, Effect, Layer, Schema } from "effect";

import { scanDomainLayer } from "./scan-domain.js";

const ReportJson = Schema.fromJsonString(ReportSchema);

const STEP_PATIENCE = {
  retries: { backoff: "exponential", delay: "3 seconds", limit: 2 },
  timeout: "90 seconds",
} as const;

const spentIn =
  (job: ScanJob, step: ScanStepFailed["step"]) =>
  // oxlint-disable-next-line anti-slop/no-unknown-parameters -- A storage, decoding or fetch failure of any type becomes the detail of one typed step failure.
  (cause: unknown) =>
    new ScanStepFailed({ detail: String(cause), scanId: job.scanId, step });

export default class ScanWorkflow extends Cloudflare.Workflow<ScanWorkflow>()(
  "ScanWorkflow",
  Effect.gen(function* makeScanWorkflow() {
    const store = Context.get(yield* Layer.build(scanStoreD1), ScanStore);
    const domain = yield* Layer.build(scanDomainLayer);

    const scan = (job: ScanJob) =>
      Effect.gen(function* scanStep() {
        yield* store.enter(job.scanId, "scanning");

        const report = yield* scanUrl(job.target.url);

        return yield* Schema.encodeEffect(ReportJson)(report);
      }).pipe(
        Effect.provideContext(domain),
        Effect.mapError(spentIn(job, "scan"))
      );

    const keep = (job: ScanJob, report: Report) =>
      Effect.gen(function* storeStep() {
        yield* store.publish(
          job.scanId,
          report,
          yield* Clock.currentTimeMillis
        );
      }).pipe(Effect.mapError(spentIn(job, "store")));

    const fail = (job: ScanJob, failure: string) =>
      Effect.gen(function* failStep() {
        yield* store.fail(job.scanId, failure, yield* Clock.currentTimeMillis);
      }).pipe(Effect.mapError(spentIn(job, "fail")));

    // oxlint-disable-next-line anti-slop/no-unknown-parameters -- A Workflow's params arrive from the platform as stored JSON and are decoded on the first line.
    return Effect.fn(function* scanWorkflow(params: unknown) {
      const job = yield* Schema.decodeUnknownEffect(ScanJobSchema)(params).pipe(
        Effect.orDie
      );

      const services = yield* Effect.context<
        Cloudflare.Workflows.WorkflowStep | RuntimeContext
      >();

      const steps = ScanSteps.of({
        fail: (scanned, failure) =>
          Cloudflare.Workflows.task(
            "fail",
            fail(scanned, failure),
            STEP_PATIENCE
          ).pipe(Effect.provideContext(services)),
        scan: (scanned) =>
          Cloudflare.Workflows.task("scan", scan(scanned), STEP_PATIENCE).pipe(
            Effect.provideContext(services),
            Effect.flatMap((json) =>
              Schema.decodeEffect(ReportJson)(json).pipe(
                Effect.mapError(spentIn(scanned, "scan"))
              )
            )
          ),
        store: (scanned, report) =>
          Cloudflare.Workflows.task(
            "store",
            keep(scanned, report),
            STEP_PATIENCE
          ).pipe(Effect.provideContext(services)),
      });

      return yield* runScan(job).pipe(Effect.provideService(ScanSteps, steps));
    });
  })
) {}
