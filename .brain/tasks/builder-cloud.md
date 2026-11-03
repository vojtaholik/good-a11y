# Task: builder-cloud

## Ground rules

- Repo: /Users/vojta/Developer/vojtaholik/eaa-check. Read `AGENTS.md`, `VISION.md`, `BRIEF.md`, `.brain/projects/eaa-checker/eaa-checker-brief.svx` (decision ledger), `research/facts/README.md`, and `docs/layer-1.md` (what builder-core built) first.
- Reference stack: ~/Developer/vojtaholik/webproai (READ ONLY). Its slice-era commits are the closest template for this layer: `062401a` (lifecycle contracts), `76991af` (scan store on D1), `47b7170` (machine in a Workflow behind capabilities), `f6978ef` (bare Foldkit page), `72eed5e` (site wired to backend), `933cbc0` (deploy report). Read them with `git -C ~/Developer/vojtaholik/webproai show <sha>`; the current tree there is much bigger than you need. Also its `.brain/projects/rat-stack-rebuild/` steps on the replay proof and deploy.
- Lead is hc terminal `t1t`. Report with `hc send t1t "..."` at each milestone, when blocked, and when done.
- Do not start other agents. Do not commit or push: tell the lead when a layer is green; the lead commits. The pre-commit hook runs the full gate, so keep the tree green between milestones.
- Do not edit `research/`, `.brain/`, `REPORT.md`, `BRIEF.md`. Do not change `packages/core` checks or `packages/facts` beyond what wiring needs; tell the lead if you must.
- Never enter credentials. If a Cloudflare login or token is needed and not already present, stop that part and tell the lead.
- Plain English in docs, no em dashes.

## Task: layers 2 and 3

1. **Contracts**: `startScan` (url -> scan id/slug), `getScan` (slug -> stage + report or failure) in core, like webproai's lifecycle contracts.
2. **`packages/scan-store`**: D1 store, one row per scan (stage, report JSON, failure), like webproai's slice-era store, with a simple daily cap on new scans and a per-address rescan reuse. Migrations declared for the Stack.
3. **`apps/scanner`**: the backend Worker. `ScanWorkflow`: one Cloudflare Workflow instance per scan whose body runs an XState scan machine (`packages/core/src/scan-machine.ts`, `createEffectActor`, side effects as `fromEffect` actors), each step a Workflow task (fetch evidence, run checks, store report). Serves the capabilities over RPC (`toRpc`).
4. **`apps/infra`**: Alchemy Stack: the Worker, the Workflow, D1, the website Worker. No zone, no domain, no email. `alchemy dev` works locally.
5. **`apps/web`**: a bare Foldkit page, styled minimally with StyleX: paste a URL, start a scan, poll, show the report: findings with WCAG SC + EN 301 549 clauses (verified facts only), per finding the member states where it applies with small SVG country flags (use a maintained MIT flag package such as `flag-icons`; record the choice), the "automated checks find only part of WCAG; manual review needed" statement, never "compliant", and the studio9 contact CTA placeholder. English.
6. **Deploy** to a NON-production stage (e.g. `--stage dev`) on the Cloudflare account webproai uses, through the same Alchemy profile mechanism webproai uses (see its AGENTS.md Commands; `pnpm exec varlock run -- pnpm --filter @eaa-check/infra exec alchemy deploy --stage dev --yes --no-input`). Plans must only create resources. Report the workers.dev URL. If auth is missing, tell the lead instead of logging in.

Milestones: (a) store + contracts green, (b) machine in Workflow green with a test, (c) `alchemy dev` serves the page and a scan completes locally, (d) deployed URL. Write `docs/layer-2-3.md` at the end.

## Timing and coordination (lead, 2026-11-03 20:25 CET)

- Hard deadline: the machine sleeps around 00:20 CET. No questions to anyone: make the best call, record it in `docs/layer-2-3.md`, keep going. A deployed bare page that scans one URL end to end beats breadth. Have (d) deployed by 23:30 at the latest.
- builder-core (hc name `builder-core`) is still finishing `packages/core` (scan capability, checks, report) and `apps/cli` in this same working tree. Start with what does not depend on it: `packages/scan-store`, `apps/infra`, the `apps/scanner` Worker shell, the `apps/web` page shell. Put `startScan`/`getScan` contracts in a new file in core and tell builder-core you did. Before you run `pnpm install` or change the root `package.json`/`pnpm-workspace.yaml`/`turbo.json`, send builder-core a one-line heads-up so you don't install at the same time. The pre-commit gate runs on the whole tree: keep your packages compiling.
- Cloudflare auth: Alchemy profiles live in `~/.alchemy/profiles` (created for webproai on this machine). Use the default profile the way webproai does. If a deploy needs an interactive login, stop that part, tell the lead, and keep building.
