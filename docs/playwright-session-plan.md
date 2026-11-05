# Plan: one browser driver (Playwright) for the rendered audit

Written 2026-11-05 by writer for the lead (option (c)). Not started. Start only after probes' layer 2 lands in `packages/browser-audit/src/puppeteer-session.ts`. Done when a full accuracy-qa rerun on the Playwright session shows the same findings as on the puppeteer session.

## Why

The `good-a11y` npm package ships two drivers: `puppeteer-core` for the local rendered audit and `playwright` for the flow graders. The graders need Playwright (`expect` from `playwright/test`, shared with evals), so the audit moves. The hosted audit moves with it so local and hosted keep one session (`sessionOn`): hosted on `@cloudflare/playwright` 1.3.6, local on `playwright` 1.64.1. `puppeteer-core` and `@cloudflare/puppeteer` leave the repo.

## What the session needs, and what Playwright gives

| Session need (`puppeteer-session.ts` today) | Playwright | Status |
| --- | --- | --- |
| Vet every main-frame navigation, redirect hops included, and refuse a hop `vetUrl` refuses (`page.on("request")`, `redirectChain()`) | `context.route` sees only the first request of a redirect chain. Tested 2026-11-05 on 1.64.1: `/a` 302 `/b` 302 `/c` routed `/a` only, landed on `/c` | **Gap.** Use CDP `Fetch` through `context.newCDPSession(page)` (paused at request stage, each hop pauses), as the empty-submit block does today |
| Hold or block everything during the empty submit and the Tab walk (`holding`) | The same CDP `Fetch` handler with the flags | Same code path as above |
| Bypass service workers (`setBypassServiceWorker`) | `newContext({ serviceWorkers: "block" })` | In 1.58.2 types. Verify Browser Run allows `newContext` |
| Close popups (`targetcreated`) and the `NO_POPUPS` init script (`evaluateOnNewDocument`) | `context.on("page")` and `context.addInitScript` | Supported |
| User agent and viewport, reflow at 320 x 256 (`setUserAgent`, `setViewport`) | `newContext({ userAgent, viewport })`, `page.setViewportSize` | Supported |
| Offline during the empty submit (`setOfflineMode`) | `context.setOffline(true)`, context-wide | Supported; one page per context, so same effect |
| Tab walk: `keyboard.press("Tab")`, Shift down and up | `page.keyboard.press/down/up` | Same |
| Page scripts as strings (`evaluate(expression)`), `content()`, `url()`, `goto(..., { waitUntil: "load", timeout })` with `headers()` and `status()` | Same names | Same |
| Browser Run session: `launch(binding, { keep_alive })` | `launch(env.BROWSER, { keep_alive })` | Supported, same option |

## Risks

- **Two Playwright builds.** `@cloudflare/playwright` 1.3.6 is a fork tracking upstream 1.58.2; the local check runs upstream 1.64.1. One `SessionBrowser` interface covers both, as it covers `@cloudflare/puppeteer` and `puppeteer-core` today. Keep the interface to the calls in the table.
- **CDP `Fetch` next to Playwright's own network layer.** Playwright enables `Fetch` itself only when a route or HTTP credentials exist (its Chromium network manager, read in the 1.64.1 source), so the session must register neither. Two `Fetch` clients on one target would pause each request twice. Test it first, on both builds.
- **Browser Run specifics.** The fork's README lists Playwright Test (except assertions), video and other browsers as unsupported. Browser Run reached full CDP support in 1.3.0. Verify `newContext` options, `newCDPSession` and `setOffline` on a dev Worker before porting.
- **Worker size.** The fork's `lib` is 5.8 MB against 8.6 MB for `@cloudflare/puppeteer`, so the scanner bundle should not grow. Measure the built Worker.
- **Changed behavior hidden in a refactor.** Timing differs (Playwright auto-waits, its `goto` resolves differently on 204), and the Tab walk and reflow probes are timing-sensitive. The accuracy-qa gate below catches this; unit tests alone would not.
- **New option, not part of the move:** 1.3.6 adds session `guardrails.allowedDomains` (egress allowlist latched for the session). It could narrow the documented Browser Run egress assumption in `AGENTS.md`. It needs its own decision, since a scanned page loads third-party hosts.

## Steps

1. Spike on a dev Worker: `@cloudflare/playwright` 1.3.6 opens a context with `serviceWorkers: "block"` and `userAgent`, a CDP session pauses each redirect hop with `Fetch`, and `setOffline` works. Same spike in Node on 1.64.1.
2. Rewrite `SessionBrowser` and `sessionOn` against the Playwright calls in the table. Navigation guard and holds move into the CDP `Fetch` handler. Keep `BrowserSession` (the port side) unchanged.
3. `node.ts` launches the user's Chrome through `playwright` (`channel: "chrome"` or `--chrome`). `index.ts` launches Browser Run through `@cloudflare/playwright`. Remove `puppeteer-core` from the `good-a11y` package and `@cloudflare/puppeteer` from browser-audit. Update the pins in `AGENTS.md`, `docs/rendered-audit.md` and `docs/local-check.md`, and the boundary rule's local-only module list.
4. Gate: `pnpm turbo run check test build`, then a full accuracy-qa rerun on dev with the same findings as the puppeteer session. Prod deploy through the lead.
