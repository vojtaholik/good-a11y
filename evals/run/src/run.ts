import { headlessShellPath } from "@good-a11y/browser-audit/headless-shell";
import { GUIDES, flowForCheck, withGuideIndex } from "@good-a11y/guides";
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
import { leftoverPids } from "./leftovers.js";
import type { Grade, RunResult } from "./result.js";
import { serveDirectory } from "./serve.js";
import { URL_ARMS } from "./task.js";
import type { Arm, LoadedTask } from "./task.js";
import { summarizeTranscript } from "./transcript.js";

export const SHIPPED_COMMAND = /npx -y good-a11y@\d+\.\d+\.\d+/gu;

export const SHIPPED_SEARCH = "`https://good-a11y.com/search.md?q=<2-5 words>`";

export const INSTALLED_GUIDES = ".claude/skills/good-a11y/guides";

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

export type { Grade, RunResult, RunStatus } from "./result.js";

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
  withGuideIndex(skill, GUIDES, (id) => `${INSTALLED_GUIDES}/${id}.md`)
    .replaceAll(SHIPPED_COMMAND, `node ${bundle}`)
    .replaceAll(SHIPPED_SEARCH, `\`node ${bundle} search "<2-5 words>"\``);

export const URL_PROMPT =
  "Use https://good-a11y.com for accessibility in this project: read https://good-a11y.com/skill.md and follow it.";

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

export const runToEnd = (
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

const signal = (pid: number, name: "SIGKILL" | "SIGTERM") =>
  Effect.try(() => process.kill(pid, name)).pipe(Effect.ignore);

const outputOf = (command: string, args: readonly string[], cwd: string) =>
  runToEnd(command, args, { cwd }).pipe(
    Effect.map(({ stdout }) => stdout),
    Effect.orElseSucceed(() => "")
  );

export const stopLeftovers = Effect.fn("stopLeftovers")(function* stopLeftovers(
  workDir: string
) {
  const fileSystem = yield* FileSystem.FileSystem;

  const real = yield* fileSystem
    .realPath(workDir)
    .pipe(Effect.orElseSucceed(() => workDir));

  const pids = leftoverPids(
    yield* outputOf("ps", ["-axo", "pid=,command="], real),
    [...new Set([workDir, real])],
    process.pid
  );

  if (pids.length === 0) {
    return pids;
  }

  yield* Effect.forEach(pids, (pid) => signal(pid, "SIGTERM"), {
    discard: true,
  });
  yield* Effect.sleep(Duration.seconds(1));
  yield* Effect.forEach(pids, (pid) => signal(pid, "SIGKILL"), {
    discard: true,
  });

  return pids;
});

export const prepareProject = Effect.fn("prepareProject")(
  function* prepareProject(spec: RunSpec, paths: RunPaths, workDir: string) {
    const fileSystem = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
    const project = path.join(workDir, "project");
    const app = path.join(paths.evalsRoot, "apps", spec.loaded.task.app);

    yield* fileSystem.makeDirectory(project, { recursive: true });

    for (const entry of yield* fileSystem.readDirectory(app)) {
      if (!NOT_COPIED.has(entry)) {
        yield* fileSystem.copy(
          path.join(app, entry),
          path.join(project, entry)
        );
      }
    }

    const built = yield* fileSystem.exists(path.join(project, "package.json"));

    if (spec.arm === "guided") {
      const skillDir = path.join(project, ".claude", "skills", "good-a11y");
      const agentsFile = path.join(project, "AGENTS.md");

      const agents = (yield* fileSystem.exists(agentsFile))
        ? yield* fileSystem.readFileString(agentsFile)
        : "# Project notes";

      yield* fileSystem.makeDirectory(path.join(project, INSTALLED_GUIDES), {
        recursive: true,
      });

      for (const guide of GUIDES) {
        yield* fileSystem.writeFileString(
          path.join(project, INSTALLED_GUIDES, `${guide.id}.md`),
          [guide.text.trimEnd(), "", ...flowForCheck(guide)].join("\n")
        );
      }

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
  }
);

const agentHomeOf = Effect.fn("agentHomeOf")(function* agentHomeOf(
  workDir: string
) {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const userHome = yield* Config.String("HOME");
  const home = path.join(workDir, "home");

  yield* fileSystem.makeDirectory(path.join(home, ".codex"), {
    recursive: true,
  });
  yield* fileSystem.symlink(
    path.join(userHome, ".codex", "auth.json"),
    path.join(home, ".codex", "auth.json")
  );

  return home;
});

const runAgent = Effect.fn("runAgent")(function* runAgent(
  spec: RunSpec,
  paths: RunPaths,
  project: string,
  workDir: string
) {
  const home = spec.agent === "codex" ? yield* agentHomeOf(workDir) : "";

  const invocation = invocationOf(spec.agent, {
    home,
    network: spec.arm === "url-network",
    project,
    prompt: URL_ARMS.has(spec.arm)
      ? `${URL_PROMPT}\n\n${spec.loaded.task.prompt}`
      : spec.loaded.task.prompt,
    stubScript: paths.stubScript,
    web: URL_ARMS.has(spec.arm),
  });

  const finished: AgentOutcome = yield* runToEnd(
    invocation.command,
    invocation.args,
    {
      cwd: project,
      env: { ...invocation.env, GOOD_A11Y_CHROME: headlessShellPath() },
    }
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

export interface GradeTarget {
  readonly built: boolean;
  readonly project: string;
  readonly runDir: string;
  readonly task: LoadedTask["task"];
  readonly taskFile: string;
}

export const gradeProject = Effect.fn("gradeProject")(function* gradeProject({
  built,
  project,
  runDir,
  task,
  taskFile,
}: GradeTarget) {
  const path = yield* Path.Path;
  const graders = yield* Graders;

  if (built) {
    const build = yield* runToEnd("pnpm", ["run", "build"], { cwd: project });

    if (build.exitCode !== 0) {
      return {
        check: null,
        expectations: [],
        passed: false,
        problem: `the app no longer builds: ${`${build.stdout}${build.stderr}`.slice(-800)}`,
        status: "graded",
      } satisfies Grade;
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
    Effect.map(([check, { expectations }]): Grade => ({
      check,
      expectations,
      passed:
        expectations.every((expectation) => expectation.ok) &&
        check.guideFailing.length === 0,
      problem: null,
      status: "graded",
    })),
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Oxlint mistakes this Effect handler for an async Promise callback.
    Effect.catchTag("GradeFailed", (error) =>
      Effect.succeed<Grade>({
        check: null,
        expectations: [],
        passed: false,
        problem: error.message,
        status: "grade-failed",
      })
    )
  );
}, Effect.scoped);

export const runOne = Effect.fn("runOne")(function* runOne(
  spec: RunSpec,
  paths: RunPaths
) {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
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

  yield* stopLeftovers(workDir);

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

  return yield* finish({
    ...base,
    ...(yield* gradeProject({ built, project, runDir, task, taskFile })),
  });
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
