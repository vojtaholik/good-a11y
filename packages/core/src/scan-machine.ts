import { watchActor } from "@eaa-check/capability/actor-watch";
import {
  createEffectActor,
  fromEffect,
  join,
  setupEffect,
} from "@xstate/effect";
import { Effect, Schema } from "effect";
import { types } from "xstate";

import { ReportSchema } from "./report.js";
import type { Report } from "./report.js";
import { SCAN_FAILED, ScanJobSchema, ScanOutcomeSchema } from "./scan-job.js";
import type { ScanJob, ScanOutcome } from "./scan-job.js";
import { ScanSteps } from "./scan-steps.js";

interface ScanContext {
  readonly job: ScanJob;
  readonly report: Report | undefined;
  readonly stage: ScanOutcome["stage"] | undefined;
}

const StepInput = Schema.Struct({ job: ScanJobSchema });

const StoreInput = Schema.Struct({
  job: ScanJobSchema,
  report: Schema.UndefinedOr(ReportSchema),
});

const scan = fromEffect({
  effect: ({ input }) => ScanSteps.use((steps) => steps.scan(input.job)),
  schemas: { input: StepInput, output: ReportSchema },
});

const crawl = fromEffect({
  effect: ({ input: { job, report } }) =>
    report === undefined
      ? Effect.die(
          new Error(`Scan ${job.scanId} reached crawling without a report`)
        )
      : ScanSteps.use((steps) => steps.crawl(job, report)),
  schemas: { input: StoreInput, output: ReportSchema },
});

const render = fromEffect({
  effect: ({ input: { job, report } }) =>
    report === undefined
      ? Effect.die(
          new Error(`Scan ${job.scanId} reached rendering without a report`)
        )
      : ScanSteps.use((steps) => steps.render(job, report)),
  schemas: { input: StoreInput, output: ReportSchema },
});

const judge = fromEffect({
  effect: ({ input: { job, report } }) =>
    report === undefined
      ? Effect.die(
          new Error(`Scan ${job.scanId} reached judging without a report`)
        )
      : ScanSteps.use((steps) => steps.judge(job, report)),
  schemas: { input: StoreInput, output: ReportSchema },
});

const store = fromEffect({
  effect: ({ input: { job, report } }) =>
    report === undefined
      ? Effect.die(
          new Error(`Scan ${job.scanId} reached storing without a report`)
        )
      : ScanSteps.use((steps) => steps.store(job, report)),
  schemas: { input: StoreInput },
});

const settleFailed = fromEffect({
  effect: ({ input }) =>
    ScanSteps.use((steps) => steps.fail(input.job, SCAN_FAILED)),
  schemas: { input: StepInput },
});

export const scanMachine = setupEffect({
  actors: { crawl, judge, render, scan, settleFailed, store },
  schemas: {
    context: types<ScanContext>(),
    input: ScanJobSchema,
  },
}).createMachine({
  context: ({ input }) => ({ job: input, report: undefined, stage: undefined }),
  initial: "scanning",
  output: ({ context }) => ({ stage: context.stage }),
  states: {
    crawling: {
      invoke: {
        input: ({ context }) => ({ job: context.job, report: context.report }),
        onDone: {
          context: ({ context, event }) => ({
            ...context,
            report: event.output,
          }),
          target: "rendering",
        },
        onError: { target: "rendering" },
        src: "crawl",
      },
    },
    failed: { type: "final" },
    failing: {
      invoke: {
        input: ({ context }) => ({ job: context.job }),
        onDone: {
          context: ({ context }) => ({ ...context, stage: "failed" as const }),
          target: "failed",
        },
        src: "settleFailed",
      },
    },
    judging: {
      invoke: {
        input: ({ context }) => ({ job: context.job, report: context.report }),
        onDone: {
          context: ({ context, event }) => ({
            ...context,
            report: event.output,
          }),
          target: "storing",
        },
        onError: { target: "storing" },
        src: "judge",
      },
    },
    published: { type: "final" },
    rendering: {
      invoke: {
        input: ({ context }) => ({ job: context.job, report: context.report }),
        onDone: {
          context: ({ context, event }) => ({
            ...context,
            report: event.output,
          }),
          target: "judging",
        },
        onError: { target: "judging" },
        src: "render",
      },
    },
    scanning: {
      invoke: {
        input: ({ context }) => ({ job: context.job }),
        onDone: {
          context: ({ context, event }) => ({
            ...context,
            report: event.output,
          }),
          target: "crawling",
        },
        onError: { target: "failing" },
        src: "scan",
      },
    },
    storing: {
      invoke: {
        input: ({ context }) => ({ job: context.job, report: context.report }),
        onDone: {
          context: ({ context }) => ({
            ...context,
            stage: "published" as const,
          }),
          target: "published",
        },
        onError: { target: "failing" },
        src: "store",
      },
    },
  },
});

export const runScan = Effect.fn("runScan")(function* runScan(job: ScanJob) {
  const actor = yield* createEffectActor(scanMachine, { input: job });

  yield* watchActor("scanMachine", actor);
  // @effect-diagnostics-next-line anyUnknownInErrorContext:off -- The machine handles every step failure itself, so an error that reaches join is the fail step failing or a programming error. A machine's ErrorFrom is unknown by design (statelyai/xstate#5725), so the diagnostic is off for this one call and orDie closes it.
  const output = yield* join(actor).pipe(Effect.orDie);

  return yield* Schema.decodeUnknownEffect(ScanOutcomeSchema)(output).pipe(
    Effect.orDie
  );
}, Effect.scoped);
