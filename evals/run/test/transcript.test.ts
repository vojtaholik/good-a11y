import { describe, expect, it } from "@effect/vitest";

import { summarizeTranscript } from "../src/transcript.js";

const lines = (...values: readonly unknown[]): string =>
  values.map((value) => JSON.stringify(value)).join("\n");

const use = (input: Record<string, string>, name: string) => ({
  message: { content: [{ input, name, type: "tool_use" }] },
  type: "assistant",
});

describe("reading an agent transcript", () => {
  it("finds good-a11y searches, retrievals and checks in Claude Code tool calls, and its usage", () => {
    const summary = summarizeTranscript(
      [
        lines(
          {
            message: { content: [{ text: "ok", type: "text" }] },
            type: "assistant",
          },
          {
            message: {
              content: [
                {
                  input: { skill: "good-a11y" },
                  name: "Skill",
                  type: "tool_use",
                },
              ],
            },
            type: "assistant",
          },
          {
            message: {
              content: [
                {
                  input: {
                    command:
                      'node /x/bundle/good-a11y.mjs search "modal dialog focus" && node /x/bundle/good-a11y.mjs retrieve "dialog-modal,form-errors-validation"',
                  },
                  name: "Bash",
                  type: "tool_use",
                },
              ],
            },
            type: "assistant",
          },
          {
            message: {
              content: [
                {
                  input: {
                    command:
                      "npx -y github:vojtaholik/good-a11y check --json localhost:8080/",
                  },
                  name: "Bash",
                  type: "tool_use",
                },
              ],
            },
            type: "assistant",
          },
          {
            total_cost_usd: 0.42,
            type: "result",
            usage: {
              cache_creation_input_tokens: 20,
              cache_read_input_tokens: 300,
              input_tokens: 50,
              output_tokens: 70,
            },
          }
        ),
        "not json",
      ].join("\n")
    );

    expect(summary.use).toEqual({
      checks: ["localhost:8080/"],
      retrieved: ["dialog-modal", "form-errors-validation"],
      searches: ["modal dialog focus"],
      skillOpened: true,
    });
    expect(summary.usage).toEqual({
      cachedInputTokens: 320,
      costUsd: 0.42,
      inputTokens: 50,
      outputTokens: 70,
    });
    expect(summary.toolUses).toBe(3);
  });

  it("reads Codex command executions and adds up its turns", () => {
    const summary = summarizeTranscript(
      lines(
        {
          item: {
            command: "bash -lc 'cat .claude/skills/good-a11y/SKILL.md'",
            type: "command_execution",
          },
          type: "item.completed",
        },
        {
          item: {
            command:
              'bash -lc "node /b/good-a11y.mjs search \'skip link landmarks\'; node /b/good-a11y.mjs retrieve \\"tabs,focus-visible\\""',
            type: "command_execution",
          },
          type: "item.completed",
        },
        {
          type: "turn.completed",
          usage: {
            cached_input_tokens: 1000,
            input_tokens: 2000,
            output_tokens: 300,
          },
        },
        {
          type: "turn.completed",
          usage: { input_tokens: 10, output_tokens: 1 },
        }
      )
    );

    expect(summary.use.searches).toEqual(["skip link landmarks"]);
    expect(summary.use.retrieved).toEqual(["tabs", "focus-visible"]);
    expect(summary.use.skillOpened).toBe(true);
    expect(summary.usage).toEqual({
      cachedInputTokens: 1000,
      costUsd: null,
      inputTokens: 2010,
      outputTokens: 301,
    });
  });

  it("follows the bundle through a shell variable, and only through one that holds it", () => {
    const summary = summarizeTranscript(
      lines({
        message: {
          content: [
            {
              input: {
                command:
                  'cd /p; B=/x/bundle/good-a11y.mjs; node $B search "toast live region"; node $B retrieve "status-messages-toast,reduced-motion"; node $OTHER search "not ours"; G="node /x/bundle/good-a11y.mjs"; $G search "skip link"',
              },
              name: "Bash",
              type: "tool_use",
            },
          ],
        },
        type: "assistant",
      })
    );

    expect(summary.use).toEqual({
      checks: [],
      retrieved: ["status-messages-toast", "reduced-motion"],
      searches: ["toast live region", "skip link"],
      skillOpened: false,
    });
  });

  it("counts guides read from the installed files or fetched from good-a11y.com, and hosted searches and checks", () => {
    const summary = summarizeTranscript(
      lines(
        use({ url: "https://good-a11y.com/skill.md" }, "WebFetch"),
        use({ url: "https://good-a11y.com/dialog-modal.md" }, "WebFetch"),
        use(
          { file_path: "/p/.claude/skills/good-a11y/guides/tabs.md" },
          "Read"
        ),
        use(
          {
            command:
              'curl -s "https://good-a11y.com/search.md?q=cart+hold+timer" && curl -s https://good-a11y.com/check.md?url=https%3A%2F%2Fshop.example%2F && npx -y good-a11y@0.1.0 check localhost:5173/',
          },
          "Bash"
        )
      )
    );

    expect(summary.use).toEqual({
      checks: ["localhost:5173/", "https://shop.example/"],
      retrieved: ["dialog-modal", "tabs"],
      searches: ["cart hold timer"],
      skillOpened: true,
    });
  });

  it("lists the tool calls Claude Code denied", () => {
    const summary = summarizeTranscript(
      lines({
        permission_denials: [
          {
            tool_input: {
              command:
                'G=/b/good-a11y.mjs; node $G search "footer sitemap"; cat index.html',
            },
            tool_name: "Bash",
            tool_use_id: "toolu_1",
          },
        ],
        total_cost_usd: 0.17,
        type: "result",
        usage: { input_tokens: 1, output_tokens: 1 },
      })
    );

    expect(summary.denials).toEqual([
      {
        input:
          'G=/b/good-a11y.mjs; node $G search "footer sitemap"; cat index.html',
        tool: "Bash",
      },
    ]);
  });

  it("reports no usage and no use for an empty transcript", () => {
    expect(summarizeTranscript("")).toEqual({
      denials: [],
      toolUses: 0,
      usage: null,
      use: { checks: [], retrieved: [], searches: [], skillOpened: false },
    });
  });
});
