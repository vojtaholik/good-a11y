# Code review: hostile input, spend, workflow, facts gate, report honesty

Reviewer: hc terminal `reviewer`, 2026-11-03, at `159c21e` plus the uncommitted tree. Read-only. Every finding was traced end to end in code; `vetUrl` results below were run against `packages/core/dist`.

Counts: **2 high, 3 medium, 3 low.** No defects found in the facts gate or in report honesty (what was checked is listed at the end).

## High

### H1. Browser Run navigation is not vetted: redirects, script navigations and the refused path bypass SafeFetch

- `packages/browser-audit/src/puppeteer-session.ts:117-123` calls `page.goto(url, { waitUntil: "load" })` with no request interception. Chrome follows every HTTP redirect, meta refresh and `location =` itself. `vetUrl` runs once, on the start URL (`apps/scanner/src/scan-workflow.ts:115`), and never on a hop the browser takes.
- On the refused path (decision 20) `report.finalUrl` is `null` (`packages/core/src/scan.ts:63`), so the browser opens `job.target.url` and walks a redirect chain that SafeFetch never vetted at all. On the checked path the server can answer the browser differently from the static fetch (the same UA string, but a different client, IP and timing), so the hops SafeFetch vetted are not the hops Chrome takes.
- axe runs wherever the page ended up. `stayed` (`puppeteer-session.ts:215`) only gates target size and reflow, not axe, and `rendered.ts` never compares the landed URL with the tested one.

Failure scenario: an attacker hosts `https://evil.example/` that 302s the static fetcher to a harmless page but 302s a headless Chrome (or every request after the first) to `http://169.254.169.254.nip.io/` or any other internal name. Browser Run loads it, axe and the probes run on it, its HTML is archived to R2 (`scan-workflow.ts:140`), and rendered samples from that page show up in the public report under the attacker's URL. Whether Browser Run's egress can reach anything private is not something this repo controls or verifies; the rule "every outbound request goes through `SafeFetch`" is broken either way. A milder version of the same defect: a site can cloak, so the report attributes rendered findings to a URL the browser never stayed on.

Fix: `page.setRequestInterception(true)` and, for every `request.isNavigationRequest()` (main frame and frames), abort unless `vetUrl(request.url())` succeeds; abort non-`http(s)` schemes. Also cap navigations (count redirects in `request.redirectChain()` at `DEFAULT_MAX_REDIRECTS`). After `goto` and after the probes, re-vet `page.url()` and skip the rendered result with a reason if it fails. Add a fixture test with a fake `BrowserSession` that redirects to a forbidden host.

### H2. Every cap is global, so one anonymous caller can switch the product off for everyone

- `apps/scanner/src/site-limits.ts:1-5`: 200 scans/day, 50 messages/day. `packages/core/src/rendered-audit.ts:10-12`: 1080 browser seconds/day, 90 reserved per audit, so **12 rendered audits per day** in production. `packages/core/src/judged.ts:16`: 400k judge tokens/day.
- Nothing identifies the caller: no per-IP limit, no Turnstile, no rate limiter binding (`grep -ri "ratelimit|connecting-ip|turnstile"` over `apps` and `packages` is empty). The only dedupe is same exact URL within an hour (`packages/scan-store/src/scan-store.ts:79-95`), which a query string defeats (`?a=1`, `?a=2`, …).

Failure scenario: a script sends 200 `startScan` calls with `https://example.com/?n=1..200`. Each passes `parseScanTarget`, each inserts a row, and every visitor for the next 24 h gets `DailyCapReached`. The first 12 of those scans also take the whole day's Browser Run budget, so even before the scan cap bites, real visitors get static-only reports. 50 `sendMessage` calls do the same to the contact form, which is the product's reason to exist (studio9 leads). Brief decision 14 defers Turnstile; the scan side has no such decision.

Fix: Cloudflare's Rate Limiting binding (`ratelimit` in the Worker, keyed by `cf-connecting-ip`) on `startScan` and `sendMessage` in the website Worker before the RPC hop, plus Turnstile on both when site keys exist. Keep the global caps as the spend ceiling. Normalise or drop the query string for the reuse key, or count distinct URLs per host per day.

## Medium

### M1. A visitor follows the newest scan of the host, not their own scan

- `apps/web/src/client/commands.ts:31-50`: `SucceededStartScan` keeps only `slug`; `scanId` is dropped. `GetScan` polls `getScan({ slug })`, which returns the newest row for the hostname (`scan-store.ts:132-148`, `scan-view.ts:27-33`).

Failure scenario: visitor A scans `https://shop.example/`. While it runs, B (or anyone) scans `https://shop.example/404-this-does-not-exist`. A's page now shows B's scan and report, under the `/shop.example` link A will share. Anyone can repoint a site's shared report page to the worst page on that host at any time.

Fix: return and poll by `scanId` (`getScan({ scanId })` reading by primary key), and keep the slug only for the human-readable URL; or make the page URL carry the scan ID.

### M2. A stuck or slow scan shows "failed" but blocks a rescan of the same URL for up to an hour

- `packages/core/src/scan-view.ts:35-42`: `readAt` turns an unsettled scan into `failed` after 10 minutes (`STALE_AFTER_MILLIS`).
- `packages/scan-store/src/scan-store.ts:79-95`: `isReusable` works on the raw stage, so an unsettled (`queued`/`scanning`) row is reused for `REUSE_WITHIN_MILLIS` = 1 hour.

