import type { BrowserWorker } from "@cloudflare/puppeteer";
import { aiJudgeLayer } from "@eaa-check/ai-judge";
import type { ModelRunner } from "@eaa-check/ai-judge";
import { browserRenderedAuditLayer } from "@eaa-check/browser-audit";
import type { OnClose } from "@eaa-check/browser-audit";
import {
  BUDGET_SPENT,
  DAILY_BROWSER_SECONDS,
  DAILY_JUDGE_TOKENS,
  JUDGE_BUDGET_SPENT,
  JUDGE_FAILED,
  Judge,
  PageEvidenceSchema,
  RENDERED_AUDIT_RESERVE_SECONDS,
  RenderedAudit,
  ReportSchema,
  ScanJobSchema,
  ScanStepFailed,
  ScanSteps,
  inspectUrl,
  judgedOf,
  judgedSkipped,
  questionsFor,
  renderedFrom,
  runScan,
  skippedBecause,
  tokensToReserve,
  vetUrl,
  withJudged,
  withRendered,
} from "@eaa-check/core";
import type {
  Judged,
  PageEvidence,
  RenderedOutcome,
  Report,
  ScanJob,
} from "@eaa-check/core";
import {
  BrowserBudget,
  JudgeBudget,
  ScanStore,
  utcDayOf,
} from "@eaa-check/scan-store";
import { scanStoreD1 } from "@eaa-check/scan-store/d1";
import * as Cloudflare from "alchemy/Cloudflare";
import type { RuntimeContext } from "alchemy/RuntimeContext";
import {
  Clock,
  Config,
  Context,
  Effect,
  Layer,
  Ref,
  Result,
  Schema,
} from "effect";

import { DAILY_BROWSER_SECONDS_NAME, secondsUsed } from "./browser-limits.js";
import {
  EvidenceArchive,
  axeEvidenceKey,
  pageEvidenceKey,
} from "./evidence-archive.js";
import { scanDomainLayer } from "./scan-domain.js";

const ReportJson = Schema.fromJsonString(ReportSchema);

const EvidenceJson = Schema.fromJsonString(PageEvidenceSchema);

const JUDGE_PATIENCE = {
  retries: { delay: "3 seconds", limit: 0 },
  timeout: "120 seconds",
} as const;

const QUESTIONS_AT_ONCE = 4;

const STEP_PATIENCE = {
  retries: { backoff: "exponential", delay: "3 seconds", limit: 2 },
  timeout: "90 seconds",
} as const;

const RENDERS: ReadonlySet<Report["outcome"]> = new Set(["checked", "refused"]);

