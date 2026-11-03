# Brief: EU accessibility (EAA) checker

From Vojta, relayed by his orchestrating agent on 2026-11-03. You lead this build tonight.

## The product

A visitor pastes a URL. The checker scans the public page and reports how it stands against the
European Accessibility Act (Directive (EU) 2019/882) and the standard it points to (EN 301 549,
which pulls in WCAG 2.1 AA for web content). It covers every EU member state, because large
e-commerce sites sell in many countries. For each finding, show which member states it applies
in. Small country flags beside a rule are welcome where they help a reader see the spread.

It sells web and accessibility work for Vojta's studio (studio9). The report ends with a contact
call to action. Treat the exact wording as a placeholder for Vojta to review.

## The rule that overrides everything: every claim is sourced

Every legal and normative claim in the product must trace to a primary source: EUR-Lex, a member
state's official journal or ministry, ETSI for EN 301 549, W3C for WCAG.

- Keep a facts ledger in the repo (for example `research/facts/*.md`). For each fact record:
  the claim, the source URL, a short verbatim excerpt, the date retrieved, and which product text
  depends on it.
- Per member state: the transposing law and its identifier, the date it applies, who is in scope
  (products, services, e-commerce), exemptions (microenterprises, disproportionate burden),
  the enforcement or market-surveillance body, and penalties where the law states them.
- Where a source can't be found or is ambiguous, mark it **unknown**. Never fill a gap.
  The product shows "unknown" or leaves the claim out.
- A second agent verifies every fact against its source before product text uses it. Rejected
  facts go back, never into the UI.
- Automated checks catch only part of WCAG. The report must say so plainly and must never claim
  a site is "compliant".

## Infrastructure

Same stack as Vojta's AI-readiness scanner at `~/Developer/vojtaholik/webproai`, built on
rat-stack: Effect, XState inside a Cloudflare Workflow, Alchemy for the cloud. Read its
`AGENTS.md`, `VISION.md`, `README.md` and `.brain/` first, and reuse its patterns and packages
where they fit, such as `http-transport`, `html-reader` and `scan-store`. Do not modify the
webproai repo. Copy or vendor what you need into this repo.

The checks are deterministic, the same way webproai's score is. For rendered-DOM checks,
investigate axe-core on Cloudflare Browser Rendering, and record the decision with its
reasoning. Map every check to its WCAG success criterion and EN 301 549 clause, from the ledger.

## How to work

- Start a `.brain/` for this repo the way webproai has one, with a working brief and a decision
  ledger. Write decisions down as you make them.
- Orchestrate with hc (`hc --skill`). You may start child agents, about 6 at once at most. A
  sensible split: several research agents, each owning a group of member states plus one for
  the directive and EN 301 549/WCAG; one fact verifier; implementers on separate packages; a
  reviewer at the end. Give each child a narrow scope and have it report to you with `hc send`.
- Grow in layers. The first goal is a thin slice that works end to end: CLI scan → checks →
  report, then the Workflow, then a bare page. A working product beats unfinished breadth.
- English UI first. Record whether Czech or other languages come later.

## Limits

- You may create a **private** GitHub repo under `vojtaholik` and push to it.
- You may deploy to a non-production stage with the Cloudflare account webproai already uses.
  Do not buy domains, deploy to a production domain, or touch other projects' resources.
- No paid services beyond what webproai already uses. Keep model spending small.
- Never enter credentials anywhere. If something needs Vojta, write it under "Needs Vojta" in
  `REPORT.md` and keep going on other work.

## Reporting

Keep `REPORT.md` current: what works, the deploy URL, the facts ledger's coverage (states done
or unknown), open decisions, and "Needs Vojta". Send short milestone notes to the orchestrator
with `hc send t1r "..."` when it is reachable. If it is gone, `REPORT.md` is the record.
