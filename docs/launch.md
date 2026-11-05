# Launch readiness

Audit by writer on 2026-11-05 at `ed34008` plus the launch commit. Each item is **done** (checked, or fixed in the launch commit) or **needs Vojta** (his account, his name or his decision). Proposals are marked as such.

## Packaging

| Item | Status |
| --- | --- |
| Root `README.md` for the public: what good-a11y is, the agent prompt, four install routes, "If you are an agent", the CLI, what the checker does and does not claim, working on the repo. Modelled on good-css | **done** |
| `apps/good-a11y/README.md` for the npm page; `files` lists `bundle`, `README.md`, `LICENSE`. `npm pack --dry-run` ships exactly those plus `package.json` | **done** |
| `.claude-plugin/plugin.json` (no version, like good-css) and `marketplace.json`. The marketplace entry lists `skills: ["./skills/good-a11y"]`, so only that skill loads: a plugin's own `skills` field adds to the default `skills/` scan, which would also load the seven repo-internal skills. `claude plugin validate .` passes; a local `marketplace add ./` plus `install` shows one skill | **done** |
| skills.sh: the seven repo-internal skills in `skills/` carry `metadata.internal: true`. `skills@1.7.6 add <repo> --list` finds only `good-a11y`. `skills/good-a11y/README.md`, which held stale `github:` install lines, is removed; the routes live in the root README | **done** |
| Plugin icon. The plugin directory warns without one: a square PNG, 512 to 2048 px, at `.claude-plugin/icon.png`. It is fixed at the first directory submission, so it should be the final mark | **needs Vojta** |
| `good-a11y@0.2.0` on npm. The site, `skill.md` and both READMEs pin it; npm has `0.0.0-stage` and `0.1.0`, `latest` is `0.1.0`. Publish before the next prod deploy, or every copied agent prompt fails at `npx` | **needs Vojta** |
| `good-a11y@0.0.0-stage` on npm. Proposal: `npm deprecate good-a11y@0.0.0-stage "Use good-a11y@latest"`. It needs the npm owner's login | **needs Vojta** |

## Public-repo hygiene

| Item | Status |
| --- | --- |
| Secrets. Tracked files and all 226 commits searched for GitHub, OpenAI, AWS, Slack and private-key patterns and API-token assignments: none. The only env file ever added is `.env.schema` | **done** |
| Absolute paths. Seven `.brain/tasks/*.md` named `/Users/vojta/...`; they now say "this repository". `evals/run/test/leftovers.test.ts` keeps `/Users/me/...`, a made-up path in test input | **done** |
| Private names and emails in files. The emails in the tree are placeholders (`name@example.com`), public contact addresses of authorities and shops in recorded scan fixtures, and one licence comment in the bundle. No private address | **done** |
| Commit author email. All 226 commits carry `vojta@egghead.io`, which becomes public with the repo. Keep it, or rewrite history before the repo goes public | **needs Vojta** |
| Design files. `design/` and `.impeccable/` are ignored; the one tracked file, `.impeccable/config.json`, is a detector ignore rule. No design export is tracked | **done** |
| Working notes go public with the repo: `.brain/` (briefs and decision ledgers, which name the registrar team), `BRIEF.md`, `REPORT.md`, and the dev stage's workers.dev URLs in `docs/`. Nothing in them is a secret; the scanner's own workers.dev URL is off (`docs/review.md` R1). Proposal: keep them, they are how the repo is built | **needs Vojta** |
| Repo visibility. `vojtaholik/good-a11y` is private. The skills.sh badge, `npx skills add`, the plugin marketplace and the README links all need it public | **needs Vojta** |

## Licence and provenance

| Item | Status |
| --- | --- |
| `LICENSE` held only the template's "Copyright (c) 2026 Joel Hooks". It now names Vojta Holík and keeps Joel Hooks for the rat-stack template, as MIT requires. A copy ships in the npm package | **done**, Vojta to confirm the holder name |
| The npm bundle inlines 23 packages (MIT, BSD-2-Clause, ISC, Apache-2.0) plus axe-core (MPL-2.0) with no notices. `pnpm good-a11y:bundle` now writes `bundle/THIRD-PARTY-LICENSES.md` from the esbuild metafile, with each package's licence and notice files, and it ships in the package. The `redis` packages it lists are pulled in by `@effect/platform-node-shared` and ship no licence file; their manifests say MIT | **done** |
| `PROVENANCE.md` gains rows for `puppeteer-core` and `playwright` (Apache-2.0, dependencies of the npm package), `@puppeteer/browsers` (development only), and `guides/`: written from W3C sources, with `badass-courses/a11y-agent` (Apache-2.0) read as seed material. Measured overlap: 68 of 30,761 ten-word runs (0.22%), all standard ARIA markup | **done** |
| GitHub shows no detected licence while the repo is private. Recheck after it goes public | **needs Vojta** (recheck) |

## GitHub repo

| Item | Status |
| --- | --- |
| Description, homepage and topics. Set by the lead: "Accessibility guides for coding agents, each with a live demo, and a checker that finds accessibility issues on a page.", `https://good-a11y.com`, `a11y`, `accessibility`, `agent-skills`, `coding-agents`, `wcag` | **done** |

## Site

| Item | Status |
| --- | --- |
| About page text, a proposal in `docs/site.md` (written 2026-11-04 by check): names Vojta as maker, makes no claim about screen-reader testing | **needs Vojta** (approve) |
| Organization schema. is-agentic's `org-schema-completeness` wants `contactPoint` with an email or phone and a postal `address`. Proposal in `docs/site.md`; it needs a real contact point | **needs Vojta** |
| Contact. `CONTACT_SHOWN` is off (decision 2), so `/contact` answers 404 and removal requests go through a public GitHub issue | **needs Vojta** |
| is-agentic on prod: **97** (scan 2026-11-04T13:19Z). Open: `org-schema-completeness`, `trust-anchors` (About, Contact and Privacy of 500+ characters; Contact is hidden), `brand-search-accuracy` (the domain does not rank yet). The first two wait on the rows above; the third waits on launch traffic | **needs Vojta** |

## Launch blurb (proposal)

> good-a11y gives your coding agent a short accessibility guide before it builds a dialog, a form or a menu, then checks the page it built. Paste one line into Claude Code, Codex or Cursor and its first version already works with a keyboard and a screen reader. Open source, with 25 guides, each with a live demo, at good-a11y.com.
