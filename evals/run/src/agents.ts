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
  readonly home: string;
  readonly project: string;
  readonly prompt: string;
  readonly stubScript: string;
  readonly web: boolean;
}

export const CLAUDE_ALLOWED_TOOLS = [
  "Read",
  "Edit",
  "Write",
  "Glob",
  "Grep",
  "Skill",
  "Bash",
] as const;

export const CLAUDE_SANDBOX_SETTINGS = {
  permissions: { deny: ["WebFetch", "WebSearch"] },
  sandbox: {
    allowUnsandboxedCommands: false,
    autoAllowBashIfSandboxed: true,
    enabled: true,
    failIfUnavailable: true,
    network: {
      allowLocalBinding: true,
      allowedDomains: ["localhost", "127.0.0.1"],
    },
  },
} as const;

export const WEB_DOMAINS = [
  "good-a11y.com",
  "github.com",
  "codeload.github.com",
  "objects.githubusercontent.com",
  "registry.npmjs.org",
] as const;

export const CLAUDE_WEB_SETTINGS = {
  ...CLAUDE_SANDBOX_SETTINGS,
  permissions: { deny: ["WebSearch"] },
  sandbox: {
    ...CLAUDE_SANDBOX_SETTINGS.sandbox,
    network: {
      ...CLAUDE_SANDBOX_SETTINGS.sandbox.network,
      allowedDomains: [
        ...CLAUDE_SANDBOX_SETTINGS.sandbox.network.allowedDomains,
        ...WEB_DOMAINS,
      ],
    },
  },
} as const;

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
        "--settings",
        JSON.stringify(
          input.web ? CLAUDE_WEB_SETTINGS : CLAUDE_SANDBOX_SETTINGS
        ),
        "--permission-mode",
        "acceptEdits",
        "--allowedTools",
        ...CLAUDE_ALLOWED_TOOLS,
        ...(input.web ? ["WebFetch"] : []),
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
      env: { CODEX_HOME: `${input.home}/.codex`, HOME: input.home },
    };
  }

  return {
    args: [input.stubScript, input.prompt],
    command: process.execPath,
    env: {},
  };
};
