# Task: verifier round 4: second product-text audit (lead, 21:47 CET)

Read-only except the output file. Deadline 00:30 CET.

The report was redesigned (issues first, merged cards, fix prompts, judged observations, per-state profiles, contact form). Repeat the method of `docs/product-text-audit.md` on the new text: `packages/core/src` (report, fix prompts, rendered mapping titles and descriptions, judged texts), `apps/web/src` (all views), and a live scan on https://eaacheck-website-dev-x6ihepvlvg74r7cg.vojtaholik.workers.dev (pick a site that lets us in, e.g. wikipedia.org or otto.de). Extra focus:
- Fix prompts: do they state anything normative beyond the SC/clause facts? Do they ask for anything unsafe?
- State profiles: every value shown matches its verified fact; unknowns read "unknown"; no value from an unverified fact.
- Judged observations: labelled as a model's judgement, never "issue", never counted, hidden checks really hidden.
- Axe rule titles and help texts (from axe) that we show: any that overclaim ("must", "ensure compliance")? axe text is not a fact; flag where we present it as normative.
Write `docs/product-text-audit-2.md`, defects first with file:line and fix, and send the lead the path and counts.
