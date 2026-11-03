# Product text audit (verifier, round 2)

Date: 2026-11-03, about 21:40 CET. Read-only audit of every user-visible string that makes a legal or normative claim, in `packages/core/src`, `apps/cli/src` and `apps/web/src`, against the verified ledger in `research/facts/`. Line numbers are from the working tree at audit time.

Live page: the scan form on https://eaacheck-website-dev-x6ihepvlvg74r7cg.vojtaholik.workers.dev crashed on submit, twice (see D1). The report audited is therefore the CLI report from `pnpm cli scan wikipedia.org` (2026-11-03T19:39:49Z), plus a reading of `apps/web/src/features/report-view.ts`, which renders the same `Report` value.

Summary: 8 defects (1 blocker, 4 medium, 3 low), 0 compliance wording, 0 misstated WCAG SC, 0 unknown states shown as applying, 0 unlabelled WCAG 2.2-only content.

## Defects

### D1 (blocker, not text) Live scan crashes the page

- Where: deployed dev Worker, scan submit with `wikipedia.org`.
- Text shown: "Application Crash ... The scan store failed during begin. Check the D1 binding and that its migrations ran." followed by the Foldkit default crash view.
- Why: no report can be read on the live page, and a visitor sees a developer crash screen with an internal hint. Reproduced twice after a reload.
- Fix: check the D1 binding and run the scan-store migrations on the dev stage. Separately, map a store failure to the normal "The scan failed." state instead of the default crash view.

### D2 (medium) TODO placeholder reaches users in the call to action

- Where: `packages/core/src/report.ts:28-32` (`CONTACT_TEXT`, `BLOCKED_CONTACT_TEXT`), rendered by `packages/core/src/report-text.ts:90` and `apps/web/src/features/report-view.ts:137`.
- Text: "TODO(Vojta): wording. studio9 can review this page by hand, explain what the findings mean for your site, and fix them. Get in touch with studio9."
- Why: not a legal claim, but it is printed verbatim at the end of every report on both surfaces. `contact.placeholder: true` exists in the schema and no surface reads it.
- Fix: Vojta writes the CTA; until then, have both surfaces hide the contact block while `contact.placeholder` is true.

### D3 (medium) Web shows the Official Journal fact without its subject

- Where: `apps/web/src/features/report-view.ts:122-124`.
- Text shown: "Not found as of 2026-10-30" (the value of EU-HS-1), alone in a paragraph.
- Why: a legal fact shown without saying what was not found. The CLI labels it ("Official Journal citation of EN 301 549 under the EAA:", `report-text.ts:72-75`); the web drops the label. The benchmark line at `report-view.ts:165-167` has the same shape but its value is self-describing.
- Fix: render the same label as the CLI: "Official Journal citation of EN 301 549 under the EAA: Not found as of 2026-10-30".

### D4 (medium) "Applies in" ignores the microenterprise exemption

- Where: `packages/core/src/applicability.ts:22-31`, rendered at `report-text.ts:37` ("Applies in (25): ...") and `report-view.ts:53` ("Applies in: ...").
- Why: the line says a failing finding applies in 25 member states, with no qualifier. EU-MICRO-1 (verified) says microenterprises providing services are exempt from the service accessibility requirements, and most state profiles hold a verified micro exemption too. For a shop run by a microenterprise the claim is wrong. The rule in AGENTS.md ("A finding applies in a member state when ...") is followed; the defect is that the shown text reads as unconditional.
- Fix: keep the rule, and add one sourced line under the states: the value of EU-MICRO-1 with its fact ID, for example "Microenterprises providing services are exempt (EU-MICRO-1)". Or rename the label to "The EAA covers e-commerce services in:".

### D5 (medium) NL and SK shown as unknown although e-commerce scope is verified

- Where: `packages/core/src/applicability.ts:20,28` (exact match on `"yes"`), data in `research/facts/states/nl.md` (NL-ECOMMERCE-1) and `research/facts/states/sk.md` (SK-ECOMMERCE-1).
- Values: NL-ECOMMERCE-1 = "yes (Art. 6:230fb Burgerlijk Wetboek)", SK-ECOMMERCE-1 = "yes, as information society services (Act 22/2004 Coll.)". Both verified, as are NL-LAW-1 and SK-LAW-1.
- Why: the report says "Unknown (2): NL SK". This errs on the safe side, so it is not a law breach, but it is wrong data on a legal claim.
- Fix: in the ledger, set both values to exactly `yes` and move the detail into the claim (researcher edit, then re-verify). Keep the strict match in code.

### D6 (low) "Upcoming" / "next version" for EN 301 549 V4.1.1 has no fact

