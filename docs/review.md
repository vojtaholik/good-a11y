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

## Round 2 review (2026-11-04) of cae3e54..1614b61

Scope: the small crawl, the empty-submit probe, the local-only Clef calibrator, the judged step's budget, and the verdict and checklist text against AGENTS.md project law. Method: read every changed path end to end, drove a real headless Chrome over CDP with the calls Puppeteer makes, and ran read-only live checks (Cloudflare worker list, dev D1 `SELECT`).

Counts: **1 high, 3 medium, 4 low**.

### High

**R2-H1. Empty submits still send requests: through a service worker and through popups.** `packages/browser-audit/src/puppeteer-session.ts:485-486` turns on page-level interception "abort everything" and `setOfflineMode(true)`; `:204` sets `setBypassServiceWorker(true)`; `:195` closes popups after `targetcreated`. `packages/browser-audit/page/evidence.ts:658` then calls `form.requestSubmit()` inside `page.evaluate`, which `@cloudflare/puppeteer` 1.4.0 runs with `userGesture: true` (`lib/esm/puppeteer/cdp/ExecutionContext.js:339`), so the page's submit handlers have user activation.

- _Service worker._ Bypass only stops the page's own requests from going through a worker. The page can still register one during the ~60 s session, and the worker is its own target: page interception and page offline mode do not apply to it. A submit handler that hands the form to the worker (`registration.active.postMessage(...)`, or an offline-first queue, which offline mode actually triggers because `navigator.onLine` turns false) gets a real request out.
- _Popup._ A submit handler that clicks a `target="_blank"` link, or sets `form.target` back after `submitEmpty` removed it, opens a new target. Its first navigation leaves before the async `closePopup` runs. Hidden fields (ids, CSRF tokens, list ids) are not cleared, so a POST like this can perform a real action, such as a newsletter signup or an add-to-cart.

Reproduced with Chrome 156 headless and raw CDP, same calls as the session (page `Fetch.enable` with `*` failing every request after lockdown, `Network.emulateNetworkConditions` offline, `Network.setBypassServiceWorker`, `Runtime.evaluate` with `userGesture: true`). After lockdown the page's own `fetch` fails as intended, but the local server received `POST /from-sw` (dest `empty`, from the worker) and `GET /popup-leak` (dest `document`, the popup). A dedicated `Worker` was blocked. `docs/rendered-probes.md` says "none does leave" and calls the popup page "closed as soon as it appears". Both claims are wrong for this path.

Fix, verified with the same harness (0 requests after lockdown): (1) add `delete Navigator.prototype.serviceWorker;` to the `NO_POPUPS` init script at `open`, so no worker registers in the whole session. This also closes the same gap for the axe run and the tab walk. (2) Before the first submit, open a browser-level CDP session (`browser.target().createCDPSession()`), call `Fetch.enable({ patterns: [{ urlPattern: "*" }] })`, and fail every `Fetch.requestPaused`. That covers every target, popups included. Or drop the submits for now (R2-M1). Then correct `docs/rendered-probes.md`.

### Medium

**R2-M1. The empty-submit evidence feeds no check, yet the probe submits real forms on visitor-chosen sites.** `emptySubmits` is collected (`puppeteer-session.ts:521`), decoded (`packages/core/src/rendered-evidence.ts:126`) and archived to R2. No judged check reads it (`packages/core/src/judged.ts` `JUDGED_CHECKS` has no 3.3.1 or 3.3.3 entry). Every rendered scan of a page with a form pays the H1 risk and up to 15 s of browser budget for nothing a report shows. That breaks "grow in layers". Fix: remove `submitAll` until a 3.3.1/3.3.3 question exists and has 30 real labelled items, then bring it back with the H1 fix.

