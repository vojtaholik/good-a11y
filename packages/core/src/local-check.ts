import { Effect, Result } from "effect";

import { JUDGED_CHECKS, questionsFor } from "./judged.js";
import type { Asked } from "./judged.js";
import { vetLocalUrl } from "./public-url.js";
import { RenderedAudit } from "./rendered-audit.js";
import { renderedEvidenceOf } from "./rendered-evidence.js";
import { skippedBecause } from "./rendered.js";
import type { RenderedOutcome } from "./rendered.js";
import { withRendered } from "./report.js";
import type { Report } from "./report.js";
import { parseLocalTarget } from "./scan-target.js";
import { inspectTarget } from "./scan.js";

export interface LocalCheck {
  readonly questions: readonly Asked[];
  readonly renderProblem: string | null;
  readonly report: Report;
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

export const checkLocally = Effect.fn("checkLocally")(function* checkLocally(
  input: string
) {
  const target = yield* Effect.fromResult(parseLocalTarget(input));
  const { evidence, report } = yield* inspectTarget(target);

  if (!RENDERS.has(report.outcome)) {
    const unrendered: LocalCheck = {
      questions: [],
      renderProblem: null,
      report,
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
    questions,
    renderProblem: problem,
    report: withRendered(report, rendered),
  };

  return checked;
});