const RENDER_PATIENCE = {
  retries: { delay: "3 seconds", limit: 0 },
  timeout: "120 seconds",
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
    const judgeBudget = Context.get(stores, JudgeBudget);
    const ai = yield* Cloudflare.Workers.AI();
    const browser = yield* Cloudflare.Browser("BROWSER");

    const archive = yield* Cloudflare.R2.ReadWriteBucket(EvidenceArchive);
    const domain = yield* Layer.build(scanDomainLayer);

    const scan = (job: ScanJob) =>
      Effect.gen(function* scanStep() {
        yield* store.enter(job.scanId, "scanning");

        const { evidence, report } = yield* inspectUrl(job.target.url);

        if (evidence !== null) {
          yield* archive.put(
            pageEvidenceKey(job),
            yield* Schema.encodeEffect(EvidenceJson)(evidence)
          );
        }

        return yield* Schema.encodeEffect(ReportJson)(report);
      }).pipe(
        Effect.provideContext(domain),
        Effect.mapError(spentIn(job, "scan"))
      );

    const session = (job: ScanJob, report: Report, onClose: OnClose) =>
      Effect.gen(function* browserSession() {
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
          Effect.provide(browserRenderedAuditLayer(worker, onClose)),
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

    const audit = (job: ScanJob, report: Report) =>
      Effect.gen(function* auditStep() {
        const day = utcDayOf(yield* Clock.currentTimeMillis);

        const dailySeconds = yield* Config.Int(DAILY_BROWSER_SECONDS_NAME).pipe(
          Config.withDefault(DAILY_BROWSER_SECONDS)
        );

        const reserved = yield* budget.reserve({
          dailySeconds,
          day,
          seconds: RENDERED_AUDIT_RESERVE_SECONDS,
        });

        if (!reserved) {
          return { skipped: BUDGET_SPENT };
        }

        const startedAt = yield* Clock.currentTimeMillis;
        const closed = yield* Ref.make(true);

        return yield* session(job, report, (done) =>
          Ref.set(closed, done)
        ).pipe(
          Effect.ensuring(
            Clock.currentTimeMillis.pipe(
              Effect.flatMap((endedAt) =>
                Ref.get(closed).pipe(
                  Effect.flatMap((done) =>
                    budget.release({
                      day,
                      seconds: done
                        ? RENDERED_AUDIT_RESERVE_SECONDS -
                          secondsUsed(startedAt, endedAt)
                        : 0,
                    })
                  )
                )
              ),
              Effect.ignore
            )
          )
        );
      });

    const render = (job: ScanJob, report: Report) =>
      Effect.gen(function* renderStep() {
        if (!RENDERS.has(report.outcome)) {
          return yield* Schema.encodeEffect(ReportJson)(report);
        }

        const outcome = yield* audit(job, report);
        const result = renderedFrom(outcome);

        yield* Effect.logInfo(
          `Rendered check of ${job.target.url} after a ${report.outcome} fetch: ${result.status === "ran" ? "ran" : result.reason}`
        );

        const rendered = withRendered(report, outcome);

        return yield* Schema.encodeEffect(ReportJson)(rendered);
      }).pipe(Effect.mapError(spentIn(job, "render")));

    const askModel = (evidence: PageEvidence) =>
      Effect.gen(function* askModelStep() {
        const asked = questionsFor(evidence);

        const day = utcDayOf(yield* Clock.currentTimeMillis);
        const tokens = tokensToReserve(asked);

        const reserved = yield* judgeBudget.reserve({
          dailyTokens: DAILY_JUDGE_TOKENS,
          day,
          tokens,
        });

        if (!reserved) {
          return judgedSkipped(JUDGE_BUDGET_SPENT);
        }

        // oxlint-disable-next-line typescript/no-unsafe-assignment -- The linter does not load workers-types' global Ai; tsc types this binding, and the next line narrows it to ModelRunner.
        const binding = yield* ai.raw;

        // SAFETY: the Workers AI binding's run(model, inputs, options) is the ModelRunner call; workers-types only lists catalogue models by name, and judgeWith parses the reply with JudgeReplySchema.
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion, anti-slop/no-chained-type-assertions -- workers-types types Ai.run by its built-in model list, which does not name @cf/cloudflare/clef; the reply is decoded at the adapter boundary.
        const runner = binding as unknown as ModelRunner;

        const judged: Judged = yield* Effect.forEach(
          asked,
          (question) =>
            Judge.use((judge) => judge.ask(question.request)).pipe(
              Effect.map((reply) => ({ asked: question, reply }))
            ),
          { concurrency: QUESTIONS_AT_ONCE }
        ).pipe(
          Effect.provide(aiJudgeLayer(runner)),
          Effect.map((answered) => judgedOf(answered)),
          Effect.catchTag("JudgeUnavailable", (failure) =>
            Effect.logWarning(failure.message).pipe(
              Effect.as(judgedSkipped(JUDGE_FAILED))
            )
          )
        );

        if (judged.status === "ran") {
          yield* judgeBudget.settle({
            day,
            reserved: tokens,
            used: judged.inputTokens,
          });
        }

        return judged;
      });

    const judge = (job: ScanJob, report: Report) =>
      Effect.gen(function* judgeStep() {
        if (report.outcome !== "checked") {
          return yield* Schema.encodeEffect(ReportJson)(report);
        }

        const stored = yield* archive.get(pageEvidenceKey(job));

        if (stored === null) {
          return yield* Schema.encodeEffect(ReportJson)(report);
        }

        const evidence = yield* Schema.decodeEffect(EvidenceJson)(
          yield* stored.text()
        );

        const judged = yield* askModel(evidence);

        yield* Effect.logInfo(
          `Judged step for ${job.target.url}: ${judged.status === "ran" ? `${judged.inputTokens} input tokens` : judged.reason}`
        );

        return yield* Schema.encodeEffect(ReportJson)(
          withJudged(report, judged)
        );
      }).pipe(Effect.mapError(spentIn(job, "judge")));

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
        judge: (scanned, report) =>
          Cloudflare.Workflows.task(
            "judge",
            judge(scanned, report),
            JUDGE_PATIENCE
          ).pipe(
            Effect.provideContext(services),
            Effect.flatMap((json) =>
              Schema.decodeEffect(ReportJson)(json).pipe(
                Effect.mapError(spentIn(scanned, "judge"))
              )
            )
          ),
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
        Cloudflare.Workers.AIBinding,
        Cloudflare.Workers.BrowserBinding
      )
    )
  )
) {}
