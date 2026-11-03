# EAA checker – report

Durable record of tonight's build (2026-11-03). Newest first within each section.

## What works

- Nothing shipped yet. Repo, `.brain/` and facts ledger format are set up.

## Deploy URL

- None yet.

## Facts ledger coverage

| Area | Researcher | Facts | Verified | Rejected | Unknown fields |
| --- | --- | --- | --- | --- | --- |
| EU directive | – | – | – | – | – |
| EN 301 549 / WCAG | – | – | – | – | – |
| 27 member states | – | – | – | – | – |

## Open decisions

- Rendered-DOM checks: decided (axe-core on Browser Run, budgeted, later layer). `.brain/resources/axe-on-browser-run.svx`.

- Contact CTA wording is a placeholder for Vojta.
- Languages after English (proposal: Czech second).

## Needs Vojta

- Confirm that axe-core on Cloudflare Browser Run is OK while it stays inside Workers Paid's included 10 browser hours a month (decision 7). Building it with a hard daily budget so it cannot overrun; static checks work without it.

## Log

- 20:30 Six agents running: research-eu, states-a/b/c, verifier, builder-core. Vojta asked for full rat-stack fence and webproai structure; builder briefed.
- 20:10 Lead started. Brief read, webproai studied, ledger format defined.
