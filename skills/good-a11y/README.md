# good-a11y skill

Accessibility guidance for coding agents. The skill tells the agent when to search the guides, how to retrieve them, and to check its own page.

Install it into a project for Claude Code:

```sh
mkdir -p .claude/skills/good-a11y
curl -fsSL https://raw.githubusercontent.com/vojtaholik/good-a11y/main/skills/good-a11y/SKILL.md -o .claude/skills/good-a11y/SKILL.md
```

For Codex and other agents that read `AGENTS.md`, put it in `.agents/skills/good-a11y/SKILL.md` the same way, or paste its body into `AGENTS.md`.

The commands it calls run straight from GitHub, with nothing to install:

```sh
npx -y github:vojtaholik/good-a11y search "modal dialog focus"
npx -y github:vojtaholik/good-a11y retrieve modal-dialog
npx -y github:vojtaholik/good-a11y check http://localhost:5173
```
