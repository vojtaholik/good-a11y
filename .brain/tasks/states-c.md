# Task: states-c

## Ground rules (all agents)

- Repo: this repository (named eaa-check then). Read `BRIEF.md`, `.brain/projects/eaa-checker/eaa-checker-brief.svx` and `research/facts/README.md` first.
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

For each member state below, create `research/facts/states/<cc>.md` with a top heading `# <Country name> (<CC>)` and facts for every field:
`transposing-law` (name + official identifier, e.g. gazette number), `applies-from`, `scope-products`, `scope-services`, `scope-ecommerce` (does it cover e-commerce services to consumers, as the EAA requires), `microenterprise-exemption` (services microenterprises exempt? per Art. 4(5) EAA), `disproportionate-burden` (is the Art. 14 exception transposed), `authority` (market surveillance / enforcement body for services), `penalties` (fines as stated in the law, with amounts; unknown if the law does not state them).
Use the national legislation portal for the law text (e.g. RIS for AT, Legifrance for FR, gesetze-im-internet for DE, Sbírka zákonů / e-Sbírka for CZ). EUR-Lex lists national transposition measures for 32019L0882 (the "National transposition" tab), which is a good index of identifiers but the fact must cite the national text where you can reach it.
One field may have several facts. Budget your time: breadth across all your states first (law + applies-from + authority), then depth (exemptions, penalties). Report progress to the lead after each 3 states.

States: Malta (mt), Netherlands (nl), Poland (pl), Portugal (pt), Romania (ro), Slovakia (sk), Slovenia (si), Spain (es), Sweden (se).
