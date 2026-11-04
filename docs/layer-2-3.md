# Layers 2 and 3: scan lifecycle, Workflow, page, deploy

Built 2026-11-03 by the builder-cloud agent, on top of layer 1 (`docs/layer-1.md`). A visitor pastes an address on a bare Foldkit page; the backend Worker records the scan in D1 and starts one Cloudflare Workflow instance, whose body runs an XState machine; the page polls until the report is published and renders it.

Deployed to the non-production stage `dev`: https://eaacheck-website-dev-x6ihepvlvg74r7cg.vojtaholik.workers.dev

## What was built

| Package | What it does |
| --- | --- |
| `packages/core` (new files) | `startScan` and `getScan` contracts (`scan-lifecycle.ts`), `ScanView` and its stages (`scan-view.ts`), `ScanJob` (`scan-job.ts`), the `ScanSteps` port, the scan machine (`scan-machine.ts`), and the failures `UnknownScan`, `DailyCapReached`, `ScanUnavailable`, `ScanStepFailed`. The browser-safe entry `@good-a11y/core/contracts` re-exports what the page needs |
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
| `pnpm exec alchemy dev --no-input` (in `apps/infra`) | The whole product in local workerd. The site is the `siteUrl` it prints. Build first: `pnpm turbo run build --filter=@good-a11y/web^...` |
| `pnpm exec varlock run -- pnpm --filter @good-a11y/infra exec alchemy plan --stage dev --no-input` | Preview the Stack diff |
| `pnpm exec varlock run -- pnpm --filter @good-a11y/infra exec alchemy deploy --stage dev --yes --no-input` | Deploy stage `dev` through the default Alchemy profile |
| `pnpm --filter @good-a11y/scan-store exec drizzle-kit generate --dialect sqlite --schema src/schema/d1.ts --out migrations/d1 --name <name>` | A new migration after a schema change |

## Verified

- Gate: `pnpm turbo run check test build`, 40 of 40 tasks.
- Tests: the scan machine (published, scan spent, store spent), the store (publish, reuse, rescan after the window, daily cap, an outdated row), the message store (cap, a resent message), the budget (spend, new day, oversize), the site capabilities (start and reuse, a refused address, an unknown site, a message), our own page (with the contact form).
- Stage `dev`, contact: a test message sent from the form under a live report was stored and the page said "Your message arrived. Thank you."
- `alchemy dev`: the page served and a scan of example.com published through the local Workflow.
- Stage `dev`: first deploy created 5 resources and changed nothing else. A scan typed into the live page (gov.uk) published and rendered; w3.org comes back as refused (HTTP 403 to Worker requests), which the report states.

## Open

