# Task: builder-core

## Ground rules

- Repo: this repository (named eaa-check then). Read `BRIEF.md`, `.brain/projects/eaa-checker/eaa-checker-brief.svx`, `research/facts/README.md` first.
- Reference stack: ~/Developer/vojtaholik/webproai (READ ONLY; never modify it). Read its `AGENTS.md` (long; the Stack contract, Packages, Project law, Architecture sections), `README.md`, `VISION.md`.
- Lead is hc terminal `t1t`. Report with `hc send t1t "..."` at each milestone below, when blocked, and when done.
- Do not start other agents. Do not commit or push: tell the lead when a layer is green and the lead commits.
- Do not edit `research/`, `.brain/`, `REPORT.md`, `BRIEF.md`. Other agents write `research/facts/` concurrently.
- Never enter credentials. Plain English in docs, no em dashes.

## Task: layer 1, the thin slice CLI scan -> checks -> report

1. **Skeleton.** Copy webproai's rat-stack skeleton into this repo under the `@eaa-check` scope: root `package.json`, `pnpm-workspace.yaml` (trim the minimumReleaseAgeExclude list to what you use), `turbo.json`, `tsconfig*.json`, oxlint/oxfmt config, `lefthook.yml`, `.nvmrc`, `.gitignore`, `.env.schema` (empty of webproai vars), `scripts/` and `tools/` that the fence needs, the `.claude/settings.json` hook-bypass block, and the packages `capability`, `http-transport`, `html-reader` (adapt), plus `apps/cli`. Same exact pins. Do not copy `.git`, `node_modules`, `dist`, `.turbo`, `.brain`, `.agent_sources`, `marketing`, `.env.local`. Leave `apps/scanner`, `apps/infra`, `apps/web`, `scan-store` out for now (layer 2/3, another agent). Write a short `AGENTS.md` for this repo (stack contract, packages table, commands, the sourcing rule) and `README.md`. Milestone: `pnpm install && pnpm turbo run check test build` green on the empty skeleton -> tell lead.

2. **`packages/facts`** (`@eaa-check/facts`): parses `research/facts/**/*.md` per the format in `research/facts/README.md`, and a build step generates typed data with ONLY `status: verified` facts (rejected and unverified never reach product code). Expose lookups by ID and per-state profiles (`states/<cc>.md` -> profile per field, each field `{ value, factId, source }` or unknown). A test fails on a malformed fact entry. Declare the ledger files as turbo inputs.

3. **`packages/core`** (`@eaa-check/core`): the `scan` capability (contract + implement, like webproai), the hardened fetch from webproai's `SafeFetch`/`HopTransport` pattern (hostile URLs: no private IPs, no redirects to them, size and time limits), evidence from the fetched HTML via the `PageReader` port, and deterministic checks, each a pure function of evidence. Start with checks that are reliable on static HTML, e.g.: `html-lang` (3.1.1), `document-title` (2.4.2), `image-alt` (1.1.1), `form-labels` (1.3.1 / 4.1.2), `link-name` (2.4.4 / 4.1.2), `button-name` (4.1.2), `frame-title` (4.1.2), `meta-viewport-zoom` (1.4.4), `meta-refresh` (2.2.1), `duplicate-id` (4.1.1). Pick what you can make reliable; fewer, correct checks beat many noisy ones. A check reports pass / fail / not-applicable with counted instances and a few sample selectors or snippets.
   - A check catalogue maps each check to WCAG SC fact IDs `STD-SC-<n>` and EN 301 549 fact IDs `STD-EN-9.<n>` (the research-eu agent is writing these into `research/facts/standards.md` now; IDs follow that convention). A test fails if a catalogue ID does not exist in the ledger. The report shows SC/EN text only from verified facts; an unverified mapping is omitted from the report (never shown as fact).
   - Per-state applicability: for each finding, the states where it applies = states whose profile has verified `transposing-law` and `scope-ecommerce`; states with unknown or unverified data are listed as "unknown", never as applying.
   - The report: the page scanned, checks run, findings (SC + EN clause), per-state applicability, a fixed plain statement that automated checks catch only part of WCAG and a manual review is needed, never the word "compliant" (add a test that the rendered report never contains "compliant"/"compliance score"), and a contact CTA placeholder (`studio9`, wording marked TODO for Vojta).
4. **`apps/cli`**: `pnpm cli scan <url>` prints the report; `--json` prints the schema-encoded result. Tests for checks with HTML fixtures.

Milestone after each of 2, 3, 4 when the gate is green. Then write `docs/layer-1.md` with what was built, what was copied from webproai and changed, and open questions, and tell the lead.

## Addendum from Vojta (2026-11-03, via orchestrator)

"Build it on rat-stack the same way webproai is (start from the same template, same fence: lint, Effect language service, hooks, CI), with a .brain/ like webproai's. It should be very similar to webproai in structure."

So in step 1, the skeleton must carry the WHOLE fence, as webproai has it:
- `@effect/tsgo` patch in `prepare` and the Effect language service diagnostics in `tsconfig.base.json` that fail `tsc`.
- oxlint + ultracite + all typed lint plugins in `scripts/oxlint-plugin-*.ts` and `tools/oxlint/anti-slop/`.
- lefthook pre-commit (`pnpm check`, `pnpm test`), the no-verify bypass blocks for Claude Code (`.claude/settings.json`), Cursor (`.cursor/hooks.json`) and Pi (`.pi/extensions/git-interceptor`), `scripts/vcs-command-policy.js`.
- CI: `.github/workflows/ci.yml` running the full gate.
- `skills/` (rat-stack-mode, add-a-capability, add-a-lifecycle-machine, add-a-store, learn-alchemy, keep-or-cut, gardener), `scripts/vendor-agent-sources.sh`, `PROVENANCE.md` (state: created from joelhooks/rat-stack at `e2616fb` by way of webproai's cut skeleton, date 2026-11-03), `CLAUDE.md` pointing at `AGENTS.md`.
- Same workspace layout and naming as webproai: `apps/cli`, later `apps/scanner`, `apps/infra`, `apps/web`; `packages/capability`, `packages/core`, `packages/http-transport`, `packages/html-reader`, later `packages/scan-store`. `AGENTS.md` structured like webproai's (Stack contract, Packages, Nouns, Commands, Fence, Source-first, Source control, Project law, Architecture, Boundaries), short where the product is not built yet.
