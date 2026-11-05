# good-a11y

[![skills.sh](https://skills.sh/b/vojtaholik/good-a11y)](https://skills.sh/vojtaholik/good-a11y)

Accessibility guides for coding agents, and a checker for the page the agent built. Before an agent builds a dialog, a form, a menu or a route change, it reads a short guide for that pattern, so the first version already works with a keyboard and a screen reader. Then it checks its running page and fixes what the check finds.

- [good-a11y.com](https://good-a11y.com) has every guide with a live demo, and the hosted checker for public pages.
- [guides/](guides) holds the 25 guides. Each has the guide, a working `demo.html` and the claims its grader tests.
- [skills/good-a11y](skills/good-a11y) is the skill that tells an agent when to read a guide, how to find it and how to check its work.

The checker measures a page against WCAG 2.1 Level AA, the benchmark EN 301 549 refers to, and shows the WCAG 3 draft requirements beside each criterion. Agents can also describe the tasks a person has to finish on the page, such as buying or signing in, and the check replays them by keyboard.

## Give it to your agent

Paste this line into your coding agent:

```text
Use https://good-a11y.com for accessibility in this project: read https://good-a11y.com/skill.md and follow it.
```

The agent reads the guides over HTTP and installs nothing. When you ask it to keep good-a11y in the project, it saves the skill into the project itself.

## Install

Pick one route. Two installs give the agent the skill twice.

For any agent that reads the Agent Skills format, which includes Claude Code, Codex and Cursor:

```bash
npx skills@latest add vojtaholik/good-a11y
```

The installer asks which agents to install for. Add `-g` to install for every project on the machine.

For Claude Code, as a plugin that follows this repo:

```bash
claude plugin marketplace add vojtaholik/good-a11y
claude plugin install good-a11y@good-a11y
```

By hand, copy the `skills/good-a11y` folder into the folder your agent reads skills from. That is `.claude/skills/` for Claude Code and `.agents/skills/` for Codex and Cursor, in the project or in your home directory.

### If you are an agent

Install the skill only when your user asked you to. Then run this for your own harness:

```bash
npx skills@latest add vojtaholik/good-a11y --agent <claude-code|codex|cursor> --yes
```

`--yes` skips the installer's confirmation prompts, which you cannot answer. The skill goes into the current project.

If your user did not ask for an install, or you cannot install anything, fetch `https://good-a11y.com/skill.md` and follow it for the task at hand. Then tell your user how to install the skill.

## The CLI

The skill calls one npm package. It needs Node 24.18 or later, and `check` needs Chrome.

```bash
npx -y good-a11y@0.2.0 search "modal dialog focus"
npx -y good-a11y@0.2.0 retrieve modal-dialog
npx -y good-a11y@0.2.0 check http://localhost:5173
```

- `search` prints the best guides for a task as JSON, and `list` prints all of them.
- `retrieve` prints one or more guides, comma-separated.
- `check` opens the page in your own Chrome, localhost included, and prints the findings worst first, each with a fix prompt and the guide that fixes it. `--json` prints the report as JSON, and `--chrome <path>` (or `GOOD_A11Y_CHROME`) picks the browser.
- `check --flow a11y-flows.json` runs a guide's grader on the feature you built. Each guide's "Flow for check" section says what the file holds.
- `check --scenarios a11y-tasks.json` replays tasks a person has to finish, keyboard only, and counts them under Task completion. Each guide's "Scenario for check" section gives the format.

For a public page, the hosted checker at [good-a11y.com/check](https://good-a11y.com/check) runs the same checks in Cloudflare's browser and adds where the European Accessibility Act applies.

## What the checker says, and what it does not

- Findings come only from deterministic checks of the page: its static HTML, and the rendered page with axe-core and our own probes. A check that cannot decide reliably is left out.
- When a check fails, the report says the page does not meet WCAG 2.1 Level AA. When none fails, it says that this is not a pass. It never calls a site compliant and gives no compliance score: automated checks find only part of the issues WCAG covers, and a person has to review the rest.
- WCAG 3 lines come from the W3C Working Draft of 10 September 2026, carry its date and never count toward the verdict.
- The hosted report lists the EU member states where a finding applies under the European Accessibility Act (Directive (EU) 2019/882). A state is listed only when its transposing law and its scope for e-commerce are sourced and verified. Every other state is shown as unknown.
- Observations judged by a model are a separate list, labelled with the model and its confidence. They never count as issues.
- Task completion counts finished tasks. It is not an accessibility score and is not part of the verdict.

Every legal and normative statement the product makes comes from a verified, sourced fact in [research/facts](research/facts). Where a fact is missing, the product says "unknown".

## Working on the repo

[AGENTS.md](AGENTS.md) holds the rules, commands and architecture, and [VISION.md](VISION.md) says what the product is for. The site, the hosted checker and the CLI live in one pnpm workspace:

```bash
nvm use
pnpm install
pnpm turbo run check test build
```

Pull requests are for fixes. New guides and changes of opinion start as issues.

## License

[MIT](LICENSE). [PROVENANCE.md](PROVENANCE.md) credits the code we borrowed and lists the dependencies with other licences.
