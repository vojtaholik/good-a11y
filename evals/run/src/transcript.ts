import { Option, Schema } from "effect";

export interface ToolUse {
  readonly command: string | null;
  readonly name: string;
  readonly target: string | null;
}

export interface Usage {
  readonly cachedInputTokens: number;
  readonly costUsd: number | null;
  readonly inputTokens: number;
  readonly outputTokens: number;
}

export interface GoodA11yUse {
  readonly checks: readonly string[];
  readonly retrieved: readonly string[];
  readonly searches: readonly string[];
  readonly skillOpened: boolean;
}

export interface TranscriptSummary {
  readonly toolUses: number;
  readonly usage: Usage | null;
  readonly use: GoodA11yUse;
}

const Count = Schema.Finite;

const ClaudeToolUse = Schema.Struct({
  input: Schema.Struct({
    command: Schema.optional(Schema.String),
    file_path: Schema.optional(Schema.String),
    skill: Schema.optional(Schema.String),
  }),
  name: Schema.String,
  type: Schema.Literal("tool_use"),
});

const ClaudeAssistant = Schema.Struct({
  message: Schema.Struct({
    content: Schema.Array(
      Schema.Union([ClaudeToolUse, Schema.Struct({ type: Schema.String })])
    ),
  }),
  type: Schema.Literal("assistant"),
});

const ClaudeResult = Schema.Struct({
  total_cost_usd: Schema.optional(Count),
  type: Schema.Literal("result"),
  usage: Schema.Struct({
    cache_creation_input_tokens: Schema.optional(Count),
    cache_read_input_tokens: Schema.optional(Count),
    input_tokens: Count,
    output_tokens: Count,
  }),
});

const CodexCommand = Schema.Struct({
  item: Schema.Struct({
    command: Schema.String,
    type: Schema.Literal("command_execution"),
  }),
  type: Schema.Literal("item.completed"),
});

const CodexTurn = Schema.Struct({
  type: Schema.Literal("turn.completed"),
  usage: Schema.Struct({
    cached_input_tokens: Schema.optional(Count),
    input_tokens: Count,
    output_tokens: Count,
  }),
});

const TranscriptLine = Schema.Union([
  ClaudeAssistant,
  ClaudeResult,
  CodexCommand,
  CodexTurn,
]);

const decodeLine = Schema.decodeUnknownOption(
  Schema.fromJsonString(TranscriptLine)
);

const GOOD_A11Y_COMMAND =
  /good-a11y(?:\.mjs)?\s+(?<command>search|retrieve|check|list)\b(?<argument>[^\n;&|]*)/gu;

const FIRST_ARGUMENT =
  /^\s*(?:--json\s+|--chrome\s+\S+\s+)*(?:"(?<double>[^"]*)"|'(?<single>[^']*)'|(?<bare>[^\s"']+))/u;

const firstArgument = (text: string): string => {
  const groups = FIRST_ARGUMENT.exec(text)?.groups;

  return (groups?.double ?? groups?.single ?? groups?.bare ?? "").trim();
};

export const goodA11yUseOf = (toolUses: readonly ToolUse[]): GoodA11yUse => {
  const searches: string[] = [];
  const retrieved: string[] = [];
  const checks: string[] = [];

  for (const use of toolUses) {
    for (const match of use.command?.matchAll(GOOD_A11Y_COMMAND) ?? []) {
      const argument = firstArgument(match.groups?.argument ?? "");

      if (match.groups?.command === "search") {
        searches.push(argument);
      } else if (match.groups?.command === "retrieve") {
        retrieved.push(
          ...argument
            .split(",")
            .map((id) => id.trim())
            .filter((id) => id !== "")
        );
      } else if (match.groups?.command === "check") {
        checks.push(argument);
      }
    }
  }

  const skillOpened = toolUses.some(
    (use) =>
      (use.name === "Skill" && use.target === "good-a11y") ||
      (use.target?.endsWith("good-a11y/SKILL.md") ?? false) ||
      (use.command?.includes("good-a11y/SKILL.md") ?? false)
  );

  return { checks, retrieved: [...new Set(retrieved)], searches, skillOpened };
};

export const summarizeTranscript = (text: string): TranscriptSummary => {
  const toolUses: ToolUse[] = [];
  let usage: Usage | null = null;

  const add = (next: Omit<Usage, "costUsd">, costUsd: number | null) => {
    usage = {
      cachedInputTokens:
        (usage?.cachedInputTokens ?? 0) + next.cachedInputTokens,
      costUsd: costUsd ?? usage?.costUsd ?? null,
      inputTokens: (usage?.inputTokens ?? 0) + next.inputTokens,
      outputTokens: (usage?.outputTokens ?? 0) + next.outputTokens,
    };
  };

  for (const raw of text.split("\n")) {
    const line = decodeLine(raw);

    if (Option.isNone(line)) {
      continue;
    }

    const { value } = line;

    if (value.type === "assistant") {
      for (const part of value.message.content) {
        if ("name" in part) {
          toolUses.push({
            command: part.input.command ?? null,
            name: part.name,
            target: part.input.skill ?? part.input.file_path ?? null,
          });
        }
      }
    } else if (value.type === "item.completed") {
      toolUses.push({
        command: value.item.command,
        name: "shell",
        target: null,
      });
    } else if (value.type === "result") {
      add(
        {
          cachedInputTokens:
            (value.usage.cache_read_input_tokens ?? 0) +
            (value.usage.cache_creation_input_tokens ?? 0),
          inputTokens: value.usage.input_tokens,
          outputTokens: value.usage.output_tokens,
        },
        value.total_cost_usd ?? null
      );
    } else {
      add(
        {
          cachedInputTokens: value.usage.cached_input_tokens ?? 0,
          inputTokens: value.usage.input_tokens,
          outputTokens: value.usage.output_tokens,
        },
        null
      );
    }
  }

  return { toolUses: toolUses.length, usage, use: goodA11yUseOf(toolUses) };
};
