# EAA checker – report

Durable record of tonight's build (2026-11-03). Newest first within each section.

## What works

State at 23:25 CET, all on `main`, CI green, deployed to stage dev.

- **The page** (dev URL below): paste a URL, follow the scan, read the report at `/report/<host>/<scanId>` (shareable, reloads show that scan). The report puts the headline and coverage line first and lists issues worst first. Each concern gets one card with static and rendered samples merged, its WCAG 2.1 SC and EN 301 549 clause from verified facts, and a Copy fix prompt. Judged observations come next in their own labelled section. Then one "Where the EAA applies" section shows the 27 states as flags opening to verified profiles. Passes are collapsed. Rules, the automated-checks statement and the contact form come last. `/checks` lists all 50 WCAG 2.1 A/AA criteria (plus 6 WCAG 2.2 additions) and how each is tested: 23 have an automated check and 27 are manual, with a reason for each. Our own pages pass our own checks (test).
- **Checks**: 12 deterministic static-HTML checks; axe-core 4.14.0 on Cloudflare Browser Run, also when the plain fetch was refused; and our own rendered probes for reflow 1.4.10, text spacing 1.4.12, focus visible 2.4.7, keyboard reach 2.1.1, keyboard trap 2.1.2, target size and on-focus 3.2.1. A check that cannot be decided reliably is not in the catalogue (decision 15, `docs/sc-coverage-plan.md`).
- **Judged observations**: Cloudflare Clef answers fixed questions about collected evidence. Only checks calibrated at ≥0.9 precision on real pages are shown (link purpose, language match). They are never counted as issues and stay inside the free Workers AI allocation (decisions 18, 19, 21, 23).
- **Accuracy**: five QA rounds on 21 real EU sites (`docs/accuracy-qa.md`). Every false-positive cause found was fixed or its check was dropped. In the regression run, 19 of 21 static results matched the earlier rounds and the 2 differences were sites newly read. There were 0 crashes, 0 wrong state lists and 0 "compliant" wording. Rendered findings hand-checked on 5 more sites: 13 of 15 true or plausible; the 2 false positives were fixed. Known residue: one heureka contrast sample unsettled, and contrast inside shadow DOM is dropped (decision recorded).
- **Honesty**: "compliant" and "compliance score" never appear (tested). Every report says automated checks find only part of WCAG and that a manual review is needed. Two product-text audits by the verifier (`docs/product-text-audit*.md`) are fixed except D6 (below).
- **Security**: code review plus three re-reviews (`docs/review.md`), with 0 open high or medium findings. Every fetch and browser navigation is vetted, with redirects followed by hand and the landed URL re-vetted. Popups and service workers are blocked in the browser. The scanner Worker is reachable only by service binding. Per-IP rate limits (IPv6 by /64) and a per-site per-caller daily cap are enforced in one insert, and the caller header cannot be spoofed. Daily budgets cover browser minutes (dev 90 min) and model use. The CLI pins DNS and refuses private addresses.
- **CLI**: `pnpm cli scan <url>` runs the same static scan in the terminal; `--json` gives the schema-encoded report.
- **Facts**: 485 facts, all verified by a second agent against the primary source; 27 of 27 states (table below).
- **Stack**: rat-stack exactly like webproai with the full fence (tsgo Effect diagnostics, typed lint, anti-slop, lefthook, CI). Gate `pnpm turbo run check test build` is green.

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

- Error-message checks (3.3.1, 3.3.3) need a second form run to reach 30 labelled items; evidence and next steps in `.brain/projects/eaa-checker/calibrate-error-messages.svx`. The empty-submit probe is off unless `EMPTY_SUBMITS=true` at deploy.
- Production stage name `prod` and its Clef share (250k of a 400k account ceiling) are proposals (decision 30).

- Contact CTA wording is a placeholder for Vojta: "studio9 can review this page by hand, explain what the findings mean for your site, and fix them. Get in touch with studio9." (blocked sites: "studio9 can review it by hand."). It is one constant in `packages/core/src/report.ts`; the contact form under it stores messages in D1.
- A few state-profile values read as fragments without their claim (audit 2, D6, e.g. DE-LAW-2 "Implements Directive (EU) 2019/882"). They are true and sourced; tidy the wording in a later research pass.
- Bot walls: 9 of 16 large EU shops refuse a plain fetch, and with render-on-refused 12 of 16 still get a rendered audit. Blocked sites get a clear "blocked automated checks" report with the CTA and no evasion (decisions 11, 20).
- Browser Run egress not reaching private networks is an assumption: Cloudflare's docs do not say it. It is recorded in AGENTS.md and `docs/rendered-audit.md`.
- Languages after English: Czech second is proposed (decision 4).

## Needs Vojta

- Privacy notice for the contact form: the page says studio9 keeps the e-mail, name, message and scanned address only to answer and deletes them on request. A proper GDPR notice needs the controller's legal name and contact, and a retention period; give those and the notice is one constant.

