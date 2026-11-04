# Round 2, common rules (lead, 2026-11-04)

Read `AGENTS.md`, `VISION.md`, `.brain/projects/eaa-checker/eaa-checker-brief.svx` (decisions 25-29 are this round), `REPORT.md`, `research/facts/README.md` and the docs your task names. Vojta said "lets build it all"; no questions to him. Make the best call, record it in your doc, tell the lead (`hc send t1t ...`) at each milestone and when blocked.

- Commit and push yourself when the whole gate is green (`pnpm facts` if the ledger changed, stage only your files, message ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, never bypass hooks). Five agents share this tree: research-2, verifier-5, builder-core, builder-cloud, builder-judge. Before touching another agent's files, root config, or running `pnpm install`, `hc send` the owner.
- Deploys: only builder-cloud deploys stage dev (`pnpm exec varlock run -- pnpm --filter @eaa-check/infra exec alchemy deploy --stage dev --yes --no-input`); others ask it.
- Before Effect/XState code read `packages/core/node_modules/effect/AGENTS.md`. UI work loads `foldkit-skills:foldkit` and runs `foldkit-skills:audit-program` before calling it done.
- Every legal or normative text traces to a verified fact. A finding comes only from a deterministic check. Model output is a judged observation, shown only when calibrated (precision >= 0.9 on >= 30 real hand-labelled items), never counted.
- Grow in layers: each step lands working, tested, deployed before the next.
