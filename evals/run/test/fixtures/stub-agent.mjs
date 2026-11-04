import { existsSync, readFileSync, writeFileSync } from "node:fs";

const skill = ".claude/skills/good-a11y/SKILL.md";

const guided = existsSync(skill);

const line = (value) => process.stdout.write(`${JSON.stringify(value)}\n`);

const prompt = process.argv[2] ?? "";

writeFileSync(
  "index.html",
  prompt.includes("BREAK THE BUILD")
    ? "BROKEN"
    : '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><title>Mini</title></head>\n<body><a href="#main">Skip to main content</a><header>Mini</header><main id="main">Mini site</main></body></html>\n'
);

if (guided) {
  const command =
    /`(?<command>node \S+good-a11y\.mjs)/u.exec(readFileSync(skill, "utf-8"))
      ?.groups?.command ?? "missing";

  line({
    message: {
      content: [
        {
          input: { file_path: `${process.cwd()}/${skill}` },
          name: "Read",
          type: "tool_use",
        },
      ],
    },
    type: "assistant",
  });
  line({
    message: {
      content: [
        {
          input: { command: `${command} search "page layout skip link"` },
          name: "Bash",
          type: "tool_use",
        },
      ],
    },
    type: "assistant",
  });
  line({
    message: {
      content: [
        {
          input: { command: `${command} retrieve skip-link-landmarks` },
          name: "Bash",
          type: "tool_use",
        },
      ],
    },
    type: "assistant",
  });
}

line({
  total_cost_usd: 0.01,
  type: "result",
  usage: { cache_read_input_tokens: 100, input_tokens: 10, output_tokens: 5 },
});
