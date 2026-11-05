import { ScenarioSchema } from "@good-a11y/core/scenario";
import { Schema } from "effect";

const Filled = Schema.String.check(Schema.isMinLength(1));

const OneLine = Filled.check(Schema.isPattern(/^[^\n]+$/u));

export const CriterionIdSchema = Schema.String.check(
  Schema.isPattern(/^STD-SC(?:22)?-\d+\.\d+\.\d+$/u)
);

export const GuideIdSchema = Schema.String.check(
  Schema.isPattern(/^[a-z\d]+(?:-[a-z\d]+)*$/u)
);

export const GuideFrontmatterSchema = Schema.Struct({
  category: Schema.optional(GuideIdSchema),
  criteria: Schema.NonEmptyArray(CriterionIdSchema),
  description: OneLine,
  name: OneLine,
});

export type GuideFrontmatter = typeof GuideFrontmatterSchema.Type;

export const FlowValueSchema = Schema.Union([
  Schema.String,
  Schema.Array(Schema.String),
  Schema.Record(
    Schema.String,
    Schema.Union([Schema.String, Schema.Int, Schema.Boolean])
  ),
]);

export type FlowValue = typeof FlowValueSchema.Type;

export const FlowFileSchema = Schema.Record(
  Schema.String.check(Schema.isPattern(/^[a-z][a-zA-Z\d]*$/u)),
  Schema.Struct({ demo: FlowValueSchema, means: OneLine })
);

export const FlowKeySchema = Schema.Struct({
  demo: FlowValueSchema,
  key: Schema.String,
  means: Schema.String,
});

export type FlowKey = typeof FlowKeySchema.Type;

export const GuideSchema = Schema.Struct({
  category: GuideIdSchema,
  criteria: Schema.NonEmptyArray(CriterionIdSchema),
  demo: Schema.String,
  description: Schema.String,
  expectations: Schema.String,
  flow: Schema.Array(FlowKeySchema),
  headings: Schema.Array(Schema.String),
  id: GuideIdSchema,
  name: Schema.String,
  scenario: Schema.NullOr(ScenarioSchema),
  text: Schema.String,
});

export type Guide = typeof GuideSchema.Type;

export class MalformedGuide extends Schema.TaggedError<MalformedGuide>()(
  "MalformedGuide",
  {
    guide: Schema.String,
    problem: Schema.String,
  }
) {
  override get message(): string {
    return `Malformed guide guides/${this.guide}: ${this.problem}. See docs/guides.md for the format.`;
  }
}
