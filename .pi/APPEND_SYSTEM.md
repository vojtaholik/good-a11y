# Project context

Pi appends this file to its system prompt for sessions in this repo.

- Repo law lives in `AGENTS.md`; product intent in `VISION.md`. Read both before substantial work.
- eaa-check is an EU accessibility (EAA) checker on rat-stack, built the same way as webproai. A visitor pastes a URL; deterministic checks report findings against Directive (EU) 2019/882 and EN 301 549 (WCAG), per EU member state. It sells web and accessibility work for studio9. English UI first.
- The working brief and decision ledger: `.brain/projects/eaa-checker/eaa-checker-brief.svx`. Durable status: `REPORT.md`.
- The overriding rule: every legal and normative claim traces to a `verified` fact in `research/facts/` (format in `research/facts/README.md`). Gaps show "unknown". The report never says a site is "compliant" and states that automated checks catch only part of WCAG.
- webproai (`~/Developer/vojtaholik/webproai`) is read-only reference; reuse by copying.
- Validation gate: `pnpm turbo run check test build`. Lefthook runs `pnpm check` and `pnpm test` on commit; CI runs the full gate on a cold cache.
- Domain terms: a **capability** (`defineContract` plus `implement`) is one named, schema-typed behavior; a **projection** (`packages/capability`) turns capabilities into a CLI command or an RPC group; a **fact** is one sourced claim in the ledger; a **check** is a pure function from page evidence to findings, mapped to WCAG SC and EN 301 549 clause facts; the **fence** is the type-aware lint, Effect language-service diagnostics, and hooks that make bypasses fail loudly.
- Active constraint: `xstate` and `@xstate/effect` are alpha pins (`6.0.0-alpha.63`, `0.1.0-alpha.6`) with matching `minimumReleaseAgeExclude` entries; bump them together, and read `vendor/README.md` before vendoring anything.

## Brain procedures

`.brain/` is the agent-connected project brain (PARA: projects, areas, resources, archives).

- Organize by usefulness: ask where this will be useful next.
- Keep notes atomic, linked, source-grounded, authored as `.svx`.
- Capture only durable decisions, terms, tradeoffs, gotchas, sources, questions, and review feedback.
- Express knowledge as code, docs, decisions, UI, issues, or plans. Storage is not the goal; output is.