- Contact messages are stored and never sent anywhere. Sending them (webproai notifies the owner's own address through Cloudflare Email) needs the destination address verified in Cloudflare, and is not built.
- The contact form has no Turnstile or other bot check; the daily cap of 50 is the only limit.

- The browser bundle is 650 kB: `@good-a11y/core/contracts` pulls the facts ledger. Splitting the page's schemas from the ledger is a later change.
- Old rows on stage `dev` from before the Report schema changes read as outdated; nothing migrates them, by design.
- Alchemy reports `2.0.0-beta.85` is available; the repo stays on the pinned `beta.81`.

## Browser navigation is vetted (review H1)

Browser Run follows redirects, meta refreshes and script navigations itself, so `SafeFetch` never sees those hops. The session therefore turns on request interception. Every navigation request, in the main frame and in frames, goes through `navigationAllowed`: it must pass `vetUrl` (which also refuses other schemes than http and https) and have at most `DEFAULT_MAX_REDIRECTS` redirects behind it, or it is aborted. Other requests, such as images and scripts, continue unchanged. After `goto` and again after the probes, the page's URL is vetted once more. A refused hop or a refused landing fails the audit with the kind `navigation`, and the report says "The page sent the browser to an address the scanner does not open, so the rendered page was not checked." Tests: `packages/browser-audit/test/rendered-audit.test.ts`.

## Per-caller and per-site limits (review H2, L3)

The global daily caps (200 scans, 50 messages, the browser and judge budgets) stay as spend ceilings. In front of them:

- The Scanner Worker has no `workers.dev` URL and no preview URLs (`workersDev: false`); the website reaches it only through its service binding, so every call passes the website's limits (review R1). The website answers 405 to any method other than POST on `/rpc` (R2). It reads the procedure tags of each POST body and, for `startScan` and `sendMessage`, asks a Cloudflare rate limit binding before the request goes to the Scanner. The key is the caller: the full address for IPv4, the /64 prefix for IPv6, since one IPv6 client holds a whole /64 (R4). Limits: 5 `startScan` calls and 2 `sendMessage` calls per minute per address (`apps/web/src/server/limits.ts`). Cloudflare's binding allows only 10 or 60 second periods, so "3 messages per 10 minutes" became 2 per minute. Over the limit the Worker answers 429 with "Too many requests from your address. Wait a minute and try again." The binding counts per Cloudflare location and approximately: on dev, 15 calls one second apart from one address got the first 429 on the 9th call. It stops bursts and scripts, not a careful caller.
- One caller can scan one site at most 10 times a day (`SITE_DAILY_SCAN_CAP`), counted by slug and caller, so a query string per request cannot use up the global cap, and nobody can lock a site out for its owner (R3). The website sets the `x-eaa-caller` header to the caller key, overwriting whatever the visitor sent. Effect RPC also merges each JSON message's own `headers` over the HTTP headers, so the website answers 400 to any message that sets `x-eaa-caller` itself, and to a body it cannot read as RPC messages (re-review R11); the Scanner's `CallerMiddleware` turns it into the `Caller` service for `startScan`, and `ScanStore.begin` stores it in the `caller` column (migration `scan_caller`). Over the cap, `startScan` fails with "Today's cap of 10 new scans of this site is reached."
- The per-site cap, the global cap and the reuse of a running scan of the same URL are all conditions of the one `INSERT` in `ScanStore.begin`, so two calls at the same moment start one Workflow, and the second gets the first scan's ID.

## A browser that does not close keeps its reservation (review L2)

Browser Run is launched with `keep_alive` set to 60 seconds (`KEEP_ALIVE_MS`), so a session left open ends at most a minute after its last command. The adapter reports whether `browser.close` succeeded. When it failed, the audit step releases nothing and the scan keeps its full 90-second reservation, which covers that minute. Test: `packages/browser-audit/test/rendered-audit.test.ts`.

## Small crawl (decision 28, 2026-11-04)

After the `scan` task, a `crawl` task reads up to 4 more pages of the same site, then the scan goes on to `render`. It runs only when the entered page was `checked`; its evidence comes from the R2 archive the scan task wrote. A failed or spent crawl task leaves the report as it was and rendering goes on; it never fails the scan. No retries, 90 second timeout.

- **Picking (`packages/core/src/crawl.ts`, `pickPages`).** Pure and deterministic. Links are resolved against the page's final URL; only http(s) links on the same site (hostname without `www.`) count, the entered page itself never does, and fragments are dropped. Roles are filled in a fixed order: accessibility statement, contact, product, sign-in. For each role the first link in document order whose text or path matches wins, and a URL picked for one role is not picked for another. Text signs are whole words in the 24 EU languages (for example "Prohlášení o přístupnosti", "Barrierefreiheit", "Kontakt", "Přihlásit se", "Log in"); path signs are segments (`/accessibility`, `/barrierefreiheit`, `/pristupnost`, `/contact`, `/kontakt`, `/login`, `/anmelden`, `/prihlaseni`, ...). A product page is recognised by path only: a segment such as `product`, `products`, `produkt`, `produit`, `producto`, `prodotto`, `artikel`, `item`, `p` or `dp` followed by one more segment. Link text alone says too little about a product. The full lists are `ROLE_SIGNS`.
- **Structured data.** The reader now keeps each page's schema.org types (JSON-LD `@type`, microdata `itemtype`, up to 20), so builder-judge's EAA scope question and a later product check can see `Product` and `Offer` on the pages read. Picking does not use them: the entered page's JSON-LD rarely names product URLs, and reading it would cost a second parser.
- **Fetching (`crawl-site.ts`, `crawlSite`).** Each pick goes through `SafeFetch` (every hop vetted, body capped, the same user agent), two at a time. A page fails, typed and shown, when the fetch fails (`FetchFailureReason`), when it answers HTTP 400 or above (`http_error`), when a redirect lands on another site (`off_site`, for example a sign-in page on an identity provider), or when it is not HTML (`not_html`). Static checks run on every page read (`SitePage.checks`).
- **Kept.** In R2 for 30 days: each page's `PageEvidence` (`<slug>/<scanId>.<role>.evidence.json`, whose passages give builder-judge the statement's text) and the `SiteEvidence` (`.site.json`). The HTML bodies are not stored (R2-L2). The report gets `withSite(report, site)` from builder-core.
- **Cross-page evidence (`site-evidence.ts`, `SiteEvidence`).** `pages`: each crawled page, read or failed. `summaries`: the entered page first, then each page read, each with its navigation links (inside `nav` or `header` landmarks, in order, up to 80), help links (help, FAQ, support or contact by text or last path segment, `mailto:`, `tel:`; links back to the page itself such as skip links are left out; up to 10, with their position among all links), whether it has a search, whether it links a site map, the names of its links and buttons (up to 200) and its schema.org types.
- **Caps count one scan.** The crawl adds no `ScanStore` row and no rate-limit call; the per-site and global caps count the scan once. It adds at most 4 fetches to the site per scan, two at a time.
- **Reader additions.** `LinkEvidence.href` (as written, trimmed, up to 500 characters) and `LinkEvidence.landmark` (the nearest `nav`, `header`, `footer`, `main` or `aside` by tag or role; `header` and `footer` count only outside `article`, `aside`, `main`, `nav` and `section`, as HTML-AAM maps them), `PageEvidence.search` and `PageEvidence.structuredTypes`. All one pass, linear: JSON-LD text is kept up to 100,000 characters per page.

