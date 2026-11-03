# Layers 2 and 3: scan lifecycle, Workflow, page, deploy

Built 2026-11-03 by the builder-cloud agent, on top of layer 1 (`docs/layer-1.md`). A visitor pastes an address on a bare Foldkit page; the backend Worker records the scan in D1 and starts one Cloudflare Workflow instance, whose body runs an XState machine; the page polls until the report is published and renders it.

Deployed to the non-production stage `dev`: https://eaacheck-website-dev-x6ihepvlvg74r7cg.vojtaholik.workers.dev

## What was built

| Package | What it does |
| --- | --- |
| `packages/core` (new files) | `startScan` and `getScan` contracts (`scan-lifecycle.ts`), `ScanView` and its stages (`scan-view.ts`), `ScanJob` (`scan-job.ts`), the `ScanSteps` port, the scan machine (`scan-machine.ts`), and the failures `UnknownScan`, `DailyCapReached`, `ScanUnavailable`, `ScanStepFailed`. The browser-safe entry `@eaa-check/core/contracts` re-exports what the page needs |
| `packages/scan-store` | D1 through Drizzle. `ScanStore`: one row per scan (stage, report JSON, failure). `MessageStore`: one row per visitor message. `BrowserBudget`: one row per UTC day of reserved browser seconds. Migrations in `migrations/d1/`, declared for the Stack by `ScanDatabase` in `src/d1.ts` |
| `apps/scanner` | The backend Worker. Serves `startScan`, `getScan` and `sendMessage` over RPC (`toRpc`), and owns `ScanWorkflow` |
| `apps/infra` | The Alchemy Stack `EaaCheck`: the website Worker, the scanner Worker, the Workflow, D1 and its migrations, the R2 bucket for raw axe results, the Browser Run binding. No zone, no domain, no email |
| `apps/web` | The bare Foldkit page, styled with StyleX, flags from `flag-icons` |

## How a scan runs

1. `startScan(url)` parses the address with `parseScanTarget`, then `ScanStore.begin`. `begin` reuses the newest scan of the same vetted URL when it is still running, or was published within the last hour (`REUSE_WITHIN_MILLIS`). Otherwise it inserts a `queued` row, unless 200 scans (`DAILY_SCAN_CAP`) were requested in the last 24 hours, in which case it fails with `DailyCapReached`. The row is inserted and the cap checked in one statement.
2. A new row starts one Workflow instance named by the scan id.
3. The Workflow decodes its params and runs `runScan`: the XState machine `scanning → rendering → storing → published`, with `failing → failed` from scan or store. Each step is a `fromEffect` actor calling a `ScanSteps` method, and each method is one `Cloudflare.Workflows.task` with two retries and a 90 second timeout.
   - `scan`: marks the row `scanning`, runs `scanUrl` (SafeFetch, PageReader, checks, report) and returns the report as JSON.
   - `render`: when the static report is `checked` or `refused`, reserves browser time in `BrowserBudget`, opens the page once in Browser Run (`packages/browser-audit`), runs axe-core and the rendered probes (`docs/rendered-probes.md`), keeps the raw axe JSON in R2 (`EvidenceArchive`), and adds the result with `withRendered`. No retries and a 120 second timeout: a second browser session would spend budget on a site that already refused one. A spent budget, a browser that is blocked or a failed session leaves a skipped section with its reason, and a failed render task still publishes the static report.
   - `store`: writes the report and marks the row `published`.
   - `fail`: marks the row `failed` with a plain message.
4. `getScan(slug)` reads the newest row for the hostname without `www.`. A row still unsettled after 15 minutes (`STALE_AFTER_MILLIS`, longer than the sum of the step timeouts, about 13 minutes) reads as failed, and the next `startScan` of that URL marks it failed and starts a new scan (review M2).

## Contact

Every settled report, refused ones included, ends with the studio9 contact text (still the placeholder wording) and a short form: name (optional), email and message. The scanned URL is sent with it and the page says so. `sendMessage` checks the fields against `ContactMessageSchema` (the page checks the same schema before sending), and `MessageStore.keep` stores the message in D1 unless 50 messages (`DAILY_MESSAGE_CAP`) arrived in the last 24 hours, which fails with `DailyCapReached`. Ported from webproai's slice (`76991af`, `f6978ef`), without the notified column. Messages are stored only: nobody is told one arrived.

## Decisions

