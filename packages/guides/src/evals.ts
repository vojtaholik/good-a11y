import { Schema } from "effect";

import { GuideIdSchema } from "./guide.js";

const Filled = Schema.String.check(Schema.isMinLength(1));

const Count = Schema.Int.check(Schema.isGreaterThanOrEqualTo(0));

const Commit = Schema.String.check(Schema.isPattern(/^[\da-f]{7}$/u));

const Day = Schema.String.check(Schema.isPattern(/^\d{4}-\d{2}-\d{2}$/u));

export const AgentIdSchema = Schema.Literals(["claude", "codex"]);

export type AgentId = typeof AgentIdSchema.Type;

export const RateSchema = Schema.Tuple([Count, Count]);

export type Rate = typeof RateSchema.Type;

export const EvalCellSchema = Schema.Struct({
  commit: Schema.NullOr(Commit),
  guided: RateSchema,
  guidedBefore: Schema.optional(RateSchema),
  runs: Schema.NonEmptyArray(Filled),
  unguided: RateSchema,
});

export type EvalCell = typeof EvalCellSchema.Type;

export const EvalEntrySchema = Schema.Struct({
  cells: Schema.Struct({ claude: EvalCellSchema, codex: EvalCellSchema }),
  date: Day,
  guide: GuideIdSchema,
  id: Filled,
  note: Schema.NullOr(Filled),
  published: Schema.Boolean,
  round: Filled,
  shipsFor: Schema.Array(AgentIdSchema),
  task: Schema.NullOr(Filled),
});

export type EvalEntry = typeof EvalEntrySchema.Type;

export const ScreenResultSchema = Schema.Literals([
  "pass",
  "fail",
  "not-graded",
]);

export const ScreenCandidateSchema = Schema.Struct({
  candidate: Filled,
  claude: ScreenResultSchema,
  codex: ScreenResultSchema,
  date: Day,
  guide: Schema.NullOr(GuideIdSchema),
  note: Schema.NullOr(Filled),
  runs: Schema.NonEmptyArray(Filled),
  screen: Filled,
});

export type ScreenCandidate = typeof ScreenCandidateSchema.Type;

export const UrlRouteRowSchema = Schema.Struct({
  agent: AgentIdSchema,
  arm: Schema.Literals(["guided", "url", "url-network"]),
  graded: Count,
  installed: Schema.NullOr(Count),
  passed: Count,
  ranCheck: Schema.NullOr(Count),
  runs: Count,
  study: Filled,
});

export type UrlRouteRow = typeof UrlRouteRowSchema.Type;

export const ScenariosStepRowSchema = Schema.Struct({
  agent: AgentIdSchema,
  passed: RateSchema,
  ranCheck: RateSchema,
  ranScenarios: RateSchema,
  skill: Schema.Literals(["no step", "step 6"]),
  taskCompletion: RateSchema,
});

export type ScenariosStepRow = typeof ScenariosStepRowSchema.Type;

export const EvalResultsSchema = Schema.Struct({
  agents: Schema.Array(
    Schema.Struct({ id: AgentIdSchema, name: Filled, setting: Filled })
  ),
  guides: Schema.Array(EvalEntrySchema),
  scenariosStep: Schema.Struct({
    commit: Commit,
    rows: Schema.Array(ScenariosStepRowSchema),
    runs: Schema.NonEmptyArray(Filled),
  }),
  screens: Schema.Array(ScreenCandidateSchema),
  shipRule: Schema.Struct({
    maxUnguidedPercent: Count,
    minUpliftPoints: Count,
  }),
  updated: Day,
  urlRoute: Schema.Array(UrlRouteRowSchema),
});

export type EvalResults = typeof EvalResultsSchema.Type;
