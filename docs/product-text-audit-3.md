# Product text audit 3 (verifier-5, round 2)

Date: 2026-11-04, about 07:15 CET. Same method as `docs/product-text-audit-2.md`, applied to builder-core's new text at commit `bcdecda`: the verdict (`packages/core/src/verdict.ts`, decision 25), the requirement checklist (`packages/core/src/requirements.ts`, `report-text.ts`, `apps/web/src/features/report-checklist.ts`, decision 26) and the EAA rows built from the round 2 facts. Evidence: the CLI at `bcdecda` (static HTML only) on `https://www.wikipedia.org/`, `https://example.com/` and `https://www.alza.cz/` (blocked, HTTP 403), run 2026-11-04 06:08 UTC. The dev Worker did not serve the checklist yet (bundle `index-CSYantDe.js` has no checklist text), so the web view is audited from code. Line numbers are from `bcdecda`.

Summary: 9 defects (0 blocker, 3 medium, 6 low). No "compliant" or "compliance" wording. Every EAA row and Annex II example comes from a verified fact, with the right citation (Annex I Section III (a), (b)(i) to (vii), (c), (d); Section IV (g)(i) to (iii); Annex V point 1(a) to (c)). Examples are labelled non-binding, as Annex II's title says. The failure verdict cites STD-WCAG21-3 and says "this page does not meet", which is what the fact supports (see its verifier note on conforming alternate versions). Judged observations do not touch the verdict.

## Defects

### D1 (medium) "No failure found" for criteria whose checks had nothing to check

- Where: `packages/core/src/requirements.ts:92-95` adds every catalogue criterion to `ran` whenever the served HTML was checked; `wcagStatus` (`:110-131`) then returns `no_failure`. Rendered probes already drop `not_applicable` (`:101-103`); static checks do not.
- Live (example.com): the page has no links, images, buttons, fields, frames or meta refresh, and the CLI says "8 had nothing to check". The checklist still shows "No failure found" for 1.1.1, 1.3.1, 1.3.5, 2.2.1, 2.4.4 and 4.1.2. Only 2.4.2, 3.1.1 and 1.4.4 were actually tested. The same page says "The page probably builds its content with JavaScript", so "No failure found" for non-text content is not a meaningful result.
- Why: the row tells the visitor a criterion was checked when no item was. The verdict's "41 of the 50 ... were not checked automatically" uses the same count, so it is too low by 6 here.
- Fix: a criterion counts as run only when at least one of its checks has status `pass` or `fail` on this scan. Apply the same rule to the count behind `needPerson` in the verdict.

### D2 (medium) A served-HTML failure makes the verdict even when the rendered page passes the same check

- Where: `packages/core/src/report-sections.ts:104-126` (`staticIssue`: `failing = max(served, renderedFailing)`, so a static fail stays an issue when the rendered page reports 0 failing), counted by `verdict.ts:23` (`failsWcag21`).
- Why: the verdict now says "This page does not meet WCAG 2.1 Level AA", and the page view says "Only a failure is certain". A field unlabelled in the served HTML but labelled by a script before anyone sees it is a failure of the HTML file, not of the page users get. Where the rendered check ran the same concern and found nothing, the certainty claim is not backed. On wikipedia.org (static only) both failures are real in the served HTML (`<select id="searchLanguage">` has no label; the close `<button>` in `<dialog class="frb-iad-dialog">` holds only an SVG), so this did not produce a wrong verdict today.
- Fix: when the rendered page ran and checked the same concern with 0 failing, keep the static issue but mark it "in the served HTML only" and leave it out of the verdict count. Add a test with a served fail and a rendered pass.

### D3 (medium) A model's note replaces a deterministic "No failure found" on a row

- Where: `packages/core/src/requirements.ts:118-124`: `judged` with `noted > 0` is checked before `results.ran`.
- Why: for a criterion a deterministic check ran on, the row shows "Judged by a model" in place of "No failure found". The model output changes what the report says about a criterion a check decided. That goes against "No model output changes a finding" and decision 26's "one status" being built from checks first. `docs/requirement-checklist.md` only guarantees a judged row is never "Fails".
- Fix: order `fails`, `no_failure`, then `judged`; show the judged note under the row as a second line labelled as a model's judgement.

### D4 (low) 4.1.1 Parsing shows "Needs a person" and is counted as left for a person

