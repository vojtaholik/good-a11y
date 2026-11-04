#!/usr/bin/env node

import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { GUIDES, makeGuideIndex } from "@good-a11y/guides";
import {
  Clock,
  Console,
  DateTime,
  Duration,
  Effect,
  FileSystem,
  Path,
  Schema,
  Option,
  Exit,
  Cause,
} from "effect";
import { Command, Flag } from "effect/cli";

import { AgentNameSchema } from "./agents.js";
import { liveGraders } from "./grade.js";
import { regradeOne } from "./regrade.js";
import { failedRun, runOne } from "./run.js";
import type { RunPaths, RunResult, RunSpec } from "./run.js";
import { queryLogOf, summaryOf } from "./summary.js";
import { ARMS, ArmSchema, readTasks } from "./task.js";

const commaList = (text: string): string[] =>
  text
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value !== "");

const decodeAgents = Schema.decodeUnknownEffect(
  Schema.NonEmptyArray(AgentNameSchema)
);

const decodeArms = Schema.decodeUnknownEffect(Schema.NonEmptyArray(ArmSchema));

const runPathsOf = (path: Path.Path): RunPaths => {
  const repoRoot = path.resolve(import.meta.dirname, "../../..");
  const evalsRoot = path.join(repoRoot, "evals");

  return {
    bundle: path.join(repoRoot, "apps", "good-a11y", "bundle", "good-a11y.mjs"),
    evalsRoot,
    skill: path.join(repoRoot, "skills", "good-a11y", "SKILL.md"),
    stubScript: path.join(
      evalsRoot,
      "run",
      "test",
      "fixtures",
      "stub-agent.mjs"
    ),
  };
};

const writeOutputs = Effect.fn("writeOutputs")(function* writeOutputs(
  outDir: string,
  results: readonly RunResult[]
) {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const queries = queryLogOf(results, makeGuideIndex(GUIDES));

  yield* fileSystem.writeFileString(
    path.join(outDir, "results.json"),
    `${JSON.stringify(results, null, 2)}\n`
  );
  yield* fileSystem.writeFileString(
    path.join(outDir, "queries.jsonl"),
    queries.map((query) => `${JSON.stringify(query)}\n`).join("")
  );
  yield* fileSystem.writeFileString(
    path.join(outDir, "summary.md"),
    summaryOf(results)
  );
  yield* Console.log(path.join(outDir, "summary.md"));
});

const concurrencyFlag = Flag.Int("concurrency").pipe(
  Flag.withDefault(6),
  Flag.withDescription("Runs at once; each has its own temp copy and port")
);

const regradeCommand = Command.make(
  "regrade",
  {
    concurrency: concurrencyFlag,
    from: Flag.String("from").pipe(
      Flag.withDescription(
        "A results directory from an earlier eval; regraded in place"
      )
    ),
  },
  Effect.fn("regrade")(function* regrade(flags) {
    const fileSystem = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const paths = runPathsOf(path);
    const from = path.resolve(flags.from);
    const runsDir = path.join(from, "runs");
    const ids = (yield* fileSystem.readDirectory(runsDir)).toSorted();

    yield* Console.error(
      `regrading ${ids.length} runs in ${from}, ${flags.concurrency} at once`
    );

    const results = yield* Effect.forEach(
      ids,
      (id) =>
        regradeOne(path.join(runsDir, id), paths).pipe(
          Effect.provide(liveGraders(paths)),
          Effect.tap((result) =>
            Console.error(
              `${result.id}: ${result.status}, ${result.passed ? "pass" : "fail"}${result.problem === null ? "" : `: ${result.problem.slice(0, 200)}`}`
            )
          )
        ),
      { concurrency: flags.concurrency }
    );

    yield* writeOutputs(from, results);
  })
).pipe(
  Command.withDescription(
    "Grade every run of an earlier eval again from its changes.patch, with the current graders and task files; agent stats are kept"
  )
);

