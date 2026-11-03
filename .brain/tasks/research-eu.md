# Task: research-eu

## Ground rules (all agents)

- Repo: /Users/vojta/Developer/vojtaholik/eaa-check. Read `BRIEF.md`, `.brain/projects/eaa-checker/eaa-checker-brief.svx` and `research/facts/README.md` first.
- Lead is hc terminal `t1t` (name `eaa-lead`). Report with `hc send t1t "..."` when done, when blocked, or at a meaningful milestone. Keep messages short; put long content in files and send paths.
- Do not start other agents. Do not edit files outside your scope. Do not commit; the lead commits.
- Never enter credentials. Never touch ~/Developer/vojtaholik/webproai except to read it.
- Write in plain English, no em dashes.

## Research rules

- Primary sources only: EUR-Lex, the member state official journal / legislation portal / ministry, ETSI, W3C. Secondary sources may help you find the primary one, never cite them.
- Follow the fact format in `research/facts/README.md` exactly. Set `status: unverified`. Never set verified/rejected.
- Where a source cannot be found, cannot be fetched, or is ambiguous, record `value: unknown` and explain in `claim`. Never guess. An honest unknown is a good result.
- Use `retrieved: 2026-11-03`.
- Fetch pages yourself (WebFetch / web-fetch agent / curl). Quote excerpts verbatim from what you fetched, in the original language, with an English gloss in brackets.
- When a file is complete, send to the verifier: `hc send verifier "ready: research/facts/<file>"`, and tell the lead. When the verifier rejects a fact and messages you, fix it (new source or mark unknown) and send it back.

## Task

Two files.

1. `research/facts/eu.md` (IDs `EU-...`): from Directive (EU) 2019/882 on EUR-Lex (CELEX 32019L0882): its identifier and title; transposition deadline (Art. 31(1)) and application date (Art. 31(2), 28 June 2025); scope of services incl. e-commerce services (Art. 2(2)) and the definition of e-commerce services (Art. 3); microenterprise exemption for services (Art. 4(5)) and the definition of microenterprise (Art. 3); disproportionate burden (Art. 14); transitional periods (Art. 32); the presumption of conformity with harmonised standards (Art. 15); accessibility requirements for websites/e-commerce in Annex I (Section III and IV, the relevant points); Member States to lay down penalties (Art. 30). Also the Commission implementing decision or OJ publication that lists EN 301 549 as harmonised standard for the EAA, if one exists; if none exists as of today, record that as a fact with the source showing it (or unknown).

2. `research/facts/standards.md`: EN 301 549 (ETSI, latest published version, e.g. V3.2.1 (2021-03); check whether a newer one is published on etsi.org) and WCAG 2.1 (W3C Recommendation).
   - `STD-EN-...`: EN 301 549 version, title, URL; that clause 9 applies to web pages; that clause 9 requires WCAG 2.1 Level A and AA success criteria (quote the clause).
   - For EACH WCAG 2.1 Level A and AA success criterion, one fact with ID `STD-SC-<number>` (e.g. `STD-SC-1.1.1`): claim = its number, short name and level; value = '<number> <Name> (Level X)'; source = the W3C WCAG 2.1 URL anchor for that SC; excerpt = the SC's normative sentence.
   - For each SC, the EN 301 549 clause that requires it on web pages, ID `STD-EN-9.<sc>` (e.g. `STD-EN-9.1.1.1` for SC 1.1.1): value = 'EN 301 549 clause 9.1.1.1'; source = the ETSI PDF; excerpt = the clause heading/text.
   - A fact for the W3C statement that automated tools cannot check all of WCAG, if W3C says so in a normative or official W3C/WAI page (e.g. WAI 'Selecting Web Accessibility Evaluation Tools'), ID `STD-AUTO-1`.
   The builder will reference `STD-SC-*` and `STD-EN-9.*` IDs from its check catalogue, so produce those first and tell the lead when the SC/EN set is written (before the rest of eu.md if that is faster).
   Send each file to the verifier when complete.
