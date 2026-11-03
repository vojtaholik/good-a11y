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

## Re-review (22:15 CET) of ea1b4cb, 26fc8be, e58fc57, 8914d24

Read each diff end to end; ran the touched suites (`http-transport` node transport 24/24, `browser-audit` 11/11, `scan-store` 20/20, `web` handler 3/3, all pass). Two bypasses were confirmed against the live dev stage with read-only `getScan` calls only; no scan was started.

Counts: **2 high, 3 medium, 5 low** (new or remaining). Status of the original findings: H1 fixed for navigations, residual below (R5). H2 **not fixed** (R1, R2). M1 fixed for the visitor's own session, residual R6. M2, M3, L1, L2, L3 fixed.

### High

**R1. The scanner Worker serves RPC on its own public workers.dev URL, so the rate limits do not apply.** `apps/scanner/src/worker.ts:20-28` sets no `workersDev`, and Alchemy's default is `true` (`alchemy/src/Cloudflare/Workers/Worker.ts:545-556`). The Worker's fetch handler is the RPC server for any path. Verified: `POST https://eaacheck-scanner-dev-butkmrv76a43vsix.vojtaholik.workers.dev/` with a `getScan` message returns the report. `startScan` and `sendMessage` go through the same server, so a caller skips the website Worker and its per-IP limits entirely; only the global and per-site caps remain. Fix: `workersDev: false` on Scanner (the website reaches it through the service binding), and `previewsEnabled: false` too, since version preview URLs are another way in.

**R2. The limiter only reads POST bodies; PUT and PATCH reach the RPC server unlimited.** `apps/web/src/server/handler.ts:57-60` parses the body only when `request.method === "POST"`, then forwards every method to the backend. Effect's HTTP RPC protocol reads `request.text` with no method check (`effect/src/rpc/RpcServer.ts`, `makeProtocolWithHttpEffect`). Verified on the dev website: `PUT /rpc` and `PATCH /rpc` with a `getScan` body are answered like POST. A `PUT /rpc` carrying `startScan` is therefore never counted. Fix: on RPC paths, refuse any method other than POST with 405 before forwarding, and add that case to `apps/web/test/handler.test.ts`.

### Medium

**R3. The per-site cap is a new targeted lockout.** `SITE_DAILY_SCAN_CAP = 10` (`apps/scanner/src/site-limits.ts`) counts every scan of a host, and `?n=1..10` makes ten distinct URLs. At 5 a minute from one IP (or immediately through R1 or R2), anyone can use up a site's ten scans in two minutes, and the site owner, the very prospect studio9 wants, then gets "Daily cap reached for scans of this site" for 24 hours. Fix: drop the query string and fragment from the reuse/cap key (or reuse within the hour per host and path), and count the site cap per caller. The website Worker knows the IP and can pass a caller key (a hash of the IP) to `startScan`. Or keep the site cap only as an anti-abuse ceiling well above what a person needs (for example 50).

**R4. The per-IP key is the full IPv6 address.** `handler.ts:47` keys on `cf-connecting-ip` as given. The header can't be spoofed through Cloudflare, but an IPv6 client controls at least a /64, so it has 2^64 keys and the 5/minute limit never applies. The binding's counters are also per Cloudflare location and eventually consistent, so it is a soft limit. Fix: key IPv6 callers by their /64 (`2001:db8:1:2::/64`), IPv4 by the full address; leave the global caps as the real ceiling.

**R5. The browser fence covers navigations only.** `puppeteer-session.ts` (guard) vets main-frame and iframe document requests, which closes the redirect, meta-refresh and `location =` paths from H1, and `landedOn` re-vets the URL. What is still unvetted, by design or by omission:

- subresource requests, `fetch`/XHR and WebSockets from page JS (WebSockets are not seen by request interception at all);
- popups and new targets (`window.open`, `target=_blank`): `page.on("request")` is attached to one page, so another target navigates freely;
- service workers: requests a page's service worker makes are not this page's requests;
- DNS rebinding: a name that passed `vetUrl` can resolve to a private address inside Chrome, and same-origin reads then work.

Blind requests out of Browser Run are all that's left unless its egress reaches private networks. AGENTS.md now records the egress assumption for Workers only (`AGENTS.md:120`), not for Browser Run, which is a separate service. Fix: state the Browser Run egress assumption in AGENTS.md with its source, close popups (`browser.on("targetcreated")` → close any new page target), and call `page.setBypassServiceWorker(true)`. If Browser Run's egress is not confirmed, treat this as High.

### Low

**R6. A shared or reloaded report link still shows the newest scan of the host.** `8914d24` keeps the scan ID only in memory (`model.started`, then the loaded view). The URL stays `/<host>`, so a reload, a new tab or a shared link falls back to `latest(slug)`, and a third party can still repoint what a recipient sees. Fix: put the scan ID in the report route (`/<host>?scan=<id>` or `/<host>/<id>`) and read with `one`.

