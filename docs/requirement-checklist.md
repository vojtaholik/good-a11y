# Verdict and requirement checklist

Decisions 25 and 26 in the brief. Owner: builder-core. Code: `packages/core/src/verdict.ts`, `packages/core/src/requirements.ts`; views: `formatReport` (CLI) and `apps/web/src/features/report-checklist.ts`.

## Verdict

The headline of a tested report says one of two things.

- **A Level A or AA check fails:** "This page does not meet WCAG 2.1 Level AA, the reference benchmark. Automated checks found N failures." Backed by `STD-WCAG21-3` (WCAG 2.1, 5.2.1: Level AA conformance needs every Level A and AA criterion satisfied). The CLI prints the fact ID after the headline; the page links its source under the headline.
- **No such failure:** "Automated checks found no failures against WCAG 2.1 Level AA. That is not a pass: M of the 50 WCAG 2.1 Level A and AA success criteria were not checked automatically on this scan, and a person needs to review them."

Calls made:

- The claim is about **this page**, never the site. `STD-WCAG21-3` holds unless a conforming alternate version exists (verifier note), so the text says "does not meet", not "cannot conform".
- **N counts issues mapped to a WCAG 2.1 A or AA criterion** (an issue with a Level). A failure of a WCAG 2.2-only criterion (target size, focus obscured) does not count against WCAG 2.1; it is named in the no-failure headline as "and K issues against the newer WCAG 2.2".
- **M = criteria with no deterministic check run on this scan**, from the coverage line (50 minus the criteria touched). It changes with the scan: a static-only scan leaves more for a person than one with the rendered page.
- **Gated on the fact.** Without a verified `STD-WCAG21-3` the failure headline falls back to "N issues found by K automated checks". The no-failure headline makes no conformance claim.
- **Judged observations never touch the verdict.** `withJudged` leaves `headline` and `verdict` unchanged; a test checks it.
- **Blocked, unreachable and non-HTML reports have no verdict** (`verdict: null`) and keep their "nothing was tested" headline.
- **Wording:** the lead's "the reference benchmark for the EAA" was cut to "the reference benchmark", because decision 10 keeps WCAG/EN 301 549 from being presented as what the EAA requires.

`Report.verdict` is stored in the report. Reports saved before the field existed fail to decode and show the scan store's "outdated report" message for at most the one-hour reuse window.

## Requirement checklist

One row per requirement, built per report by `requirementsOf(report)` (not stored; derived from the report, the catalogue and the verified facts).

Rows:

- **WCAG**: every row of `SC_COVERAGE` (the 50 WCAG 2.1 A/AA criteria from `STD-SC-*` facts, and the WCAG 2.2 additions from `STD-SC22-*`, labelled newer).
- **EAA**: every verified fact with `used_by: eaa.requirement.<key>` (Annex I III (a), III (b)(i-vii), III (c), III (d), IV (g)(i-iii)) and `eaa.statement.<n>` (Art. 13 with Annex V point 1(a-c)). A fact tagged `eaa.example.<key>` is shown under its row as "Example from Annex II (non-binding)". `eaa.statement-basis.*` facts are not rows. A row appears only when its fact is verified; the citation ("Annex I, Section III (b)(i)") is built from the key.

Status of a WCAG row, first match wins:

1. **Fails**: an issue on this report (static or rendered) references the criterion.
2. **Judged by a model**: a shown judged observation relates to it and noted something.
3. **No failure found**: a deterministic check for it ran on this scan (a static check when the served HTML was checked; an axe rule or probe when the rendered page ran).
4. **Judged by a model**: a shown observation relates to it and noted nothing.
5. **Not checked on this scan**: the criterion has an automated test, but it did not run (for example the rendered check was skipped).
6. **Needs a person**: no automated test exists; the `/checks` note says why.

EAA rows are "Needs a person" until a judged question covers them (decision 27, 29: the statement and IV (g) product information, wired when builder-judge's observations land).

A judged status is never "Fails": model output stays out of the deterministic result.

The checklist sits after the issues and the judged observations, before the member states, on the page and in the CLI. On the page each group (WCAG 2.1, WCAG 2.2, EAA) is a closed disclosure whose summary carries its counts, so the report stays short at 360 px.

## Site section and cross-page checks (decision 28)

builder-cloud's crawl hands over `SiteEvidence`: the pages it tried (read with their static check results, or failed with a reason) and one `PageSummary` per page read, the page entered first. `withSite(report, evidence)` adds `Report.site` and recomputes coverage, headline and verdict, so it can run before or after the rendered step.

Cross-page checks (`packages/core/src/site-checks.ts`) compare each other page with the page entered. Each needs at least 3 navigation links shared by the two pages, else it has nothing to check.

- **3.2.3 Consistent Navigation** (`consistent-navigation`): the shared navigation links (nav and header landmarks, first occurrence of each address) must come in the same order. A repeated address, such as a logo and a Home link, counts once.
- **3.2.4 Consistent Identification** (`consistent-identification`): a navigation link to the same address must have a related name on both pages. Names are compared lowercased with digits removed (so "Cart (0)" and "Cart (2)" agree), and one name containing the other agrees (so a hidden "current page" marker does not fail).
- **3.2.6 Consistent Help** (`consistent-help`, WCAG 2.2, labelled newer): a contact or help link on both pages must have the same set of shared navigation links before it. Comparing sets, not order, keeps a navigation reorder from also failing help.

**Not yet counted (lead, after verifier N1).** Until an accuracy run on the 21 QA sites shows these checks precise, with every fail checked by hand, their results do not feed the issues, the verdict, the coverage line or a checklist "Fails". The site section lists each as "Compared across pages, not yet counted" with its result and samples, and the 3.2.3, 3.2.4 and 3.2.6 rows stay "Needs a person" with the same line under them. The accuracy run goes in `docs/accuracy-qa.md`; then they are counted or dropped.

The static check results of the other pages are listed per page in the site section and never count in the verdict: the report stays the report for the page entered.

**2.4.5 Multiple Ways stays manual.** The crawl sees search and site-map links, but navigation plus links between pages already satisfy 2.4.5, so a missing search or site map is not a failure and their presence is not a pass. The site section reports what the scan saw; the checklist row says a person decides.

**IV (g)(i) stays "Needs a person"** (builder-judge): the shop must pass on accessibility information only when the responsible economic operator provides it, and the scan cannot see whether one did, so no model question is asked about it.
