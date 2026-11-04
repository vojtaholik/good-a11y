# Task: research-2

Read `_common-2.md` first. Researcher: you write facts with status `unverified`; verifier-5 sets status. Format and ID rules: `research/facts/README.md`. Primary sources only (CELLAR for the OJ text, w3.org for WCAG). Send `hc send verifier-5 "ready: <IDs>"` per batch.

Add to `research/facts/eu.md` and `standards.md`:
1. WCAG 2.1 conformance requirement: a page conforms at Level AA only when it satisfies all Level A and AA success criteria (w3.org/TR/WCAG21/#conformance-reqs). Check whether STD-WCAG21-1/2 already say it; if not add STD-WCAG21-3. Decision 25 depends on it: do this batch first.
2. Art. 13 (service providers: information per Annex V, publicly available in written and oral format, accessible; keep it while the service is offered), and Annex V (each point the information must contain: general description of the service in accessible formats; descriptions and explanations needed to understand how the service works; a description of how the service meets the Annex I requirements). One fact per Annex V point, field `other`, used_by `eaa.statement.<n>`.
3. Annex I Section III point (a) if missing, and split III (b), III (d) and IV (g) into one fact per sub-requirement where the product can show them as separate rows (used_by `eaa.requirement.<id>`).
4. Annex II non-binding examples for e-commerce/web, only if they help explain a row.
5. Per state, only if quick: does the transposing law require an accessibility statement for services in a specific form (e.g. CZ, DE BFSG 'Barrierefreiheitserklärung')? Record unknown otherwise. Do this last.

Report to the lead when 1-3 are verified.
