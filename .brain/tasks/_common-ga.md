# good-a11y, common rules (lead, 2026-11-04)

Read `AGENTS.md`, `.brain/projects/good-a11y/good-a11y-brief.svx` (decisions 1-12 are the plan; do not reopen them), and the docs your task names. Vojta is not answering questions: make the best call, record it, tell the lead (`hc send t1t ...`) at each milestone and when blocked. Do not start agents.

- You work in your own git worktree (named in your task), detached at origin/main. Run `nvm use && pnpm install --offline` there first (fall back to `pnpm install` if the store misses a package). Commit when the whole gate is green; then `git fetch && git rebase origin/main` and `git push origin HEAD:main`. Message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Never bypass hooks.
- The repo is still named eaa-check with the `@eaa-check` scope; the rename comes later as one mechanical change. Name new things good-a11y (`packages/guides`, `@eaa-check/guides` for now).
- Effect/XState code: read `packages/core/node_modules/effect/AGENTS.md` first. Every outside value parsed by Effect Schema at its boundary. Errors are typed. No comments in code. Tests at seams with fixtures, never change detectors.
- Legal/normative claims trace to verified facts. A guide's WCAG mapping is STD-SC fact IDs only.
- Other agents now: `guides` (packages/guides, CLI search/retrieve, SKILL.md), `check` (the local `check` command), `writer` (seed guides), `builder-judge` (3.3.x calibration in the main tree). `hc send <name>` before touching their files or root config.
