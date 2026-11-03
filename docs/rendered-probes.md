# Rendered probes

Built 2026-11-03 by builder-cloud for decision 15, following `docs/sc-coverage-plan.md`. The probes run in the same Browser Run session as axe-core, after axe and after the rendered HTML is read. Each probe is split in two:

- The browser measures. `packages/browser-audit/page/probes.ts` is evaluated in the scanned page and returns plain numbers, flags and short samples. It is TypeScript checked against the DOM library (`page/tsconfig.json`), compiled to a script and embedded as text (see `docs/layer-2-3.md`).
- Core decides. `packages/core/src/probes.ts` parses the measurements with a schema (`ProbesJson`) and turns them into `pass`, `fail` or `not_applicable` with pure functions. No model output and no page script decides a result.

A probe that throws, times out (30 seconds for all probes) or meets a page that navigated away is left out. The axe results of the same session are kept.

A failed probe becomes a rendered finding (`rule` is the probe id), tied to its WCAG fact and EN 301 549 clause fact through `referencesFor`, so the report shows it next to the axe findings. A judged WCAG 2.1 probe adds its criterion to the rendered coverage line. The two WCAG 2.2 probes (2.4.11, 2.5.8) never count toward that line: their only reference is the `STD-SC22-*` fact with the kind `wcag-newer`, because EN 301 549 V4.1.1 is not cited in the Official Journal and the ledger has no V4 clause fact for them.

## Order in the session

1. axe-core, as before, at 1280 by 800.
2. Text spacing, at 1280 by 800, and the injected style is removed again.
3. One tab walk, at 1280 by 800.
4. axe `target-size` alone.
5. Reflow: the viewport changes to 320 by 256 and the page gets one second to respond. This comes last because it changes the layout.

## Probes

| Probe | SC (fact) | Measured | Fails when | Not judged when |
| --- | --- | --- | --- | --- |
| `reflow` | 1.4.10 (STD-SC-1.4.10) | `scrollWidth` and `clientWidth` of the scrolling element at 320 CSS px; the five elements reaching furthest right, skipping elements held inside a horizontal scroller that itself fits, each marked exempt when inside `table`, `pre`, `canvas`, `video`, `svg` or a map `iframe` | the page scrolls sideways (`scrollWidth > clientWidth + 1`) and the widest offender is not exempt | the page scrolls but no element can be named |
| `text-spacing` | 1.4.12 (STD-SC-1.4.12) | every rendered element with text whose `overflow` is `hidden` or `clip`, clipped or not before and after injecting the SC's spacing (`line-height: 1.5`, `letter-spacing: 0.12em`, `word-spacing: 0.16em`, paragraphs `margin-bottom: 2em`, all `!important`) | any element is clipped after the injection that was not before. Samples carry the text and the markup, so a person can confirm each | no element clips text |
| `focus-visible` | 2.4.7 (STD-SC-2.4.7) | on the tab walk, for each control reached for the first time and in view: 26 computed style properties of the control, its `::before` and `::after`, three ancestors, both siblings and five children, plus its box, before the walk and after focus, with transitions turned off | for a judged control nothing changed at all | no control reached was in view and uncovered |
| `keyboard-reach` | 2.1.1 (STD-SC-2.1.1) | the visible, enabled native controls before the walk (`a[href]`, `area[href]`, `button`, `input`, `select`, `textarea`, `summary`, `[tabindex="0"]`) and the set the walk reached | after a full cycle of the page, a control was never reached | the walk did not finish a cycle in 300 presses, or every control it reached sits in a dialog or a fixed layer |
| `keyboard-trap` | 2.1.2 (STD-SC-2.1.2) | the last 50 stops forward, and 50 stops with Shift+Tab when the forward walk looked trapped | focus stayed among 3 or fewer controls for 50 presses in both directions, with more controls outside them | the walk did not look trapped in both directions, or the cycle is inside a dialog or a fixed layer |
| `focus-obscured` | 2.4.11 (STD-SC22-2.4.11), newer | for each judged control, `elementFromPoint` at its centre and four inset corners | at all five points the top element belongs to a `fixed` or `sticky` layer that does not contain the control and covers less than half the viewport | no judged control outside a dialog or a large overlay |
| `target-size` | 2.5.8 (STD-SC22-2.5.8), newer | axe-core 4.14 rule `target-size` run alone (it is tagged `wcag22aa`, outside `AXE_TAGS`) | axe reports a node | the rule did not pass or fail |

## Strictness calls

These go beyond the plan's false positive notes. Each one leaves a possible failure unreported rather than report one that is not there.

- **Keyboard reach skips controls a user is not meant to tab to.** Not counted: controls inside a composite widget role (`grid`, `listbox`, `menu`, `menubar`, `radiogroup`, `tablist`, `toolbar`, `tree`, `treegrid`), which take arrow keys; a radio when another radio of its group was reached; controls under `inert` or `aria-hidden="true"`; controls cut off by an ancestor with `overflow` or off the page, such as hidden carousel slides and off-canvas menus.
- **A dialog is never a trap.** A cookie dialog that keeps focus among its two or three buttons is the common case on shops, and a user leaves it by pressing one. Stops inside `role=dialog`, `role=alertdialog`, `aria-modal="true"`, an open `<dialog>` or a `position: fixed` layer do not count toward a trap, and a walk that never left one does not judge keyboard reach.
- **Focus visible uses a computed style diff, not pixels.** The lead allowed either. The style diff runs in the page without screenshots, so it costs no extra browser time per control, and it is exact. An indicator drawn on an element further away than the related elements above would be missed, which reads as a failure. To keep that rare, the comparison covers pseudo-elements, three ancestors, siblings and children.
- **A large overlay is not a sticky bar.** On bbc.com the first live run reported 225 controls as obscured: a consent layer covered the whole page while the walk moved behind it. 2.4.11 is about sticky headers, footers and banners hiding the focused control, so a covering layer that takes half the viewport or more leaves those controls not judged for 2.4.11 (and, being covered, for 2.4.7).
- **3.2.1 On Focus is not built.** A navigation during the walk is detected (the page URL changed), and the probes after the walk are then left out, but no finding is made from it yet.

## Checked on a real page

The page script was injected into otto.de in Chrome on 2026-11-03 and walked with 40 real Tab presses. Text spacing found 2 newly clipped promotional boxes among 191 clipping elements. Focus visible flagged the main navigation links: their computed `outline-style` is `none` and no outline, shadow or border appears on the link or its ancestors. The blue ring in the screenshot came from Chrome's own focus highlight setting in that browser, not from the page. A link partly under the cookie dialog was not reported as obscured, as 2.4.11 requires the control to be entirely hidden.
