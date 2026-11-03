# EAA checker – report

Durable record of tonight's build (2026-11-03). Newest first within each section.

## What works

- rat-stack skeleton with webproai's full fence (tsgo Effect language service, typed lint, anti-slop, lefthook, no-verify blocks, CI workflow, skills). Gate `pnpm turbo run check test build` green.
- Facts ledger: standards (129 facts: WCAG 2.1 A/AA SCs, EN 301 549 V3.2.1 and V4.1.1 clauses, W3C automated-testing statement) verified.

## Deploy URL

- None yet.

## Facts ledger coverage

| Area | Researcher | Facts | Verified | Rejected | Unknown fields |
| --- | --- | --- | --- | --- | --- |
| EU directive | – | – | – | – | – |
| EN 301 549 / WCAG | – | – | – | – | – |
| 27 member states | – | – | – | – | – |

## Open decisions

- Rendered-DOM checks: decided and confirmed by Vojta (axe-core on Browser Run, budgeted to the included hours, later layer). `.brain/resources/axe-on-browser-run.svx`.

- Contact CTA wording is a placeholder for Vojta.
- Languages after English (proposal: Czech second).

## Needs Vojta

- Create the private GitHub repo: Claude Code's auto-mode classifier blocked `gh repo create vojtaholik/eaa-check --private --source . --push` (the brief allows it). Run it yourself (`! gh repo create vojtaholik/eaa-check --private --source . --push`) or allow it, and the lead pushes after each layer.

## Log

- 21:40 Skeleton committed (gate green). Standards verified 129/129. States verified: AT, CZ, DE, ES, IE, SE. GitHub repo creation blocked by permission classifier.
- 21:00 research-eu found EN 301 549 V4.1.1 (2026-09, WCAG 2.2). Decision 8: map both versions. Vojta confirmed the axe decision.

- 20:30 Six agents running: research-eu, states-a/b/c, verifier, builder-core. Vojta asked for full rat-stack fence and webproai structure; builder briefed.
- 20:10 Lead started. Brief read, webproai studied, ledger format defined.
