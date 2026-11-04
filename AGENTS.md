# Agent instructions

For a non-trivial task, start with `skills/rat-stack-mode`.

This file is the repo law for agents and contributors. It holds commands, validation rules, architecture constraints, and project stop rules. Read `VISION.md` for intent before planning substantial work. `VISION.md` does not override this file. The working brief and its decision ledger live in `.brain/projects/eaa-checker/`. `BRIEF.md` is the owner's brief; `REPORT.md` is the durable status.

eaa-check is built the way `~/Developer/vojtaholik/webproai` is: from the [joelhooks/rat-stack](https://github.com/joelhooks/rat-stack) template at upstream commit `e2616fb`, by way of webproai's cut skeleton, on 2026-11-03. webproai is read-only reference. Where the stack has an answer, take it.

## Stack contract

Workspace `package.json` files declare the pinned stack. Keep dependencies exact. Repo-local config wins. Record drift instead of silently migrating the project.

- pnpm workspaces + Turborepo (`apps/*`, `packages/*`)
- Node `>=24.18.0` and pnpm `11.3.0`; do not replace pnpm with Bun or npm for installs. A new shell may start on another Node: run `nvm use` first
- Effect `4.0.0` and `@effect/platform-node` `4.0.0`
- XState `6.0.0-alpha.63` with `@xstate/effect` `0.1.0-alpha.6` for the scan lifecycle: machines run as scoped Effects via `createEffectActor`, side effects are declared `fromEffect` actors
- Alchemy `2.0.0-beta.81` for every cloud resource, declared in `apps/infra/alchemy.run.ts`, authenticated through Alchemy profiles (`~/.alchemy/profiles`), never through env vars in this repo
- Foldkit `0.166.0` with `@foldkit/vite-plugin` `0.26.1` on Vite `8.0.7`, and StyleX `0.19.1`, for `apps/web`, at webproai's pins
- `flag-icons` `7.6.0` (MIT) for the member-state flags on the page
- Drizzle `1.0.0-rc.5-ab785fc` and `@effect/sql-d1` `4.0.0` for the D1 store, only in `packages/scan-store`
- TypeScript `7.0.2` in strict mode, patched by `@effect/tsgo` `0.45.0` in `prepare` so the Effect language service diagnostics in `tsconfig.base.json` fail `tsc`, not just the editor. Escape hatch for a real boundary: `// @effect-diagnostics-next-line <rule>:off` with a reason
- `@effect/vitest` `4.0.0` for every Effect test: `it.effect` and `it.layer(layer)`; `Effect.run*` and `ManagedRuntime.make` in test files are a lint error
- `@oxlint/plugins` `1.83.0` for the typed lint rules in `scripts/oxlint-plugin-*.ts` and the vendored [anti-slop](https://github.com/dmmulroy/anti-slop) rules in `tools/oxlint/anti-slop/` (all generic rules plus the Effect group, at `error`)
- Oxlint `1.83.0` with Ultracite `7.12.0`, Oxfmt `0.68.0`, and Turborepo `2.11.2`
- `htmlparser2` `12.0.0` is the one HTML parser, and only `packages/html-reader` imports it
- `axe-core` `4.14.0` (MPL-2.0) and `@cloudflare/puppeteer` `1.4.0` for the rendered page check; only `packages/browser-audit` imports them
- varlock `1.20.0`: declare every env var in `.env.schema`, never read `.env.local` directly, run `pnpm env:check` after schema edits

## Packages

| Package | Path | Role |
| --- | --- | --- |
| `@eaa-check/capability` | `packages/capability` | `defineContract`, `implement`, and the `toCommand` and `toRpc` projections, copied from webproai unchanged |
| `@eaa-check/facts` | `packages/facts` | Parses the facts ledger (`research/facts/**/*.md`) and holds the generated data the product reads: only `verified` facts, looked up by ID, and per-state profiles |
| `@eaa-check/core` | `packages/core` | The domain: the `scan` capability, the hardened fetch (`SafeFetch`), evidence, the checks, the check catalogue, per-state applicability and the report. It owns the ports `HopTransport`, `PageReader` and `RenderedAudit` and imports no HTTP client and no parser. The fence's own tests also live in `packages/core/test` |
| `@eaa-check/http-transport` | `packages/http-transport` | Adapter for `HopTransport`: one request through Effect's `HttpClient` on `fetch`, never follows a redirect, sends no tracing headers. Its `./node` entry (the CLI's) resolves each name, refuses it when any address is private, loopback, link-local, CGNAT, multicast, reserved or IPv4-mapped to one of those, and connects only to the address it vetted |
| `@eaa-check/browser-audit` | `packages/browser-audit` | Adapter for `RenderedAudit`: one Browser Run session through `@cloudflare/puppeteer`, fixed viewport and user agent, runs the pinned axe-core, closes the browser in a finalizer, hard timeout |
| `@eaa-check/html-reader` | `packages/html-reader` | Adapter for `PageReader`: reads the accessibility evidence out of HTML in one pass over the `htmlparser2` tokenizer, with no tree |
| `@eaa-check/cli` | `apps/cli` | Composition root for the `eaa-check` bin. One command per capability |

| `@eaa-check/scan-store` | `packages/scan-store` | Cartridge on D1: `ScanStore` (one row per scan: stage, report or failure; same-URL reuse within an hour; daily cap), `MessageStore` (contact messages, daily cap) and `BrowserBudget` (daily browser time for the rendered check). Each cap is one conditional insert. Declares its database and migrations for the Stack | | `@eaa-check/scanner` | `apps/scanner` | The backend Worker: `startScan`, `getScan`, `sendMessage` over RPC, and `ScanWorkflow`, one Workflow instance per scan whose body runs the XState scan machine with each step as a Workflow task | | `@eaa-check/web` | `apps/web` | The page: a Foldkit app styled with StyleX. Paste a URL, follow the scan, read the report, write to studio9 | | `@eaa-check/infra` | `apps/infra` | The Alchemy Stack: website Worker, scanner Worker, the Workflow, D1. No zone, no domain |

## Nouns

| Noun | Home | Runtime job |
| --- | --- | --- |
| Fact | `research/facts/**/*.md` | One sourced claim with status `unverified`, `verified` or `rejected`. Only `verified` facts reach product code |
| Contract | `packages/core/src/contracts.ts` | Shared name, schemas, failure, annotations |
| Capability | `packages/core/src/<name>.ts` | Binds one contract to its handler with `implement` |
| Port | `packages/core/src/<name>.ts` | A `Context.Service` core owns and an adapter implements: `HopTransport`, `PageReader`, `RenderedAudit` |
| Check | `packages/core/src/checks/<id>.ts` | One pure function from page evidence to a check result |
| Catalogue | `packages/core/src/catalogue.ts` | Maps each check to the fact IDs of its WCAG success criterion and EN 301 549 clauses |
| State profile | `packages/facts` | Per member state: one verified fact per field, or unknown |
| Projection | `packages/capability/src/to-<surface>.ts` | Expose implemented capabilities on one runtime surface |

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm install` | Install workspace dependencies |
| `pnpm check` | Typecheck, verify formatting, and run type-aware linting |
| `pnpm lint` | Type-aware lint plus format check only |
| `pnpm fix` | Apply Oxfmt and safe Oxlint fixes |
| `pnpm test` | Build and run the Vitest suite once |
| `pnpm build` | Compile package outputs |
| `pnpm facts` | Regenerate `packages/facts/src/ledger.generated.ts` from the ledger. A test fails while it is stale |
| `pnpm cli scan <url>` | Build and run the CLI; `--json` prints the schema-encoded result |
| `pnpm exec alchemy dev --no-input` (in `apps/infra`) | The whole product in local workerd, no cloud calls |
| `pnpm exec varlock run -- pnpm --filter @eaa-check/infra exec alchemy plan --stage dev --no-input` | Preview the Stack diff. Use `deploy --stage dev --yes --no-input` to apply. Name the stage every time; only non-production stages are authorized |
| `pnpm vendor:agent-sources` | Clone the pinned source mirrors agents read before writing Effect or XState code |
| `pnpm exec lefthook install` | Install git hooks (also via `prepare`) |
| `pnpm turbo run check test build` | The gate. Run it before claiming a change is ready |

## Fence (cheating is uncomfortable)

The stack and hooks are the enforceable fence. Fence wins over prose.

- Lefthook pre-commit runs `pnpm check` and `pnpm test`
- Agents must not bypass git hooks with the no-verify flag or any equivalent
- Blocked by: Pi `.pi/extensions/git-interceptor`, Cursor `.cursor/hooks.json`, Claude Code `.claude/settings.json`
- Policy source: `scripts/vcs-command-policy.js`
- CI (`.github/workflows/ci.yml`) runs the full gate on every push
- Turbo serves test results from cache by declared inputs. A test that reads a file outside its package must list that file under its task in `turbo.json`. The ledger is declared for `@eaa-check/facts#test` and `@eaa-check/core#test`
- Oxfmt does not format `.brain/**`, `research/**`, `BRIEF.md` or `REPORT.md`: other agents write them concurrently

If a hook fails, fix the failure. Do not disable the fence.

## Source-first Effect / XState work

Before writing, reviewing, or refactoring Effect or XState code, read the installed Effect package's `AGENTS.md` first, for example `packages/core/node_modules/effect/AGENTS.md`. Then inspect vendored source for the pinned versions (`pnpm vendor:agent-sources`, mirrors under `.agent_sources/github.com/`). Mirrors are reference material, not runtime dependencies.

## Source control

Preserve existing work. Inspect status before editing, stage only files changed for the current task, and do not commit generated output other than `ledger.generated.ts`, secrets, or populated `.agent_sources/github.com/` trees. Never bypass the git hooks.

## Project law

- Every legal and normative claim traces to a `verified` fact. The product reads facts only through `@eaa-check/facts`, whose generated data holds verified facts and nothing else. A fact that is unverified or rejected never reaches product text: where it is missing the product shows "unknown" or leaves the claim out.
- The catalogue names fact IDs, never text. A test fails when a catalogue ID is not in the ledger. The report shows an SC or EN clause only when its fact is verified; an unverified mapping is left out of the report.
- A finding applies in a member state when that state's profile has a verified `transposing-law` and a verified `scope-ecommerce` of `yes`. Every other state is listed as unknown, never as applying.
- The report never says "compliant" or "compliance score". It always says that automated checks find only part of the issues WCAG covers and that a manual review is needed. A test renders reports and fails on either phrase. The verdict goes one way only: when a deterministic check fails, the report says the page does not meet WCAG 2.1 Level AA, the reference benchmark, backed by a verified fact; with no failure it says that this is not a pass (decision 25).
- One contract, every kept surface. Define schemas with `defineContract`, bind a handler with `implement`, add the capability to `capabilities`.
- Schemas are the contract. Input, output, and failure are Effect `Schema`. Parse every outside value at its boundary.
- Findings come from deterministic checks only. A check is a pure function of the evidence a scan collected. No model output changes a finding.
- A **judged observation** is the one thing a model may produce: a typed answer from a decision model (`@cf/cloudflare/clef`, or TypeSafe Jev where callable) about evidence the scan collected, turned into an observation by a pure function with fixed thresholds. Observations are their own list in the report, labelled as judged by a model with the model's version and confidence. They are never counted as issues, never change a finding, and are never presented as fact-backed: no "issue" wording, and their WCAG mapping reads as what the question relates to. Model use stays inside a daily budget held in `packages/scan-store`; without the binding or budget the judged step is skipped and the report says so (decisions 15, 18, 19 in the brief).
- A check reports `pass`, `fail` or `not_applicable` with counted instances and a few samples. Fewer reliable checks beat many noisy ones: a check that cannot be decided reliably from the evidence the scan collected (static HTML or the rendered page) is not in the catalogue.
- The network is hostile. Every outbound request goes through `SafeFetch`, which vets each hop with `vetUrl`, follows redirects by hand, caps the body while it streams, and returns failures as typed values.
- A scanned site controls every byte we read. No input within the size caps may make the reader or a check take more than linear time or throw.
- Tautological and change-detector tests are harmful. Test behavior at seams and with fixtures.
- Errors are part of the interface. Name the failure, keep its source context, say how to fix it.
- No comments in code (`no-comments/no-comments`). Credit for borrowed code lives in `PROVENANCE.md`. Tool directives keep their reason after `--`; a type assertion carries a one-line `SAFETY:` comment.
- English first. Every user-facing text is English; other languages are a later decision recorded in the Brain.

## Architecture

- `rat-stack-boundaries/no-core-adapters` keeps adapters out of core. Core may import `packages/capability`, `packages/facts`, Effect and XState. `packages/facts` is pure data and domain parsing, so it is allowed; HTTP clients and parsers are not.
- `rat-stack-boundaries/no-cross-layer-imports` enforces dependency direction: apps → `packages/core` → `packages/facts`, `packages/capability` → Effect. Packages do not import apps.
- A scan runs in steps, each a Workflow task: `parseScanTarget` turns what was typed into a vetted target, `SafeFetch` fetches the one page, `PageReader.read` turns its HTML into `PageEvidence`, and `report` runs every static check and builds the `Report`. Then `RenderedAudit` opens the page in Browser Run (also when the static fetch was refused, decision 20), runs the pinned axe-core and the rendered probes, and `withRendered` adds their findings, or a skip with its reason, to the `Report`. Then the judged step may add judged observations under its own budget.
- `SafeFetch` is the only caller of `HopTransport`, and `HopTransport.open` takes a `PublicUrl`. Only `vetUrl` makes one.
- `vetUrl` vets the name. The address it resolves to is vetted by the transport: on Node by `@eaa-check/http-transport/node`, on Workers by Cloudflare's egress, which does not reach private networks. The Worker code does not vet addresses itself.
- Browser Run is vetted per navigation (interception with `vetUrl`, landed URL re-vetted, popups closed, service workers bypassed). Its subresource requests and DNS answers are not vetted: like Worker egress, Browser Run egress is Cloudflare's network, assumed not to reach private addresses. Cloudflare documents no such guarantee for Browser Run, so this is an assumption (`docs/rendered-audit.md`).

## Boundaries and sign-off

See `VISION.md`, "Needs sign-off". Never enter credentials. Deploy only to a non-production stage.