**R2-M2. The judge budget is counted per database, but the free allocation is per account.** `DAILY_JUDGE_TOKENS = 400_000` (`packages/core/src/judged.ts:16`) is checked against the `judge_budget` row of the D1 the code runs on. Each stage has its own D1, and the calibrator uses the local D1 under `alchemy dev` (`apps/scanner/src/calibrator.ts:55`). Workers AI's 10,000 free neurons a day (about 458,000 Clef tokens, `docs/judged-checks.md:148`) are shared by the whole account. Once a production stage exists, dev plus prod can reserve 800,000 tokens a day, and every calibration run adds up to 400,000 more. Anything past ~458,000 is billed, while the doc says "past the cap the step is skipped, never billed". Today only dev is deployed (live: 27,451 tokens reserved on 2026-11-04; 193,080 on 2026-11-03), so nothing has been billed yet. Fix: make the judge cap a per-stage setting, as `DAILY_BROWSER_SECONDS` is (`apps/scanner/src/browser-limits.ts`). For example, prod 300,000, dev 60,000, and the calibrator a fixed per-run total, so the sum stays under 400,000. Record the split in the brief.

**R2-M3. "Nothing to check on this page" is claimed from one check that found nothing to test.** `packages/core/src/decided.ts:54` puts a criterion in `empty` when any static check mapped to it is `not_applicable` and nothing decided it. `packages/core/src/requirements.ts:35` then shows "Nothing to check on this page" and ranks it above "Needs a person". Scenario: a script-built shop whose static HTML has no `<img>` and whose rendered step was skipped (budget spent, browser blocked) gets 1.1.1 "Nothing to check on this page" on a page full of product images. The same happens for SVG icons, `input type=image` or CSS images, none of which the alt check reads. That statement is about the page, and the evidence does not support it. Fix: keep the status only when the rendered step ran and also found the criterion inapplicable, and word it as what the check saw ("No content the automated checks test was found"). Otherwise fall back to "Needs a person".

### Low

**R2-L1. One form that navigates wipes the evidence of every form.** A form without `required` fields (the usual server-validated form) submits natively. The aborted navigation commits an error page, so `__eaaEvidence` is gone, the next `readErrors` evaluate throws, and `optionalWithin` turns the whole `submitAll` into `null` (`puppeteer-session.ts:484-523`). Fix: handle each form in its own `optional`, and stop when `page.url()` has changed. This is moot if R2-M1 removes the probe.

**R2-L2. The R2 evidence archive has no lifecycle, and the crawl multiplies it.** `apps/scanner/src/evidence-archive.ts:4` declares the bucket with no expiry. `scan-workflow.ts:167` now also stores up to 4 crawled HTML bodies (2 MB cap each) and their evidence JSON per scan, on top of the entered page, rendered HTML and axe JSON. At the 200-scan daily cap that is up to about 2-3 GB a day, kept forever. It leaves R2's free 10 GB within days, and storage then bills with no bound. Fix: add a lifecycle rule (for example, delete after 30 days) to the bucket in Alchemy, and drop the crawled HTML bodies, since only their evidence is read back.

**R2-L3. `page-language-matches` is shown without the round 2 calibration bar.** `packages/core/src/judged.ts:459` keeps `shown: true`, but on 60 real pages the model made no note (`docs/judged-checks.md:93`), so precision on real items is undefined. The round 2 rule (`_common-2.md`: "precision >= 0.9 on >= 30 real hand-labelled items") is not met; the check rests on the hand-written set. Fix: hide it until real mismatched pages are labelled, or have the lead record an explicit exception in the brief.

**R2-L4. The statement observation's title reads as permission.** `packages/core/src/judged.ts:602`: "Points of Annex V the accessibility statement may leave out" also reads as "is allowed to leave out", the opposite of what the model judged. Fix: "Points of Annex V the model judged missing from the accessibility statement". Also note that its precision rests on 27 notes (64 labelled points) and point 1(c) on one missing item. That meets the item count, but is thin for a per-point claim.

### Checked, no defect found