Failure scenario: the Workflow dies without settling the row (the `fail` step itself fails after its retries, a launch that the platform accepted but never ran, an instance stuck in the queue). After 10 minutes the page says the scan failed; the visitor clicks scan again; `begin` returns `reused` with the same dead `scanId`; the page says failed again. This repeats for ~50 minutes. The same 10-minute cut also hits slow legitimate scans: the step budgets add up to about 13 minutes (scan 3 × 90 s + backoff, render 120 s, judge 120 s, store 3 × 90 s), so a scan can read "failed" and then publish later.

Fix: use one staleness rule in both places. In `isReusable`, treat an unsettled row older than `STALE_AFTER_MILLIS` as not reusable (and mark it failed in the same statement), and make `STALE_AFTER_MILLIS` at least the sum of the step timeouts.

### M3. `vetUrl` checks the name, never the address it resolves to

- `packages/core/src/public-url.ts:48-93` rejects IP literals and private TLDs only. Run against the built package: `http://127.0.0.1.nip.io/`, `https://localtest.me/` and `http://169.254.169.254.nip.io/` all return `Success`.
- In the CLI (`apps/cli`, Node, `httpHopTransportLayer` over `fetch`) these resolve to loopback and link-local, so `pnpm cli scan 169.254.169.254.nip.io` fetches the operator's metadata endpoint and prints evidence from it. On Workers the platform's own egress rules decide; the code relies on them without saying so. The same names reach Browser Run (see H1).

Fix: in the Node transport, resolve the host first (`dns.lookup` with `all: true`), reject private, loopback, link-local, CGNAT, multicast and IPv4-mapped IPv6 ranges, and connect to the vetted address (an undici `Agent` with a `connect.lookup` that applies the same check, so a rebind between check and connect fails too). Record in AGENTS.md that on Workers address-level vetting is delegated to Cloudflare's egress, and add a test that the Node transport refuses `localtest.me`.

## Low

### L1. The judge budget is an estimate that is never reconciled with real usage

`packages/core/src/judged.ts:449-456` reserves `ceil(JSON length / 3)` tokens plus overheads; `scan-workflow.ts:215-229` never compares it with `reply.usage.input_tokens`, which `judgedOf` already sums (`judged.ts:488-491`). The page-language question sends up to the full text sample; for Greek or Bulgarian text (EU languages, dense in tokens) three characters per token undercounts, so the 400k daily cap is a soft target, not a ceiling. Bounded by request size, so the overshoot is a small multiple, not unbounded. Fix: after the answers, record the difference between actual and reserved usage (positive or negative) in `judge_budget`, and reserve from a per-script estimate or a fixed upper bound per question.

### L2. A failed `browser.close` is ignored and its time is not counted

`puppeteer-session.ts:95` wraps `browser.close` in `Effect.ignore`, and `scan-workflow.ts:160-171` releases `90 − elapsed` seconds right after. If close fails, the Browser Run session keeps billing until the platform's idle timeout, outside the budget. Fix: on a failed close, release nothing (keep the full 90 s reserved), and set `keep_alive` explicitly at launch so the orphan's lifetime is known.

### L3. Two identical `startScan` calls at the same moment both start a Workflow

`scan-store.ts:153-163` reads the newest row, then inserts. Two concurrent requests for the same URL both see nothing reusable and both insert, so two Workflows run and both can reserve browser time. Small cost, but it is free amplification for H2. Fix: make reuse part of the insert (`INSERT … WHERE NOT EXISTS (SELECT 1 FROM scans WHERE url = ? AND …)`), or a unique partial index on unsettled rows per URL.

## Checked, no defect found

- **SafeFetch**: every hop re-vetted, loop and hop-count limits, body capped while streaming (`body.ts:13-55`), whole walk under one timeout, redirect bodies not read, credentials, ports, IP literals, non-http schemes and integer/hex IPv4 forms rejected (the WHATWG parser normalises `2130706433` to `127.0.0.1` first). The HTTP transport sets `redirect: "manual"` and disables trace propagation.
- **Spend races**: scan, message, browser and judge caps are each one conditional `INSERT … WHERE` / `ON CONFLICT … WHERE` statement, so concurrent callers cannot exceed them. `release` clamps negatives (`Math.max(0, …)` and `MAX(0, …)`), and the table has a `>= 0` check. Render and judge steps have `limit: 0` retries, so a Workflow retry does not re-reserve; scan-step retries only re-fetch. Lost releases (isolate killed) fail toward over-counting.
- **Workflow replay**: the machine has no clock, randomness or I/O outside `ScanSteps`; every side effect is inside a named `Cloudflare.Workflows.task`; step names are fixed and unique; step outputs are schema-encoded JSON and decoded after replay. Render and judge failures fall through to storing; scan and store failures go to `fail`.
- **Facts gate**: `renderLedger` writes only `status === "verified"` facts (`packages/facts/src/render.ts:3-31`); the generated file holds no status field and so no unverified fact. Fix prompts quote site text one line per sample behind `> ` with whitespace collapsed, so page text cannot break out of the quote, and the rules tell the agent to treat it as data. The "published, not cited in the OJ" label traces to verified ledger facts.
- **Report honesty**: headlines never say "compliant"; the zero-issue headline is scoped ("of the kinds they look for") and the automated-limit statement is on every report. `tallyOf` counts static and rendered issues only; judged observations are a separate list and never enter the tally. A browser that lands on a bot wall is detected (`rendered.ts:181-184`) and reported as skipped, so a challenge page cannot produce "No issues found".