- Where: `packages/core/src/sc-coverage.ts:79` (note "Obsolete: WCAG 2.2 removes it.", shown without its fact) and `requirements.ts:131`.
- Why: STD-WCAG21-2 (verified) says 4.1.1 "should be considered as always satisfied for any content using HTML or XML". A person has nothing to review, yet the row says so and the verdict's "M of the 50" includes it.
- Fix: give 4.1.1 a fixed note backed by STD-WCAG21-2 (and STD-SC22-4.1.1 for the 2.2 removal), with its source link, and leave it out of M.

### D5 (low) The no-failure verdict implies checked criteria need no review

- Where: `packages/core/src/verdict.ts:62`.
- Text: "That is not a pass: 41 of the 50 ... were not checked automatically on this scan, and a person needs to review them."
- Why: "them" is only the unchecked criteria. The checked ones are checked only in part (the coverage line says so, STD-AUTO-1 says so), and the web intro says "everything else still needs a person". The verdict says less than the rest of the report.
- Fix: "That is not a pass: 41 of the 50 ... were not checked automatically on this scan, and the other 9 only in part. A person needs to review all of them."

### D6 (low) "Every WCAG criterion and EAA requirement" overclaims the list

- Where: `apps/web/src/features/report-checklist.ts:166`.
- Why: the list holds the 50 WCAG 2.1 A/AA criteria, the 6 WCAG 2.2 A/AA additions and the EAA service requirements of Annex I Sections III and IV (g) plus Annex V. It has no AAA criteria and none of Annex I Sections I, II or the other Section IV services.
- Fix: "Each WCAG 2.1 Level A and AA criterion, the WCAG 2.2 additions, and the EAA service requirements a website touches, with what this scan could say about each."

### D7 (low) Two different "for a person" numbers next to each other

- Where: CLI `report-text.ts` `checklistBlock` header vs `verdict.ts:62`; web top tally `report-checklist.ts:170-182`.
- Live (example.com): verdict "41 of the 50 ... a person needs to review them"; checklist header "not checked on this scan: 16, needs a person: 47". The 47 mixes WCAG 2.1, WCAG 2.2 and EAA rows. A reader cannot match 41 to anything in the header.
- Fix: drop the combined tally (the web group summaries already carry per-group counts), or label it "all 72 rows".

### D8 (low) Annex V rows lose "where applicable" and where the information goes

- Where: `requirements.ts:186-208` (statement rows use the fact `value` only).
- Why: Annex V point 1 lists (a) to (c) "where applicable", and says the information goes "in the general terms and conditions, or equivalent document" (EU-STMT-2). EU-STMT-1 and EU-STMT-2 are verified but appear nowhere, so the three rows read as free-standing duties of a web page.
- Fix: a group line above the statement rows from EU-STMT-1 and EU-STMT-2 ("Service providers publish this information in their terms and conditions or an equivalent document, where applicable"), with both fact IDs.

### D9 (low) "the reference benchmark" in the verdict is not tied to its fact

- Where: `verdict.ts:53`; web "Why:" line `apps/web/src/features/report-view.ts:52-64` links only STD-WCAG21-3.
- Why: what the benchmark is (EN 301 549 V3.2.1 clause 9 = WCAG 2.1 A and AA) is STD-EN-5. The CLI shows it under "About the rules", the headline does not. Decision 25 names V3.2.1 in the verdict.
- Fix: add STD-EN-5 to the "Why:" line (and the CLI fact IDs), for example "Why: WCAG 2.1 conformance (STD-WCAG21-3); reference benchmark EN 301 549 V3.2.1 clause 9 (STD-EN-5)".

## Checked and fine

- No "compliant", "compliance" or "compliance score" in the new code or the CLI output. "WCAG 2.1 conformance" appears only as the label of the STD-WCAG21-3 link.
- Failure verdict is gated on STD-WCAG21-3 being verified (`report.ts` `verifiedText(VERDICT_FACT)`); without it the headline falls back to the issue count.
- Failure count uses only issues mapped to a WCAG 2.1 A or AA criterion (`levelOf` reads only `wcag` references); WCAG 2.2-only issues are named separately.
- Blocked, unreachable and non-HTML reports have no verdict and no checklist (alza.cz: "This site blocked automated checks, so nothing was tested.").
- EAA rows: every value equals its verified fact's `value`; citations match the Directive's numbering; III (c) shows EU-ANNEX-1 with EU-EX-1; IV (g)(i) to (iii) show EU-EX-2 to EU-EX-4 under "Example from Annex II (non-binding)".
- EAA rows are all "Needs a person", which is honest until a judged question covers them.
- Facts behind these rows were verified this round: STD-WCAG21-3 (`0a512c3`), EU-STMT-1..5, EU-ANNEX-5..16, EU-EX-1..4, DE-STMT-1/2, CZ-STMT-1/2 (`9464f43`).