- **Crawl.** Every page goes through `SafeFetch` (`packages/core/src/crawl-site.ts`, `visit`). `vetUrl` refuses other schemes, credentials and non-default ports in picked links. The same-site rule (`siteOf`, only `www.` stripped) is applied to the link and again to `finalUrl` after redirects. There are at most 4 picks, 2 at once, each with the 10 s timeout and 2 MB cap, inside a 90 s task with no retry. A crawl failure goes on to rendering (`scan-machine.ts:102`) and does not fail the scan. A scan with its crawl counts once against the daily and per-caller site caps (`packages/scan-store/src/scan-store.ts:176`), and it adds at most 4 GETs to the target.
- **Calibrator.** It is declared only when `Alchemy.ALCHEMY_DEV` is true (`apps/infra/alchemy.run.ts:19`). That is `Config.Boolean("ALCHEMY_DEV")` with default `false`, set only by `alchemy dev`, whose default stage is `dev_$USER`, never `dev`. It has `workersDev: false` and no route. Live worker list (2026-11-04): only `eaacheck-scanner-dev-*` and `eaacheck-website-dev-*`, no calibrator. No token in the repo (`git grep` for tokens and Bearer strings). Each call is reserved and settled in `JudgeBudget`, but see R2-M2.
- **Judged step.** The reservation is a conditional insert before the call, settle clamps at 0, the task has no retries, and a failed call keeps its reservation (over-counts, which is the safe side).
- **Verdict and checklist.** "Fails" counts only issues whose level comes from a verified WCAG 2.1 reference (`report-sections.ts:65`), and the text needs verified `STD-WCAG21-3`. Neither the verdict nor the checklist uses "compliant" or "compliance score". With no failure, the text says this is not a pass and gives the criteria left for a person. A rendered bot-wall page is skipped (`rendered.ts:228`). Requirement and Annex V rows are built from verified facts only, and judged rows say "Judged by a model, not counted".

### Round 2 re-check 1 (07:50 CET) of 74d2255, 6594671

- **74d2255 (canary)** is the right instrument for R2-H1 but does not cover its main path: the page registers no service worker, so a canary run can come back clean while the worker leak stays open. It needs `/sw.js` served as script, registered on load, and a submit handler that posts a message to the worker, which then fetches `/hit/service-worker`. Its `anchor-blank` and `form-target-blank` channels should hit today (popups, R2-H1). Sent to builder-cloud.
- **6594671 (verdict split, scope line)**: the headline counts (`needPerson + checked` of `ofCriteria`) match the detail line, and the 4.1.1 note is unchanged. New Low, **R2-L5**: `NOT_SELLING_LEAD` (`packages/core/src/judged-placement.ts`) turns a model judgment into a legal conclusion ("so they may not apply to this site") and puts a verified definition link beside it. The line only appears when EU-DEF-1 is verified, but the sentence itself does not say it rests on the model, which AGENTS.md forbids for judged observations ("never presented as fact-backed"). In the round 2 set the model also called a consumer bank (ING) non-selling, and the EAA reaches banking services through other rules. Fix: start the sentence with the judgment ("The model judged that this site does not sell to consumers online; if so, ...") and keep "e-commerce" explicit.

### Round 2 re-check 2 (07:58 CET) of d510085

Verified fixed (code read, `@eaa-check/core` tests 264/264):

- **R2-M3.** `decided.ts` now keeps the empty criteria apart for the served HTML (`null` when the page was not checked) and for the rendered page (`null` when the rendered step did not run). `requirements.ts` (`foundNothingEverywhere`) shows "Nothing to check on this page" only when every non-model method listed for the criterion ran and found nothing. The SPA case (rendered step skipped) now falls back to "Not checked on this scan" or "Needs a person".
- **R2-L4.** The title reads "Points of Annex V the model judged missing from the accessibility statement". An Annex V row becomes "judged" only when the model noted the point. Otherwise it stays "Needs a person" and no longer claims "the model found this point".
- **R2-L5.** `NOT_SELLING_LEAD` opens with "If the model is right," so the scope line is tied to the model.
- The fail headline now counts distinct failing WCAG 2.1 criteria (`failingCriteria`, from `wcag` references of level A/AA issues). That is always at least 1 when `kind` is `fails`, because a level comes from a verified `wcag` reference.

