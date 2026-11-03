# Layer 1: CLI scan, checks, report

Built 2026-11-03 by the builder-core agent. `pnpm cli scan <url>` fetches one public page, runs ten deterministic checks over its HTML, and prints a report mapped to WCAG 2.1 and EN 301 549 from verified facts, with the member states where each finding applies. `--json` prints the schema-encoded `Report`.

## What was built

| Package | What it does |
| --- | --- |
| `packages/facts` | Parses `research/facts/**/*.md` against the exact format in `research/facts/README.md`. `pnpm facts` writes `src/ledger.generated.ts`, which holds verified facts only. Exposes `verifiedFact(id)`, `VERIFIED_FACTS`, `MEMBER_STATES` and `STATE_PROFILES` (27 states, each field `{ value, factId, source }` or unknown) |
| `packages/core` | The `scan` capability, `SafeFetch`, the `PageReader` port, `PageEvidence`, ten checks, the catalogue, applicability, the reference benchmark, the report and its text rendering |
| `packages/html-reader` | `PageReader` adapter: one pass over the `htmlparser2` tokenizer, no tree |
| `packages/http-transport` | `HopTransport` adapter, unchanged from webproai |
| `apps/cli` | The `eaa-check` bin; one command per capability |

### Checks

Each is a pure function of `PageEvidence` and reports `pass`, `fail` or `not_applicable` with the number checked, the number failing, and up to five snippets of failing elements.

| Check | WCAG 2.1 SC | Fails when |
| --- | --- | --- |
| `html-lang` | 3.1.1 | `<html>` has no `lang`, or it is not a well-formed BCP 47 tag (RFC 5646 grammar; primary subtag of 2 or 3 letters, `x-` private use, `i-` grandfathered). `en_US`, `english` and `en-a` fail |
| `document-title` | 2.4.2 | No `<title>`, or it is empty |
| `image-alt` | 1.1.1 | An `<img>` has no `alt`, no ARIA name, no `title` and no presentational role; an image button has no text |
| `form-labels` (title "Form fields have an accessible name") | 1.3.1, 4.1.2 | A field has no `<label>` (wrapping or `for`), `aria-label`, `aria-labelledby`, `title` or `placeholder` |
| `link-name` | 2.4.4, 4.1.2 | An `<a href>` has no text, no image alt inside, no ARIA name and no `title` |
| `button-name` | 4.1.2 | A button has no text, no image alt inside, no ARIA name and no `title`; an `<input type=button>` has no value |
| `frame-title` | 4.1.2 | An `<iframe>` or `<frame>` has no `title` or ARIA name |
| `meta-viewport-zoom` | 1.4.4 | The viewport sets `user-scalable=no` or a `maximum-scale` below 2 |
| `meta-refresh` | 2.2.1 | A refresh meta tag has a delay above 0 |
| `autocomplete-valid` | 1.3.5 | A field's `autocomplete` is not a valid autofill token list (W3C ACT rule 73f2c2). Skipped: lone `on`/`off`, empty, disabled or `aria-disabled`, checkbox, radio, file, negative `tabindex`, hidden. Fails only on token grammar and unknown field names; whether the field name suits the control type is not judged, so it fails a subset of what ACT fails. A field inside a disabled `<fieldset>` is still judged |

Elements under `hidden`, `aria-hidden="true"`, `<template>` or `<noscript>` are skipped. Text inside `<script>` and `<style>` is never a name. The rules lean towards fewer false failures: `placeholder` and `title` count as a name, and `aria-labelledby` counts when it is filled, without resolving the IDs it points to.

### Report

- The page, the time, the HTTP status, and an outcome: `checked`, `refused` (bot check or refusal status), `unreachable`, or `not_html`. A page with no links, images, buttons or fields says it probably renders with JavaScript.
- What the EAA requires: every verified fact tagged `used_by: report.legal-requirement`.
- The reference benchmark (`STD-EN-5`, or `STD-EN-6` when a verified fact tagged `used_by: report.reference-standard` names V4.1.1 as cited), and the Official Journal citation line (that fact, otherwise `EU-HS-1`). Either line is left out when its fact is not verified.
- Each finding with its WCAG SC (`STD-SC-*`), the reference EN 301 549 clause (`STD-EN-9.*`), and the V4.1.1 clause (`STD-EN4-9.*`) labelled "EN 301 549 V4.1.1 (published, not cited in the OJ)". That label needs verified `STD-EN-3` and `EU-HS-1`; without them the V4.1.1 clauses are left out. A reference appears only when its fact is verified.
- For each failing finding, "The EAA covers e-commerce services in:" with the states, the microenterprise exemption (value of `EU-MICRO-1` with its ID), and the states listed as unknown.
- The fixed statement that automated checks find only part of what WCAG covers and that a manual review is needed, citing `STD-AUTO-1` when verified.
- The studio9 contact, marked `placeholder: true` until Vojta signs off the wording (tracked in `REPORT.md`).