## Re-check of bf7c64d (2026-11-04, about 07:25 CET)

CLI at `bf7c64d` (static HTML only) on example.com and wikipedia.org, plus code read of the web view and the new site section.

| Defect | Result |
| --- | --- |
| D1 | Fixed. example.com: 1.1.1, 1.3.1, 1.3.5, 2.2.1, 2.4.4, 4.1.2 read "Nothing to check on this page"; the coverage line says 3 of 50; verdict, coverage and checklist share one decided set (`decided.ts`). |
| D2 | Withdrawn in part: the served-only drop on a rendered pass already existed (`concernsRun` filter); I misread `staticIssue`. bf7c64d adds the drop when axe finds the rule inapplicable on the rendered page. Fine. |
| D3 | Fixed. Order is fails, no failure, then judged only when no check decided the criterion (`requirements.ts:150`). |
| D4 | Fixed in the row ("Always met by HTML", STD-WCAG21-2, out of M). Small wording problem left, see R1. |
| D5 | Fixed ("the other 3 only in part ... A person needs to review all of them"). |
| D6 | Fixed (new intro). |
| D7 | Fixed (per-group counts only). |
| D8 | Fixed (EU-STMT-1 and EU-STMT-2 shown as basis lines). "Where applicable" is left out. builder-core says no fact carries it, but EU-STMT-3..5 do, in `claim`, not in `value`. Acceptable as is. |
| D9 | Fixed: CLI shows "(STD-WCAG21-3, STD-EN-5)"; the page's "Why:" line links both. |

### R1 (low) The no-failure verdict asks a person to review 4.1.1 too

- Where: `packages/core/src/verdict.ts` `verdictText`.
- Live (example.com): "... 46 of the 50 ... were not checked automatically on this scan, and the other 3 only in part, and 4.1.1 Parsing is always met by HTML. A person needs to review all of them."
- Why: "all of them" now takes in 4.1.1, which the same sentence calls always met. The two "and" clauses also make the sentence hard to read.
- Fix: "That is not a pass: 46 of the 50 ... were not checked automatically on this scan, and the other 3 only in part. A person needs to review those 49. 4.1.1 Parsing is always met by HTML."

### N1 (medium) Cross-page check failures count toward "does not meet" without an accuracy run

- Where: `packages/core/src/site-checks.ts` (3.2.3 `consistentNavigation`, 3.2.4 `consistentIdentification`), counted in the verdict per `docs/requirement-checklist.md:58`.
- Why: a 3.2.3 or 3.2.4 fail now makes the headline "This page does not meet WCAG 2.1 Level AA". `docs/accuracy-qa.md` measures every static and rendered check, but not these two. Both are heuristics over navigation links: 3.2.4 treats a different text for the same `href` as a failure, which misfires on a logo link versus a "Home" link, or on menus that change with the section. The project rule says a check that cannot be decided reliably is not in the catalogue. Until the precision is measured, these failures are not known to be certain.
- Fix: run both on the 21 accuracy-QA sites through the deployed crawl and hand-check every fail. Until precision is at least as good as the static checks, show them as issues but leave them out of the verdict count. 3.2.6 is WCAG 2.2 and already stays out.

## Close (b89698b, 2026-11-04)

- R1 fixed: "... 46 of the 50 ... were not checked automatically on this scan and 3 only in part, so a person needs to review those 49. 4.1.1 Parsing is always met by HTML." (example.com, CLI at `b89698b`).
- N1 settled. The accuracy run (`docs/accuracy-qa.md` round 6) found 5 of 5 cross-page differences false. The three checks are removed, and no code under `packages/*/src` or `apps/*/src` still names them. 3.2.3, 3.2.4 and 3.2.6 read "Needs a person". The site section on gov.uk lists the three pages read with their own static results, and says nothing about cross-page consistency.
- Audit 3 has no open defects.