Checked live on dev (gov.uk, 2026-11-04): the statement, contact and sign-in pages were read, no product page was picked (gov.uk has none), and the report carried the site section.

## Clef calibration runner (local only)

`apps/scanner/src/calibrator.ts` is a Worker the Stack declares only under `alchemy dev` (`Alchemy.ALCHEMY_DEV`), where the Workers AI binding runs remote through the Alchemy profile. It is never deployed, so no public endpoint runs the model on request (lead, 2026-11-04). POST a JSON array of at most 200 judge requests (`{state, questions}`) to the `calibratorUrl` that `alchemy dev` prints; it answers a JSON array in the same order, each the raw Clef reply or `{error}`. Four calls at a time, each reserved and settled in `JudgeBudget` (the local D1 under dev, so it bounds one machine's runs).

## Judge token shares per stage (R2-M2, 2026-11-04)

Workers AI's free allocation, 10,000 neurons a day (about 458,000 Clef input tokens, `docs/judged-checks.md`), is shared by the whole account. Each stage counts its use in its own D1 `judge_budget` row, and the calibrator uses the local D1. So the caps are set as shares of one account-wide ceiling of 400,000 tokens, which leaves about 58,000 tokens of margin under the free allocation (`apps/scanner/src/judge-limits.ts`):

| Who | Daily tokens | How it is set |
| --- | --- | --- |
| Stage `prod` | 250,000 | `DAILY_JUDGE_TOKENS` on the scanner Worker, from the stage at deploy |
| Every other stage (`dev`, a local `dev_*`) | 50,000 each | the same variable. The workflow also falls back to 50,000 when the variable is missing |
| Calibrator (local `alchemy dev` only) | 100,000 a day | `CALIBRATION_JUDGE_TOKENS`, counted in the local D1 |

With `prod`, `dev` and the calibrator in use, the total is 400,000. A further non-production stage in use on the same day adds 50,000, which still fits under the allocation. The production stage is named `prod`. That name is a proposal: no production stage exists yet, and creating one needs sign-off (`VISION.md`). At 50,000 a day, dev's judged step covers about 10 to 15 real scans a day. Past the cap it is skipped, as before. A calibration batch larger than 100,000 tokens takes two days, or the share has to be moved from another row in the table.

## Evidence lifetime (R2-L2)

The evidence bucket deletes every object 30 days after upload (`EvidenceArchive` lifecycle rule `delete-evidence-after-30-days`, `EVIDENCE_DAYS`). The crawl no longer stores the crawled pages' HTML bodies; it keeps only their evidence JSON (`<role>.evidence.json`), which is the only part anything reads back.