### Tests that hold the rules

- `packages/facts/test/ledger.test.ts`: the real ledger parses (a malformed entry fails the gate) and the generated data matches it (`pnpm facts` after any ledger change).
- `packages/facts/test/parse.test.ts`: each way an entry can be malformed is refused; only verified facts are kept.
- `packages/core/test/catalogue.test.ts`: every catalogue ID exists in the ledger.
- `packages/core/test/report.test.ts`: no rendered report, text or JSON, contains "compliant" or "compliance score"; every report carries the statement; every reference shown is a verified fact with that exact text; applicability lists unknown states as unknown; the reference benchmark follows the facts.
- `packages/html-reader/test/checks.test.ts`: 73 HTML fixtures across all ten checks.
- `packages/html-reader/test/hostile.test.ts`: fifteen pathological inputs at the 2 MB cap, read and judged within 1.5 s of CPU time each; element lists stop at 5000 and say so.
- `packages/core/test/safe-fetch.test.ts`, `public-url.test.ts`: copied from webproai, they hold the fetch's hostile-URL rules.

## Copied from webproai and changed

| From | Change |
| --- | --- |
| Root config, `scripts/`, `tools/`, `skills/`, `.claude/`, `.cursor/`, `.pi/`, `.github/`, `pnpm-lock.yaml` | Scope renamed to `@eaa-check`. `minimumReleaseAgeExclude` trimmed to what is used. Oxfmt ignores `.brain/**`, `research/**`, `BRIEF.md`, `REPORT.md` (other agents write them) and the generated ledger; Oxlint ignores the generated ledger |
| `scripts/oxlint-plugin-boundaries.ts` | `no-core-adapters` also allows `packages/facts`: it is data and pure parsing, no adapter |
| `packages/core/test` fence tests | `docs-pins.test.ts` removed and the `@eaa-check/infra` case of `boundaries-rule.test.ts` dropped: both need XState and `apps/infra`, which layer 2 adds. Restore them with layer 2 |
| `packages/capability`, `packages/http-transport` | Unchanged apart from the scope |
| `safe-fetch.ts`, `public-url.ts`, `body.ts`, `challenge.ts`, `refusal.ts`, `scan-target.ts`, `fetch-result.ts`, `hop-transport.ts`, `transport-failure.ts` | Czech texts rewritten in English; `messageCs` is `reason`; `accept-language` asks for English |
| `packages/html-reader` | Package shape and tokenizer technique kept; the reader is new and reads accessibility evidence |
| `apps/cli` | Same composition; renders `formatReport`, no token counter |

## Open questions and calls made

- **DNS to private addresses.** Decided (lead, 2026-11-03): the CLI keeps the gap. `vetUrl` refuses IP literals, ports, credentials and non-public TLDs on every hop, as webproai does, but a public hostname that resolves to a private address is fetched on Node. The CLI runs on the user's own machine; on Workers, Cloudflare's fetch does not reach private networks.
- **Member state list.** Decided (lead, 2026-11-03): the 27 codes and English names stay in `packages/facts/src/member-states.ts`. The page never presents the list as a legal claim; it only labels the states facts speak about.
- **Legal requirement line.** Done: verified facts tagged `used_by: report.legal-requirement` (`EU-ANNEX-1`, `EU-ANNEX-4`) appear as "What the EAA requires" above the reference benchmark, in ID order (`Report.reference.requirements`).
- **WCAG 2.2-only checks.** None of the ten checks is WCAG 2.2-only, so nothing is labelled newer at the check level.
- **Applicability per finding.** It depends only on each state's law (transposing law and e-commerce scope), so every failing finding lists the same states. When per-criterion exemptions are in the ledger this is where they plug in.
- **First verified fact wins** when a state has two verified facts for one profile field. A verified value of `unknown` counts as unknown.
- **Stale generated data fails the gate.** Any commit that changes the ledger must include `pnpm facts`'s output. This is deliberate: a fact flipped to rejected must leave product data in the same commit.
- **No table-headers check.** Telling a data table from a layout table from static HTML is a heuristic, so a 1.3.1 header check would be noisy. Left out (lead, 2026-11-03: fewer, correct checks). Skip links (2.4.1) are left out for the same reason.
- **Rendered-DOM checks** (axe-core on Browser Rendering) are not in layer 1. Static HTML from a JavaScript-rendered shop gives little to judge, and the report says so.
- **Contact wording** is a placeholder for Vojta: `contact.placeholder` stays `true`, the visible text has no TODO prefix.
