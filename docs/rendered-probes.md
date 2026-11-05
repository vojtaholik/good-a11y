# Rendered probes

Built 2026-11-03 by builder-cloud for decision 15, following `docs/sc-coverage-plan.md`. The probes run in the same Browser Run session as axe-core, after axe and after the rendered HTML is read. Each probe is split in two:

- The browser measures. `packages/browser-audit/page/probes.ts` is evaluated in the scanned page and returns plain numbers, flags and short samples. It is TypeScript checked against the DOM library (`page/tsconfig.json`), compiled to a script and embedded as text (see `docs/layer-2-3.md`).
- Core decides. `packages/core/src/probes.ts` parses the measurements with a schema (`ProbesJson`) and turns them into `pass`, `fail` or `not_applicable` with pure functions. No model output and no page script decides a result.

Each probe is timed on its own, so a slow probe loses only itself. Target size and reflow get 8 seconds each. The tab walk stops after 15 seconds and keeps the stops it walked; a walk cut short has not finished a cycle, so keyboard reach and keyboard trap are not judged, while focus visible and focus obscured are judged on the stops reached. All probes together stay under 100 seconds. A probe that throws, times out or meets a page that navigated away is left out. The axe results of the same session are kept. notino.cz showed the need: its walk ran past one shared 30-second limit and every probe was lost.

A failed probe becomes a rendered finding (`rule` is the probe id), tied to its WCAG fact and EN 301 549 clause fact through `referencesFor`, so the report shows it next to the axe findings. A judged WCAG 2.1 probe adds its criterion to the rendered coverage line. The two WCAG 2.2 probes (2.4.11, 2.5.8) never count toward that line: their only reference is the `STD-SC22-*` fact with the kind `wcag-newer`, because EN 301 549 V4.1.1 is not cited in the Official Journal and the ledger has no V4 clause fact for them.

## Order in the session

1. axe-core, as before, at 1280 by 800.
2. One tab walk, at 1280 by 800.
3. axe `target-size` alone.
4. Reflow: the viewport changes to 320 by 256 and the page gets one second to respond. This comes last because it changes the layout.

## Probes

| Probe | SC (fact) | Measured | Fails when | Not judged when |
| --- | --- | --- | --- | --- |
| `reflow` | 1.4.10 (STD-SC-1.4.10) | `scrollWidth` and `clientWidth` of the scrolling element at 320 CSS px; the five elements reaching furthest right, skipping elements held inside a horizontal scroller that itself fits, each marked exempt when inside `table`, `pre`, `canvas`, `video`, `svg` or a map `iframe` | the page scrolls sideways (`scrollWidth > clientWidth + 1`) and the widest offender is not exempt | the page scrolls but no element can be named |
| `focus-visible` | 2.4.7 (STD-SC-2.4.7) | on the tab walk, for each control reached for the first time and in view: 26 computed style properties of the control, its `::before` and `::after`, three ancestors, both siblings and five children, plus its box, before the walk and after focus, with transitions turned off | for a judged control nothing changed at all | no control reached was in view and uncovered |
| `keyboard-reach` | 2.1.1 (STD-SC-2.1.1) | the visible, enabled native controls before the walk (`a[href]`, `area[href]`, `button`, `input`, `select`, `textarea`, `summary`, `[tabindex="0"]`) and the set the walk reached | after a full cycle of the page, a control was never reached | the walk did not finish a cycle in 300 presses, or every control it reached sits in a dialog or a fixed layer |
| `keyboard-trap` | 2.1.2 (STD-SC-2.1.2) | the last 50 stops forward, and 50 stops with Shift+Tab when the forward walk looked trapped | focus stayed among 3 or fewer controls for 50 presses in both directions, with more controls outside them | the walk did not look trapped in both directions, or the cycle is inside a dialog or a fixed layer |
| `on-focus` | 3.2.1 (STD-SC-3.2.1) | main-frame navigations held during the tab walk, then two confirmation runs (see below) | focusing a control with Tab sends the page to another address, seen in both confirmation runs | the walk did not finish a cycle, or a held navigation was not confirmed |
| `focus-obscured` | 2.4.11 (STD-SC22-2.4.11), newer | for each judged control, `elementFromPoint` at its centre and four inset corners | at all five points the top element belongs to a `fixed` or `sticky` layer that does not contain the control and covers less than half the viewport | no judged control outside a dialog or a large overlay |
| `target-size` | 2.5.8 (STD-SC22-2.5.8), newer | axe-core 4.14 rule `target-size` run alone (it is tagged `wcag22aa`, outside `AXE_TAGS`) | axe reports a node | the rule did not pass or fail |

