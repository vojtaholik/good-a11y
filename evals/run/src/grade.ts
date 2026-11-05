import { headlessShellPath } from "@good-a11y/browser-audit/headless-shell";
import {
  LocalReportSchema,
  ScenarioDriverFailed,
  issueGroupsOf,
} from "@good-a11y/core";
import type { Tasks } from "@good-a11y/core";
import { guidesForCheck } from "@good-a11y/guides";
import { Context, Effect, Layer, Schema } from "effect";
import { ChildProcess, ChildProcessSpawner } from "effect/process";

import { GradeFailed } from "./grade-failed.js";

export { GradeFailed } from "./grade-failed.js";

export interface TaskGrade {
  readonly driverErrors: number;
  readonly finished: number;
  readonly scenarios: readonly {
    readonly driverError: boolean;
    readonly id: string;
    readonly status: "finished" | "not_finished";
  }[];
  readonly skipped: string | null;
  readonly total: number;
}

export interface CheckGrade {
  readonly failing: readonly string[];
  readonly guideFailing: readonly string[];
  readonly headline: string;
  readonly tasks: TaskGrade | null;
  readonly verdict: string | null;
}

export interface Expectation {
  readonly error: string | null;
  readonly ok: boolean;
  readonly title: string;
}

export interface GraderGrade {
  readonly expectations: readonly Expectation[];
}

export interface GradeInput {
  readonly guide: string;
  readonly outputDir: string;
  readonly scenariosFile: string | null;
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
  Schema.fromJsonString(LocalReportSchema)
);

const DRIVER_FAILED = new ScenarioDriverFailed({ detail: "" }).message;

export const taskGradeOf = (tasks: Tasks | null): TaskGrade | null => {
  if (tasks === null) {
    return null;
  }

  if ("skipped" in tasks) {
    return {
      driverErrors: 0,
      finished: 0,
      scenarios: [],
      skipped: tasks.skipped,
      total: 0,
    };
  }

  const scenarios = tasks.ran.map((result) => ({
    driverError:
      result.status === "not_finished" &&
      result.runs.some(
        (run) => run.problem?.startsWith(DRIVER_FAILED) ?? false
      ),
    id: result.id,
    status: result.status,
  }));

  return {
    driverErrors: scenarios.filter((scenario) => scenario.driverError).length,
    finished: scenarios.filter((scenario) => scenario.status === "finished")
      .length,
    scenarios,
    skipped: null,
    total: scenarios.length,
  };
};

interface PlaywrightSpec {
  readonly ok: boolean;
  readonly tests: readonly {
    readonly results: readonly {
      readonly error?: { readonly message?: string | undefined } | undefined;
    }[];
  }[];
  readonly title: string;
}

const PlaywrightSpecSchema = Schema.Struct({
  ok: Schema.Boolean,
  tests: Schema.Array(
    Schema.Struct({
      results: Schema.Array(
        Schema.Struct({
          error: Schema.optional(
            Schema.Struct({ message: Schema.optional(Schema.String) })
          ),
        })
      ),
    })
  ),
  title: Schema.String,
});

interface PlaywrightSuite {
  readonly specs?: readonly PlaywrightSpec[] | undefined;
  readonly suites?: readonly PlaywrightSuite[] | undefined;
}

const PlaywrightSuiteSchema: Schema.Codec<PlaywrightSuite> = Schema.Struct({
  specs: Schema.optional(Schema.Array(PlaywrightSpecSchema)),
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

const ANSI = new RegExp(`${String.fromCodePoint(27)}\\[[\\d;]*m`, "gu");

const firstErrorLine = (tests: PlaywrightSpec["tests"]): string | null => {
  const message = tests
    .flatMap((test) => test.results)
    .find((result) => result.error?.message !== undefined)?.error?.message;

  return message === undefined
    ? null
    : (message.replaceAll(ANSI, "").split("\n")[0]?.slice(0, 300) ?? null);
};

const specsOf = (suite: PlaywrightSuite): Expectation[] => [
  ...(suite.specs ?? []).map(({ ok, tests, title }) => ({
    error: ok ? null : firstErrorLine(tests),
    ok,
    title,
  })),
  ...(suite.suites ?? []).flatMap(specsOf),
];

export const checkGradeOf = (
  report: typeof LocalReportSchema.Type,
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
    tasks: taskGradeOf(report.tasks),
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
            ChildProcess.make(
              process.execPath,
              [
                paths.bundle,
                "check",
                "--json",
                ...(input.scenariosFile === null
                  ? []
                  : ["--scenarios", input.scenariosFile]),
                input.url,
              ],
              {
                env: { GOOD_A11Y_CHROME: headlessShellPath() },
                extendEnv: true,
              }
            )
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
