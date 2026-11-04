import { Schema } from "effect";

export const AGENTS = ["claude", "codex", "stub"] as const;

export const AgentNameSchema = Schema.Literals(AGENTS);

export type AgentName = typeof AgentNameSchema.Type;

export interface AgentInvocation {
  readonly args: readonly string[];
  readonly command: string;
  readonly env: Readonly<Record<string, string>>;
}

export interface InvocationInput {
  readonly codexHome: string;
  readonly project: string;
  readonly prompt: string;
  readonly stubScript: string;
}

export const CLAUDE_ALLOWED_TOOLS = [
  "Read",
  "Edit",
  "Write",
  "Glob",
  "Grep",
  "Skill",
  "Bash(node:*)",
  "Bash(npx:*)",
  "Bash(npm:*)",
  "Bash(pnpm:*)",
  "Bash(python3 -m http.server:*)",
  "Bash(ls:*)",
  "Bash(cat:*)",
  "Bash(curl:*)",
  "Bash(git:*)",
] as const;

export const invocationOf = (
  agent: AgentName,
  input: InvocationInput
): AgentInvocation => {
  if (agent === "claude") {
    return {
      args: [
        "-p",
        input.prompt,
        "--effort",
        "low",
        "--output-format",
        "stream-json",
        "--verbose",
        "--no-session-persistence",
        "--setting-sources",
        "project",
        "--strict-mcp-config",
        "--mcp-config",
        '{"mcpServers":{}}',
        "--permission-mode",
        "acceptEdits",
        "--allowedTools",
        ...CLAUDE_ALLOWED_TOOLS,
      ],
      command: "claude",
      env: {},
    };
  }

  if (agent === "codex") {
    return {
      args: [
        "exec",
        "--json",
        "--ephemeral",
        "--skip-git-repo-check",
        "--sandbox",
        "workspace-write",
        "-c",
        'model_reasoning_effort="low"',
        "-C",
        input.project,
        input.prompt,
      ],
      command: "codex",
      env: { CODEX_HOME: input.codexHome },
    };
  }

  return {
    args: [input.stubScript, input.prompt],
    command: process.execPath,
    env: {},
  };
};
