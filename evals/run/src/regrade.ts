import { DateTime, Duration, Effect, FileSystem, Path, Schema } from "effect";

import { RunResultSchema } from "./result.js";
import type { RunResult } from "./result.js";
import { gradeProject, prepareProject, runToEnd } from "./run.js";
import type { RunPaths } from "./run.js";
import { readTask } from "./task.js";

const decodeResult = Schema.decodeUnknownEffect(
  Schema.fromJsonString(RunResultSchema)
);

export class UnreadableResult extends Schema.TaggedError<UnreadableResult>()(
  "UnreadableResult",
  {
    file: Schema.String,
    problem: Schema.String,
  }
) {
  override get message(): string {
    return `Cannot regrade ${this.file}: ${this.problem}`;
  }
}

export const readResult = Effect.fn("readResult")(function* readResult(
  file: string
) {
  const fileSystem = yield* FileSystem.FileSystem;

  return yield* decodeResult(yield* fileSystem.readFileString(file)).pipe(
    Effect.mapError(
      (error) => new UnreadableResult({ file, problem: error.message })
    )
  );
});

export const regradeOne = Effect.fn("regradeOne")(function* regradeOne(
  runDir: string,
  paths: RunPaths
) {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const previous = yield* readResult(path.join(runDir, "result.json"));

  if (previous.status === "agent-failed" || previous.status === "run-failed") {
    return previous;
  }

  const loaded = yield* readTask(paths.evalsRoot, previous.guide, previous.app);

  const workDir = yield* fileSystem.makeTempDirectoryScoped({
    prefix: "good-a11y-regrade-",
  });

  const { built, project } = yield* prepareProject(
    {
      agent: previous.agent,
      arm: previous.arm,
      index: previous.run,
      loaded,
      outDir: path.dirname(path.dirname(runDir)),
      timeout: Duration.minutes(1),
    },
    paths,
    workDir
  );

  const patch = path.join(runDir, "changes.patch");
  const regradedAt = DateTime.formatIso(yield* DateTime.now);

  const save = (result: RunResult) =>
    fileSystem
      .writeFileString(
        path.join(runDir, "result.json"),
        `${JSON.stringify(result, null, 2)}\n`
      )
      .pipe(Effect.as(result));

  if ((yield* fileSystem.readFileString(patch)).trim() !== "") {
    const applied = yield* runToEnd(
      "git",
      ["apply", "--whitespace=nowarn", patch],
      { cwd: project }
    );

    if (applied.exitCode !== 0) {
      return yield* save({
        ...previous,
        check: null,
        expectations: [],
        passed: false,
        problem: `its changes.patch no longer applies to evals/apps/${previous.app}: ${applied.stderr.slice(-500)}`,
        regradedAt,
        status: "run-failed",
      });
    }
  }

  const grade = yield* gradeProject({
    built,
    project,
    runDir,
    task: loaded.task,
    taskFile: loaded.file,
  });

  return yield* save({ ...previous, ...grade, regradedAt });
}, Effect.scoped);
