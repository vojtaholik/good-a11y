import { Context, Schema } from "effect";
import type { Effect } from "effect";

import type { JudgeUnavailable } from "./judge-unavailable.js";

export const JUDGE_MODEL = "@cf/cloudflare/clef";

export const JUDGE_MODEL_NAME = "Cloudflare Clef";

export const Probability = Schema.Finite.check(
  Schema.isBetween({ maximum: 1, minimum: 0 })
);

export const NoulQuestionSchema = Schema.Struct({
  instructions: Schema.String,
  type: Schema.Literal("noul"),
});

export const ChoiceQuestionSchema = Schema.Struct({
  criteria: Schema.Record(Schema.String, Schema.String),
  instructions: Schema.String,
  type: Schema.Literal("choice"),
});

export const QuestionSchema = Schema.Union([
  NoulQuestionSchema,
  ChoiceQuestionSchema,
]);

export type Question = typeof QuestionSchema.Type;

export const JudgeRequestSchema = Schema.Struct({
  questions: Schema.Record(Schema.String, QuestionSchema),
  state: Schema.String,
});

export type JudgeRequest = typeof JudgeRequestSchema.Type;

export const NoulAnswerSchema = Schema.Struct({
  noul: Probability,
  type: Schema.Literal("noul"),
});

export const ChoiceAnswerSchema = Schema.Struct({
  choice: Schema.String,
  confidence: Probability,
  probabilities: Schema.Record(Schema.String, Probability),
  type: Schema.Literal("choice"),
});

export const AnswerSchema = Schema.Union([
  NoulAnswerSchema,
  ChoiceAnswerSchema,
]);

export type Answer = typeof AnswerSchema.Type;

const Count = Schema.Int.check(Schema.isGreaterThanOrEqualTo(0));

export const JudgeReplySchema = Schema.Struct({
  answers: Schema.Record(Schema.String, AnswerSchema),
  model: Schema.String,
  usage: Schema.Struct({ input_tokens: Count, output_tokens: Count }),
});

export type JudgeReply = typeof JudgeReplySchema.Type;

export class Judge extends Context.Service<
  Judge,
  {
    readonly ask: (
      request: JudgeRequest
    ) => Effect.Effect<JudgeReply, JudgeUnavailable>;
  }
>()("@good-a11y/core/Judge") {}
