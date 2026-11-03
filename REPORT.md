# EAA checker – report

Durable record of tonight's build (2026-11-03). Newest first within each section.

## What works

- Report UX per Vojta (21:30): headline + coverage, issues first (one card per concern, static and rendered samples merged and tagged), Copy fix prompt on every issue with a fallback, judged observations in their own labelled section (Cloudflare Clef, never counted), one 'Where the EAA applies' section with all 27 states as flags opening to verified profiles (law, scope, dates, authority, penalties, micro exemption, each with a source link), passes collapsed, rules + statement + contact form last. Foldkit audit-program run.
- Checks: 12 static (incl. autocomplete 1.3.5, BCP 47 lang, alt placeholder 1.1.1, generic title 2.4.2), axe-core 4.14 on Browser Run (also when the static fetch was refused), 4 judged observations (alt describes, link purpose, headings/labels, language match). Rendered probes (reflow, tab walk for focus visible / keyboard / trap, text spacing, target size) in progress. Coverage plan for all 56 SCs: `docs/sc-coverage-plan.md` (40 stay manual).
- Live page on stage dev: paste a URL, the scan runs in a Cloudflare Workflow (XState machine), the report shows: what the EAA requires (Annex I, EU-ANNEX-1/4), the reference benchmark (EN 301 549 V3.2.1 / WCAG 2.1 AA) and that no EN 301 549 version is cited in the OJ under the EAA (EU-HS-1), a coverage line (9 checks touch 8 of 50 WCAG 2.1 A/AA SCs), findings with SC and clause, the member states where the EAA covers e-commerce services (flags, unknowns named) with the sourced microenterprise exemption, the automated-checks statement, and the contact CTA. Bot walls get a 'blocked automated checks' report. Our own page passes our own checks (test).
- Product-text audit by the verifier (`docs/product-text-audit.md`): 8 defects found, all fixed.
- `pnpm cli scan <url>`: hardened fetch, 9 deterministic static-HTML checks (lang, title, image alt, form labels, link name, button name, frame title, zoom, meta refresh), each mapped to WCAG 2.1 SC + EN 301 549 V3.2.1 clause (+ V4.1.1 as upcoming) from verified facts, per-state applicability (23 apply, 4 unknown), the automated-checks disclaimer (STD-AUTO-1), no "compliant" anywhere (tested), studio9 CTA placeholder. Bot walls (Cloudflare, DataDome) read as "refused".
- rat-stack skeleton with webproai's full fence (tsgo Effect language service, typed lint, anti-slop, lefthook, no-verify blocks, CI workflow, skills). Gate `pnpm turbo run check test build` green.
- Facts ledger: standards (129 facts: WCAG 2.1 A/AA SCs, EN 301 549 V3.2.1 and V4.1.1 clauses, W3C automated-testing statement) verified.

## Repo

- https://github.com/vojtaholik/eaa-check (private), `main` pushed after each green layer.

## Deploy URL

- Stage `dev` (non-production, workers.dev): https://eaacheck-website-dev-x6ihepvlvg74r7cg.vojtaholik.workers.dev . Alchemy plan was 5 creates, 0 updates or deletes (Website Worker, Scanner Worker, ScanWorkflow, D1 ScanDatabase, migrations). A scan runs through the XState machine inside the Cloudflare Workflow and the page shows the report.

## Facts ledger coverage

All 485 facts verified by a second agent against their primary source (0 open rejects). 27 of 27 member states researched.

| File | Facts | Verified | Rejected | Fields recorded as unknown |
| --- | --- | --- | --- | --- |
| `eu.md` | 28 | 28 | 0 | 0 |
| `standards.md` | 129 | 129 | 0 | 0 |
| `states/at.md` | 12 | 12 | 0 | 0 |
| `states/be.md` | 11 | 11 | 0 | 2 |
| `states/bg.md` | 11 | 11 | 0 | 0 |
| `states/cy.md` | 14 | 14 | 0 | 1 |
| `states/cz.md` | 9 | 9 | 0 | 0 |
| `states/de.md` | 14 | 14 | 0 | 1 |
| `states/dk.md` | 10 | 10 | 0 | 0 |
| `states/ee.md` | 10 | 10 | 0 | 0 |
| `states/es.md` | 12 | 12 | 0 | 2 |
| `states/fi.md` | 12 | 12 | 0 | 1 |
| `states/fr.md` | 13 | 13 | 0 | 0 |
| `states/gr.md` | 11 | 11 | 0 | 2 |
| `states/hr.md` | 15 | 15 | 0 | 0 |
| `states/hu.md` | 14 | 14 | 0 | 0 |
| `states/ie.md` | 12 | 12 | 0 | 0 |
| `states/it.md` | 13 | 13 | 0 | 0 |
| `states/lt.md` | 12 | 12 | 0 | 0 |
| `states/lu.md` | 11 | 11 | 0 | 0 |
| `states/lv.md` | 12 | 12 | 0 | 1 |
| `states/mt.md` | 11 | 11 | 0 | 1 |
| `states/nl.md` | 13 | 13 | 0 | 2 |
| `states/pl.md` | 14 | 14 | 0 | 0 |
| `states/pt.md` | 12 | 12 | 0 | 0 |
| `states/ro.md` | 11 | 11 | 0 | 1 |
| `states/se.md` | 14 | 14 | 0 | 0 |
| `states/si.md` | 14 | 14 | 0 | 0 |
| `states/sk.md` | 11 | 11 | 0 | 1 |

