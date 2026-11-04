# Eval runner (`evals/run`)

Layer 3 of good-a11y (brief decisions 9 and 10): run a coding agent on one task, with and without the skill, and grade what it built.

```sh
pnpm --filter @good-a11y/eval-run eval --guide skip-link-landmarks --app content --agents claude,codex --runs 3
```

Flags: `--guide`, `--app` (required), `--agents` (`claude`, `codex`, `stub`; default `claude,codex`), `--arms` (`unguided`, `guided`; default both), `--runs` (default 3), `--timeout-minutes` (default 20), `--out` (default `evals/results/<timestamp>`).

## One run

1. Read `evals/tasks/<guide>/<app>.json` (`guide`, `app`, `prompt`, `path`).
2. Copy `evals/apps/<app>` (without `node_modules` and `dist`) into a fresh temp directory outside the repo, so no `CLAUDE.md` or `AGENTS.md` of this repo is in reach. An app with a `package.json` (the shop) gets `pnpm install --offline --ignore-workspace` from the pnpm store, with `node_modules/` and `dist/` excluded from git; a failed install stops the run with `AppSetupFailed`.
3. Guided arm only: install `skills/good-a11y/SKILL.md` as `.claude/skills/good-a11y/SKILL.md` and append a pointer to it in `AGENTS.md` for Codex. The shipped `npx -y github:vojtaholik/good-a11y` is rewritten to `node <repo>/apps/good-a11y/bundle/good-a11y.mjs`: the eval measures the guides, not npx's cold install. The task prompt is the same in both arms and never names the guide; the agent finds it itself.
4. `git init` and commit, so the agent's changes are a diff.
5. Run the agent headless in the project, stdin closed, with a timeout:
   - Claude Code: `claude -p <prompt> --effort low --output-format stream-json --verbose --no-session-persistence --setting-sources project --strict-mcp-config --mcp-config '{"mcpServers":{}}' --permission-mode acceptEdits --allowedTools <list>`. `--setting-sources project` keeps the user's `CLAUDE.md`, skills, plugins and hooks out; the empty MCP config keeps their MCP servers out. Bash is limited to `node`, `npx`, `npm`, `pnpm`, `python3 -m http.server`, `ls`, `cat`, `curl` and `git`. Uses the logged-in subscription, so no `--bare`, which needs an API key.
   - Codex: `codex exec --json --ephemeral --skip-git-repo-check --sandbox workspace-write -c model_reasoning_effort="low" -C <project> <prompt>`, with `CODEX_HOME` set to a temp directory whose `auth.json` is a symlink to the user's, so their config, global `AGENTS.md` and skills stay out.
6. Save `transcript.jsonl`, `stderr.txt` and `changes.patch` under `<out>/runs/<guide>--<app>--<agent>--<arm>--<n>/`.
7. An app with a `package.json` is built with `pnpm run build`; a build that fails is a failed run, with the build output as its problem. Serve `dist/` as a single-page app (unknown paths that accept HTML get `index.html`, as `vite preview` does, on a free port so runs never collide), or a static app's directory as is, on `127.0.0.1`, and grade `<url><path>`:
   - our local check: `good-a11y check --json`, decoded with `ReportSchema`; the failing issue keys, and those that `guidesForCheck` maps to this guide;
   - the guide's Playwright grader: `playwright test graders/<guide>.spec.ts --reporter=json` in `evals/`, with `EVAL_TARGET_URL` and `EVAL_TASK` (the task file, for its `targets`).
8. A run passes when every expectation passes and the check finds no failing issue mapped to the guide. A run whose agent fails or times out is `agent-failed`; one whose grader cannot run is `grade-failed`. Neither counts as a pass or a fail in the rates; both are listed.

## Output

- `results.json`: every run, with expectations, check grade, good-a11y use (searches, retrieved ids, checks, whether the skill was opened), token usage and cost when the agent reports them, and duration.
- `summary.md`: per guide and agent, unguided and guided pass rates, the uplift in points, guided runs that retrieved the guide, runs that opened the skill, mean tokens and cost per arm, mean minutes, errors; then each run in one line.
- `queries.jsonl`: every `search` an agent ran in the guided arm, with the guide it should find and today's top 3. These real queries replace the 40 written by us in `packages/guides/test/retrieval-benchmark.ts` as the retrieval benchmark.

Usage comes from the transcripts: Claude Code's `result` event (tokens and `total_cost_usd`), Codex's `turn.completed` events (tokens only; on a subscription there is no price).

## Tests

`evals/run/test` runs the whole run with `stub-agent.mjs` in place of an agent and a fake grader, and parses Claude Code and Codex transcript fixtures. The real agents are not run in the gate.