**R7. A blocked subframe can mislabel an unrelated navigation failure.** `puppeteer-session.ts` (`open`) maps every `goto` failure to `kind: "navigation"` whenever `refused` is non-empty, and `refused` also collects blocked iframes. A page with a blocked third-party iframe that then times out reports "sent the browser to an address the scanner does not open" in place of the timeout. Fix: record only main-frame refusals (`request.frame() === page.mainFrame()`) for that mapping.

**R8. One close path still releases unused seconds when the browser may not have closed.** `puppeteer-session.ts`: when `newPage` fails, `close` runs under `Effect.ignore` inside the launch, and the session never reaches `acquireRelease`, so `closed` stays `true` and `scan-workflow.ts` releases `90 − elapsed`. `keep_alive: 60_000` bounds the orphan, so the overshoot is under a minute per occurrence. Fix: report that close to `onClose` as well.

**R9. A failed `settle` throws away answers the model already gave.** `scan-workflow.ts` (`askModel`) runs `judgeBudget.settle` after the answers; a D1 error there fails the judge step, the machine goes to storing without judged observations, and the tokens are spent. Fix: `Effect.ignore` (with a log) around `settle`, as `release` does.

**R10. The new node transport test depends on live DNS.** `packages/http-transport/test/node-hop-transport.test.ts` resolves `localtest.me`. Offline, or with a resolver that filters rebinding answers, the result is `dns`, not `forbidden_host`, and the gate fails for a reason that isn't a bug. Fix: test `publicLookup` with an injected resolver, and keep the live case out of the default run.

### Verified fixed

- **H1 (navigation path)**: interception on before `goto`, every navigation request vetted with `vetUrl` and capped at `DEFAULT_MAX_REDIRECTS`, non-http schemes refused by `vetUrl`, landed URL re-vetted after `goto` and after the probes, refused hop surfaces as a typed `navigation` skip with a reason.
- **M2**: stale unsettled rows of the URL are marked failed in `begin`, reuse of unsettled rows is limited to `min(reuseWithin, staleAfter)`, and `STALE_AFTER_MILLIS` (15 min) is above the summed step timeouts.
- **L3 and the INSERT**: the global cap, the site cap and "no running scan of this URL" are one conditional `INSERT … SELECT … WHERE` statement, so concurrent callers cannot double-start or pass a cap; the follow-up `SELECT` only classifies the refusal. `INSERT OR IGNORE` on an ID collision would report `begun` for someone else's row, which the 36^8 nonce plus millisecond prefix makes negligible.
- **M3**: `publicLookup` resolves with `all: true`, refuses when any address is private, loopback, link-local, CGNAT, multicast, reserved, NAT64, 6to4 or IPv4-mapped, and hands the vetted address to the socket, so a rebind between check and connect can't happen. Both the http and https agents get the lookup (`layerAgentOptions`). One gap not worth a finding: deprecated IPv4-compatible `::a.b.c.d` is not listed (not routed by modern stacks).
- **L1**: `settle` adds `used − reserved` (clamped at 0) after a run; overshoot is per scan and the next reserve is refused.
- **L2**: a failed close keeps the full reservation; `keep_alive` is set explicitly.

## Re-review 2 (22:35 CET) of 2254bf6

Read the diff end to end, ran the touched suites (`apps/web` 10/10, `apps/scanner` 6/6, `scan-store` 20/20, `browser-audit` 13/13, all pass), and checked the dev stage again with read-only `getScan` calls only.

Counts: **0 high, 1 medium, 3 low** (1 medium and 1 low new, 2 low carried: R6, R10).

### Verified fixed

- **R1**, live: `https://eaacheck-scanner-dev-butkmrv76a43vsix.vojtaholik.workers.dev/` now answers 404 (Cloudflare 1042) to GET and to a POSTed `getScan`. `workersDev: false` turns off both the stable URL and version previews (`alchemy/src/Cloudflare/Workers/Worker.ts:545-556`).
- **R2**, live: `PUT`, `PATCH` and `GET /rpc` on the dev website answer 405; `POST` still works.
- **R3**: the site cap counts per site and caller in the same conditional INSERT, so a stranger no longer uses up the owner's scans. One caveat: the caller key can be spoofed, see R11.
- **R4**: `callerKey` expands `::` and keys IPv6 by its first four groups (`/64`), IPv4 by the full address; rate limits and the stored caller both use it.
- **R5**: service workers bypassed before interception is turned on, new page targets closed on `targetcreated`, iframe navigations still vetted (`guard` vets every navigation request), and the Browser Run egress assumption is recorded in `AGENTS.md` and `docs/rendered-audit.md` as an assumption, not a fact.
- **R7**: only main-frame refusals turn a `goto` failure into `navigation`.
- **R8**: a failed launch calls `onClose(false)`, so the full reservation is kept.
- **R9**: `settle` errors are logged and ignored; the answers stay in the report.

### Medium