Still open: R2-H1 (submits off on dev; builder-cloud is adding the browser-level fix and the service-worker channel to the canary), R2-M1, R2-M2, R2-L1, R2-L2, R2-L3.

### Round 2 re-check 3 (08:08 CET) of 766c553

Verified fixed:

- **R2-H1.** `NO_POPUPS` now starts with `delete Navigator.prototype.serviceWorker`. Puppeteer 1.4.0 adds it to every frame, cross-origin iframes included (`FrameManager.js:178`, preload scripts on each attached frame session), so no worker can register at any point in the session. Before the first submit, a browser-target CDP session runs `Fetch.enable` with `*`. Paused documents get a local 204, and everything else is failed. That matches the fix I verified locally (0 requests after lockdown), and the local 204 also keeps the page in place. Live, read-only (`alchemy logs --stage dev -r Canary --since 2h`): the control run in a normal Chrome 156 (06:56:22 UTC) reached every channel, `/hit/service-worker` included. The scanner run (eaa-check user agent, 06:56:32-37) logged only `GET /`, `POST /report/service-worker-api-missing` and `GET /favicon.ico`, and no `/hit/*` after it. The canary now exercises every path I found.
- **R2-L1.** Each form's submit and read run in their own `optional`. A form whose read fails keeps `errors: null`, and after `left: true` no later form is submitted, while earlier forms keep their evidence.

Still open: R2-M1 (the submits run and are archived, but no check reads them; the risk is now contained, so this is a cost item: up to 15 s of browser time per scan with forms), R2-M2 (per-stage judge cap), R2-L2 (R2 lifecycle), R2-L3 (`page-language-matches` bar).

### Round 2 re-check 4 (08:15 CET) of 33ac866

- **R2-L3 fixed.** `page-language-matches` is now measured on 89 real hand-labelled pages: 60 from round 2, plus 29 from round 3, of which 18 have a wrong `lang`. Labels were set before Clef was asked. The model made 18 notes and all 18 are right, with none on the 71 correct pages. That clears the ≥30 real items and ≥0.9 bar, on the same basis as `statement-annex-v`, where the notes are fewer than 30 but the labelled items are not.
- The judge step now also reads the archived rendered evidence. The two new checks (`visual-headings-marked`, `passage-language-marked`) are `shown: false`, and `questionsFor` asks only shown checks (`judged.ts:781`), so they spend no tokens until calibrated. No new defect.

Still open: R2-M1, R2-M2, R2-L2.

### Round 2 re-check 5 (08:20 CET) of b3d627b

- **R2-M2 fixed.** `apps/scanner/src/judge-limits.ts` sets the judge cap per stage on the scanner Worker (`Stack.useSync`, read with `Config.Int`, the same pattern as the browser budget): `prod` 250,000, every other stage 50,000, and the local calibrator 100,000. prod + dev + calibrator = 400,000, under the ~458,000-token free allocation. Residual, recorded only: every non-prod stage gets its own 50,000, a local `alchemy dev` run (`dev_$USER`) included, so the sum stays under the ceiling with at most one local dev beside stage dev (450,000). A second developer running locally on the same day could go past it. Accept that, or make local stages 0 unless set.
- **R2-L2 fixed in code.** The evidence bucket has a 30-day `Age` lifecycle rule, and the crawl stores only the evidence JSON of each crawled page, no HTML body. The rule takes effect on the next dev deploy. I have not checked the deployed bucket.

