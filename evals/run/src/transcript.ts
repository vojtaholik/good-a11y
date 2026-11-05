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

export interface Denial {
  readonly input: string;
  readonly tool: string;
}

export interface TranscriptSummary {
  readonly denials: readonly Denial[];
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
    url: Schema.optional(Schema.String),
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
  permission_denials: Schema.optional(
    Schema.Array(
      Schema.Struct({
        tool_input: Schema.Struct({
          command: Schema.optional(Schema.String),
          file_path: Schema.optional(Schema.String),
        }),
        tool_name: Schema.String,
      })
    )
  ),
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
  /(?:good-a11y(?:\.mjs|@\d+\.\d+\.\d+)?|\$\{?(?<variable>\w+)\}?)\s+(?<command>search|retrieve|check|list)\b(?<argument>[^\n;&|]*)/gu;

const GOOD_A11Y_VARIABLE =
  /\b(?<name>[A-Za-z_]\w*)=(?:\\?"[^"]*good-a11y(?:\.mjs)?\\?"|'[^']*good-a11y(?:\.mjs)?'|[^\s;"']*good-a11y(?:\.mjs)?(?=[\s;]|$))/gu;

const GUIDE_READ =
  /(?:good-a11y\.com|good-a11y\/guides)\/(?!(?:skill|search|check|llms)\.)(?<id>[a-z\d]+(?:-[a-z\d]+)*)\.md\b/gu;

const HOSTED =
  /good-a11y\.com\/(?<page>search|check)\.md\?(?:q|url)=(?<value>[^\s"'`&)]+)/gu;

const decoded = (value: string): string => {
  try {
    return decodeURIComponent(value.replaceAll("+", " "));
  } catch {
    return value;
  }
};

const FIRST_ARGUMENT =
  /^\s*(?:--json\s+|--chrome\s+\S+\s+)*(?:\\"(?<escaped>[^"\\]*)\\"|"(?<double>[^"]*)"|'(?<single>[^']*)'|(?<bare>[^\s"'\\]+))/u;

const firstArgument = (text: string): string => {
  const groups = FIRST_ARGUMENT.exec(text)?.groups;

  return (
    groups?.escaped ??
    groups?.double ??
    groups?.single ??
    groups?.bare ??
    ""
  ).trim();
};

const hostedUseOf = (toolUses: readonly ToolUse[]) => {
  const texts = toolUses.map(
    (use) => `${use.command ?? ""} ${use.target ?? ""}`
  );

  const hosted = texts.flatMap((text) => [...text.matchAll(HOSTED)]);

  const valuesOf = (page: string) =>
    hosted.flatMap((match) =>
      match.groups?.page === page ? [decoded(match.groups.value ?? "")] : []
    );

  return {
    checks: valuesOf("check"),
    retrieved: texts.flatMap((text) =>
      [...text.matchAll(GUIDE_READ)].map((match) => match.groups?.id ?? "")
    ),
    searches: valuesOf("search"),
  };
};

export const goodA11yUseOf = (toolUses: readonly ToolUse[]): GoodA11yUse => {
  const searches: string[] = [];
  const retrieved: string[] = [];
  const checks: string[] = [];

  const variables = new Set(
    toolUses.flatMap((use) =>
      [...(use.command?.matchAll(GOOD_A11Y_VARIABLE) ?? [])].flatMap((match) =>
        match.groups?.name === undefined ? [] : [match.groups.name]
      )
    )
  );

  for (const use of toolUses) {
    for (const match of use.command?.matchAll(GOOD_A11Y_COMMAND) ?? []) {
      const variable = match.groups?.variable;

      if (variable !== undefined && !variables.has(variable)) {
        continue;
      }

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

  const hosted = hostedUseOf(toolUses);

  retrieved.push(...hosted.retrieved);
  searches.push(...hosted.searches);
  checks.push(...hosted.checks);

  const skillOpened = toolUses.some(
    (use) =>
      (use.name === "Skill" && use.target === "good-a11y") ||
      (use.target?.endsWith("good-a11y/SKILL.md") ?? false) ||
      (use.target?.includes("good-a11y.com/skill.md") ?? false) ||
      (use.command?.includes("good-a11y/SKILL.md") ?? false)
  );

  return { checks, retrieved: [...new Set(retrieved)], searches, skillOpened };
};

export const summarizeTranscript = (text: string): TranscriptSummary => {
  const toolUses: ToolUse[] = [];
  const denials: Denial[] = [];
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
            target:
              part.input.skill ??
              part.input.file_path ??
              part.input.url ??
              null,
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
      for (const denial of value.permission_denials ?? []) {
        denials.push({
          input: denial.tool_input.command ?? denial.tool_input.file_path ?? "",
          tool: denial.tool_name,
        });
      }

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

  return {
    denials,
    toolUses: toolUses.length,
    usage,
    use: goodA11yUseOf(toolUses),
  };
};
