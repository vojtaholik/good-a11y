import { Schema } from "effect";

export const AxeNodeSchema = Schema.Struct({
  html: Schema.String,
  inComponent: Schema.optionalKey(Schema.Boolean),
});

export const AxeRuleSchema = Schema.Struct({
  help: Schema.String,
  helpUrl: Schema.String,
  id: Schema.String,
  impact: Schema.optional(Schema.NullOr(Schema.String)),
  nodes: Schema.Array(AxeNodeSchema),
  tags: Schema.Array(Schema.String),
});

export type AxeRule = typeof AxeRuleSchema.Type;

export const AxeResultsSchema = Schema.Struct({
  inapplicable: Schema.Array(AxeRuleSchema),
  incomplete: Schema.Array(AxeRuleSchema),
  passes: Schema.Array(AxeRuleSchema),
  testEngine: Schema.Struct({ name: Schema.String, version: Schema.String }),
  violations: Schema.Array(AxeRuleSchema),
});

export type AxeResults = typeof AxeResultsSchema.Type;

export const AxeResultsJson = Schema.fromJsonString(AxeResultsSchema);
