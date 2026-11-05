import { Schema } from "effect";

import { AgentNameSchema } from "./agents.js";
import { ArmSchema } from "./task.js";

const Count = Schema.Finite;

export const RunStatusSchema = Schema.Literals([
  "graded",
  "agent-failed",
  "grade-failed",
  "run-failed",
]);

export type RunStatus = typeof RunStatusSchema.Type;

export const TaskGradeSchema = Schema.Struct({
  driverErrors: Count,
  finished: Count,
  scenarios: Schema.Array(
    Schema.Struct({
      driverError: Schema.Boolean,
      id: Schema.String,
      status: Schema.Literals(["finished", "not_finished"]),
    })
  ),
  skipped: Schema.NullOr(Schema.String),
  total: Count,
});

export const CheckGradeSchema = Schema.Struct({
  failing: Schema.Array(Schema.String),
  guideFailing: Schema.Array(Schema.String),
  headline: Schema.String,
  tasks: Schema.optional(Schema.NullOr(TaskGradeSchema)),
  verdict: Schema.NullOr(Schema.String),
});

export const ExpectationSchema = Schema.Struct({
  error: Schema.optional(Schema.NullOr(Schema.String)),
  ok: Schema.Boolean,
  title: Schema.String,
});

export const TranscriptSummarySchema = Schema.Struct({
  denials: Schema.Array(
    Schema.Struct({ input: Schema.String, tool: Schema.String })
  ),
  toolUses: Count,
  usage: Schema.NullOr(
    Schema.Struct({
      cachedInputTokens: Count,
      costUsd: Schema.NullOr(Count),
      inputTokens: Count,
      outputTokens: Count,
    })
  ),
  use: Schema.Struct({
    checks: Schema.Array(Schema.String),
    retrieved: Schema.Array(Schema.String),
    searches: Schema.Array(Schema.String),
    skillOpened: Schema.Boolean,
  }),
});

export const RunResultSchema = Schema.Struct({
  agent: AgentNameSchema,
  agentExitCode: Schema.NullOr(Count),
  app: Schema.String,
  arm: ArmSchema,
  check: Schema.NullOr(CheckGradeSchema),
  durationMs: Count,
  expectations: Schema.Array(ExpectationSchema),
  guide: Schema.String,
  guideRetrieved: Schema.Boolean,
  id: Schema.String,
  passed: Schema.Boolean,
  problem: Schema.NullOr(Schema.String),
  regradedAt: Schema.optional(Schema.String),
  run: Count,
  skill: Schema.optional(Schema.String),
  status: RunStatusSchema,
  transcript: TranscriptSummarySchema,
});

export type RunResult = typeof RunResultSchema.Type;

export type Grade = Pick<
  RunResult,
  "check" | "expectations" | "passed" | "problem" | "status"
>;
