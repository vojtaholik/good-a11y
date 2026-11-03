# Layers 2 and 3: scan lifecycle, Workflow, page, deploy

Built 2026-11-03 by the builder-cloud agent, on top of layer 1 (`docs/layer-1.md`). A visitor pastes an address on a bare Foldkit page; the backend Worker records the scan in D1 and starts one Cloudflare Workflow instance, whose body runs an XState machine; the page polls until the report is published and renders it.

Deployed to the non-production stage `dev`: https://eaacheck-website-dev-x6ihepvlvg74r7cg.vojtaholik.workers.dev

## What was built

| Package | What it does |
| --- | --- |
| `packages/core` (new files) | `startScan` and `getScan` contracts (`scan-lifecycle.ts`), `ScanView` and its stages (`scan-view.ts`), `ScanJob` (`scan-job.ts`), the `ScanSteps` port, the scan machine (`scan-machine.ts`), and the failures `UnknownScan`, `DailyCapReached`, `ScanUnavailable`, `ScanStepFailed`. The browser-safe entry `@eaa-check/core/contracts` re-exports what the page needs |
| `packages/scan-store` | D1 through Drizzle. `ScanStore`: one row per scan (stage, report JSON, failure). `BrowserBudget`: one row per UTC day of reserved browser seconds. Migrations in `migrations/d1/`, declared for the Stack by `ScanDatabase` in `src/d1.ts` |
| `apps/scanner` | The backend Worker. Serves `startScan` and `getScan` over RPC (`toRpc`), and owns `ScanWorkflow` |
| `apps/infra` | The Alchemy Stack `EaaCheck`: the website Worker, the scanner Worker, the Workflow, D1 and its migrations. No zone, no domain, no email |
| `apps/web` | The bare Foldkit page, styled with StyleX, flags from `flag-icons` |

## How a scan runs

1. `startScan(url)` parses the address with `parseScanTarget`, then `ScanStore.begin`. `begin` reuses the newest scan of the same vetted URL when it is still running, or was published within the last hour (`REUSE_WITHIN_MILLIS`). Otherwise it inserts a `queued` row, unless 200 scans (`DAILY_SCAN_CAP`) were requested in the last 24 hours, in which case it fails with `DailyCapReached`. The row is inserted and the cap checked in one statement.
2. A new row starts one Workflow instance named by the scan id.
3. The Workflow decodes its params and runs `runScan`: the XState machine `scanning → storing → published`, with `failing → failed` from either step. Each step is a `fromEffect` actor calling a `ScanSteps` method, and each method is one `Cloudflare.Workflows.task` with two retries and a 90 second timeout.
   - `scan`: marks the row `scanning`, runs `scanUrl` (SafeFetch, PageReader, checks, report) and returns the report as JSON.
   - `store`: writes the report and marks the row `published`.
   - `fail`: marks the row `failed` with a plain message.
4. `getScan(slug)` reads the newest row for the hostname without `www.`. A row still unsettled after 10 minutes reads as failed.

## Decisions

- **Fetch and judge are one Workflow task.** The task brief named three steps (fetch evidence, run checks, store report). A Workflow step's result is persisted and capped, and the raw body may be 2 MB, so passing it between steps would need an archive (webproai used R2). Keeping fetch and judge in one task means only the report crosses a step boundary. Steps are `scan` and `store`, plus `fail`.
- **Reuse is per vetted URL, the report is read per site.** `www.example.com` and `example.com` are separate addresses and separate scans, but `getScan` reads by slug, so the page shows the newest scan of that site.
- **A stored report that no longer decodes reads as a failed scan** with "This report was made by an older version of the checker and can no longer be shown. Run a new scan.", and is never reused. This came from the live crash in `docs/product-text-audit.md` D1: the Report schema gained fields after rows were stored, `begin` decoded the whole row, and the store error became a defect.
- **Store failures are typed.** Both contracts fail with `ScanUnavailable` instead of dying. The page handles every failure, defects included (`Effect.matchCause`), so an RPC problem shows the failed state with a link to start a new scan, never Foldkit's crash view.
- **Flags: `flag-icons` 7.6.0 (MIT).** The 27 member-state SVGs (4x3) are imported one by one in `apps/web/src/features/flags.ts`, so only those ship. The flag is decorative (`alt=""`) next to the state's name.
- **StyleX: `@stylexjs/stylex` and `@stylexjs/unplugin` 0.19.1.** One `stylex.create` in `styles.ts`; `sx(h, ...)` turns it into a Foldkit `Class`. Vite needs a CSS entry for StyleX to write into, so `client/base.css` exists. In tests the plugin's `configureServer` is dropped: its interval only clears when an HTTP server closes, which vitest never has.
- **No dev backend in Vite.** webproai's slice had one; here `alchemy dev` runs the whole product in local workerd, so the page is tested against the real Worker and Workflow.
- **The page is client-rendered.** `apps/web/test/own-page.test.ts` renders the start page and a report full of findings with Foldkit's `renderToString`, puts them in `index.html`, and runs our own reader and checks over the result: no check may fail, and the page never says "compliant".
- **Browser budget.** `BrowserBudget.reserve({ day, seconds, dailySeconds })` is one conditional upsert and returns whether the seconds were reserved. The shape is builder-core's proposal for the rendered check (layer after this one); the Workflow does not call it yet.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm exec alchemy dev --no-input` (in `apps/infra`) | The whole product in local workerd. The site is the `siteUrl` it prints. Build first: `pnpm turbo run build --filter=@eaa-check/web^...` |
| `pnpm exec varlock run -- pnpm --filter @eaa-check/infra exec alchemy plan --stage dev --no-input` | Preview the Stack diff |
| `pnpm exec varlock run -- pnpm --filter @eaa-check/infra exec alchemy deploy --stage dev --yes --no-input` | Deploy stage `dev` through the default Alchemy profile |
| `pnpm --filter @eaa-check/scan-store exec drizzle-kit generate --dialect sqlite --schema src/schema/d1.ts --out migrations/d1 --name <name>` | A new migration after a schema change |

## Verified

- Gate: `pnpm turbo run check test build`, 40 of 40 tasks.
- Tests: the scan machine (published, scan spent, store spent), the store (publish, reuse, rescan after the window, daily cap, an outdated row), the budget (spend, new day, oversize), the site capabilities (start and reuse, a refused address, an unknown site), our own page.
- `alchemy dev`: the page served and a scan of example.com published through the local Workflow.
- Stage `dev`: first deploy created 5 resources and changed nothing else. A scan typed into the live page (gov.uk) published and rendered; w3.org comes back as refused (HTTP 403 to Worker requests), which the report states.

## Open

- The browser bundle is 650 kB: `@eaa-check/core/contracts` pulls the facts ledger. Splitting the page's schemas from the ledger is a later change.
- Old rows on stage `dev` from before the Report schema changes read as outdated; nothing migrates them, by design.
- The rendered check (Browser Run) is the next layer: the Workflow reserves budget, then calls builder-core's `RenderedAudit` port.
- Alchemy reports `2.0.0-beta.85` is available; the repo stays on the pinned `beta.81`.
