import {
  Clock,
  Config,
  Duration,
  Effect,
  FileSystem,
  Path,
  Schema,
  Stream,
} from "effect";
import { ChildProcess, ChildProcessSpawner } from "effect/process";

import { invocationOf } from "./agents.js";
import type { AgentName } from "./agents.js";
import { Graders } from "./grade.js";
import type { CheckGrade, Expectation } from "./grade.js";
import { serveDirectory } from "./serve.js";
import type { Arm, LoadedTask } from "./task.js";
import { summarizeTranscript } from "./transcript.js";
import type { TranscriptSummary } from "./transcript.js";

export const SHIPPED_COMMAND = "npx -y github:vojtaholik/good-a11y";

export interface RunPaths {
  readonly bundle: string;
  readonly evalsRoot: string;
  readonly skill: string;
  readonly stubScript: string;
}

export interface RunSpec {
  readonly agent: AgentName;
  readonly arm: Arm;
  readonly index: number;
  readonly loaded: LoadedTask;
  readonly outDir: string;
  readonly timeout: Duration.Duration;
}

export type RunStatus = "graded" | "agent-failed" | "grade-failed";

export interface RunResult {
  readonly agent: AgentName;
  readonly agentExitCode: number | null;
  readonly app: string;
  readonly arm: Arm;
  readonly check: CheckGrade | null;
  readonly durationMs: number;
  readonly expectations: readonly Expectation[];
  readonly guide: string;
  readonly guideRetrieved: boolean;
  readonly id: string;
  readonly passed: boolean;
  readonly problem: string | null;
  readonly run: number;
  readonly status: RunStatus;
  readonly transcript: TranscriptSummary;
}

export class AppNotServable extends Schema.TaggedError<AppNotServable>()(
  "AppNotServable",
  {
    app: Schema.String,
  }
) {
  override get message(): string {
    return `The eval app "${this.app}" has a package.json, so it needs a build before it can be served; the runner serves static apps only so far.`;
  }
}

export const runIdOf = (
  spec: Pick<RunSpec, "agent" | "arm" | "index" | "loaded">
): string =>
  `${spec.loaded.task.guide}--${spec.loaded.task.app}--${spec.agent}--${spec.arm}--${spec.index}`;

export const installedSkill = (skill: string, bundle: string): string =>
  skill.replaceAll(SHIPPED_COMMAND, `node ${bundle}`);

export const AGENTS_POINTER =
  "\n\n## Accessibility\n\nBefore any UI, HTML, form or component work, read `.claude/skills/good-a11y/SKILL.md` and follow it.\n";

const collect = (stream: Stream.Stream<Uint8Array, unknown>) =>
  stream.pipe(
    Stream.decodeText(),
    Stream.runFold(
      () => "",
      (text, chunk) => text + chunk
    ),
    Effect.orElseSucceed(() => "")
  );

const prepareProject = Effect.fn("prepareProject")(function* prepareProject(
  spec: RunSpec,
  paths: RunPaths,
  workDir: string
) {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
  const project = path.join(workDir, "project");
  const app = path.join(paths.evalsRoot, "apps", spec.loaded.task.app);

  yield* fileSystem.copy(app, project);

  if (yield* fileSystem.exists(path.join(project, "package.json"))) {
    return yield* new AppNotServable({ app: spec.loaded.task.app });
  }

  if (spec.arm === "guided") {
    const skillDir = path.join(project, ".claude", "skills", "good-a11y");
    const agentsFile = path.join(project, "AGENTS.md");

    const agents = (yield* fileSystem.exists(agentsFile))
      ? yield* fileSystem.readFileString(agentsFile)
      : "# Project notes";

    yield* fileSystem.makeDirectory(skillDir, { recursive: true });
    yield* fileSystem.writeFileString(
      path.join(skillDir, "SKILL.md"),
      installedSkill(
        yield* fileSystem.readFileString(paths.skill),
        paths.bundle
      )
    );
    yield* fileSystem.writeFileString(
      agentsFile,
      `${agents.trimEnd()}${AGENTS_POINTER}`
    );
  }

  const git = (args: readonly string[]) =>
    spawner.exitCode(
      ChildProcess.make(
        "git",
        ["-c", "user.name=eval", "-c", "user.email=eval@localhost", ...args],
        {
          cwd: project,
        }
      )
    );

  yield* git(["init", "-q"]);
  yield* git(["add", "-A"]);
  yield* git(["commit", "-q", "-m", "base app"]);

  return project;
});

const codexHomeOf = Effect.fn("codexHomeOf")(function* codexHomeOf(
  workDir: string
) {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const home = yield* Config.String("HOME");
  const codexHome = path.join(workDir, "codex-home");

  yield* fileSystem.makeDirectory(codexHome, { recursive: true });
  yield* fileSystem.symlink(
    path.join(home, ".codex", "auth.json"),
    path.join(codexHome, "auth.json")
  );

  return codexHome;
});