The interaction probes (`character-keys` 2.1.4, `hover-content` 1.4.13, `orientation` 1.3.4, `non-text-contrast` 1.4.11) run in the same session after the tab walk; their rules are in `docs/consistency-and-interaction.md`.

Dropped on 2026-11-04: `text-spacing` (1.4.12). Accuracy round 7 found no confirmed true positive in any round. It had two false positives: an ikea.com video container 6 px too small, whose only text is a 1 by 1 screen-reader label, and rohlik.cz product names cut by a designed `line-clamp`. Core removed it in 40dcdc5 and the page script in the commit after.

## Strictness calls

These go beyond the plan's false positive notes. Each one leaves a possible failure unreported rather than report one that is not there.

- **Keyboard reach skips controls a user is not meant to tab to.** Not counted: controls inside a composite widget role (`grid`, `listbox`, `menu`, `menubar`, `radiogroup`, `tablist`, `toolbar`, `tree`, `treegrid`), which take arrow keys; a radio when another radio of its group was reached; controls under `inert` or `aria-hidden="true"`; controls cut off by an ancestor with `overflow` or off the page, such as hidden carousel slides and off-canvas menus.
- **A dialog is never a trap.** A cookie dialog that keeps focus among its two or three buttons is the common case on shops, and a user leaves it by pressing one. Stops inside `role=dialog`, `role=alertdialog`, `aria-modal="true"`, an open `<dialog>` or a `position: fixed` layer do not count toward a trap, and a walk that never left one does not judge keyboard reach.
- **Focus visible uses a computed style diff, not pixels.** The lead allowed either. The style diff runs in the page without screenshots, so it costs no extra browser time per control, and it is exact. An indicator drawn on an element further away than the related elements above would be missed, which reads as a failure. To keep that rare, the comparison covers pseudo-elements, three ancestors, siblings and children.
- **A control focused at load is not judged.** The walk first blurs whatever has focus. A control that had focus when the page loaded, such as Wikipedia's `autofocus` search box, gets no "before" snapshot, because a snapshot taken while it is focused already holds its focus style and every comparison would read "no change". Test: `packages/browser-audit/test/page-probes.test.ts` runs the page script in happy-dom (21.0.4, a dev dependency of browser-audit only).
- **A large overlay is not a sticky bar.** On bbc.com the first live run reported 225 controls as obscured: a consent layer covered the whole page while the walk moved behind it. 2.4.11 is about sticky headers, footers and banners hiding the focused control, so a covering layer that takes half the viewport or more leaves those controls not judged for 2.4.11 (and, being covered, for 2.4.7).
- **3.2.1 On Focus needs the navigation twice.** During the walk, request interception holds every main-frame navigation: it is aborted and recorded, so the page stays and the walk goes on. If one was held, a confirmation reloads the page, presses Tab up to the start of that chunk, then one press at a time with 150 ms after each until a navigation is held again, and records the control that has focus. A second reload presses up to the press before, waits one second with no navigation, presses once and must see the navigation again. Only then does 3.2.1 fail, with the control and the address it sends to. A held navigation that is not confirmed (a timed redirect, a script that reacts to time) leaves 3.2.1 not judged. A full cycle with no navigation passes it. New windows opened on focus are not watched. The confirmation has its own 15-second limit; the probes together get 100 seconds, the rendered audit 145 seconds, the reservation 155 seconds and the render step 185 seconds (raised on 2026-11-05 for the interaction probes). Checked live on gov.uk (pass), bbc.com and otto.de (not judged, no cycle); no public page that navigates on focus was at hand, so the fail path is covered by `packages/core/test/probes.test.ts` only.

## Checked on a real page

