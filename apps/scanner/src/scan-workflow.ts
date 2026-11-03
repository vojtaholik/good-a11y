import type { BrowserWorker } from "@cloudflare/puppeteer";
import { browserRenderedAuditLayer } from "@eaa-check/browser-audit";
import {
  BUDGET_SPENT,
  DAILY_BROWSER_SECONDS,
  RENDERED_AUDIT_RESERVE_SECONDS,
  RenderedAudit,
  ReportSchema,
  ScanJobSchema,
  ScanStepFailed,
  ScanSteps,
  runScan,
  scanUrl,
  skippedBecause,
  vetUrl,
  withRendered,
} from "@eaa-check/core";
import type { RenderedOutcome, Report, ScanJob } from "@eaa-check/core";
import { BrowserBudget, ScanStore, utcDayOf } from "@eaa-check/scan-store";
import { scanStoreD1 } from "@eaa-check/scan-store/d1";
import * as Cloudflare from "alchemy/Cloudflare";
import type { RuntimeContext } from "alchemy/RuntimeContext";
import { Clock, Context, Effect, Layer, Result, Schema } from "effect";

import { EvidenceArchive, axeEvidenceKey } from "./evidence-archive.js";
import { scanDomainLayer } from "./scan-domain.js";

const ReportJson = Schema.fromJsonString(ReportSchema);

const STEP_PATIENCE = {
  retries: { backoff: "exponential", delay: "3 seconds", limit: 2 },
  timeout: "90 seconds",
} as const;

const RENDER_PATIENCE = {
  retries: { delay: "3 seconds", limit: 0 },
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
    const stores = yield* Layer.build(scanStoreD1);
    const store = Context.get(stores, ScanStore);
    const budget = Context.get(stores, BrowserBudget);
    const browser = yield* Cloudflare.Browser("BROWSER");
    const archive = yield* Cloudflare.R2.ReadWriteBucket(EvidenceArchive);
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

    const audit = (job: ScanJob, report: Report) =>
      Effect.gen(function* auditStep() {
        const reserved = yield* budget.reserve({
          dailySeconds: DAILY_BROWSER_SECONDS,
          day: utcDayOf(yield* Clock.currentTimeMillis),
          seconds: RENDERED_AUDIT_RESERVE_SECONDS,
        });

        if (!reserved) {
          return { skipped: BUDGET_SPENT };
        }

        const vetted = vetUrl(report.finalUrl ?? job.target.url);

        if (Result.isFailure(vetted)) {
          return { skipped: vetted.failure.reason };
        }

        const binding = yield* browser.raw;

        // SAFETY: workers-types' BrowserRun and puppeteer's BrowserWorker name the same runtime Browser Rendering binding; they differ only in how each library types Request.
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion, anti-slop/no-chained-type-assertions -- One runtime binding typed by two libraries with different Request and Blob types; no shape check is possible across them.
        const worker = binding as unknown as BrowserWorker;

        const outcome: RenderedOutcome = yield* RenderedAudit.use((auditor) =>
          auditor.audit(vetted.success)
        ).pipe(
          Effect.provide(browserRenderedAuditLayer(worker)),
          Effect.matchEffect({
            onFailure: (failure) =>
              Effect.logWarning(
                `Rendered audit failed (${failure.kind}): ${failure.detail}`
              ).pipe(Effect.as({ skipped: skippedBecause(failure) })),
            onSuccess: (page) =>
              archive
                .put(axeEvidenceKey(job), page.axe)
                .pipe(Effect.as({ ran: page })),
          })
        );

        return outcome;
      });

    const render = (job: ScanJob, report: Report) =>
      Effect.gen(function* renderStep() {
        const rendered =
          report.outcome === "checked"
            ? withRendered(report, yield* audit(job, report))
            : report;

        return yield* Schema.encodeEffect(ReportJson)(rendered);
      }).pipe(Effect.mapError(spentIn(job, "render")));

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
        render: (scanned, report) =>
          Cloudflare.Workflows.task(
            "render",
            render(scanned, report),
            RENDER_PATIENCE
          ).pipe(
            Effect.provideContext(services),
            Effect.flatMap((json) =>
              Schema.decodeEffect(ReportJson)(json).pipe(
                Effect.mapError(spentIn(scanned, "render"))
              )
            )
          ),
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
  }).pipe(
    Effect.provide(
      Layer.mergeAll(
        Cloudflare.R2.ReadWriteBucketBinding,
        Cloudflare.Workers.BrowserBinding
      )
    )
  )
) {}
