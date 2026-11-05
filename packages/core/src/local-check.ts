import { Effect, Result, Schema } from "effect";

import { FlowAudit, FlowsSchema } from "./flow.js";
import type { Flow, Flows } from "./flow.js";
import { JUDGED_CHECKS, questionsFor } from "./judged.js";
import type { Asked } from "./judged.js";
import { isPrivateTarget, vetLocalUrl } from "./public-url.js";
import { RenderedAudit } from "./rendered-audit.js";
import { renderedEvidenceOf } from "./rendered-evidence.js";
import { skippedBecause } from "./rendered.js";
import type { RenderedOutcome } from "./rendered.js";
import { withRendered, ReportSchema } from "./report.js";
import type { Report } from "./report.js";
import { parseLocalTarget } from "./scan-target.js";
import { inspectTarget } from "./scan.js";
import { ScenarioAudit, TasksSchema } from "./scenario.js";
import type { Scenario, Tasks } from "./scenario.js";

export interface LocalCheck {
  readonly flows: Flows | null;
  readonly questions: readonly Asked[];
  readonly renderProblem: string | null;
  readonly report: Report;
  readonly tasks: Tasks | null;
}

const RENDERS: ReadonlySet<Report["outcome"]> = new Set(["checked", "refused"]);

const WCAG_QUESTIONS: ReadonlySet<string> = new Set(
  JUDGED_CHECKS.filter((check) => check.criteria.length > 0).map(
    (check) => check.id
  )
);

const renderedOutcome = (url: string) =>
  Effect.gen(function* renderLocally() {
    const vetted = vetLocalUrl(url);

    if (Result.isFailure(vetted)) {
      return {
        outcome: { skipped: vetted.failure.reason },
        problem: null,
      } as const;
    }

    return yield* RenderedAudit.use((auditor) =>
      auditor.audit(vetted.success)
    ).pipe(
      Effect.match({
        onFailure: (failure) => ({
          outcome: { skipped: skippedBecause(failure) },
          problem: `${failure.kind}: ${failure.detail}`,
        }),
        onSuccess: (page) => ({ outcome: { ran: page }, problem: null }),
      })
    );
  });

export const LocalReportSchema = Schema.Struct({
  ...ReportSchema.fields,
  flows: Schema.NullOr(FlowsSchema),
  tasks: Schema.NullOr(TasksSchema),
});

export const FLOWS_PUBLIC =
  "Flows run only against a page on your own machine: localhost, a private address or a one-label host. Run the app locally and check that address.";

const flowsOn = (url: string, flows: readonly Flow[]) =>
  Effect.gen(function* runFlows() {
    if (flows.length === 0) {
      return null;
    }

    const vetted = vetLocalUrl(url);

    if (Result.isFailure(vetted) || !isPrivateTarget(url)) {
      const skipped: Flows = { skipped: FLOWS_PUBLIC };

      return skipped;
    }

    return yield* FlowAudit.use((audit) =>
      audit.run(vetted.success, flows)
    ).pipe(
      Effect.match({
        onFailure: (failure): Flows => ({ skipped: failure.message }),
        onSuccess: (ran): Flows => ({ ran }),
      })
    );
  });

export const TASKS_PUBLIC =
  "Scenarios run only against a page on your own machine: localhost, a private address or a one-label host. Run the app locally and check that address.";

const tasksOn = (url: string, scenarios: readonly Scenario[]) =>
  Effect.gen(function* runScenarios() {
    if (scenarios.length === 0) {
      return null;
    }

    const vetted = vetLocalUrl(url);

    if (Result.isFailure(vetted) || !isPrivateTarget(url)) {
      const skipped: Tasks = { skipped: TASKS_PUBLIC };

      return skipped;
    }

    return yield* ScenarioAudit.use((audit) =>
      audit.run(vetted.success, scenarios)
    ).pipe(
      Effect.match({
        onFailure: (failure): Tasks => ({ skipped: failure.message }),
        onSuccess: (ran): Tasks => ({ ran }),
      })
    );
  });

const tasksUnrun = (
  url: string,
  scenarios: readonly Scenario[],
  reason: string
): Tasks | null => {
  if (scenarios.length === 0) {
    return null;
  }

  return { skipped: isPrivateTarget(url) ? reason : TASKS_PUBLIC };
};

const flowsUnrun = (
  url: string,
  flows: readonly Flow[],
  reason: string
): Flows | null => {
  if (flows.length === 0) {
    return null;
  }

  return { skipped: isPrivateTarget(url) ? reason : FLOWS_PUBLIC };
};

export const checkLocally = Effect.fn("checkLocally")(function* checkLocally(
  input: string,
  flows: readonly Flow[],
  scenarios: readonly Scenario[]
) {
  const target = yield* Effect.fromResult(parseLocalTarget(input));
  const { evidence, report } = yield* inspectTarget(target);

  if (!RENDERS.has(report.outcome)) {
    const unrendered: LocalCheck = {
      flows: flowsUnrun(target.url, flows, report.outcomeDetail),
      questions: [],
      renderProblem: null,
      report,
      tasks: tasksUnrun(target.url, scenarios, report.outcomeDetail),
    };

    return unrendered;
  }

  const { outcome, problem } = yield* renderedOutcome(
    report.finalUrl ?? target.url
  );

  const rendered: RenderedOutcome = outcome;

  const questions =
    evidence === null
      ? []
      : questionsFor({
          entered: evidence,
          rendered:
            "ran" in rendered ? renderedEvidenceOf(rendered.ran.probes) : null,
          statement: null,
        }).filter((asked) => WCAG_QUESTIONS.has(asked.id));

  const checked: LocalCheck = {
    flows: yield* flowsOn(report.finalUrl ?? target.url, flows),
    questions,
    renderProblem: problem,
    report: withRendered(report, rendered),
    tasks: yield* tasksOn(report.finalUrl ?? target.url, scenarios),
  };

  return checked;
});
