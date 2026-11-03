# Task: report UX redesign (builder-core, lead 21:00 CET)

From Vojta, 2026-11-03: "lets make sure its really good ux-wise, so issues in report come first, flags and states are solved smarter".
Deadline ~00:20 CET, no questions. Load the `impeccable` skill (or `frontend-design`) and `good-css` before styling. You own `apps/web/src/features/report-*` and the report view model in core for this task; tell builder-cloud (it is deploying the rendered check) which files you are in, and pull before you start.

## Report order (web, and mirror the order in the CLI text)

1. **Top**: page URL, when scanned, which checks ran (static, or static + rendered page), one headline: "N issues found by M automated checks" (or the blocked headline). The coverage line sits right under it, short.
2. **Issues first**: every failing check as a card, worst first (by number of instances, Level A before AA): plain title, what fails, how many of how many, 2 to 3 code samples, how to fix in one sentence (only where it is a plain restatement of what fails, no new normative claim), then the WCAG SC + EN 301 549 clause as small references. No per-card state list.
3. **Where the EAA applies**: ONE section for the whole report, since applicability is the same for every finding (it depends on each state's law, not on the finding). A compact grid of member states with small flags, grouped: "Covers e-commerce services (N)", "Unknown (M)" with the reason per state. Each state opens (disclosure, no JS needed beyond Foldkit) to its verified profile: transposing law and identifier, applies from, enforcement body, penalties, microenterprise exemption, each value with a link to its source and "unknown" where the ledger says so. This is the researched data; show it well. Optional: let the visitor pick the states they sell in (default: all) and the section lists those first; only if it stays simple.
4. **Checks with no issue found** and "nothing to check": collapsed under one disclosure ("7 checks found no issues"), neutral wording, never ticks.
5. **About the rules**: what the EAA requires (Annex I lines), reference benchmark, the OJ line, the newer EN version, compact.
6. Statement (automated checks find only part ...), then the contact CTA and form (builder-cloud's form).

Rules: every legal/normative text still comes from verified facts only; never "compliant"; our own page must still pass our own checks (own-page test); mobile-first, readable at 360 px, keyboard and screen-reader friendly (disclosures as `details/summary` or proper buttons with aria-expanded); flags decorative (`aria-hidden`) next to the state name text. Commit + push yourself when the whole gate is green; redeploy dev is builder-cloud's (tell it when to deploy). Send the lead a screenshot path when done (agent-browser or the Chrome extension, your own tab, close it after).
