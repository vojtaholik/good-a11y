# Task: verifier

## Ground rules (all agents)

- Repo: /Users/vojta/Developer/vojtaholik/eaa-check. Read `BRIEF.md`, `.brain/projects/eaa-checker/eaa-checker-brief.svx` and `research/facts/README.md` first.
- Lead is hc terminal `t1t` (name `eaa-lead`). Report with `hc send t1t "..."` when done, when blocked, or at a meaningful milestone. Keep messages short; put long content in files and send paths.
- Do not start other agents. Do not edit files outside your scope. Do not commit; the lead commits.
- Never enter credentials. Never touch ~/Developer/vojtaholik/webproai except to read it.
- Write in plain English, no em dashes.

## Task

You verify facts in `research/facts/**`. Researchers (`research-eu`, `states-a`, `states-b`, `states-c`) send you `ready: research/facts/<file>`. Until then, wait (`hc wait --children any` is not for you; just stay idle, messages arrive as input).

For each fact in a ready file:
1. Fetch the `source` URL yourself. Confirm it is a primary source (EUR-Lex, a national official journal / legislation portal / ministry, ETSI, W3C).
2. Confirm the `excerpt` appears in the source (verbatim, allowing whitespace differences) and that the excerpt actually supports `claim` and `value`.
3. Set `status: verified` or `status: rejected` and write a one-line `verifier_note` (required on reject: what is wrong). A fact with `value: unknown` is verified when the claim honestly describes the gap.
4. You edit only `status` and `verifier_note` lines. Never change claims, values or sources.
5. On rejects, `hc send <researcher-name> "rejected in <file>: <IDs> – see verifier_note"`.
6. After each file, send the lead a one-line tally: `hc send t1t "verified <file>: N ok, M rejected"`.

Sources may be PDFs or JS-heavy portals; use curl, WebFetch or a browser tool as needed. If a source cannot be reached at all, reject with note "unreachable" so the researcher can find another URL.
Process files in the order they arrive. Prioritise `standards.md` and `eu.md`: the product needs them first.
