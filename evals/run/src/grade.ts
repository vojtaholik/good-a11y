import { ReportSchema, issueGroupsOf } from "@good-a11y/core";
import { guidesForCheck } from "@good-a11y/guides";
import { Context, Effect, Layer, Schema } from "effect";
import { ChildProcess, ChildProcessSpawner } from "effect/process";

import { GradeFailed } from "./grade-failed.js";

export { GradeFailed } from "./grade-failed.js";

export interface CheckGrade {
  readonly failing: readonly string[];
  readonly guideFailing: readonly string[];
  readonly headline: string;
  readonly verdict: string | null;
}

export interface Expectation {
  readonly ok: boolean;
  readonly title: string;
}

export interface GraderGrade {
  readonly expectations: readonly Expectation[];
}

export interface GradeInput {
  readonly guide: string;
  readonly outputDir: string;
  readonly taskFile: string;
  readonly url: string;
}

export class Graders extends Context.Service<
  Graders,
  {
    readonly check: (
      input: GradeInput
    ) => Effect.Effect<CheckGrade, GradeFailed>;
    readonly expectations: (
      input: GradeInput
    ) => Effect.Effect<GraderGrade, GradeFailed>;
  }
>()("@good-a11y/eval-run/Graders") {}

const decodeReport = Schema.decodeUnknownEffect(
  Schema.fromJsonString(ReportSchema)
);

interface PlaywrightSuite {
  readonly specs?:
    | readonly { readonly ok: boolean; readonly title: string }[]
    | undefined;
  readonly suites?: readonly PlaywrightSuite[] | undefined;
}

const PlaywrightSuiteSchema: Schema.Codec<PlaywrightSuite> = Schema.Struct({
  specs: Schema.optional(
    Schema.Array(Schema.Struct({ ok: Schema.Boolean, title: Schema.String }))
  ),
  suites: Schema.optional(
    Schema.Array(
      Schema.suspend((): Schema.Codec<PlaywrightSuite> => PlaywrightSuiteSchema)
    )
  ),
});

const decodePlaywright = Schema.decodeUnknownEffect(
  Schema.fromJsonString(
    Schema.Struct({ suites: Schema.Array(PlaywrightSuiteSchema) })
  )
);

const specsOf = (suite: PlaywrightSuite): Expectation[] => [
  ...(suite.specs ?? []).map(({ ok, title }) => ({ ok, title })),
  ...(suite.suites ?? []).flatMap(specsOf),
];

export const checkGradeOf = (
  report: typeof ReportSchema.Type,
  guide: string
): CheckGrade => {
  const { benchmark, newer } = issueGroupsOf(report);

  const failing = [...benchmark, ...newer].flatMap((issue) =>
    issue.failing > 0 ? [issue.key] : []
  );

  return {
    failing,
    guideFailing: failing.filter((key) => guidesForCheck(key).includes(guide)),
    headline: report.headline,
    verdict: report.verdict?.kind ?? null,
  };
};

export const liveGraders = (paths: {
  readonly bundle: string;
  readonly evalsRoot: string;
}) =>
  Layer.effect(
    Graders,
    Effect.gen(function* liveGradersLayer() {
      const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;

      const check = Effect.fn("check")(function* check(input: GradeInput) {
        const output = yield* spawner
          .string(
            ChildProcess.make(process.execPath, [
              paths.bundle,
              "check",
              "--json",
              input.url,
            ])
          )
          .pipe(
            Effect.mapError(
              (error) =>
                new GradeFailed({ grader: "check", problem: error.message })
            )
          );

        const report = yield* decodeReport(output).pipe(
          Effect.mapError(
            (error) =>
              new GradeFailed({
                grader: "check",
                problem: `its --json output is not a report (${error.message}): ${output.slice(0, 200)}`,
              })
          )
        );

        return checkGradeOf(report, input.guide);
      });

      const expectations = Effect.fn("expectations")(function* expectations(
        input: GradeInput
      ) {
        const output = yield* spawner
          .string(
            ChildProcess.make(
              "pnpm",
              [
                "--silent",
                "exec",
                "playwright",
                "test",
                `graders/${input.guide}.spec.ts`,
                "--reporter=json",
                "--workers=2",
                "--output",
                input.outputDir,
              ],
              {
                cwd: paths.evalsRoot,
                env: { EVAL_TARGET_URL: input.url, EVAL_TASK: input.taskFile },
                extendEnv: true,
              }
            )
          )
          .pipe(
            Effect.mapError(
              (error) =>
                new GradeFailed({
                  grader: "playwright",
                  problem: error.message,
                })
            )
          );

        const report = yield* decodePlaywright(output).pipe(
          Effect.mapError(
            (error) =>
              new GradeFailed({
                grader: "playwright",
                problem: `its JSON report did not decode (${error.message}): ${output.slice(0, 200)}`,
              })
          )
        );

        const all = report.suites.flatMap(specsOf);

        if (all.length === 0) {
          return yield* new GradeFailed({
            grader: "playwright",
            problem: `graders/${input.guide}.spec.ts ran no expectation`,
          });
        }

        return { expectations: all };
      });

      return Graders.of({ check, expectations });
    })
  );
