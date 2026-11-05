import {
  DriverDecisionSchema,
  ScenarioDriver,
  ScenarioDriverFailed,
  actionOf,
  driverPrompt,
} from "@good-a11y/core";
import type { DriverTurn } from "@good-a11y/core";
import { Effect, FileSystem, Layer, Schema, Stream } from "effect";
import { ChildProcess, ChildProcessSpawner } from "effect/process";

export const CLAUDE_DRIVER_MODEL = "claude-sonnet-5-5";

const ANSWER_MS = 90_000;

const DETAIL_CHARACTERS = 600;

const DECISION_SCHEMA = JSON.stringify(
  Schema.toJsonSchemaDocument(DriverDecisionSchema).schema
);

const ClaudeAnswerSchema = Schema.Struct({
  structured_output: DriverDecisionSchema,
});

const decodeAnswer = Schema.decodeUnknownEffect(
  Schema.fromJsonString(ClaudeAnswerSchema)
);

const argsFor = (prompt: string): readonly string[] => [
  "-p",
  prompt,
  "--model",
  CLAUDE_DRIVER_MODEL,
  "--tools",
  "",
  "--setting-sources",
  "project",
  "--strict-mcp-config",
  "--mcp-config",
  '{"mcpServers":{}}',
  "--no-session-persistence",
  "--output-format",
  "json",
  "--json-schema",
  DECISION_SCHEMA,
];

const collect = (stream: Stream.Stream<Uint8Array, unknown>) =>
  stream.pipe(
    Stream.decodeText(),
    Stream.runFold(
      () => "",
      (text, chunk) => text + chunk
    ),
    Effect.orElseSucceed(() => "")
  );

const failed = (detail: string) =>
  new ScenarioDriverFailed({
    detail: detail.trim().slice(0, DETAIL_CHARACTERS),
  });

export const claudeDriverLayer = Layer.effect(
  ScenarioDriver,
  Effect.gen(function* claudeDriver() {
    const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
    const fs = yield* FileSystem.FileSystem;

    const cwd = yield* fs.makeTempDirectoryScoped({
      prefix: "good-a11y-driver-",
    });

    const ask = (turn: DriverTurn) =>
      Effect.scoped(
        Effect.gen(function* askClaude() {
          const handle = yield* spawner.spawn(
            ChildProcess.make("claude", [...argsFor(driverPrompt(turn))], {
              cwd,
              extendEnv: true,
              stdin: "ignore",
            })
          );

          const [stdout, stderr, exitCode] = yield* Effect.all(
            [collect(handle.stdout), collect(handle.stderr), handle.exitCode],
            { concurrency: "unbounded" }
          );

          if (Number(exitCode) !== 0) {
            return yield* failed(
              `claude exited ${Number(exitCode)}: ${stderr || stdout}`
            );
          }

          const answer = yield* decodeAnswer(stdout).pipe(
            Effect.mapError(() =>
              failed(`claude answered outside the decision schema: ${stdout}`)
            )
          );

          const action = actionOf(answer.structured_output);

          if (action === null) {
            return yield* failed(
              `claude chose "${answer.structured_output.action}" without naming the key or input`
            );
          }

          return action;
        })
      ).pipe(
        Effect.timeout(ANSWER_MS),
        Effect.catchTag("TimeoutError", () =>
          Effect.fail(
            failed(`claude did not answer within ${ANSWER_MS / 1000} seconds`)
          )
        ),
        Effect.catchTag("PlatformError", (platform) =>
          Effect.fail(
            failed(
              `claude could not be started (${platform.message}). Install Claude Code and sign in`
            )
          )
        )
      );

    return ScenarioDriver.of({ model: CLAUDE_DRIVER_MODEL, next: ask });
  })
);
