import { Context, Schema } from "effect";
import type { Effect } from "effect";

import type { FlowAuditFailed } from "./flow-audit-failed.js";
import type { LocalUrl } from "./public-url.js";

export const RoleTargetSchema = Schema.Struct({
  exact: Schema.optional(Schema.Boolean),
  name: Schema.String,
  nth: Schema.optional(Schema.Int),
  role: Schema.String,
});

export const TextTargetSchema = Schema.Struct({ text: Schema.String });

const CssTargetSchema = Schema.Struct({ css: Schema.String });

export const FlowTargetSchema = Schema.Union([
  RoleTargetSchema,
  TextTargetSchema,
  CssTargetSchema,
]);

export type FlowTarget = typeof FlowTargetSchema.Type;

export const FlowStepSchema = Schema.Union([
  Schema.Struct({ click: FlowTargetSchema }),
  Schema.Struct({ press: Schema.String }),
]);

export const FlowSchema = Schema.Struct({
  guide: Schema.String,
  path: Schema.optional(Schema.String),
  requires: Schema.optional(Schema.Array(FlowTargetSchema)),
  setup: Schema.optional(Schema.Array(FlowStepSchema)),
  targets: Schema.optional(
    Schema.Record(
      Schema.String,
      Schema.Union([
        FlowTargetSchema,
        Schema.String,
        Schema.Array(Schema.String),
      ])
    )
  ),
});

export type Flow = typeof FlowSchema.Type;

export const FlowFileSchema = Schema.Union([
  FlowSchema,
  Schema.Array(FlowSchema),
]);

export const ClaimResultSchema = Schema.Struct({
  detail: Schema.NullOr(Schema.String),
  n: Schema.Int,
  status: Schema.Literals(["pass", "fail"]),
  title: Schema.String,
});

export type ClaimResult = typeof ClaimResultSchema.Type;

export const FlowResultSchema = Schema.Struct({
  blocked: Schema.Array(Schema.String),
  claims: Schema.Array(ClaimResultSchema),
  criteria: Schema.Array(Schema.String),
  guide: Schema.String,
  name: Schema.String,
  problem: Schema.NullOr(Schema.String),
  url: Schema.String,
});

export type FlowResult = typeof FlowResultSchema.Type;

export const FlowsSchema = Schema.Union([
  Schema.Struct({ ran: Schema.Array(FlowResultSchema) }),
  Schema.Struct({ skipped: Schema.String }),
]);

export type Flows = typeof FlowsSchema.Type;

export class FlowAudit extends Context.Service<
  FlowAudit,
  {
    readonly run: (
      base: LocalUrl,
      flows: readonly Flow[]
    ) => Effect.Effect<readonly FlowResult[], FlowAuditFailed>;
  }
>()("@good-a11y/core/FlowAudit") {}