const evalCommand = Command.make(
  "eval-run",
  {
    agents: Flag.String("agents").pipe(
      Flag.withDefault("claude,codex"),
      Flag.withDescription("Comma-separated: claude, codex, stub")
    ),
    app: Flag.String("app").pipe(
      Flag.optional,
      Flag.withDescription(
        "Base app under evals/apps, e.g. content; omit for every app"
      )
    ),
    arms: Flag.String("arms").pipe(
      Flag.withDefault(ARMS.join(",")),
      Flag.withDescription("Comma-separated: unguided, guided")
    ),
    concurrency: concurrencyFlag,
    guide: Flag.String("guide").pipe(
      Flag.optional,
      Flag.withDescription(
        "Guide id, e.g. skip-link-landmarks; omit for every guide"
      )
    ),
    out: Flag.String("out").pipe(Flag.optional),
    runs: Flag.Int("runs").pipe(Flag.withDefault(3)),
    timeoutMinutes: Flag.Int("timeout-minutes").pipe(Flag.withDefault(20)),
  },
  Effect.fn("evalRun")(function* evalRun(flags) {
    const fileSystem = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const paths = runPathsOf(path);
    const { evalsRoot } = paths;

    const stamp = DateTime.formatIso(yield* DateTime.now).replaceAll(
      /[:.]/gu,
      "-"
    );

    const outDir = Option.match(flags.out, {
      onNone: () => path.join(evalsRoot, "results", stamp),
      onSome: (out) => path.resolve(out),
    });

    const tasks = yield* readTasks(evalsRoot, {
      app: Option.getOrUndefined(flags.app),
      guide: Option.getOrUndefined(flags.guide),
    });

    const agents = yield* decodeAgents(commaList(flags.agents));
    const arms = yield* decodeArms(commaList(flags.arms));

    const specs: RunSpec[] = tasks.flatMap((loaded) =>
      agents.flatMap((agent) =>
        arms.flatMap((arm) =>
          Array.from({ length: flags.runs }, (_, offset) => ({
            agent,
            arm,
            index: offset + 1,
            loaded,
            outDir,
            timeout: Duration.minutes(flags.timeoutMinutes),
          }))
        )
      )
    );

    const runSafely = Effect.fn("runSafely")(function* runSafely(
      spec: RunSpec
    ) {
      const started = yield* Clock.currentTimeMillis;

      const exit = yield* runOne(spec, paths).pipe(
        Effect.provide(liveGraders(paths)),
        Effect.exit
      );

      const result = Exit.isSuccess(exit)
        ? exit.value
        : failedRun(spec, Cause.pretty(exit.cause));

      if (Exit.isFailure(exit)) {
        const runDir = path.join(outDir, "runs", result.id);
        yield* fileSystem.makeDirectory(runDir, { recursive: true });
        yield* fileSystem.writeFileString(
          path.join(runDir, "result.json"),
          `${JSON.stringify(result, null, 2)}\n`
        );
      }

      const finished = yield* Clock.currentTimeMillis;
      yield* Console.error(
        `${result.id}: ${result.status}, ${result.passed ? "pass" : "fail"}, ${((finished - started) / 1000).toFixed(0)} s${result.problem === null ? "" : `: ${result.problem.slice(0, 200)}`}`
      );

      return result;
    });

    yield* Console.error(
      `${specs.length} runs, ${flags.concurrency} at once, results in ${outDir}`
    );

    const results = yield* Effect.forEach(specs, runSafely, {
      concurrency: flags.concurrency,
    });

    yield* writeOutputs(outDir, results);
  })
).pipe(
  Command.withDescription(
    "Run the good-a11y guided vs unguided eval for every task, or one guide and app"
  ),
  Command.withSubcommands([regradeCommand])
);

NodeRuntime.runMain(
  Command.runWith(evalCommand, { version: "0.1.0" })(
    process.argv.slice(2)
  ).pipe(Effect.provide(NodeServices.layer))
);