**R11. The caller key can be set by the client through RPC message headers.** The website sets the HTTP header `x-eaa-caller` (`apps/web/src/server/handler.ts`, `forwarded.headers.set`), and `CallerMiddleware` reads `headers[CALLER_HEADER]` (`apps/scanner/src/caller-middleware.ts`). But Effect's HTTP RPC server builds those headers as `requestHeaders.concat(message.headers)` (`effect/src/rpc/RpcServer.ts:1165`), and `Headers.fromInput` keeps the last value for a name (`effect/src/http/Headers.ts`, `fromInput`). Each JSON message carries its own `headers` array, which the client writes. A `startScan` message with `"headers":[["x-eaa-caller","anything"]]` therefore replaces the website's value. Verified by reading both code paths. I did not send a spoofed `startScan`, because that starts a scan.

Failure scenario: a script sends a new made-up caller with every `startScan` and gets past the per-site-per-caller cap. It is still held to 5 a minute per IP and the global 200. Or it writes the caller key of a known site owner (their IPv4, or their /64) and uses up that owner's 10 scans of their own site, which brings back R3's lockout for a targeted victim.

Fix: the website already parses every message (`limitedProcedures`). Reject with 400 any RPC body whose messages carry a header named `x-eaa-caller`, or strip it by re-serialising the messages before forwarding. Add a handler test for it. Do not rely on the middleware's header order.

### Low

**R12. A popup is closed after it starts, not before.** `closePopup` (`packages/browser-audit/src/puppeteer-session.ts`) runs on `targetcreated`, and interception is attached only to the audited page. The popup's first navigation request can leave before `close()`, so one unvetted blind request per popup remains. Nothing from it is read back, and it falls under the recorded egress assumption. Fix if wanted: attach the same `guard` to any new page before closing it, or turn on auto-attach with interception for the whole browser context.

Carried, not claimed in 2254bf6: **R6** (shared or reloaded report link still shows the newest scan of the host) and **R10** (node transport test needs live DNS for `localtest.me`).

Accepted residual, recorded: the global caps (200 scans, browser seconds, judge tokens, 50 messages a day) can still be used up by a caller with many IPs or many /64s. Per-IP limits slow that down; Turnstile (decision 14) is the remaining control.

## Re-review 3 (22:50 CET) of 09b944b, 49d240b, 9e3693b

Read the three diffs, checked the dev stage with read-only `getScan` calls and page GETs, and ran the built CLI.

Counts: **0 high, 1 medium, 1 low**. R6, R10 and R11 are fixed; R12 is narrowed, with a residual. The medium is a crash that has been in the Node lookup since 26fc8be and that the R10 refactor kept.

### Verified fixed

- **R11**, live: a `getScan` message with `headers: []` answers 200. With `[["x-eaa-caller","spoof"]]`, with `[["X-EAA-Caller","spoof"]]`, with headers as an object, and in the array-of-messages form, it answers 400. Code: `readRpcBody` decodes every message's `headers` and refuses any name equal to `x-eaa-caller` after lowercasing. Any `headers` shape it cannot decode makes the body unreadable, and an unreadable body also gets 400, so the check fails closed.
- **R6**, live and code: a started scan navigates to `/report/<host>/<scanId>` (`scanRouter`), which reads that scan by ID; `GET /report/example.com/scan-x` serves the app (200, `text/html`). `/report/<host>` still shows the newest scan, as intended.
- **R10**: `publicLookupWith(resolve)` takes an injected resolver, and the test drives it with fixed answers, so the gate no longer needs live DNS.

### Medium

**R13. The Node transport crashes the CLI on any DNS failure.** `packages/http-transport/src/public-lookup.ts` (`publicLookupWith`): when the resolver fails, Node calls back with `addresses` undefined, and `const [first] = addresses` throws before the refusal is passed on. The throw happens inside a DNS callback, so it is an uncaught exception, not a typed `dns` failure. Reproduced with the built CLI: `node apps/cli/dist/cli.js scan no-such-host-zz9-eaa.com --json` dies with `TypeError: addresses is not iterable`, where it should report "The domain was not found in DNS." A mistyped domain crashes the process, which breaks "errors are part of the interface". It is present since 26fc8be, and 9e3693b kept the line. The Worker transport is not affected. Fix: `if (error !== null) { callback(error, ""); return; }` before destructuring (or `addresses ?? []`), plus a test where the injected resolver fails with `ENOTFOUND` and `SafeFetch` returns `reason: "dns"`.

### Low

**R12, residual.** `NO_POPUPS` replaces `window.open` in each new document, so the main frame's `window.open` no longer starts a popup. Popups still start from page script by other routes: `a.click()` on a `target="_blank"` link, a form with `target="_blank"`, or `open` taken from a fresh same-origin `about:blank` iframe's `contentWindow`, which the init script may not reach before the page uses it. The `targetcreated` close is still the backstop, so what remains is the same single blind request per popup as before, under the recorded egress assumption. Fix if wanted: guard new targets with the same interception before closing them; otherwise record it as accepted next to the egress assumption.
