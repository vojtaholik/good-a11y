# Product text audit 2 (verifier, round 4)

Date: 2026-11-03, about 22:20 CET. Same method as `docs/product-text-audit.md`, applied to the redesigned report: `packages/core/src` (report, fix prompts, rendered probes and axe mapping, judged checks), `apps/web/src/features` (all views) and a live scan of `wikipedia.org` on the dev Worker (scanned 2026-11-03 20:45 UTC, static HTML plus rendered page plus judged). Line numbers are from the working tree at audit time. `packages/core/src/judged.ts` had uncommitted changes when read.

Summary: 8 defects (0 blocker, 4 medium, 4 low). No "compliant" or "compliance" wording. No unverified fact reaches a state profile. Judged observations are labelled as a model's judgement and are not counted. WCAG 2.2 probes are labelled newer and kept out of the WCAG 2.1 coverage count. All defects from audit 1 are fixed; the live scan now works.

## Defects

### D1 (medium) Focus-visible probe fails autofocused controls, and the false fail is counted as an issue

- Where: `packages/browser-audit/page/probes.ts:489-496` (style snapshot of every control) runs before `:512-514` (blur of `document.activeElement`); decided in `packages/core/src/probes.ts:233-243` (`changed === 0` fails).
- Live: "A control reached with the Tab key showed no visible change when it got focus. 1 element failing. WCAG Level AA", sample `<input id="searchInput" ... autofocus="autofocus" ...>`.
- Why: the "before" snapshot of an autofocused control is taken while it already has focus, so its focused style equals its "before" style and `changed` is 0. Wikipedia's search box does show a focus style. This is a deterministic issue that is counted in "3 issues found", not a judged note, so the false positive goes against the project rule that checks are reliable.
- Fix: blur the active element before taking the snapshots (move lines 512-514 above the loop), or skip stops whose element was `document.activeElement` at walk start. Add a fixture with `autofocus`.

### D2 (medium) "not yet required by the cited EN 301 549" asserts a citation that does not exist

- Where: `packages/core/src/reference.ts:42-43` (`NEWER_WCAG_LABEL`), `apps/web/src/features/report-references.ts:60`, used in fix prompts via `packages/core/src/fix-prompt.ts:37`.
- Text: "WCAG 2.2 (newer, not yet required by the cited EN 301 549)".
- Why: hard-coded legal claim. EU-HS-1 (verified) says no EN 301 549 reference under Directive (EU) 2019/882 was found in the OJ, and the report itself shows "Official Journal citation of EN 301 549 under the EAA: Not found as of 2026-10-30". There is no "cited EN 301 549". The web line also appears under every 2.2 probe (2.4.11, 2.5.8).
- Fix: "WCAG 2.2 (newer; required by EN 301 549 V4.1.1, which is not cited in the OJ)", backed by STD-EN-6 and EU-HS-1, or "WCAG 2.2 (newer than the reference benchmark)", backed by STD-EN-5.

### D3 (medium) axe help texts become issue titles and fix-prompt lines, phrased as requirements

- Where: `packages/core/src/report-sections.ts:136` (`title: finding.help` for rendered axe issues), shown by `apps/web/src/features/report-issues.ts` and copied into the prompt at `packages/core/src/fix-prompt.ts:49` ("Issue: ...").
- Text (axe-core 4.14 `help`, rules that can reach the report): "Elements must meet minimum color contrast ratio thresholds", "Page must have means to bypass repeated blocks", "Frames must have a unique title attribute", "Delayed refresh under 20 hours must not be used", "<blink> elements are deprecated and must not be used", "Documents must have <title> element to aid in navigation", and about 40 more "must" titles.
- Why: axe text is not a fact, but it is shown as the issue's own title, in the same voice as our sourced lines, and it states requirements. Some go beyond the mapped SC text: a unique frame title is not what 4.1.2 says (STD-SC-4.1.2 is Name, Role, Value), and "under 20 hours" is axe's threshold, not 2.2.1's. Static issues have our own neutral titles ("Buttons have a name"); axe-only issues do not. No axe issue appeared on wikipedia.org, so this was read from code and the axe rule metadata.
- Fix: give each kept axe rule a short neutral title of our own in a map next to `SAME_CONCERN` (for example `color-contrast`: "Text contrast is below the minimum ratio"), with the SC fact line as the only normative part. Until then, prefix axe titles with "axe-core rule:" in both the card and the prompt.

### D4 (medium) Judged checks marked hidden still show, on the live page and in stored reports

- Where: `packages/core/src/judged.ts:209` (`alt-text-describes`, `shown: false`) and `:313` (`headings-labels-describe`, `shown: false`); render in `apps/web/src/features/report-judged.ts:74-98` shows every stored observation.
- Live: "Headings or labels that may not describe their topic. Noted for 11 of 15 items", with notes such as h2 "1,000,000+ articles" at 82%.
- Why: the hide flag is in the working tree, not deployed. Even after deploy, reports already in the scan store keep their old observations and the web renders them as stored, so a hidden check stays visible on every cached report until it is re-scanned.
- Fix: deploy; and filter `judged.observations` by the shown check ids when building the view (or when reading a stored report), so hiding takes effect on old reports too.

### D5 (low) Link-purpose observations on language-name links