- Where: `packages/core/src/report-text.ts:13` ("Upcoming (EN 301 549 V4.1.1)"), `apps/web/src/features/report-view.ts:24` ("EN 301 549, next version").
- Why: hard-coded normative framing. The ledger supports "V4.1.1 is the latest published version" (STD-EN-3) and "presumption of conformity needs an OJ citation" (STD-EN-9), and that no citation was found (EU-HS-1). Nothing verifies that V4.1.1 will become the cited version, which "upcoming" implies. The label is gated correctly (shown only while the reference version is V3.2.1).
- Fix: "EN 301 549 V4.1.1 (published, not cited in the OJ)", backed by STD-EN-3 and EU-HS-1.

### D7 (low) Home heading says the page is checked against the EU rules

- Where: `apps/web/src/features/view.ts:30`.
- Text: "Check one page against the EU accessibility rules".
- Why: implies a test against the law. The checks test 9 static-HTML patterns against WCAG criteria; the report itself says it "does not show whether the page meets the European Accessibility Act". The heading and the disclaimer contradict each other.
- Fix: "Run automated accessibility checks on one page" or "Find accessibility issues on one page". The intro paragraph at `view.ts:34` is accurate and can stay.

### D8 (low) "Form fields have a label" passes placeholder-only fields

- Where: `packages/core/src/checks/form-labels.ts:19-21`, `packages/html-reader/src/read-page.ts:284`.
- Text: title "Form fields have a label"; what fails: "... has no <label>, aria-label, aria-labelledby, title or placeholder."
- Why: a placeholder gives a field an accessible name, so the 4.1.2 mapping (STD-SC-4.1.2) holds and the description is honest. But the title says "label", and a field with only a placeholder passes under that title. A reader can take "no issue found" as "every field is labelled".
- Fix: title "Form fields have an accessible name". No catalogue change needed.

## Notes (no change required)

- `link-name` maps to 2.4.4 Link Purpose (In Context) (STD-SC-2.4.4) but only tests that a link has a name. Not a misstatement, since the coverage line says the checks touch criteria "only partly", but a pass does not mean 2.4.4 is met.
- The web reference label is "WCAG" (`report-view.ts:25`) while the CLI says "WCAG 2.1" (`report-text.ts:14`). Each STD-SC value carries its level but not the WCAG version; consider "WCAG 2.1" on the web too.
- The disclaimer (`report.ts:25-26`) is hard-coded text with STD-AUTO-1 attached. The fact supports "automated tools cannot check all of accessibility; human judgement is required"; the rest of the text is the disclaimer AGENTS.md requires. Accepted.

## Traced to verified facts (a)

| Text | Where | Fact |
| --- | --- | --- |
| Each WCAG SC line, for example "3.1.1 Language of Page (Level A)" | `report.ts:115-120` via `verifiedText` | STD-SC-3.1.1, 2.4.2, 1.1.1, 1.3.1, 4.1.2, 2.4.4, 1.4.4, 2.2.1 |
| EN 301 549 clause lines | `report.ts:115-120` | STD-EN-9.x and STD-EN4-9.x for the same SC |
| "What the EAA requires" lines | `reference.ts:53-60` | EU-ANNEX-1, EU-ANNEX-4 |
| Reference benchmark | `reference.ts:32-35,51` | STD-EN-5 (V3.2.1 while no V4.1.1 citation) |
| Official Journal citation | `reference.ts:52` | EU-HS-1 |
| Coverage line "touch 8 of the 50 WCAG 2.1 Level A and AA success criteria" | `coverage.ts:52` | count of verified STD-SC-x.y.z facts (50; 30 Level A, 20 Level AA per their values) |
| Applies in / Unknown member states | `applicability.ts:22-31` | each state's `transposing-law` and `scope-ecommerce` facts; unknown otherwise |
| Disclaimer | `report.ts:25-26,184-187` | STD-AUTO-1 |

Every SC a check maps to is verified, each check's "what fails" text describes a real failure of the mapped SC, and no WCAG 2.2-only criterion is in the catalogue. V4.1.1 clauses appear only under the "Upcoming" label (see D6).

## Not legal or normative claims (c)

Check titles and "what fails" texts other than D8; the status marks ("issue found", "no issue found", "nothing to check"); headlines (`report.ts:34-41,163-165`), including "found no issues of the kinds they look for", which avoids a clean bill of health; fetch, refusal, challenge, redirect, timeout, cap and target-rejected errors (`safe-fetch.ts`, `refusal.ts`, `challenge.ts`, `daily-cap-reached.ts`, `scan-target-rejected.ts`, `scan.ts:28,80,94-95`); truncation notices; CLI description "EU accessibility (EAA) checker for public web pages" (`apps/cli/src/command.ts:18`); contract description (`contracts.ts:14,18`); web titles and status lines (`view.ts:16,34,76-78`, `report-view.ts:188-214`).

No string says "compliant", "compliance" or "compliance score", and no state with an unknown field is shown as applying.