const runAgent = Effect.fn("runAgent")(function* runAgent(
  spec: RunSpec,
  paths: RunPaths,
  project: string,
  workDir: string
) {
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
  const codexHome = spec.agent === "codex" ? yield* codexHomeOf(workDir) : "";

  const invocation = invocationOf(spec.agent, {
    codexHome,
    project,
    prompt: spec.loaded.task.prompt,
    stubScript: paths.stubScript,
  });

  return yield* Effect.scoped(
    Effect.gen(function* agentProcess() {
      const handle = yield* spawner.spawn(
        ChildProcess.make(invocation.command, [...invocation.args], {
          cwd: project,
          env: invocation.env,
          extendEnv: true,
          stdin: "ignore",
        })
      );

      const [stdout, stderr, exitCode] = yield* Effect.all(
        [collect(handle.stdout), collect(handle.stderr), handle.exitCode],
        { concurrency: "unbounded" }
      );

      return { exitCode: Number(exitCode), stderr, stdout };
    })
  ).pipe(
    Effect.timeoutOrElse({
      duration: spec.timeout,
      orElse: () =>
        Effect.succeed({
          exitCode: null,
          stderr: `timed out after ${Duration.format(spec.timeout)}`,
          stdout: "",
        }),
    })
  );
});

const changesOf = Effect.fn("changesOf")(function* changesOf(project: string) {
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;

  const inProject = (args: readonly string[]) =>
    ChildProcess.make("git", [...args], { cwd: project });

  yield* spawner.exitCode(inProject(["add", "-A"]));

  return yield* spawner.string(inProject(["diff", "--cached", "HEAD"]));
});

export const runOne = Effect.fn("runOne")(function* runOne(
  spec: RunSpec,
  paths: RunPaths
) {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const graders = yield* Graders;
  const startedAt = yield* Clock.currentTimeMillis;
  const id = runIdOf(spec);
  const runDir = path.join(spec.outDir, "runs", id);

  const workDir = yield* fileSystem.makeTempDirectoryScoped({
    prefix: "good-a11y-eval-",
  });

  const { task, file: taskFile } = spec.loaded;

  yield* fileSystem.makeDirectory(runDir, { recursive: true });

  const project = yield* prepareProject(spec, paths, workDir);
  const agent = yield* runAgent(spec, paths, project, workDir);
  const transcript = summarizeTranscript(agent.stdout);

  yield* fileSystem.writeFileString(
    path.join(runDir, "transcript.jsonl"),
    agent.stdout
  );
  yield* fileSystem.writeFileString(
    path.join(runDir, "stderr.txt"),
    agent.stderr
  );
  yield* fileSystem.writeFileString(
    path.join(runDir, "changes.patch"),
    yield* changesOf(project)
  );

  const base = {
    agent: spec.agent,
    agentExitCode: agent.exitCode,
    app: task.app,
    arm: spec.arm,
    guide: task.guide,
    guideRetrieved: transcript.use.retrieved.includes(task.guide),
    id,
    run: spec.index,
    transcript,
  };

  const finish = (outcome: Omit<RunResult, "durationMs">) =>
    Clock.currentTimeMillis.pipe(
      Effect.map((now): RunResult => ({
        ...outcome,
        durationMs: now - startedAt,
      })),
      Effect.tap((result) =>
        fileSystem.writeFileString(
          path.join(runDir, "result.json"),
          `${JSON.stringify(result, null, 2)}\n`
        )
      )
    );

  if (agent.exitCode !== 0) {
    return yield* finish({
      ...base,
      check: null,
      expectations: [],
      passed: false,
      problem: `the agent exited with ${agent.exitCode ?? "a timeout"}: ${agent.stderr.slice(-500)}`,
      status: "agent-failed",
    });
  }

  const url = `${yield* serveDirectory(project)}${task.path}`;
  const input = { guide: task.guide, taskFile, url };

  return yield* Effect.all([
    graders.check(input),
    graders.expectations(input),
  ]).pipe(
    Effect.flatMap(([check, { expectations }]) =>
      finish({
        ...base,
        check,
        expectations,
        passed:
          expectations.every((expectation) => expectation.ok) &&
          check.guideFailing.length === 0,
        problem: null,
        status: "graded",
      })
    ),
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Oxlint mistakes this Effect handler for an async Promise callback.
    Effect.catchTag("GradeFailed", (error) =>
      finish({
        ...base,
        check: null,
        expectations: [],
        passed: false,
        problem: error.message,
        status: "grade-failed",
      })
    )
  );
}, Effect.scoped);