- **Fetch and judge are one Workflow task.** The task brief named three steps (fetch evidence, run checks, store report). A Workflow step's result is persisted and capped, and the raw body may be 2 MB, so passing it between steps would need an archive (webproai used R2). Keeping fetch and judge in one task means only the report crosses a step boundary. Steps are `scan` and `store`, plus `fail`.
- **Reuse is per vetted URL, the report is read per site.** `www.example.com` and `example.com` are separate addresses and separate scans, but `getScan` reads by slug, so the page shows the newest scan of that site.
- **A stored report that no longer decodes reads as a failed scan** with "This report was made by an older version of the checker and can no longer be shown. Run a new scan.", and is never reused. This came from the live crash in `docs/product-text-audit.md` D1: the Report schema gained fields after rows were stored, `begin` decoded the whole row, and the store error became a defect.
- **Store failures are typed.** Both contracts fail with `ScanUnavailable` instead of dying. The page handles every failure, defects included (`Effect.matchCause`), so an RPC problem shows the failed state with a link to start a new scan, never Foldkit's crash view.
- **Flags: `flag-icons` 7.6.0 (MIT).** The 27 member-state SVGs (4x3) are imported one by one in `apps/web/src/features/flags.ts`, so only those ship. The flag is decorative (`alt=""`) next to the state's name.
- **StyleX: `@stylexjs/stylex` and `@stylexjs/unplugin` 0.19.1.** One `stylex.create` in `styles.ts`; `sx(h, ...)` turns it into a Foldkit `Class`. Vite needs a CSS entry for StyleX to write into, so `client/base.css` exists. In tests the plugin's `configureServer` is dropped: its interval only clears when an HTTP server closes, which vitest never has.
- **No dev backend in Vite.** webproai's slice had one; here `alchemy dev` runs the whole product in local workerd, so the page is tested against the real Worker and Workflow.
- **The page is client-rendered.** `apps/web/test/own-page.test.ts` renders the start page and a report full of findings with Foldkit's `renderToString`, puts them in `index.html`, and runs our own reader and checks over the result: no check may fail, and the page never says "compliant".
- **Browser budget counts measured session time (decision 22).** Before a browser session the render step reserves `RENDERED_AUDIT_RESERVE_SECONDS` (90, above the adapter's hard timeout of 80) with one conditional upsert, so concurrent scans can never overspend the day. After the session, success or failure, it measures the session with the Clock and gives back the unused part (`BrowserBudget.release`, never below zero). So the day's total is the sum of real sessions, rounded up to whole seconds, and the reservation only limits how many sessions run at once.
- **The daily browser budget is a per-stage setting (decision 22).** The Scanner Worker gets `DAILY_BROWSER_SECONDS` from the Stack (`apps/scanner/src/browser-limits.ts`, `Stack.useSync` on the stage name): stage `dev` gets 5400 seconds (90 minutes) a day for QA, every other stage gets `DAILY_BROWSER_SECONDS` from core, 1080 seconds (18 minutes). Included Browser Run time is 10 hours a month, so 18 minutes a day keeps a production month inside it; dev spends from the same account, so long QA days on dev eat into it. The Workflow reads the value with `Config.Int` and falls back to the core default.
- **The rendered check also runs when the static fetch was refused** (lead, 2026-11-03). Browser Run is an honest Cloudflare browser with the scanner's own user agent, so it is no evasion. If the browser is refused too, the report stays the refused report unchanged. Measured on 16 large shops in `.brain/resources/bot-wall-block-rate.svx`.
- **axe-core and the probe script are injected as text from a generated module.** `axe.source` is built from `axeFunction.toString()`, which breaks once a bundler rewrites axe-core (Rolldown renamed its `module` and the injected script threw). The browser-audit build writes `dist/page/scripts.js` with axe-core's shipped `axe.min.js` and the compiled probe script as string constants, reached through the package import `#page-scripts` (types in `src/page-scripts.d.ts`). Node (Alchemy importing the Stack), Vite (tests) and Rolldown (the Worker) all read it the same way.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm exec alchemy dev --no-input` (in `apps/infra`) | The whole product in local workerd. The site is the `siteUrl` it prints. Build first: `pnpm turbo run build --filter=@eaa-check/web^...` |
| `pnpm exec varlock run -- pnpm --filter @eaa-check/infra exec alchemy plan --stage dev --no-input` | Preview the Stack diff |
| `pnpm exec varlock run -- pnpm --filter @eaa-check/infra exec alchemy deploy --stage dev --yes --no-input` | Deploy stage `dev` through the default Alchemy profile |
| `pnpm --filter @eaa-check/scan-store exec drizzle-kit generate --dialect sqlite --schema src/schema/d1.ts --out migrations/d1 --name <name>` | A new migration after a schema change |

## Verified

- Gate: `pnpm turbo run check test build`, 40 of 40 tasks.
- Tests: the scan machine (published, scan spent, store spent), the store (publish, reuse, rescan after the window, daily cap, an outdated row), the message store (cap, a resent message), the budget (spend, new day, oversize), the site capabilities (start and reuse, a refused address, an unknown site, a message), our own page (with the contact form).
- Stage `dev`, contact: a test message sent from the form under a live report was stored and the page said "Your message arrived. Thank you."
- `alchemy dev`: the page served and a scan of example.com published through the local Workflow.
- Stage `dev`: first deploy created 5 resources and changed nothing else. A scan typed into the live page (gov.uk) published and rendered; w3.org comes back as refused (HTTP 403 to Worker requests), which the report states.

## Open

- Contact messages are stored and never sent anywhere. Sending them (webproai notifies the owner's own address through Cloudflare Email) needs the destination address verified in Cloudflare, and is not built.
- The contact form has no Turnstile or other bot check; the daily cap of 50 is the only limit.

- The browser bundle is 650 kB: `@eaa-check/core/contracts` pulls the facts ledger. Splitting the page's schemas from the ledger is a later change.
- Old rows on stage `dev` from before the Report schema changes read as outdated; nothing migrates them, by design.
- Alchemy reports `2.0.0-beta.85` is available; the repo stays on the pinned `beta.81`.

## Browser navigation is vetted (review H1)

Browser Run follows redirects, meta refreshes and script navigations itself, so `SafeFetch` never sees those hops. The session therefore turns on request interception. Every navigation request, in the main frame and in frames, goes through `navigationAllowed`: it must pass `vetUrl` (which also refuses other schemes than http and https) and have at most `DEFAULT_MAX_REDIRECTS` redirects behind it, or it is aborted. Other requests, such as images and scripts, continue unchanged. After `goto` and again after the probes, the page's URL is vetted once more. A refused hop or a refused landing fails the audit with the kind `navigation`, and the report says "The page sent the browser to an address the scanner does not open, so the rendered page was not checked." Tests: `packages/browser-audit/test/rendered-audit.test.ts`.

## Per-caller and per-site limits (review H2, L3)

The global daily caps (200 scans, 50 messages, the browser and judge budgets) stay as spend ceilings. In front of them:

- The Scanner Worker has no `workers.dev` URL and no preview URLs (`workersDev: false`); the website reaches it only through its service binding, so every call passes the website's limits (review R1). The website answers 405 to any method other than POST on `/rpc` (R2). It reads the procedure tags of each POST body and, for `startScan` and `sendMessage`, asks a Cloudflare rate limit binding before the request goes to the Scanner. The key is the caller: the full address for IPv4, the /64 prefix for IPv6, since one IPv6 client holds a whole /64 (R4). Limits: 5 `startScan` calls and 2 `sendMessage` calls per minute per address (`apps/web/src/server/limits.ts`). Cloudflare's binding allows only 10 or 60 second periods, so "3 messages per 10 minutes" became 2 per minute. Over the limit the Worker answers 429 with "Too many requests from your address. Wait a minute and try again." The binding counts per Cloudflare location and approximately: on dev, 15 calls one second apart from one address got the first 429 on the 9th call. It stops bursts and scripts, not a careful caller.
- One caller can scan one site at most 10 times a day (`SITE_DAILY_SCAN_CAP`), counted by slug and caller, so a query string per request cannot use up the global cap, and nobody can lock a site out for its owner (R3). The website sets the `x-eaa-caller` header to the caller key, overwriting whatever the visitor sent; the Scanner's `CallerMiddleware` turns it into the `Caller` service for `startScan`, and `ScanStore.begin` stores it in the `caller` column (migration `scan_caller`). Over the cap, `startScan` fails with "Today's cap of 10 new scans of this site is reached."
- The per-site cap, the global cap and the reuse of a running scan of the same URL are all conditions of the one `INSERT` in `ScanStore.begin`, so two calls at the same moment start one Workflow, and the second gets the first scan's ID.

## A browser that does not close keeps its reservation (review L2)

Browser Run is launched with `keep_alive` set to 60 seconds (`KEEP_ALIVE_MS`), so a session left open ends at most a minute after its last command. The adapter reports whether `browser.close` succeeded. When it failed, the audit step releases nothing and the scan keeps its full 90-second reservation, which covers that minute. Test: `packages/browser-audit/test/rendered-audit.test.ts`.
