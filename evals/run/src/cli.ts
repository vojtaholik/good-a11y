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
} from "effect";
import { Command, Flag } from "effect/cli";

import { AgentNameSchema } from "./agents.js";
import { liveGraders } from "./grade.js";
import { runOne } from "./run.js";
import type { RunPaths, RunResult } from "./run.js";
import { queryLogOf, summaryOf } from "./summary.js";
import { ARMS, ArmSchema, readTask } from "./task.js";

const commaList = (text: string): string[] =>
  text
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value !== "");

const decodeAgents = Schema.decodeUnknownEffect(
  Schema.NonEmptyArray(AgentNameSchema)
);

const decodeArms = Schema.decodeUnknownEffect(Schema.NonEmptyArray(ArmSchema));

const evalCommand = Command.make(
  "eval-run",
  {
    agents: Flag.String("agents").pipe(
      Flag.withDefault("claude,codex"),
      Flag.withDescription("Comma-separated: claude, codex, stub")
    ),
    app: Flag.String("app").pipe(
      Flag.withDescription("Base app under evals/apps, e.g. content")
    ),
    arms: Flag.String("arms").pipe(
      Flag.withDefault(ARMS.join(",")),
      Flag.withDescription("Comma-separated: unguided, guided")
    ),
    guide: Flag.String("guide").pipe(
      Flag.withDescription("Guide id, e.g. skip-link-landmarks")
    ),
    out: Flag.String("out").pipe(Flag.optional),
    runs: Flag.Int("runs").pipe(Flag.withDefault(3)),
    timeoutMinutes: Flag.Int("timeout-minutes").pipe(Flag.withDefault(20)),
  },
  Effect.fn("evalRun")(function* evalRun(flags) {
    const fileSystem = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const repoRoot = path.resolve(import.meta.dirname, "../../..");
    const evalsRoot = path.join(repoRoot, "evals");

    const paths: RunPaths = {
      bundle: path.join(
        repoRoot,
        "apps",
        "good-a11y",
        "bundle",
        "good-a11y.mjs"
      ),
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

    const stamp = DateTime.formatIso(yield* DateTime.now).replaceAll(
      /[:.]/gu,
      "-"
    );

    const outDir = Option.match(flags.out, {
      onNone: () => path.join(evalsRoot, "results", stamp),
      onSome: (out) => path.resolve(out),
    });

    const loaded = yield* readTask(evalsRoot, flags.guide, flags.app);
    const agents = yield* decodeAgents(commaList(flags.agents));
    const arms = yield* decodeArms(commaList(flags.arms));
    const results: RunResult[] = [];

    for (const agent of agents) {
      for (const arm of arms) {
        for (let index = 1; index <= flags.runs; index += 1) {
          const started = yield* Clock.currentTimeMillis;
          yield* Console.error(
            `run ${flags.guide} ${flags.app} ${agent} ${arm} ${index}`
          );

          const result = yield* runOne(
            {
              agent,
              arm,
              index,
              loaded,
              outDir,
              timeout: Duration.minutes(flags.timeoutMinutes),
            },
            paths
          ).pipe(Effect.provide(liveGraders(paths)));

          const finished = yield* Clock.currentTimeMillis;
          yield* Console.error(
            `  ${result.status}, ${result.passed ? "pass" : "fail"}, ${((finished - started) / 1000).toFixed(0)} s${result.problem === null ? "" : `: ${result.problem.slice(0, 200)}`}`
          );
          results.push(result);
        }
      }
    }

    const queries = queryLogOf(results, makeGuideIndex(GUIDES));

    yield* fileSystem.writeFileString(
      path.join(outDir, "results.json"),
      `${JSON.stringify(results, null, 2)}\n`
    );
    yield* fileSystem.writeFileString(
      path.join(outDir, "queries.jsonl"),
      queries.map((query) => JSON.stringify(query)).join("\n") +
        (queries.length === 0 ? "" : "\n")
    );
    yield* fileSystem.writeFileString(
      path.join(outDir, "summary.md"),
      summaryOf(results)
    );
    yield* Console.log(path.join(outDir, "summary.md"));
  })
).pipe(
  Command.withDescription(
    "Run the good-a11y guided vs unguided eval for one guide and one app"
  )
);

NodeRuntime.runMain(
  Command.runWith(evalCommand, { version: "0.1.0" })(
    process.argv.slice(2)
  ).pipe(Effect.provide(NodeServices.layer))
);
