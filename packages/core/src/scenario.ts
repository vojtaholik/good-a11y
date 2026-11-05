import { Context, Schema } from "effect";
import type { Effect } from "effect";

import { RoleTargetSchema, TextTargetSchema } from "./flow.js";
import type { LocalUrl } from "./public-url.js";
import type { ScenarioAuditFailed } from "./scenario-audit-failed.js";

export const SCENARIO_KEYS = [
  "Tab",
  "Shift+Tab",
  "Enter",
  "Space",
  "Escape",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
  "PageUp",
  "PageDown",
] as const;

export const ScenarioKeySchema = Schema.Literals(SCENARIO_KEYS);

export type ScenarioKey = typeof ScenarioKeySchema.Type;

export const ScenarioStepSchema = Schema.Union([
  Schema.Struct({ press: ScenarioKeySchema }),
  Schema.Struct({ type: Schema.String }),
]);

export type ScenarioStep = typeof ScenarioStepSchema.Type;

export const TreeTargetSchema = Schema.Union([
  RoleTargetSchema,
  TextTargetSchema,
]);

export type TreeTarget = typeof TreeTargetSchema.Type;

export const SuccessSchema = Schema.Struct({
  absent: Schema.optional(Schema.Array(TreeTargetSchema)),
  path: Schema.optional(Schema.String),
  present: Schema.Array(TreeTargetSchema).check(Schema.isMinLength(1)),
});

export type Success = typeof SuccessSchema.Type;

export const ScenarioSchema = Schema.Struct({
  budget: Schema.optional(
    Schema.Int.check(Schema.isBetween({ maximum: 200, minimum: 1 }))
  ),
  goal: Schema.String,
  id: Schema.String,
  inputs: Schema.optional(Schema.Record(Schema.String, Schema.String)),
  keys: Schema.optional(
    Schema.Array(ScenarioStepSchema).check(Schema.isMinLength(1))
  ),
  path: Schema.optional(Schema.String),
  success: SuccessSchema,
});

export type Scenario = typeof ScenarioSchema.Type;

export const ScenarioFileSchema = Schema.Union([
  ScenarioSchema,
  Schema.Array(ScenarioSchema),
]);

export interface TreeNode {
  readonly name: string;
  readonly role: string;
}

export interface Tree {
  readonly nodes: readonly TreeNode[];
  readonly text: string;
}

export interface ScenarioState extends Tree {
  readonly path: string;
}

const LINE = /^\s*- (?<content>.*)$/u;

const ENTRY =
  /^(?<role>[a-z]+)(?: "(?<name>(?:[^"\\]|\\.)*)")?(?: \[[^\]]*\])*(?::(?: (?<value>.*))?)?$/u;

const SINGLE_QUOTED = /^'(?<key>(?:[^']|'')*)'(?<rest>.*)$/u;

const ESCAPE = /\\(?<escaped>.)/gu;

const DOUBLED_QUOTE = /''/gu;

const QUOTED_VALUE = /^"(?<inner>(?:[^"\\]|\\.)*)"$/u;

const unescaped = (text: string): string =>
  text.replace(ESCAPE, (_match, escaped: string) => escaped);

const valueText = (value: string): string => {
  const quoted = QUOTED_VALUE.exec(value)?.groups?.inner;

  return quoted === undefined ? value : unescaped(quoted);
};

const entryOf = (content: string): string => {
  const quoted = SINGLE_QUOTED.exec(content)?.groups;

  return quoted === undefined
    ? content
    : `${(quoted.key ?? "").replace(DOUBLED_QUOTE, "'")}${quoted.rest ?? ""}`;
};

export const treeOf = (snapshot: string): Tree => {
  const nodes: TreeNode[] = [];
  const texts: string[] = [];

  for (const line of snapshot.split("\n")) {
    const content = LINE.exec(line)?.groups?.content;

    const entry =
      content === undefined || content.startsWith("/")
        ? undefined
        : ENTRY.exec(entryOf(content))?.groups;

    if (entry?.role !== undefined) {
      const name = unescaped(entry.name ?? "");

      const value =
        entry.value === undefined ? "" : valueText(entry.value.trim());

      if (entry.role !== "text") {
        nodes.push({ name, role: entry.role });
      }

      texts.push(...[name, value].filter((part) => part !== ""));
    }
  }

  return { nodes, text: texts.join("\n") };
};

const SPACES = /\s+/gu;

const folded = (text: string): string =>
  text.replace(SPACES, " ").trim().toLowerCase();

export const isOnTree = (target: TreeTarget, tree: Tree): boolean => {
  if ("text" in target) {
    return folded(tree.text).includes(folded(target.text));
  }

  return tree.nodes.some(
    (node) =>
      node.role === target.role &&
      (target.exact === false
        ? folded(node.name).includes(folded(target.name))
        : node.name === target.name)
  );
};

export const reached = (success: Success, state: ScenarioState): boolean =>
  (success.path === undefined || success.path === state.path) &&
  success.present.every((target) => isOnTree(target, state)) &&
  (success.absent ?? []).every((target) => !isOnTree(target, state));

export const DRIVEN_RUNS = 3;

export const DRIVEN_RUNS_NEEDED = 2;

export const DEFAULT_BUDGET = 60;

export const STUCK_REPEATS = 5;

export const ScenarioRunSchema = Schema.Struct({
  confirmed: Schema.Boolean,
  focused: Schema.NullOr(Schema.String),
  problem: Schema.NullOr(Schema.String),
  reached: Schema.Boolean,
  trace: Schema.Array(ScenarioStepSchema),
});

export type ScenarioRun = typeof ScenarioRunSchema.Type;

export const ScenarioResultSchema = Schema.Struct({
  blocked: Schema.Array(Schema.String),
  driver: Schema.NullOr(Schema.String),
  goal: Schema.String,
  id: Schema.String,
  mode: Schema.Literals(["replayed", "driven"]),
  runs: Schema.Array(ScenarioRunSchema),
  status: Schema.Literals(["finished", "not_finished"]),
  url: Schema.String,
});

export type ScenarioResult = typeof ScenarioResultSchema.Type;

export const TasksSchema = Schema.Union([
  Schema.Struct({ ran: Schema.Array(ScenarioResultSchema) }),
  Schema.Struct({ skipped: Schema.String }),
]);

export type Tasks = typeof TasksSchema.Type;

export const ALREADY_REACHED =
  "The success condition already held before the first key, so this scenario does not test the task. Name something that appears only once the task is done.";

export const unknownInput = (name: string): string =>
  `The scenario types the input "${name}", which its "inputs" do not define. Add it to "inputs".`;

export interface TaskCount {
  readonly finished: number;
  readonly total: number;
}

export const tasksFinished = (
  results: readonly ScenarioResult[]
): TaskCount => ({
  finished: results.filter((result) => result.status === "finished").length,
  total: results.length,
});

export const runsNeeded = (mode: ScenarioResult["mode"]): number =>
  mode === "driven" ? DRIVEN_RUNS_NEEDED : 1;

export const statusOf = (
  mode: ScenarioResult["mode"],
  runs: readonly ScenarioRun[]
): ScenarioResult["status"] =>
  runs.filter((run) => run.confirmed).length >= runsNeeded(mode)
    ? "finished"
    : "not_finished";

export class ScenarioAudit extends Context.Service<
  ScenarioAudit,
  {
    readonly run: (
      base: LocalUrl,
      scenarios: readonly Scenario[]
    ) => Effect.Effect<readonly ScenarioResult[], ScenarioAuditFailed>;
  }
>()("@good-a11y/core/ScenarioAudit") {}