All round 2 findings except R2-M1 are closed. R2-M1 stays open as a cost item: the empty submits are contained (R2-H1) but feed no shown check.

### Round 2 re-check 6 (08:25 CET) of 250dec1

**R2-L6 (new, Low). The calibrator's cap can now be set to any value.** `apps/scanner/src/calibrator.ts` reads `Config.Int("CALIBRATION_JUDGE_TOKENS")` with the 100,000 share as default. Alchemy binds a `Config` value read while the Stack is built into the Worker's env (`alchemy/src/Runtime.ts`, `reifyBoundConfigProvider`), so a value in the shell or `.env.local` reaches the calibrator under `alchemy dev`. Nothing bounds it, and `.env.schema` declares it as a plain `number`. One `CALIBRATION_JUDGE_TOKENS=1000000` for a big calibration batch lets that day's calibration plus prod (250,000) plus dev (50,000) pass the ~458,000-token free allocation. That undoes the account ceiling R2-M2 just set up, and Workers AI then bills. Fix: clamp the override to the share left under the ceiling (`Math.min(value, 458_000 - PRODUCTION_JUDGE_TOKENS - STAGE_JUDGE_TOKENS)`), or drop the override and run a larger batch over two UTC days.

### Round 2 re-check 7 (08:30 CET) of 311f6af

**R2-L6 not fixed.** The override is now clamped (`MAX_CALIBRATION_JUDGE_TOKENS = 220_000`), but at a value above the ceiling. 220,000 + prod 250,000 + dev 50,000 = 520,000, and even 220,000 + prod alone is 470,000. Both are over the ~458,000-token free allocation (`docs/judged-checks.md:171`) that the 400,000 account ceiling in `docs/layer-2-3.md:109` exists to protect. It holds today only because no prod stage is deployed. Fix: derive the clamp instead of hard-coding it: `ACCOUNT_JUDGE_TOKENS (400_000) - PRODUCTION_JUDGE_TOKENS - STAGE_JUDGE_TOKENS` = 100,000, the same as the default share. That makes the override pointless, so the simpler fix is to remove it. Or allow up to 158,000 if the 58,000 margin may be spent, and say so in `docs/layer-2-3.md`.

**R2-L6, lead decision (08:35 CET).** Accepted as a one-day exception: no prod stage exists, real account use today stays around 400,000, and the override is deleted once builder-judge finishes today's calibration. R2-L6 closes when that deletion is re-checked.

**48f0706 (08:40 CET).** The clamp is raised to 350,000 for 2026-11-04, by the lead. With dev's 50,000 that is 400,000, under the ~458,000 free allocation while no prod stage exists, so it sits inside the accepted exception. Nothing in the code ties it to the date, so the deletion still has to land before any prod deploy. R2-L6 stays open until then.

**619b502 (08:45 CET).** The clamp is raised to 410,000 for 2026-11-04 (lead, hard stop). With dev's 50,000 cap that is 460,000, about 2,000 tokens over the ~458,000 free allocation if both are used to the limit. At Clef's rate that is roughly 44 neurons, about $0.0005. The overage is negligible, but it is past the "never billed" line, and the 458,000 figure is itself an estimate (`docs/judged-checks.md:171`). Recorded as part of the lead's exception. The same deletion closes R2-L6.

### Round 2 re-check 8 (08:55 CET) of 2ba6167

- **R2-M1 fixed.** The empty submits now run only when `options.emptySubmits && stayed` (`puppeteer-session.ts`). The Workflow reads `Config.Boolean("EMPTY_SUBMITS")` with default `false`. The scanner Worker's env carries the deploy-time value (default `"false"`), and `.env.schema` declares it as a boolean that is unset everywhere. A normal scan no longer submits forms or spends browser time on them. A 3.3.x calibration run can turn them on per deploy, with the R2-H1 containment still in place.

Open: R2-L6 only (lead's one-day exception; closes when the calibrator override is deleted).
