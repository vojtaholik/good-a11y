import { NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { Duration, Effect, FileSystem, Layer, Path } from "effect";
import { FetchHttpClient, HttpClient } from "effect/http";

import { GradeFailed, Graders, taskGradeOf } from "../src/grade.js";
import type { GradeInput } from "../src/grade.js";
import { readResult, regradeOne } from "../src/regrade.js";
import { URL_PROMPT, prepareProject, runOne } from "../src/run.js";
import type { RunPaths } from "../src/run.js";
import { summaryOf } from "../src/summary.js";
import { readTask } from "../src/task.js";

const fixtures = `${import.meta.dirname}/fixtures`;

const paths: RunPaths = {
  bundle: "/repo/apps/good-a11y/bundle/good-a11y.mjs",
  evalsRoot: `${fixtures}/evals`,
  skill: `${import.meta.dirname}/../../../skills/good-a11y/SKILL.md`,
  stubScript: `${fixtures}/stub-agent.mjs`,
};

const pageGraders = (fail: boolean) =>
  Layer.succeed(
    Graders,
    Graders.of({
      check: () =>
        Effect.succeed({
          failing: [],
          guideFailing: [],
          headline: "No failures",
          tasks: null,
          verdict: "no_failures",
        }),
      expectations: (input: GradeInput) =>
        fail
          ? Effect.fail(
              new GradeFailed({ grader: "playwright", problem: "no browser" })
            )
          : HttpClient.get(input.url, {
              headers: { accept: "text/html" },
            }).pipe(
              Effect.flatMap((response) => response.text),
              Effect.provide(FetchHttpClient.layer),
              Effect.mapError(
                () =>
                  new GradeFailed({
                    grader: "playwright",
                    problem: "page did not load",
                  })
              ),
              Effect.map((html) => ({
                expectations: [
                  {
                    error: null,
                    ok: html.includes("Skip to main content"),
                    title: "E1 skip link",
                  },
                  {
                    error: null,
                    ok: html.includes("<main"),
                    title: "E2 main landmark",
                  },
                ],
              }))
            ),
    })
  );

const scenarioRun = (problem: string | null, reached: boolean) => ({
  confirmed: reached,
  focused: null,
  problem,
  reached,
  trace: [],
});

const scenarioResult = (
  id: string,
  status: "finished" | "not_finished",
  runs: readonly ReturnType<typeof scenarioRun>[]
) => ({
  blocked: [],
  driver: "claude-sonnet-5-5",
  goal: id,
  id,
  mode: "driven" as const,
  runs,
  status,
  url: "http://localhost:5173/",
});

it("counts a scenario the driver could not answer as a driver error, not an unfinished task", () => {
  expect(
    taskGradeOf({
      ran: [
        scenarioResult("buy", "finished", [
          scenarioRun(null, true),
          scenarioRun(null, true),
        ]),
        scenarioResult("sign-in", "not_finished", [
          scenarioRun("The model gave up: no submit button", false),
        ]),
        scenarioResult("redo", "not_finished", [
          scenarioRun(
            "The model driving the scenario did not answer: claude exited 1",
            false
          ),
        ]),
      ],
    })
  ).toEqual({
    driverErrors: 1,
    finished: 1,
    scenarios: [
      { driverError: false, id: "buy", status: "finished" },
      { driverError: false, id: "sign-in", status: "not_finished" },
      { driverError: true, id: "redo", status: "not_finished" },
    ],
    skipped: null,
    total: 3,
  });
  expect(taskGradeOf({ skipped: "not a local page" })?.skipped).toBe(
    "not a local page"
  );
  expect(taskGradeOf(null)).toBeNull();
});

it.layer(NodeServices.layer)("one eval run", (test) => {
  test.effect(
    "hands a task's scenarios to the check as a file in the run folder",
    () =>
      Effect.gen(function* scenariosFile() {
        const fileSystem = yield* FileSystem.FileSystem;
        const outDir = yield* fileSystem.makeTempDirectoryScoped();
        const seen: (string | null)[] = [];

        const recording = Layer.succeed(
          Graders,
          Graders.of({
            check: (input: GradeInput) =>
              Effect.sync(() => {
                seen.push(input.scenariosFile);

                return {
                  failing: [],
                  guideFailing: [],
                  headline: "No failures",
                  tasks: null,
                  verdict: "no_failures",
                };
              }),
            expectations: () => Effect.succeed({ expectations: [] }),
          })
        );

        for (const guide of ["redundant-entry", "skip-link-landmarks"]) {
          yield* runOne(
            {
              agent: "stub",
              arm: "unguided",
              index: 1,
              loaded: yield* readTask(paths.evalsRoot, guide, "mini"),
              outDir,
              timeout: Duration.minutes(1),
            },
            paths
          ).pipe(Effect.provide(recording));
        }

        const [withScenarios, without] = seen;

        expect(without).toBeNull();
        expect(withScenarios).toMatch(
          /redundant-entry--mini--stub--unguided--1\/scenarios\.json$/u
        );
        expect(
          JSON.parse(yield* fileSystem.readFileString(withScenarios ?? ""))
        ).toEqual([
          {
            goal: "Place the order",
            id: "place-order",
            success: { present: [{ text: "Order placed" }] },
          },
        ]);
      })
  );

  test.effect(
    "copies the app, runs the agent, serves its page and grades it",
    () =>
      Effect.gen(function* gradedRun() {
        const fileSystem = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const outDir = yield* fileSystem.makeTempDirectoryScoped();

        const loaded = yield* readTask(
          paths.evalsRoot,
          "skip-link-landmarks",
          "mini"
        );

        const unguided = yield* runOne(
          {
            agent: "stub",
            arm: "unguided",
            index: 1,
            loaded,
            outDir,
            timeout: Duration.minutes(1),
          },
          paths
        ).pipe(Effect.provide(pageGraders(false)));

        const guided = yield* runOne(
          {
            agent: "stub",
            arm: "guided",
            index: 1,
            loaded,
            outDir,
            timeout: Duration.minutes(1),
          },
          paths
        ).pipe(Effect.provide(pageGraders(false)));

        expect(unguided.status).toBe("graded");
        expect(unguided.passed).toBe(true);
        expect(unguided.transcript.use.skillOpened).toBe(false);
        expect(guided.transcript.use).toEqual({
          checks: [],
          retrieved: ["skip-link-landmarks"],
          searches: ["page layout skip link"],
          skillOpened: true,
        });
        expect(guided.guideRetrieved).toBe(true);
        expect(unguided.skill).toBeUndefined();
        expect(guided.skill).toMatch(
          /skills\/good-a11y\/SKILL\.md@sha256:[0-9a-f]{12}$/u
        );

        const runDir = path.join(outDir, "runs", guided.id);

        const patch = yield* fileSystem.readFileString(
          path.join(runDir, "changes.patch")
        );

        expect(patch).toContain(
          '+<body><a href="#main">Skip to main content</a>'
        );
        expect(
          yield* fileSystem.readFileString(path.join(runDir, "result.json"))
        ).toContain('"passed": true');

        const summary = summaryOf([unguided, guided]);

        expect(summary).toContain(
          "| stub | 1/1 (100%) | 1/1 (100%) | 0 points | 1/1 | 1/1 |"
        );
      })
  );

  test.effect(
    "installs, builds and serves an app with a package.json as a single-page app",
    () =>
      Effect.gen(function* builtRun() {
        const fileSystem = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const outDir = yield* fileSystem.makeTempDirectoryScoped();

        const loaded = yield* readTask(
          paths.evalsRoot,
          "skip-link-landmarks",
          "built"
        );

        const result = yield* runOne(
          {
            agent: "stub",
            arm: "unguided",
            index: 1,
            loaded,
            outDir,
            timeout: Duration.minutes(1),
          },
          paths
        ).pipe(Effect.provide(pageGraders(false)));

        expect([result.status, result.problem]).toEqual(["graded", null]);
        expect(result.expectations.every((expectation) => expectation.ok)).toBe(
          true
        );

        const patch = yield* fileSystem.readFileString(
          path.join(outDir, "runs", result.id, "changes.patch")
        );

        expect(patch).toContain("Skip to main content");
        expect(patch).not.toContain("dist/");
      })
  );

  test.effect(
    "gives the url arm the good-a11y.com prompt and no installed skill",
    () =>
      Effect.gen(function* urlRun() {
        const fileSystem = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const outDir = yield* fileSystem.makeTempDirectoryScoped();

        const loaded = yield* readTask(
          paths.evalsRoot,
          "skip-link-landmarks",
          "mini"
        );

        const result = yield* runOne(
          {
            agent: "stub",
            arm: "url",
            index: 1,
            loaded,
            outDir,
            timeout: Duration.minutes(1),
          },
          paths
        ).pipe(Effect.provide(pageGraders(false)));

        const patch = yield* fileSystem.readFileString(
          path.join(outDir, "runs", result.id, "changes.patch")
        );

        expect(result.arm).toBe("url");
        expect(patch).toContain(`+${URL_PROMPT}`);
        expect(patch).not.toContain(".claude/skills");
      })
  );

  test.effect("fails a run whose app no longer builds", () =>
    Effect.gen(function* brokenBuild() {
      const fileSystem = yield* FileSystem.FileSystem;
      const outDir = yield* fileSystem.makeTempDirectoryScoped();
      const loaded = yield* readTask(paths.evalsRoot, "tabs", "built");

      const result = yield* runOne(
        {
          agent: "stub",
          arm: "unguided",
          index: 1,
          loaded,
          outDir,
          timeout: Duration.minutes(1),
        },
        paths
      ).pipe(Effect.provide(pageGraders(false)));

      expect(result.status).toBe("graded");
      expect(result.passed).toBe(false);
      expect(result.problem).toContain("build error: BROKEN marker");
    })
  );

  test.effect("fails a run whose agent was denied a tool call", () =>
    Effect.gen(function* deniedRun() {
      const fileSystem = yield* FileSystem.FileSystem;
      const outDir = yield* fileSystem.makeTempDirectoryScoped();
      const loaded = yield* readTask(paths.evalsRoot, "tabs", "mini");

      const result = yield* runOne(
        {
          agent: "stub",
          arm: "guided",
          index: 1,
          loaded,
          outDir,
          timeout: Duration.minutes(1),
        },
        paths
      ).pipe(Effect.provide(pageGraders(false)));

      expect(result.status).toBe("agent-failed");
      expect(result.passed).toBe(false);
      expect(result.problem).toContain("Bash cat index.html | grep nav");
    })
  );

  test.effect(
    "regrades a run from its patch with the current graders, keeping the agent's stats",
    () =>
      Effect.gen(function* regradesRun() {
        const fileSystem = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const outDir = yield* fileSystem.makeTempDirectoryScoped();

        const loaded = yield* readTask(
          paths.evalsRoot,
          "skip-link-landmarks",
          "built"
        );

        const first = yield* runOne(
          {
            agent: "stub",
            arm: "guided",
            index: 1,
            loaded,
            outDir,
            timeout: Duration.minutes(1),
          },
          paths
        ).pipe(Effect.provide(pageGraders(true)));

        expect(first.status).toBe("grade-failed");

        const regraded = yield* regradeOne(
          path.join(outDir, "runs", first.id),
          paths
        ).pipe(Effect.provide(pageGraders(false)));

        expect([regraded.status, regraded.passed]).toEqual(["graded", true]);
        expect(regraded.transcript).toEqual(first.transcript);
        expect(regraded.durationMs).toBe(first.durationMs);
        expect(regraded.regradedAt).toBeDefined();
        expect(
          yield* readResult(path.join(outDir, "runs", first.id, "result.json"))
        ).toEqual(regraded);
      })
  );

  test.effect(
    "installs the skill with every guide as a local file and check on the local bundle",
    () =>
      Effect.gen(function* installsSkill() {
        const fileSystem = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const workDir = yield* fileSystem.makeTempDirectoryScoped();
        const loaded = yield* readTask(paths.evalsRoot, "tabs", "mini");

        const { project } = yield* prepareProject(
          {
            agent: "stub",
            arm: "guided",
            index: 1,
            loaded,
            outDir: workDir,
            timeout: Duration.minutes(1),
          },
          paths,
          workDir
        );

        const skill = yield* fileSystem.readFileString(
          path.join(project, ".claude/skills/good-a11y/SKILL.md")
        );

        const guide = yield* fileSystem.readFileString(
          path.join(project, ".claude/skills/good-a11y/guides/tabs.md")
        );

        expect(skill).toContain(
          "- [tabs](.claude/skills/good-a11y/guides/tabs.md): "
        );
        expect(skill).toContain(`\`node ${paths.bundle} check <url>\``);
        expect(skill).toContain(
          `\`node ${paths.bundle} search "<2-5 words>"\``
        );
        expect(skill).not.toMatch(/npx -y good-a11y@|search\.md\?q=/u);
        expect(guide).toContain("# Tabs");
      })
  );

  test.effect(
    "records a grader that could not run as grade-failed, never as a pass",
    () =>
      Effect.gen(function* gradeFailed() {
        const fileSystem = yield* FileSystem.FileSystem;
        const outDir = yield* fileSystem.makeTempDirectoryScoped();

        const loaded = yield* readTask(
          paths.evalsRoot,
          "skip-link-landmarks",
          "mini"
        );

        const result = yield* runOne(
          {
            agent: "stub",
            arm: "unguided",
            index: 2,
            loaded,
            outDir,
            timeout: Duration.minutes(1),
          },
          paths
        ).pipe(Effect.provide(pageGraders(true)));

        expect(result.status).toBe("grade-failed");
        expect(result.passed).toBe(false);
        expect(result.problem).toContain("no browser");
      })
  );

  test.effect("names a task file that does not exist", () =>
    Effect.gen(function* missingTask() {
      const error = yield* readTask(
        paths.evalsRoot,
        "menu-button",
        "mini"
      ).pipe(Effect.flip);

      expect(error.message).toContain("evals/tasks/menu-button/mini.json");
    })
  );
});
