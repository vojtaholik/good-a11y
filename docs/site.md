# The site (layer 4)

Built 2026-11-04 by check for decision 11 of the good-a11y brief. `apps/web` is a Foldkit app the Worker renders on the server and the browser then hydrates. Every page is also served as Markdown. Stage `prod` serves it on good-a11y.com (www redirects there); every other stage on its workers.dev URL (decisions 12 and 13). Every absolute URL the site prints, canonical, `og:url`, JSON-LD, `llms.txt`, the sitemap and the skill's links, comes from one `SITE_ORIGIN` binding, Alchemy's `Worker.URL`: the first custom domain, else the workers.dev URL. A request that reaches prod's workers.dev URL still names good-a11y.com as canonical.

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
| `/sitemap.xml`, `/robots.txt` | none | `/`, `/check` and every guide; robots allows all and names the sitemap |

Unknown paths and unknown guides answer 404 in both forms. Reports carry `robots: noindex` and `cache-control: no-store`; the other pages are cached for five minutes.

## How a request is answered

`apps/web/src/worker.ts` runs first for every path except `/assets/*` (`runWorkerFirst: ["/*", "!/assets/*"]`, `notFoundHandling: "none"`):

1. `/rpc` goes to the scanner as before (`server/handler.ts`, rate limits unchanged).
2. `server/site.ts` answers the agent files and demos.
3. A GET or HEAD whose `Accept` prefers `text/markdown` over `text/html` gets Markdown (`server/markdown.ts`), with `Vary: Accept`.
4. Anything else is rendered: the built `index.html` comes from the `ASSETS` binding, `withPageMeta` fills its description, Open Graph and robots tags from `pageMetaOf(route)`, and Foldkit's `Server.handleRequest` places `Server.renderToString` output into it. `lang`, `<title>`, `canonical` and `og:url` come from the view's `Document`.

The home page also carries `WebSite` and `SoftwareApplication` JSON-LD, and every page `og:image` (`public/assets/og.png`, 1200×630, made once from an HTML card in Chrome).

On a report route the Worker reads the scan from the scanner over the service binding (`server/read-scan.ts`, the same RPC group as the browser) and passes it in the Flags, so the server-rendered page and its Markdown hold the report. The browser hydrates from those Flags (`Runtime.hydrate`) and polls only while the scan runs.

## Calls made

- **One build id, derived from the source.** Foldkit refuses to hydrate a page from another build. Its Vite plugin shares the id between `client` and `ssr` environments, but the Worker builds as a Cloudflare environment and kept the placeholder (`MissingBuildId` in workerd). A random id per config load split too: Alchemy evaluates `vite.config.ts` more than once per deploy, and the first dev deploy served a client from one id and a Worker from another, so hydration stopped. `scripts/build-id.ts` hashes git `HEAD`, the uncommitted diff and the untracked file list; `vite.config.ts` defines it as `__BUILD_ID__`, and both `renderToString` and `Runtime.hydrate` take it explicitly, the path Foldkit documents for integrations like this. The same tree always gets the same id, and a changed tree a new one.
- **Guide text through `@foldkit/markdown`.** `scripts/guide-pages.ts` is a Vite plugin that parses each guide at build time into Foldkit's Markdown document and serves it as `virtual:guide-pages`, without the demos, so the browser bundle carries about 136 kB of guide text and no demo HTML. Foldkit's parser reads `:1` in `3:1` as a text directive and refuses it; `proseOf` finds those directives with the same remark pipeline and escapes their colon, which only ever lands in prose, never in code.
- **The demo is isolated twice.** The iframe has `sandbox="allow-scripts allow-forms"` (no same origin), and the demo response carries a CSP sandbox, so opening the demo URL directly is sandboxed as well. `frame-ancestors 'self'` keeps it out of other sites' frames.
- **Report routes are `/check/<host>[/<id>]`.** `/report/*` and `/checks` are gone, with no redirects (no backward compatibility in this repo). "What we check" is a section of `/check`.
- **Focus follows navigation.** Foldkit intercepts every same-origin link, in-page `#` links included, so the browser neither moves focus nor scrolls. `changeUrl` in `features/update.ts` does what our `spa-route-change` guide asks: a new page moves focus to its `main h1` (`FocusMainHeading`), a link with a fragment focuses and scrolls to its target without reloading the page (`FocusFragment`), and a change of the query alone leaves focus where it is. Both use `Dom.focus` with `makeFocusable`. The header starts with a "Skip to content" link to `#main`, which every route's `main` carries.
- **Vojta's UI design (2026-11-04) is the visual source.** Its tokens live in `apps/web/src/features/tokens.stylex.ts` as StyleX `defineVars`, with the design's names kept verbatim as CSS custom properties (`--ink`, `--s4`, `--radius-md`), so `base.css` and the Markdown prose read the same variables as the StyleX components. Colours are the design's hex values written as oklch, each checked to round-trip to the same 8-bit colour, so the design's contrast ratios hold. The fonts are Atkinson Hyperlegible Next and Mono from `@fontsource-variable`, bundled into our own `/assets`. The design file itself (`design/good-a11y-ui.html`, 4.2 MB, mostly a React runtime and fonts) is not committed; `design/` is ignored.
- **Light only.** The design has one light theme.

