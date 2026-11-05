# Provenance

This repo bans comments in code (see AGENTS.md). Credit for borrowed code lives here instead.

The repository was created from the [joelhooks/rat-stack](https://github.com/joelhooks/rat-stack) template (MIT) at upstream commit `e2616fb88e6c56c433d295ee90ac75289d5e0704`, by way of webproai's cut skeleton (`vojtaholik/webproai`), on 2026-11-03. Everything not listed below as ours came from there.

| Code | Origin | Notes |
| --- | --- | --- |
| Root config, `scripts/`, `tools/`, `skills/`, `.claude/`, `.cursor/`, `.pi/`, `.github/`, `packages/capability` | webproai at its `main` on 2026-11-03 | Copied, scope renamed to `@eaa-check`, then to `@good-a11y` on 2026-11-04. `no-core-adapters` also allows `packages/facts` |
| `packages/core/src/safe-fetch.ts`, `hop-transport.ts`, `public-url.ts`, `fetch-result.ts`, `transport-failure.ts`, `body.ts`, `challenge.ts`, `refusal.ts`, `scan-target.ts` | webproai `packages/core/src` | Copied; Czech texts rewritten in English |
| `packages/http-transport` | webproai `packages/http-transport` | Copied unchanged apart from the scope |
| `packages/html-reader` | webproai `packages/html-reader` (package shape, tokenizer approach) | The reader itself is new: it reads accessibility evidence, not webproai's page facts |
| `apps/web/src/page-views.ts`, `apps/web/src/server/beacon.ts` | webproai `apps/web/src/page-views.ts`, `apps/web/src/server/beacon.ts` on 2026-11-05 | Copied; the zone and production stage come from `apps/web/src/zone.ts` |
| `scripts/oxlint-plugin-xstate-effect.ts` | [statelyai/xstate](https://github.com/statelyai/xstate) `scripts/oxlint-plugin-xstate-effect.mjs` at `xstate@6.0.0-alpha.58`, MIT | Via webproai |
| `scripts/oxlint-plugin-effect-tests.ts` | [t3code](https://github.com/pingdotgg/t3code) `oxlint-plugin-t3code/rules/no-manual-effect-runtime-in-tests.ts` | Via webproai |
| `tools/oxlint/anti-slop/` | [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop) at `c44ef22`, MIT | Vendored; see `UPSTREAM.md` there |
| `scripts/oxlint-plugin-patterns.ts`, parts of `scripts/oxlint-plugin-boundaries.ts` | [foldkit/foldkit](https://github.com/foldkit/foldkit) `packages/oxlint-plugin-foldkit` at `95fed7f`, MIT | Rule ideas, via webproai |
| `guides/` | Written for this repo from W3C sources (WCAG Understanding documents, the WAI-ARIA Authoring Practices) and the verified facts in `research/facts/`. [badass-courses/a11y-agent](https://github.com/badass-courses/a11y-agent) (Apache-2.0) was read as seed material | Measured 2026-11-05: 68 of 30,761 ten-word runs in `guides/` also occur in a11y-agent's Markdown (0.22%), all standard ARIA markup such as `role="menu" aria-labelledby` |
| `skills/rat-stack-mode/` router and adapted principles | pstack by Lauren Tan, MIT (`skills/rat-stack-mode/LICENSE-pstack`) | Via webproai |

## Runtime dependencies with notable licences

| Dependency | Licence | How it is used |
| --- | --- | --- |
| [axe-core](https://github.com/dequelabs/axe-core) `4.14.0` | MPL-2.0 | `packages/browser-audit` evaluates its unmodified source (`axe.source`) inside the rendered page and runs `axe.run`. Not modified or vendored; MPL-2.0 is file-level copyleft, so changes to axe-core files would have to be published, use of it does not. `packages/core/test/fixtures/axe-results.json` is its output, recorded from `axe-page.html` in local headless Chrome |
| [@cloudflare/puppeteer](https://github.com/cloudflare/puppeteer) `1.4.0` | Apache-2.0 | `packages/browser-audit` drives Cloudflare Browser Run through the Worker's `browser` binding |
| [puppeteer-core](https://github.com/puppeteer/puppeteer) `25.13.0` | Apache-2.0 | The local `check` drives the user's Chrome with it. A dependency of the `good-a11y` npm package, not bundled |
| [playwright](https://github.com/microsoft/playwright) `1.64.1` | Apache-2.0 | The graders behind `check --flow` and the evals. A dependency of the `good-a11y` npm package, not bundled |
| [@puppeteer/browsers](https://github.com/puppeteer/puppeteer) `3.2.6` | Apache-2.0 | `pnpm chrome:install` downloads the pinned `chrome-headless-shell` for tests and evals. Development only |
| [Atkinson Hyperlegible Next](https://github.com/googlefonts/atkinson-hyperlegible-next) via [@fontsource-variable/atkinson-hyperlegible-next](https://fontsource.org/fonts/atkinson-hyperlegible-next) `5.3.0` | OFL-1.1 | The site's text face, chosen in Vojta's UI design (2026-11-04). Vite bundles the woff2 files into `apps/web`'s own `/assets`, so no page requests Google Fonts. Copyright 2020-2024 The Atkinson Hyperlegible Next Project Authors; the licence ships in the package's `LICENSE` |
| [Atkinson Hyperlegible Mono](https://github.com/googlefonts/atkinson-hyperlegible-next-mono) via [@fontsource-variable/atkinson-hyperlegible-mono](https://fontsource.org/fonts/atkinson-hyperlegible-mono) `5.3.0` | OFL-1.1 | The site's code face and wordmark, same design and same self-hosting. Copyright 2020-2024 The Atkinson Hyperlegible Mono Project Authors |

The `good-a11y` npm package bundles its other dependencies into `bundle/good-a11y.mjs`. `pnpm good-a11y:bundle` writes their names, versions and licence texts, axe-core's included, to `apps/good-a11y/bundle/THIRD-PARTY-LICENSES.md`, which ships in the package.
