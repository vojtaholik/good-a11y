# Rendered page check (axe-core on Browser Run)

Built 2026-11-03 by builder-core. After the static checks, a scan can open the page in Cloudflare Browser Run, run axe-core in it, and add its findings to the report. builder-cloud wires the step into the Workflow.

## Flow

1. The static scan runs as before and produces a `Report`.
2. The Workflow reserves `RENDERED_AUDIT_RESERVE_SECONDS` (60) of browser time with `BrowserBudget.reserve` from `@eaa-check/scan-store`, against `DAILY_BROWSER_SECONDS` (1080, about 18 minutes a day). The insert is conditional, so the budget is never overspent. Nothing is refunded.
3. If the reservation fails, the report gets `withRendered(report, { skipped: BUDGET_SPENT })`.
4. Otherwise `RenderedAudit.audit(finalUrl)` runs, and the report gets `withRendered(report, { ran: page })`. If it fails, the report gets `{ skipped: skippedBecause(failure) }`.
5. `page.axe`, the raw axe JSON, is stored as evidence.

Only a `checked` report gets a rendered section. A refused, unreachable or non-HTML page keeps its report unchanged.

## Core (`packages/core`)

| File | What it holds |
| --- | --- |
| `rendered-audit.ts` | The `RenderedAudit` port, `RenderedPage` (`axe`, `headers`, `html`, `status`), `AXE_TAGS`, the budget constants |
| `rendered-audit-failed.ts` | `RenderedAuditFailed` with kind `timeout`, `browser` or `audit` |
| `axe-results.ts` | The part of axe's result the product reads, as Effect Schema, parsed from the JSON text |
| `rendered.ts` | The pure mapping: `renderedOf(results)`, `renderedFrom(outcome)`, the skip reasons |
| `report.ts` | `Report.rendered` and `withRendered` |

Mapping rules:

- Only `violations` become findings. `passes`, `incomplete` and `inapplicable` only count towards the rules run and the criteria touched.
- A rule counts only if it is tagged `wcag2a`, `wcag2aa`, `wcag21a` or `wcag21aa`.
- Each `wcagNNN` tag maps to a success criterion (`wcag1410` is 1.4.10). A criterion counts only when `STD-SC-<n>` is verified. A rule with no verified criterion is not shown. References (`STD-SC-*`, `STD-EN-9.*`, `STD-EN4-9.*`) appear only from verified facts, the same as for static findings.
- Samples are the first five failing elements' HTML, each cut to 160 characters.
- If the browser landed on a refusal status (4xx except 404 and 410, or 5xx), or the rendered HTML carries a known bot check, the section is "skipped" and no axe finding is shown. A wall must never produce findings about itself.
- If the axe JSON does not parse against the schema, the section is "skipped".

When the rendered check ran, the coverage line says "static HTML + rendered page" and counts the criteria both methods touch. The headline counts static checks and axe rules together. When it was skipped, the report says "Rendered page check skipped: <reason>" and the static findings and coverage stay as they are.

The statement now says automated checks find only issues "visible to the checker in the page it read". It no longer says "in the page's HTML as served", which would be false once the rendered check runs.

## Adapter (`packages/browser-audit`)

- `browserRenderedAuditLayer(env.BROWSER)` provides `RenderedAudit`.
- One `launch` per audit, viewport 1280×800, user agent `SCANNER_USER_AGENT`.
- `goto` waits for `load`, with a 30 s navigation timeout, then a fixed 2 s settle.
- axe-core is evaluated from its own `axe.source`, then `axe.run(document, { runOnly: tags, resultTypes: ["violations"] })`. `resultTypes` keeps one node per non-violation rule, which keeps the JSON small.
- The browser closes in a finalizer, on success, on failure and on timeout. The hard timeout is 50 s, under the 60 s reservation.
- `renderedAuditWith(launch)` takes the session as an Effect, so tests use a fake session and the test clock. Tests never call Browser Run.

## Calls made

- **`evaluate`, not `addScriptTag`.** The task named `addScriptTag`. A script tag is subject to the site's Content Security Policy, so a strict CSP would block axe and every such site would come back "skipped". `page.evaluate` runs through DevTools and is not subject to CSP. `@axe-core/puppeteer` does the same. It does not change how the site sees the visitor, so it is not evasion.
- **Top frame only.** axe is not injected into iframes. Content inside frames is not checked, which matches the static checks.
- **What the browser may load.** Every navigation request, in the main frame and in frames, passes `vetUrl` and the redirect cap or is aborted, and the landed URL is vetted after `goto` and after the probes (see `docs/layer-2-3.md`). Service workers are bypassed (`setBypassServiceWorker(true)`), so the page's own requests are the ones interception sees. A new page target such as a popup or a `target=_blank` window is closed as soon as it appears. Subresources, `fetch`, XHR and WebSockets from page scripts are not vetted, and a name that passed `vetUrl` may resolve to any address inside Chrome.
- **Egress assumption.** Browser Run, like a Worker's `fetch`, sends its traffic out through Cloudflare's network, and we assume that network does not reach private addresses (loopback, RFC 1918, link-local, metadata endpoints). Cloudflare's documentation, searched on 2026-11-03, states no such guarantee for Browser Run. It is an assumption, not a cited fact; if it turns out false, the unvetted subresource and DNS paths above become a high-severity issue.
- **Unused seconds are released.** A scan reserves 110 seconds and releases what the session did not use, except when the browser failed to launch or to close; then the full reservation is kept (decision 22, review L2 and R8).

## Tests

- `packages/core/test/rendered.test.ts` runs against `test/fixtures/axe-results.json`, a real axe-core 4.14.0 run recorded in local headless Chrome from `test/fixtures/axe-page.html`. That page has one image added by script, so the fixture proves rendered elements are seen. The tests cover:
  - violations become findings, with their element counts;
  - references come from verified facts only;
  - tag mapping;
  - out-of-scope and unsourced rules are left out;
  - coverage and headline;
  - the budget skip, the bot-wall skip and the unreadable-JSON skip;
  - no "compliant" text.
- `packages/browser-audit/test/rendered-audit.test.ts` runs against a fake session. It checks that the result comes back as recorded, that the browser closes on success, on failure and on timeout, and that output which is not text fails.

## Open

- The web view (`apps/web`) does not render `report.rendered` yet. That is builder-cloud's.