Notable unknowns: DE enforcement body (BFSG defers to Land law); ES authority (regional) and penalty amounts (by reference); NL e-commerce fine amounts; MT penalties (by reference); SK product list (separate regulation); BE microenterprise exemption and products (federal law only); LV fines; GR e-commerce authority and fines; FI fine amounts; CY e-commerce surveillance department; RO law number (text from senat.ro adopted copy). Unknowns show as "unknown" in the product.

EN 301 549: V4.1.1 (2026-09, WCAG 2.2) is published; no version is cited in the OJ under the EAA as of 2026-10-30 (EU-HS-1). V3.2.1 is cited under the Web Accessibility Directive (2021/1339). The report uses V3.2.1 / WCAG 2.1 AA as the reference benchmark and the EAA Annex I as the legal requirement.

## Open decisions

- Contact CTA wording (placeholder, shown to users now without a TODO marker): "studio9 can review this page by hand, explain what the findings mean for your site, and fix them. Get in touch with studio9." Blocked sites: "studio9 can review it by hand." Vojta to rewrite; it is one constant in `packages/core/src/report.ts`. There is no contact form or link target yet.

- Bot walls: 9 of 16 large EU shops block a plain fetch (Cloudflare, DataDome, AWS WAF, Baleen). Product shows a clear blocked report with the CTA; no evasion. Browser Run block rate pending (decision 11).

- Rendered-DOM checks: decided and confirmed by Vojta (axe-core on Browser Run, budgeted to the included hours, later layer). `.brain/resources/axe-on-browser-run.svx`.

- Contact CTA wording is a placeholder for Vojta.
- Languages after English (proposal: Czech second).

## Needs Vojta

- Jev through Cloudflare (`typesafe/jev-1.14.0`) answers HTTP 402 "Insufficient balance; add money to your gateway or use BYOK": it needs AI Gateway credits (Unified Billing) or a TypeSafe key. Judged observations run on Cloudflare's own `@cf/cloudflare/clef` inside the free Workers AI daily allocation instead. To switch to Jev, load AI Gateway credits (or add a key as BYOK) and change one model constant.

- Contact messages are stored in D1 on stage dev and nobody is told. To get them by e-mail, as webproai does, the Stack needs your verified destination address (Cloudflare Email). Read them meanwhile with `wrangler d1 execute` on the dev database or ask an agent.
- Turnstile on the scan and contact forms needs a site key for the final hostname; not set up.

## Log

Times are CET, from the machine clock.

- 21:30 Report redesign live on dev (adc00e5, 9881eb2). Judged observations built on Clef. Browser budget per stage (dev 90 min/day). builder-core running accuracy QA on ~10 real sites.

- 21:15 Vojta (afk after): issues first + smarter states UX, copy-fix-prompt per issue, Foldkit skills for UI, and test almost everything accurately, Jev via Cloudflare for decisions. Now running: builder-core (report UX + fix prompts), builder-cloud (Browser Run deploy, block rate, rendered probes: reflow, text spacing, focus visible, target size), builder-judge (Jev-judged checks via Workers AI binding), verifier (SC coverage plan for all 50 + 6 SCs). Decisions 15-18.

- 20:50 Audit fixes committed and pushed (7dfac2b, 2a7a291); live crash on outdated D1 rows fixed and verified live. axe adapter in progress.

- 20:58 Coverage line, blocked-site report and EAA requirement line committed (4f0e416). Block rate: 9/16 big shops refuse. builder-core on axe; verifier auditing product text.

- 20:50 Deployed to stage dev; lead scanned wikipedia.org through the live page, report correct. Fixes queued: our own URL field needs a real label, OJ citation line on the page.

- 20:36 Ledger complete: 485 facts, all verified, 27/27 states. Layer 1 CLI works live. builder-cloud has store + Workflow machine + infra green, web page in progress. builder-core on round 2 (legal-requirement line, axe-core on Browser Run).

- 20:25 Deadline set by Vojta: machine sleeps ~00:20; no questions. builder-cloud started (layers 2-3, deploy). EU directive verified 28/28 (no EN 301 549 cited in the OJ under the EAA as of 2026-10-30). facts package committed (milestone 2). CI green.

- 20:17 Skeleton committed (gate green). Standards verified 129/129. States verified: AT, CZ, DE, ES, IE, SE. GitHub repo creation blocked by permission classifier.
- 20:12 research-eu found EN 301 549 V4.1.1 (2026-09, WCAG 2.2). Decision 8: map both versions. Vojta confirmed the axe decision.

- 20:08 Six agents running: research-eu, states-a/b/c, verifier, builder-core. Vojta asked for full rat-stack fence and webproai structure; builder briefed.
- 20:04 Lead started. Brief read, webproai studied, ledger format defined.
