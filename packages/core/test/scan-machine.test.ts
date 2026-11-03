import { describe, expect, it } from "@effect/vitest";
import { Effect, Ref } from "effect";

import { ScanStepFailed, ScanSteps, reportOf, runScan } from "../src/index.js";
import type { Report, ScanJob } from "../src/index.js";

const job: ScanJob = {
  scanId: "scan-1",
  slug: "example.com",
  target: { schemeGuessed: true, url: "https://example.com/" },
};

const report: Report = reportOf(
  {
    finalUrl: "https://example.com/",
    httpStatus: 200,
    outcome: "checked",
    outcomeDetail: "The page was read.",
    requestedUrl: "https://example.com/",
    scannedAt: "2026-11-03T00:00:00.000Z",
    truncated: false,
  },
  []
);

const rendered = (scanned: Report): Report => ({
  ...scanned,
  headline: "rendered",
});

type Step = "scan" | "render" | "store" | "fail";

const hostWhere = (failing: readonly Step[]) =>
  Effect.gen(function* buildHost() {
    const calls = yield* Ref.make<readonly string[]>([]);
    const kept = yield* Ref.make<Report | null>(null);

    const record = (step: Step) =>
      Ref.update(calls, (done) => [...done, step]).pipe(
        Effect.andThen(
          failing.includes(step)
            ? Effect.fail(
                new ScanStepFailed({
                  detail: "generated",
                  scanId: job.scanId,
                  step,
                })
              )
            : Effect.void
        )
      );

    const steps = ScanSteps.of({
      fail: () => record("fail"),
      render: (_job, scanned) =>
        record("render").pipe(Effect.as(rendered(scanned))),
      scan: () => record("scan").pipe(Effect.as(report)),
      store: (_job, stored) =>
        record("store").pipe(Effect.andThen(Ref.set(kept, stored))),
    });

    return { calls, kept, steps };
  });

describe("runScan", () => {
  it.effect("publishes the static report when rendering is spent", () =>
    Effect.gen(function* renderSpent() {
      const host = yield* hostWhere(["render"]);

      const outcome = yield* runScan(job).pipe(
        Effect.provideService(ScanSteps, host.steps)
      );

      expect(outcome.stage).toBe("published");
      expect(yield* Ref.get(host.kept)).toEqual(report);
    })
  );

  it.effect("publishes the report the scan step returned", () =>
    Effect.gen(function* publishes() {
      const host = yield* hostWhere([]);

      const outcome = yield* runScan(job).pipe(
        Effect.provideService(ScanSteps, host.steps)
      );

      expect(outcome.stage).toBe("published");
      expect(yield* Ref.get(host.calls)).toEqual(["scan", "render", "store"]);
      expect(yield* Ref.get(host.kept)).toEqual(rendered(report));
    })
  );

  it.effect("settles as failed when the scan step is spent", () =>
    Effect.gen(function* scanSpent() {
      const host = yield* hostWhere(["scan"]);

      const outcome = yield* runScan(job).pipe(
        Effect.provideService(ScanSteps, host.steps)
      );

      expect(outcome.stage).toBe("failed");
      expect(yield* Ref.get(host.calls)).toEqual(["scan", "fail"]);
    })
  );

  it.effect("settles as failed when storing the report is spent", () =>
    Effect.gen(function* storeSpent() {
      const host = yield* hostWhere(["store"]);

      const outcome = yield* runScan(job).pipe(
        Effect.provideService(ScanSteps, host.steps)
      );

      expect(outcome.stage).toBe("failed");
      expect(yield* Ref.get(host.calls)).toEqual([
        "scan",
        "render",
        "store",
        "fail",
      ]);
      expect(yield* Ref.get(host.kept)).toBeNull();
    })
  );
});