## The demo gate

`apps/good-a11y/test/demos.e2e.test.ts` serves every guide's `demo.html` from a local server and runs the committed `check --json` bundle on each in Chrome. It fails when any demo has an issue, WCAG 2.2 ones included, or when the rendered check did not run. A failing demo is a broken guide. About 75 s for 15 demos.

## Tests

- `apps/web/test/site.test.ts`: the server-rendered start page and its metadata, Markdown for every route, `llms.txt` and the skill naming every guide, the demo's CSP, 404s, and the `Accept` negotiation.
- `apps/web/test/own-page.test.ts`: our own checks pass on the start page, `/check`, every guide page and the report.
- `apps/web/test/story.test.ts`: `update` for starting a scan (refused, started, refused by the scanner), reading a report (unknown scan, a stale answer ignored), focus on navigation and the contact form.
- `apps/web/test/scene.test.ts`: the rendered start page, the skip link, the empty-address status, the disabled button while a scan starts, a report heading.

`foldkit-skills:audit-program` ran on `apps/web` on 2026-11-04. Its findings are fixed: focus on navigation, the story and scene tests, the full `@foldkit/oxlint-plugin` recommended set on `apps/web/src`, nested `modifyFields` in place of spreads, `aria-invalid` on the contact fields, and `Message` in `client/message.ts`. Left as they are: native `input`, `textarea` and `button` (`@foldkit/ui` is not a dependency, and the native controls with `For`/`Id` are what our guides teach), and `ScanState` as its own union, since `Running`, `Settled` and `Unknown` say more than `AsyncData`.

## is-agentic

Measured with is-agentic.com's public report API on the dev URL, 2026-11-04 (`GET https://is-agentic.com/api/v1/report?url=…`; a scan starts from the site's `/scan/<host>` page in a browser).

- First scan: **90**. Essential 80 of 80 (6 of 6 checks pass), recommended 7 of 20, bonus 2.5. Failed: JSON-LD, agent when-to-use, sitemap, Organization schema, trust pages (About, Contact, Privacy), brand search; partial: `og:image` missing.
- Fixed since: JSON-LD, the "When to use" section in `llms.txt`, `sitemap.xml` and `robots.txt`, `og:image`.
- Rescan 2026-11-04T10:22:16Z: **97**. Essential 80 of 80 (6 of 6), recommended 14 of 20 (7 of 10), bonus 2.5 (10 positive signals). Still failing: `brand-search-accuracy`, `org-schema-completeness` (no `Organization` in the JSON-LD), `trust-anchors` (no About, Contact or Privacy page of real length).
- Prod on https://good-a11y.com, deployed 2026-11-04 from 71703de by the lead (zone adopted, www redirects to the apex). Scan 2026-11-04T13:19Z: **97**. Essential 80 of 80 (6 of 6), recommended 14 of 20 (5 of 7 for Docs & content), bonus +2.6 (13 positive signals). `brand-search-accuracy` passes on the domain. Still failing: `org-schema-completeness` and `trust-anchors`.
- Left for Vojta, as proposals: Organization schema needs a real contact point and postal address; trust pages need real About, Contact and Privacy text (the contact is hidden by decision 2, and a privacy page states what the scanner stores); brand search needs the domain (decision 12).