## Headline and scope line (6594671, 2026-11-04, about 07:50 CET)

Live on dev: wikipedia.org (scan `mw1r2wu8-47x7kbpx`, static only, the rendered check was skipped on a redirect) and gov.uk (scan `mw1r1zyh-jvzvz3o9`, static + rendered + crawl + judged).

Checked and fine:

- Failure headline (wikipedia.org): "This page does not meet WCAG 2.1 Level AA, the reference benchmark. Automated checks found 2 failures." The "Why:" line links STD-WCAG21-3 and STD-EN-5.
- No-failure headline (gov.uk): "Automated checks found no failures against WCAG 2.1 Level AA. That is not a pass: 49 of 50 criteria still need a person." The new detail line, "29 were not checked automatically ... and 20 only in part, so a person needs to review those 49. 4.1.1 Parsing is always met by HTML.", adds up to 50 (29 + 20 + 1) and agrees with the checklist counts.
- Plural tallies read correctly ("2 fail", "26 need a person", "13 need a person").
- The scope line cites EU-DEF-1 (Art. 3(30), e-commerce services), which holds the words used. The lead's EU-DEF-2 is the microenterprise definition, so builder-core's switch is right. The value shown matches the verified fact. The state list stays "Covers e-commerce services (27)" next to a "does not sell" judgement, so the judgement does not change it (decision 29).
- `sells-to-consumers` is calibrated (60 of 60 right on 71 real sites, `docs/judged-checks.md`), and its line says "Judged by a model (Cloudflare Clef), not used for the list of states" with the confidence.

### S1 (low) The scope line reads as our conclusion, not the model's

- Where: `packages/core/src/judged-placement.ts` `NOT_SELLING_LEAD`.
- Text: "The EAA's e-commerce rules cover services provided with a view to concluding a consumer contract, so they may not apply to this site."
- Why: it is shown only because of a model judgement, but nothing in the sentence says so, and it states an effect of the law on this site. `docs/judged-checks.md:163` names the likely error: a shop built by script, judged "does not sell". On that site this line would tell the owner the e-commerce rules may not apply to them.
- Fix: tie it to the judgement: "If the model is right, the EAA's e-commerce rules may not apply to this site: they cover services provided with a view to concluding a consumer contract." Keep EU-DEF-1.

### S2 (low) "found this point in the statement, or was not sure" merges two answers

- Where: the `statement-annex-v` note on Annex V rows (builder-judge's text, shown in the checklist). Live on gov.uk, point 1(c).
- Why: a row that says the point was found and a row where the model could not tell are different results. The visitor cannot tell which one this is.
- Fix: two texts, "the model found this point in the statement" and "the model could not tell", or show only the found and missing cases and leave the row at "Needs a person" otherwise.

No other defects. No "compliant" wording; every legal line traces to a verified fact.

## S1/S2 re-check (d510085, 2026-11-04, about 08:05 CET)

Stored report on dev, no new scan (builder-cloud asked for a hold on third-party scans): navlacil.cz, scan `mw1rf9cz-0rso4d5k`, static + rendered + crawl + judged.

- S1 fixed: "If the model is right, the EAA's e-commerce rules may not apply to this site: they cover services provided with a view to concluding a consumer contract." EU-DEF-1 is linked.
- S2 fixed: Annex V rows are "Judged by a model" only when the model judged a point missing; otherwise "Needs a person" (navlacil.cz: 3 need a person).
- New headline count is right: "Automated checks found 3 failing criteria" (1.4.3, 2.4.4, 4.1.2), which matches the checklist's "3 fail". The detail line "2 issues below fail WCAG 2.1 Level A or AA and 2 are against the newer WCAG 2.2" matches the 4 issues listed.
- Still live: "39 elements failing. found in the rendered page" (lowercase after the full stop, on the 2.4.11 and 2.5.8 issues). `ce417ac` fixes this but was not deployed when I read the report. Check after the next deploy.
- Note, not a text defect: the 1.4.3 samples are `<span class="word">` pieces of an animated heading, which axe may have read mid-animation. The verdict on this page also rests on the empty carousel links (`<a class="carousel-item__prev" href="#">` holding only an SVG, 2.4.4 and 4.1.2), which are real, so the headline holds.

Audit 3: no open text defects once `ce417ac` is deployed.
