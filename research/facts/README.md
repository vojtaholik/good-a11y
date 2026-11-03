# Facts ledger

Every legal and normative claim the product makes traces to a fact here, and every fact to a
primary source: EUR-Lex, a member state's official journal or ministry, ETSI (EN 301 549), W3C (WCAG).
Secondary sources (law-firm blogs, overlays' marketing, AccessibleEU summaries) may point you to
a primary source but are never the source of a fact.

## Files

- `eu.md` – Directive (EU) 2019/882 (EAA): scope, dates, exemptions, definitions.
- `standards.md` – EN 301 549 (ETSI) and WCAG 2.1 (W3C): which clauses and success criteria apply to web.
- `states/<cc>.md` – one file per member state, ISO 3166-1 alpha-2 lowercase (`at.md`, `be.md`, ... `gr.md` for Greece).

## Fact format (machine-read by tests – keep it exact)

Each fact is a level-3 heading with its ID, followed by these bullets, in this order:

```md
### AT-SCOPE-1
- claim: Austria transposed the EAA with the Barrierefreiheitsgesetz (BaFG), BGBl. I Nr. 76/2023.
- field: transposing-law
- value: Barrierefreiheitsgesetz (BaFG), BGBl. I Nr. 76/2023
- source: https://www.ris.bka.gv.at/...
- excerpt: "short verbatim quote from the source, original language"
- retrieved: 2026-11-03
- used_by: states.at.law
- status: unverified
- verifier_note:
```

Rules:

- ID: `<CC or EU or STD>-<FIELD-SHORT>-<n>`, unique across the ledger.
- `field` (states): one of `transposing-law`, `applies-from`, `scope-products`, `scope-services`,
  `scope-ecommerce`, `microenterprise-exemption`, `disproportionate-burden`, `authority`, `penalties`, `other`.
- `value`: the short value the product would show. If the source cannot be found or is ambiguous,
  write `value: unknown` and say why in `claim`. Never fill a gap with a guess.
- `excerpt`: verbatim, original language, under ~300 characters. Add an English gloss in brackets if not English.
- `source`: a primary source URL (official journal, ministry, legislation portal, EUR-Lex, ETSI, W3C).
- `status`: `unverified` (researcher), then `verified` or `rejected` (set only by the verifier).
- `verifier_note`: the verifier's reason, required on `rejected`.
- `used_by`: the product data key(s) that depend on the fact, or `none`.

Only `verified` facts may reach product text. A test enforces it.
