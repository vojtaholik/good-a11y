# The site (layer 4)

Built 2026-11-04 by check for decision 11 of the good-a11y brief. `apps/web` is a Foldkit app the Worker renders on the server and the browser then hydrates. Every page is also served as Markdown. It runs on stage dev's workers.dev URL until there is a domain (decision 12).

## Routes

| Path | Page | Markdown (`Accept: text/markdown`) |
| --- | --- | --- |
| `/` | Heading, the checker input, the agent command, then every guide by category in one list | The same, with absolute links |
| `/guides/<id>` | The guide text, its `demo.html` live in a sandboxed iframe, the WCAG criteria from verified facts, `retrieve <id>` for agents | `guide.md` without frontmatter, plus the verified criteria, the demo URL and the retrieve command |
| `/guides/<id>/demo.html` | The demo itself, served with `Content-Security-Policy: sandbox allow-scripts allow-forms; frame-ancestors 'self'; default-src 'none'; …` | none |
| `/check` | The checker input and what we check, per success criterion | The coverage table as Markdown, and the local `check` command |
| `/check/<host>`, `/check/<host>/<id>` | The newest report for a site, or one scan. Each finding links to the guides that fix it (`CHECK_GUIDES`) | The report in the format `check` prints |
| `/llms.txt` | none | The site and every guide |
| `/skills/good-a11y/SKILL.md` | none | `skills/good-a11y/SKILL.md` with a References list |
| `/skills/good-a11y/references/<id>.md` | none | The guide, as the guide page's Markdown |

Unknown paths and unknown guides answer 404 in both forms. Reports carry `robots: noindex` and `cache-control: no-store`; the other pages are cached for five minutes.

## How a request is answered

`apps/web/src/worker.ts` runs first for every path except `/assets/*` (`runWorkerFirst: ["/*", "!/assets/*"]`, `notFoundHandling: "none"`):

1. `/rpc` goes to the scanner as before (`server/handler.ts`, rate limits unchanged).
2. `server/site.ts` answers the agent files and demos.
3. A GET or HEAD whose `Accept` prefers `text/markdown` over `text/html` gets Markdown (`server/markdown.ts`), with `Vary: Accept`.
4. Anything else is rendered: the built `index.html` comes from the `ASSETS` binding, `withPageMeta` fills its description, Open Graph and robots tags from `pageMetaOf(route)`, and Foldkit's `Server.handleRequest` places `Server.renderToString` output into it. `lang`, `<title>`, `canonical` and `og:url` come from the view's `Document`.

On a report route the Worker reads the scan from the scanner over the service binding (`server/read-scan.ts`, the same RPC group as the browser) and passes it in the Flags, so the server-rendered page and its Markdown hold the report. The browser hydrates from those Flags (`Runtime.hydrate`) and polls only while the scan runs.

## Calls made

- **One build id, derived from the source.** Foldkit refuses to hydrate a page from another build. Its Vite plugin shares the id between `client` and `ssr` environments, but the Worker builds as a Cloudflare environment and kept the placeholder (`MissingBuildId` in workerd). A random id per config load split too: Alchemy evaluates `vite.config.ts` more than once per deploy, and the first dev deploy served a client from one id and a Worker from another, so hydration stopped. `scripts/build-id.ts` hashes git `HEAD`, the uncommitted diff and the untracked file list; `vite.config.ts` defines it as `__BUILD_ID__`, and both `renderToString` and `Runtime.hydrate` take it explicitly, the path Foldkit documents for integrations like this. The same tree always gets the same id, and a changed tree a new one.
- **Guide text through `@foldkit/markdown`.** `scripts/guide-pages.ts` is a Vite plugin that parses each guide at build time into Foldkit's Markdown document and serves it as `virtual:guide-pages`, without the demos, so the browser bundle carries about 136 kB of guide text and no demo HTML. Foldkit's parser reads `:1` in `3:1` as a text directive and refuses it; `proseOf` finds those directives with the same remark pipeline and escapes their colon, which only ever lands in prose, never in code.
- **The demo is isolated twice.** The iframe has `sandbox="allow-scripts allow-forms"` (no same origin), and the demo response carries a CSP sandbox, so opening the demo URL directly is sandboxed as well. `frame-ancestors 'self'` keeps it out of other sites' frames.
- **Report routes are `/check/<host>[/<id>]`.** `/report/*` and `/checks` are gone, with no redirects (no backward compatibility in this repo). "What we check" is a section of `/check`.
- **Light only for now.** The report styles use fixed light colors; a dark mode needs them on tokens first.

## The demo gate

`apps/good-a11y/test/demos.e2e.test.ts` serves every guide's `demo.html` from a local server and runs the committed `check --json` bundle on each in Chrome. It fails when any demo has an issue, WCAG 2.2 ones included, or when the rendered check did not run. A failing demo is a broken guide. About 75 s for 15 demos.

## Tests

- `apps/web/test/site.test.ts`: the server-rendered start page and its metadata, Markdown for every route, `llms.txt` and the skill naming every guide, the demo's CSP, 404s, and the `Accept` negotiation.
- `apps/web/test/own-page.test.ts`: our own checks pass on the start page, `/check`, every guide page and the report.