The page script was injected into otto.de in Chrome on 2026-11-03 and walked with 40 real Tab presses. Focus visible flagged the main navigation links: their computed `outline-style` is `none` and no outline, shadow or border appears on the link or its ancestors. The blue ring in the screenshot came from Chrome's own focus highlight setting in that browser, not from the page. A link partly under the cookie dialog was not reported as obscured, as 2.4.11 requires the control to be entirely hidden.

## Evidence for judged questions (2026-11-04, decision 29)

The same session also collects evidence that only a model can judge. It is not a finding and no check decides on it: builder-judge's questions read it. `packages/browser-audit/page/evidence.ts` measures, `packages/core/src/rendered-evidence.ts` (`RenderedEvidenceSchema`, `renderedEvidenceOf`) parses it out of the probes JSON (key `evidence`), and the render step archives it in R2 as `<slug>/<scanId>.rendered-evidence.json`. Every part is capped and linear: at most 5000 elements are walked, each read gets 5 seconds, and a part that throws or times out is `null`.

| Part | Question | What is collected |
| --- | --- | --- |
| `visualHeadings` | 1.3.1, text styled as a heading | The font size that holds the most text (body size), the count of real headings, and up to 20 short blocks (2 to 120 characters) outside `h1`-`h6`, `role=heading` and interactive elements, set at 1.2 times body size or larger, or weight 600+ at body size and alone on their line: text, size, weight, markup |
| `formInstructions` | 3.3.2 | Up to 40 rendered fields: type, required, label (labels, `aria-label`, `aria-labelledby`), `aria-describedby` text, placeholder, and the text of the field's container two levels up without the label |
| `foreignBlocks` | 3.1.2 | Up to 15 blocks (`p`, `li`, cells, `blockquote`, headings) of 40+ characters whose common words (14 per language, 15 EU languages) point to another language than the `lang` in force on them, with at least 3 hits and 12% of the words: text, guess, lang |
| `emptySubmits` | 3.3.1, 3.3.3 | Up to 3 forms submitted empty, then every invalid field (the browser's own message, `aria-invalid`, its description) and up to 10 texts that appeared after the submit (in the form or not, in a live region or not) |

### Submitting forms without sending anything

**Off by default (R2-M1, 2026-11-04).** The scanner skips them and `emptySubmits` is `null`, so the judged questions `error-identified` and `error-suggestion` (shown since round 4, docs/judged-checks.md) ask nothing. They run only when the scanner Worker is deployed with `EMPTY_SUBMITS=true` (declared in `.env.schema`, read at deploy by `emptySubmitsSetting` in `apps/scanner/src/browser-limits.ts`, then by the render step). To turn them on for a 3.3.1/3.3.3 calibration run on stage dev:

```sh
EMPTY_SUBMITS=true pnpm exec varlock run -- pnpm --filter @good-a11y/infra exec alchemy deploy --stage dev --yes --no-input
```

Run the scans, archive their `rendered-evidence.json`, and deploy again without the variable to turn them off. While they are on, every dev scan of a page with forms submits up to three of them, under the blocking below.

The empty submits run last, after axe, the tab walk and target size, and only when the page is still where it landed. Two things hold for the whole session, from the first document on: `Navigator.prototype.serviceWorker` is deleted, so the page cannot register a service worker or reach one (a worker's own fetches are outside page interception and offline mode; R2-H1), and `window.open` returns nothing. That `open` is configurable and writable: a non-configurable own global makes a page script that declares its own top-level `open` (`const`, `let` or `function`) throw before it runs, so the page we audited was not the page users get (2026-11-05, `test/global-open.chrome.test.ts`). The page may replace it; closing every popup the browser opens is the defense that holds. Before the first submit the session:

1. turns on the Fetch domain on the browser target (`browser.target().createCDPSession()`, `Fetch.enable` with the pattern `*`), which pauses every request of every target, popups and workers included. A paused navigation (`resourceType` `Document`) is answered with a local 204, which Chrome treats as "stay on the current page"; every other request is failed with `BlockedByClient`. It stays on until the browser closes;
2. switches page interception to the same rule (a navigation gets a local 204, the rest is aborted). Every request either layer sees is recorded (`blocked`, `blockedCount` per form; a request both layers see counts twice);
3. turns on offline mode for the page (`page.setOfflineMode(true)`);
4. replaces `WebSocket.prototype.send` and `navigator.sendBeacon` in the page with functions that send nothing;
5. removes `target` from the form and `formtarget` from its buttons.

Then, form by form, it clears every text field (checkboxes, radios and files are left alone) and calls `form.requestSubmit()`, which runs the browser's own validation and the page's submit handlers. Nothing is typed into any field. The local 204 keeps the page where it was: an aborted navigation would put the main frame on Chrome's error page, the landed-URL check would refuse that page, and the whole rendered result, axe included, would be lost (the first canary run showed it). Each form's submit and read are timed on their own; a form whose read fails keeps `errors: null`, and when the page is at another address after a submit (`left: true`) no later form is submitted, while the forms before it keep their evidence (L1). Skipped: search forms (`role=search`, `<search>`, only search fields), any form with a password field, any form with a payment field (autocomplete, name or id like `cc-*`, card, cvv, cvc, iban), and forms past the third.

### Canary (2026-11-04)

`apps/scanner/src/canary.ts` is a Worker that exists only on stage dev (`https://eaacheck-canary-dev-clgqccqqmb4wwsod.vojtaholik.workers.dev`). Its page registers `/sw.js` on load and reports the outcome to `/report/*`: registered, active, threw, or API missing. It has three forms, and every request they cause goes to `/hit/<channel>` on the same Worker, which logs each one (`Canary hit`, with path and user agent) to Workers Logs, read with `alchemy logs --stage dev -r Canary`. `/sw.js` and `/report/*` are not hits.

| Form | Channels |
| --- | --- |
| native | the native POST submit |
| scripted | service worker (`postMessage` to the active worker, which POSTs), keepalive `fetch`, `sendBeacon`, XHR, image, WebSocket, EventSource, iframe, `link rel=prefetch`, CSS background, `window.open`, a script click on a `target=_blank` link, then a meta refresh after 300 ms |
| retargeted | re-sets `target=_blank` and calls `HTMLFormElement.prototype.submit` (no submit event), then `location.href` after 500 ms |

Runs on 2026-11-04 (times UTC):

- **Control, a normal Chrome 156, no blocking** (06:42 and 06:56): every channel reached the Worker, the service worker included, except the script-clicked `_blank` link. Chrome lets one popup open per click and `window.open` took it.
- **Scan before the fix** (74d2255 build, `scan-mw1r3grv-n9ocbmpa`, 06:43:42): 0 hits. The canary had no service-worker channel yet. The aborted navigations left the page on Chrome's error page, so the rendered result was refused. This run proves nothing about the popups or the worker.
- **Scan with the fix** (`scan-mw1rjxrr-ypo061ot`, 06:56:30): the page reported `service-worker-api-missing`. All three forms were submitted and the page stayed (`left: false` each), with 12 attempts recorded, among them `native-submit`, `xhr`, `fetch`, `iframe`, `prefetch`, `image`, `form-target-blank` (the popup's navigation, caught at the browser level) and `location`. **0 `/hit/*` requests reached the Worker** from 06:56:30 until the scan finished. The rendered audit and axe results were kept.

A third-party empty submit had already run once on dev before the fix: navlacil.cz's newsletter form (`scan-mw1r5vo8-8tqlnmer`, 06:45:57, scanned by another agent). Page interception recorded no request for it. That scan did not watch the service-worker or popup channels.

### Browser time

Measured with the D1 `browser_budget` row before and after one scan at a time on stage dev:

| Site    | Before (no evidence reads) | After |
| ------- | -------------------------- | ----- |
| otto.de | 45 s                       | 33 s  |
| alza.cz | 27 s                       | 27 s  |
| gov.uk  | 14 s                       | 12 s  |

The reads add no time that one scan at a time can see: page load and the tab walk dominate and vary more between runs than the reads cost. None of the three home pages had a form that was submitted (otto.de: a search form, and a newsletter form whose field is a custom element with a shadow root, which the script does not look into, so it counts as having no fields; gov.uk and alza.cz: search forms only), so the submit path cost nothing there; on a page with three submittable forms it adds at most 15 seconds. The reservation stays the ceiling per scan (155 s).