- Jev through Cloudflare (`typesafe/jev-1.14.0`) answers HTTP 402 "Insufficient balance; add money to your gateway or use BYOK": it needs AI Gateway credits (Unified Billing) or a TypeSafe key. Judged observations run on Cloudflare's own `@cf/cloudflare/clef` inside the free Workers AI daily allocation instead. To switch to Jev, load AI Gateway credits (or add a key as BYOK) and change one model constant.

- Contact messages are stored in D1 on stage dev and nobody is told. To get them by e-mail, as webproai does, the Stack needs your verified destination address (Cloudflare Email). Read them meanwhile with `wrangler d1 execute` on the dev database or ask an agent.
- Turnstile on the scan and contact forms needs a site key for the final hostname; not set up.

## Log

Times are CET, from the machine clock.

- 08:50 (11-04) Round 2 done. Fail-only verdict on STD-WCAG21-3; requirement checklist (50 WCAG 2.1 + 6 WCAG 2.2 + EAA Annex I and Art. 13/Annex V rows); small crawl (up to 4 same-site pages); Clef now judges EAA scope, the accessibility statement against Annex V, page language, passages in another language (3.1.2) and text styled as a heading (1.3.1), each at precision 1.00 on a holdout of real pages. Retired after real data: cross-page 3.2.3/3.2.4/3.2.6 (5/5 FP), text spacing 1.4.12 (no TP), sensory 1.3.3, 3.3.2, 3.2.4, product info IV(g). Verdict accuracy on 31 sites: 20 do not meet WCAG 2.1 AA, 8 no failure, 3 blocked; every verdict-driving failure hand-checked, none flipped by a false positive. Review round 2: 10 findings, all fixed; one empty newsletter submit on navlacil.cz (06:45 UTC) predates the leak fix. Clef calibration used ~379k local tokens plus dev scans, a few thousand past the free allocation. Open: 3.3.1/3.3.3 error messages (`calibrate-error-messages.svx`).

- 08:07 Lead allowed up to 120k Clef tokens past today's free allocation (about $0.03) to finish calibration today, through a local-only calibrator override.

- 06:55 (11-04) Round 2 started on Vojta's "lets build it all": fail-only verdict, requirement checklist with EAA rows, accessibility-statement check, small crawl, more Clef questions (decisions 25-29). Five agents: research, verifier, builder-core, builder-cloud, builder-judge.

- 23:25 Build wrapped. Re-review 3: 0 open high/medium (R13 CLI DNS crash fixed, 90d723f). Accuracy round 5 plus the orchestrator's alza check: reflow is now page-level (1 instance when the page scrolls sideways at 320 px; carousel items no longer count), probe counts are real counts, contrast inside web components dropped, consent dialogs no longer fail keyboard reach. Old stored reports show 'made by an older version, run a new scan' with the URL prefilled. All Brain steps closed. CI green on main, dev deployed. Children stopped.

- 22:35 Re-review 2: H2 fixed (scanner Worker not reachable on its own URL, non-POST RPC refused, per-site cap keyed by site and caller, IPv6 by /64), popups and service workers blocked in Browser Run. Caller-header spoofing (R11) and popup first request (R12) fixed in 09b944b. Report links carry the scan ID (R6). Regression run found and fixed a CLI gzip bug (1349852). /checks page lists all 50 WCAG 2.1 A/AA criteria and how each is tested (23 automated, 27 manual). CI green, dev deployed.

- 22:15 Review fixes deployed (H1 ea1b4cb, H2/L3/M2 26fc8be, L2 e58fc57, M1 8914d24). Re-review: H1, M1-M3, L1-L3 fixed; H2 still open (scanner Worker reachable on its own workers.dev URL; non-POST RPC unlimited), plus per-site lockout, IPv6 keying and browser popups/service workers. All routed to builder-cloud. Fresh dev screenshots of a many-issue report and a blocked report look right; builder-core on the /checks page.

- 21:55 Code review (`docs/review.md`): 2 high (Browser Run navigations not vetted; no per-caller limits), 3 medium, 3 low; facts gate and report honesty clean. Second product-text audit (`docs/product-text-audit-2.md`): 8 defects, 0 blockers. All routed to builders.

- 21:45 Accuracy QA on 21 sites (`docs/accuracy-qa.md`): 5 false-positive causes fixed (charset, svg names in buttons, hidden iframes, shadow-DOM links, Akamai wall); static checks precise on every site where they fired; axe contrast 12/14. Two judged checks hidden for low real precision (decision 23). Vojta moved the deadline to ~01:40, all decisions on the lead.

- 21:38 Judged observations calibrated on 212 labelled items (thresholds per check for precision >= 0.9; mostly hand-written cases, so real-world precision is likely lower); a test guards it. ~$0.002 per scan on Clef, inside the free allocation.

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
