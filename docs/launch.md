# Launch readiness

Audit by writer on 2026-11-05 at `ed34008` plus the launch commit. Each item is **done** (checked, or fixed in the launch commit) or **needs Vojta** (his account, his name or his decision). Proposals are marked as such.

## Packaging

| Item | Status |
| --- | --- |
| Root `README.md` for the public: what good-a11y is, the agent prompt, four install routes, "If you are an agent", the CLI, what the checker does and does not claim, working on the repo. Modelled on good-css | **done** |
| `apps/good-a11y/README.md` for the npm page; `files` lists `bundle`, `README.md`, `LICENSE`. `npm pack --dry-run` ships exactly those plus `package.json` | **done** |
| `.claude-plugin/plugin.json` (no version, like good-css) and `marketplace.json`. The marketplace entry lists `skills: ["./skills/good-a11y"]`, so only that skill loads: a plugin's own `skills` field adds to the default `skills/` scan, which would also load the seven repo-internal skills. `claude plugin validate .` passes; a local `marketplace add ./` plus `install` shows one skill | **done** |
| skills.sh: the seven repo-internal skills in `skills/` carry `metadata.internal: true`. `skills@1.7.6 add <repo> --list` finds only `good-a11y`. `skills/good-a11y/README.md`, which held stale `github:` install lines, is removed; the routes live in the root README | **done** |
| Plugin icon. The plugin directory warns without one (a square PNG, 512 to 2048 px, at `.claude-plugin/icon.png`). Vojta, 2026-11-06: launch without it | **done** |
| `good-a11y@0.2.0` on npm: `latest` since 2026-11-05 14:20 UTC, and the site, `skill.md` and both READMEs pin it | **done** |
| `good-a11y@0.0.0-stage` on npm: deprecated by Vojta on 2026-11-06 with "Use good-a11y@latest" | **done** |

## Public-repo hygiene

| Item | Status |
| --- | --- |
| Secrets. Tracked files and all 226 commits searched for GitHub, OpenAI, AWS, Slack and private-key patterns and API-token assignments: none. The only env file ever added is `.env.schema` | **done** |
| Absolute paths. Seven `.brain/tasks/*.md` named `/Users/vojta/...`; they now say "this repository". `evals/run/test/leftovers.test.ts` keeps `/Users/me/...`, a made-up path in test input | **done** |
| Private names and emails in files. The emails in the tree are placeholders (`name@example.com`), public contact addresses of authorities and shops in recorded scan fixtures, and one licence comment in the bundle. No private address | **done** |
| Commit author email. The commits carry `vojta@egghead.io`, public with the repo. Vojta, 2026-11-06: keep it | **done** |
| Design files. `design/` and `.impeccable/` are ignored; the one tracked file, `.impeccable/config.json`, is a detector ignore rule. No design export is tracked | **done** |
| Working notes go public with the repo: `.brain/` (briefs and decision ledgers, which name the registrar team), `BRIEF.md`, `REPORT.md`, and the dev stage's workers.dev URLs in `docs/`. Nothing in them is a secret; the scanner's own workers.dev URL is off (`docs/review.md` R1). Vojta, 2026-11-06: they stay public | **done** |
| Repo visibility. `vojtaholik/good-a11y` is public, which the skills.sh badge, `npx skills add`, the plugin marketplace and the README links need | **done** |

## Licence and provenance

| Item | Status |
| --- | --- |
| `LICENSE` held only the template's "Copyright (c) 2026 Joel Hooks". It now names Vojta Holík and keeps Joel Hooks for the rat-stack template, as MIT requires. A copy ships in the npm package | **done**, Vojta to confirm the holder name |
| The npm bundle inlines 23 packages (MIT, BSD-2-Clause, ISC, Apache-2.0) plus axe-core (MPL-2.0) with no notices. `pnpm good-a11y:bundle` now writes `bundle/THIRD-PARTY-LICENSES.md` from the esbuild metafile, with each package's licence and notice files, and it ships in the package. The `redis` packages it lists are pulled in by `@effect/platform-node-shared` and ship no licence file; their manifests say MIT | **done** |
| `PROVENANCE.md` gains rows for `puppeteer-core` and `playwright` (Apache-2.0, dependencies of the npm package), `@puppeteer/browsers` (development only), and `guides/`: written from W3C sources, with `badass-courses/a11y-agent` (Apache-2.0) read as seed material. Measured overlap: 68 of 30,761 ten-word runs (0.22%), all standard ARIA markup | **done** |
| GitHub detects the MIT licence | **done** |

## GitHub repo

| Item | Status |
| --- | --- |
| Description, homepage and topics. Set by the lead: "Accessibility guides for coding agents, each with a live demo, and a checker that finds accessibility issues on a page.", `https://good-a11y.com`, `a11y`, `accessibility`, `agent-skills`, `coding-agents`, `wcag` | **done** |

## Site

| Item | Status |
| --- | --- |
| About page text (written 2026-11-04 by check): names Vojta as maker, makes no claim about screen-reader testing. Approved by Vojta as is on 2026-11-06; live at `/about`, linked from the header, the footer, the sitemap and `llms.txt` | **done** |
| Organization schema. is-agentic's `org-schema-completeness` wants `contactPoint` with an email or phone and a postal `address`. Vojta decided on 2026-11-06: no `Organization` schema | **done** (dropped) |
| Contact. `CONTACT_SHOWN` is off (decision 2), so `/contact` answers 404 and removal requests go through a public GitHub issue. Vojta decided on 2026-11-06: contact stays hidden | **done** |
| is-agentic on prod: **97** (scan 2026-11-04T13:19Z). Open: `org-schema-completeness`, `trust-anchors` (About, Contact and Privacy of 500+ characters; Contact is hidden), `brand-search-accuracy` (the domain does not rank yet). The first two stay open by Vojta's 2026-11-06 decision (no Organization schema, no Contact); the third waits on launch traffic | **accepted** |

## Launch blurb (proposal)

> good-a11y gives your coding agent a short accessibility guide before it builds a dialog, a form or a menu, then checks the page it built. In our evals, Claude Code and Codex built the patterns we guide far more often right when they read the guide first. Open source, with 25 guides, each with a live demo, at good-a11y.com.

The eval claim rests on the matrices in `docs/evals.md`, 3 runs per base app and arm: a guide ships for an agent only where that agent failed it unguided, and the guided arm then passes 5 or 6 of 6 for the agent it ships for (for example form-errors-validation: 0 of 6 unguided, 6 of 6 guided, for both agents).
