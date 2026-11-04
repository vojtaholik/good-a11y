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

export type RunStatus =
  | "graded"
  | "agent-failed"
  | "grade-failed"
  | "run-failed";

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

export class AppSetupFailed extends Schema.TaggedError<AppSetupFailed>()(
  "AppSetupFailed",
  {
    app: Schema.String,
    output: Schema.String,
    step: Schema.String,
  }
) {
  override get message(): string {
    return `Setting up the eval app "${this.app}" failed at \`${this.step}\`. Check that evals/apps/${this.app} installs offline from the pnpm store (pnpm install --offline --ignore-workspace):\n${this.output.slice(-800)}`;
  }
}

export interface Finished {
  readonly exitCode: number;
  readonly stderr: string;
  readonly stdout: string;
}

interface AgentOutcome {
  readonly exitCode: number | null;
  readonly stderr: string;
  readonly stdout: string;
}

const NOT_COPIED = new Set(["node_modules", "dist"]);

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

const runToEnd = (
  command: string,
  args: readonly string[],
  options: {
    readonly cwd: string;
    readonly env?: Readonly<Record<string, string>>;
  }
) =>
  Effect.scoped(
    Effect.gen(function* processToEnd() {
      const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;

      const handle = yield* spawner.spawn(
        ChildProcess.make(command, [...args], {
          cwd: options.cwd,
          env: { ...options.env },
          extendEnv: true,
          stdin: "ignore",
        })
      );

      const [stdout, stderr, exitCode] = yield* Effect.all(
        [collect(handle.stdout), collect(handle.stderr), handle.exitCode],
        { concurrency: "unbounded" }
      );

      return { exitCode: Number(exitCode), stderr, stdout } satisfies Finished;
    })
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

  yield* fileSystem.makeDirectory(project, { recursive: true });

  for (const entry of yield* fileSystem.readDirectory(app)) {
    if (!NOT_COPIED.has(entry)) {
      yield* fileSystem.copy(path.join(app, entry), path.join(project, entry));
    }
  }

  const built = yield* fileSystem.exists(path.join(project, "package.json"));

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

  if (built) {
    yield* fileSystem.writeFileString(
      path.join(project, ".git", "info", "exclude"),
      "node_modules/\ndist/\n"
    );

    const install = yield* runToEnd(
      "pnpm",
      ["install", "--offline", "--ignore-workspace"],
      { cwd: project }
    );

    if (install.exitCode !== 0) {
      return yield* new AppSetupFailed({
        app: spec.loaded.task.app,
        output: `${install.stdout}${install.stderr}`,
        step: "pnpm install --offline --ignore-workspace",
      });
    }
  }

  yield* git(["add", "-A"]);
  yield* git(["commit", "-q", "-m", "base app"]);

  return { built, project };
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
  const codexHome = spec.agent === "codex" ? yield* codexHomeOf(workDir) : "";

  const invocation = invocationOf(spec.agent, {
    codexHome,
    project,
    prompt: spec.loaded.task.prompt,
    stubScript: paths.stubScript,
  });

  const finished: AgentOutcome = yield* runToEnd(
    invocation.command,
    invocation.args,
    { cwd: project, env: invocation.env }
  ).pipe(
    Effect.timeoutOrElse({
      duration: spec.timeout,
      orElse: () =>
        Effect.succeed<AgentOutcome>({
          exitCode: null,
          stderr: `timed out after ${Duration.format(spec.timeout)}`,
          stdout: "",
        }),
    })
  );

  return finished;
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

  const { built, project } = yield* prepareProject(spec, paths, workDir);
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

  if (transcript.denials.length > 0) {
    return yield* finish({
      ...base,
      check: null,
      expectations: [],
      passed: false,
      problem: `the agent was denied ${transcript.denials.length} tool call(s), so its result is not its own: ${transcript.denials
        .map((denial) => `${denial.tool} ${denial.input.slice(0, 120)}`)
        .join(" | ")}`,
      status: "agent-failed",
    });
  }

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

  if (built) {
    const build = yield* runToEnd("pnpm", ["run", "build"], { cwd: project });

    if (build.exitCode !== 0) {
      return yield* finish({
        ...base,
        check: null,
        expectations: [],
        passed: false,
        problem: `the app no longer builds: ${`${build.stdout}${build.stderr}`.slice(-800)}`,
        status: "graded",
      });
    }
  }

  const served = built
    ? yield* serveDirectory(path.join(project, "dist"), { spa: true })
    : yield* serveDirectory(project, { spa: false });

  const url = `${served}${task.path}`;

  const input = {
    guide: task.guide,
    outputDir: path.join(runDir, "playwright"),
    taskFile,
    url,
  };

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

export const failedRun = (spec: RunSpec, problem: string): RunResult => ({
  agent: spec.agent,
  agentExitCode: null,
  app: spec.loaded.task.app,
  arm: spec.arm,
  check: null,
  durationMs: 0,
  expectations: [],
  guide: spec.loaded.task.guide,
  guideRetrieved: false,
  id: runIdOf(spec),
  passed: false,
  problem,
  run: spec.index,
  status: "run-failed",
  transcript: {
    denials: [],
    toolUses: 0,
    usage: null,
    use: { checks: [], retrieved: [], searches: [], skillOpened: false },
  },
});
