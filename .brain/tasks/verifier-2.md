# Task: verifier, round 2: product-text audit (lead, 20:52 CET)

Read-only. Deadline ~00:20 CET, no questions; best call.

Audit every user-visible string that makes a legal or normative claim, in `packages/core/src` (report text, check titles and "what fails" descriptions, disclaimer, CTA), `apps/cli/src`, `apps/web/src`. Also scan the live page https://eaacheck-website-dev-x6ihepvlvg74r7cg.vojtaholik.workers.dev with one URL (e.g. wikipedia.org) and read the report.

For each claim, decide: (a) traced to a verified fact the code actually reads (name the fact ID), (b) hard-coded text that states a legal/normative claim without a fact (a defect), (c) not a legal/normative claim (fine). Also flag: any wording that implies compliance or a clean bill of health; any check description that misstates its WCAG SC (compare with the STD-SC excerpt); "unknown" states shown as applying; WCAG 2.2-only content not labelled upcoming.

Write findings to `docs/product-text-audit.md` (defects first, each with file:line, the text, why, suggested fix) and send the lead the path and a one-line count. Do not edit code.