- Where: `packages/core/src/judged.ts` `linkPurpose` (shown), threshold `NOTE_AT["link-purpose"] = 0.85`.
- Live: "Links whose purpose may be unclear. Noted for 4 of 20 items": "Français", "Afrikaans", "Asturianu", "Euskara", each at 85-89%.
- Why: the labelling is right (model judgement, may be wrong, not counted), so no text rule is broken. But these four notes are plainly wrong on a showcase site, and a visitor reads them next to real issues.
- Fix: skip links that carry `hreflang` or `lang`, or whose text is the only text in its list item and the list holds many one-word links; re-check precision on the calibration set.

### D6 (low) Some profile values do not stand alone without their claim

- Where: `packages/core/src/applicability.ts:50-63` shows every verified value of a field; rendered at `apps/web/src/features/report-states.ts:17-30`.
- Examples: "Implements Directive (EU) 2019/882" under Transposing law (DE-LAW-2, LT-LAW-2); "Act of 8 April 2024" (NL-LAW-2); "definition matches EAA Art. 3(30)" under "E-commerce services in scope" (AT, PL, SE, SI); "caps EUR 6,000 / 20,000 / 30,000" repeating SK-PENALTIES-1 (SK-PENALTIES-2); "state technical support and coordination unit (Art. 28), fallback authority" as Spain's only enforcement body (ES-AUTHORITY-2).
- Why: every value matches its verified fact and links its source, so nothing is false, but a few read as fragments.
- Fix: ledger wording (researcher edit, then re-verify), or show the claim text when a state is opened. No code change needed for correctness.

### D7 (low) "Unknown: no verified source yet" where a verified source records the gap

- Where: `apps/web/src/features/report-states.ts:20`, with `applicability.ts:59` dropping facts whose value is exactly `unknown`.
- Why: a field whose only fact is a verified `unknown` (for example a penalties fact with value `unknown`) has a verified source that says the answer is not determinable from it. "No verified source yet" misdescribes that.
- Fix: say "Unknown" and, when a verified `unknown` fact exists, link its source ("Unknown (source)").

### D8 (low, product's own legal duty) Contact form collects personal data without a privacy notice

- Where: `apps/web/src/features/contact-view.ts:54-91`.
- Why: not a ledger claim, but the form collects a name and an email for studio9 and says only that the scanned page is sent with the message. GDPR Art. 13 requires telling the person who processes the data, why, and for how long. Also, the line shows the requested URL ("https://wikipedia.org/"), while the report shows the final URL ("https://www.wikipedia.org/").
- Fix: one sentence naming studio9 as controller, purpose (answering this message) and retention, linking a privacy notice; show the same URL as the report header.

## Extra focus results

- Fix prompts (`fix-prompt.ts`): normative content is limited to the SC and clause fact lines (each with its source URL) plus our own "What fails" and "How to fix" texts, which state nothing beyond the mapped SC. Page text is quoted with `> ` on single collapsed lines and capped at 400 characters, and the rules say to treat it as data. The prompt asks the agent not to invent alt text and to ask instead. Nothing unsafe found. Exceptions: the axe title (D3) and the WCAG 2.2 label (D2).
- State profiles: every value shown in the 27 profiles was compared with the ledger. All come from `verified` facts, values equal to `unknown` are not shown, and values that start with "unknown (...)" read as unknown (BE-MICRO-1, GR-AUTH-1, GR-PEN-1, ES-PENALTIES-1, FI-PENALTIES-1, MT-PENALTIES-1, NL-AUTHORITY-1). All 27 states are under "Covers e-commerce services"; Unknown is empty. The microenterprise exemption line (EU-MICRO-1) is shown with its fact ID.
- Judged observations: the section label says "Judged by a model (Cloudflare Clef, @cf/cloudflare/clef); it may be wrong. These observations are not counted with the automated checks above and no source backs them. A person should look at each one." Cards say "Noted for N of M items" and "Model confidence", never "issue". Judged criteria are not in the coverage count (`coverage.ts:46-62` uses the catalogue only). Hidden checks: see D4.
- axe texts: see D3. axe `helpUrl` is not shown.
- WCAG 2.2 probes (2.4.11, 2.5.8) map to `STD-SC22-*`, are labelled WCAG 2.2, and do not count toward "touch 22 of the 50 WCAG 2.1 Level A and AA success criteria".

## Traced to verified facts (a), new since audit 1

| Text | Where | Fact |
| --- | --- | --- |
| "WCAG Level A/AA" on issue cards | `report-sections.ts:61-80` reads the level from the SC fact value | STD-SC-* |
| "also EN 301 549 V4.1.1 ..., published, not cited in the OJ" | `finding-reference.ts:40`, `reference.ts:45-46,66-79` | STD-EN4-9.*, gated on STD-EN-3 and EU-HS-1 |
| "Newer version: EN 301 549 V4.1.1 (published, not cited in the OJ)" | `reference.ts:74-79` | STD-EN-3, EU-HS-1 |
| Microenterprise exemption line | `applicability.ts:119-123` | EU-MICRO-1 |
| State profile values with source links | `applicability.ts:50-63` | each state's verified facts |
| Probe criteria lines | `probes.ts:152-158` | STD-SC-2.1.1, 2.1.2, 1.4.10, 1.4.12, 2.4.7; STD-SC22-2.4.11, 2.5.8 |

## Not legal or normative claims (c)

Probe help texts (`probes.ts:103-137`), static check titles, "What fails" and "How to fix" texts (all `checks/*.ts`, including the new `alt-placeholder` and `title-generic`), judged titles and "about" texts, headline "3 issues found by 67 automated checks", quiet summary, scan status lines, contact form labels and statuses, CTA "studio9 can review this page by hand, explain what the findings mean for your site, and fix them."
