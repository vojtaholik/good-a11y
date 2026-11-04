import { Effect, FileSystem, Path, Schema } from "effect";

export const ARMS = ["unguided", "guided", "url"] as const;

export const DEFAULT_ARMS = ["unguided", "guided"] as const;

export const ArmSchema = Schema.Literals(ARMS);

export type Arm = typeof ArmSchema.Type;

export const TaskSchema = Schema.Struct({
  app: Schema.String.check(Schema.isPattern(/^[a-z\d-]+$/u)),
  guide: Schema.String.check(Schema.isPattern(/^[a-z\d-]+$/u)),
  path: Schema.String.check(Schema.isPattern(/^\//u)),
  prompt: Schema.String.check(Schema.isMinLength(1)),
});

export type Task = typeof TaskSchema.Type;

export interface LoadedTask {
  readonly file: string;
  readonly task: Task;
}

export class MalformedTask extends Schema.TaggedError<MalformedTask>()(
  "MalformedTask",
  {
    file: Schema.String,
    problem: Schema.String,
  }
) {
  override get message(): string {
    return `Malformed eval task ${this.file}: ${this.problem}. A task is evals/tasks/<guide>/<app>.json with guide, app, prompt and path.`;
  }
}

const decodeTask = Schema.decodeUnknownEffect(
  Schema.fromJsonString(TaskSchema)
);

export const readTask = Effect.fn("readTask")(function* readTask(
  evalsRoot: string,
  guide: string,
  app: string
) {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const file = path.join(evalsRoot, "tasks", guide, `${app}.json`);

  if (!(yield* fileSystem.exists(file))) {
    return yield* new MalformedTask({
      file,
      problem: "the file does not exist",
    });
  }

  const task = yield* decodeTask(yield* fileSystem.readFileString(file)).pipe(
    Effect.mapError(
      (error) => new MalformedTask({ file, problem: error.message })
    )
  );

  if (task.guide !== guide || task.app !== app) {
    return yield* new MalformedTask({
      file,
      problem: `it names guide "${task.guide}" and app "${task.app}", not its folder and file name`,
    });
  }

  return { file, task } satisfies LoadedTask;
});

export const readTasks = Effect.fn("readTasks")(function* readTasks(
  evalsRoot: string,
  only: { readonly app: string | undefined; readonly guide: string | undefined }
) {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const tasksDir = path.join(evalsRoot, "tasks");
  const tasks: LoadedTask[] = [];

  for (const guide of (yield* fileSystem.readDirectory(tasksDir)).toSorted()) {
    if (only.guide !== undefined && guide !== only.guide) {
      continue;
    }

    for (const file of (yield* fileSystem.readDirectory(
      path.join(tasksDir, guide)
    )).toSorted()) {
      const app = path.basename(file, ".json");

      if (
        file.endsWith(".json") &&
        (only.app === undefined || app === only.app)
      ) {
        tasks.push(yield* readTask(evalsRoot, guide, app));
      }
    }
  }

  if (tasks.length === 0) {
    return yield* new MalformedTask({
      file: tasksDir,
      problem: `no task matches guide ${only.guide ?? "any"} and app ${only.app ?? "any"}`,
    });
  }

  return tasks;
});
