import { NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { Duration, Effect, FileSystem, Layer, Path } from "effect";
import { FetchHttpClient, HttpClient } from "effect/http";

import { GradeFailed, Graders } from "../src/grade.js";
import type { GradeInput } from "../src/grade.js";
import { SHIPPED_COMMAND, runOne } from "../src/run.js";
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
                    ok: html.includes("Skip to main content"),
                    title: "E1 skip link",
                  },
                  { ok: html.includes("<main"), title: "E2 main landmark" },
                ],
              }))
            ),
    })
  );

it.layer(NodeServices.layer)("one eval run", (test) => {
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
    "installs the skill with the shipped command pointed at the local bundle",
    () =>
      Effect.gen(function* installsSkill() {
        const fileSystem = yield* FileSystem.FileSystem;
        const skill = yield* fileSystem.readFileString(paths.skill);

        expect(skill).toContain(SHIPPED_COMMAND);
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
