# Provenance

This repo bans comments in code (see AGENTS.md). Credit for borrowed code lives here instead.

The repository was created from the [joelhooks/rat-stack](https://github.com/joelhooks/rat-stack) template (MIT) at upstream commit `e2616fb88e6c56c433d295ee90ac75289d5e0704`, by way of webproai's cut skeleton (`vojtaholik/webproai`), on 2026-11-03. Everything not listed below as ours came from there.

| Code | Origin | Notes |
| --- | --- | --- |
| Root config, `scripts/`, `tools/`, `skills/`, `.claude/`, `.cursor/`, `.pi/`, `.github/`, `packages/capability` | webproai at its `main` on 2026-11-03 | Copied, scope renamed to `@eaa-check`. `no-core-adapters` also allows `packages/facts` |
| `packages/core/src/safe-fetch.ts`, `hop-transport.ts`, `public-url.ts`, `fetch-result.ts`, `transport-failure.ts`, `body.ts`, `challenge.ts`, `refusal.ts`, `scan-target.ts` | webproai `packages/core/src` | Copied; Czech texts rewritten in English |
| `packages/http-transport` | webproai `packages/http-transport` | Copied unchanged apart from the scope |
| `packages/html-reader` | webproai `packages/html-reader` (package shape, tokenizer approach) | The reader itself is new: it reads accessibility evidence, not webproai's page facts |
| `scripts/oxlint-plugin-xstate-effect.ts` | [statelyai/xstate](https://github.com/statelyai/xstate) `scripts/oxlint-plugin-xstate-effect.mjs` at `xstate@6.0.0-alpha.58`, MIT | Via webproai |
| `scripts/oxlint-plugin-effect-tests.ts` | [t3code](https://github.com/pingdotgg/t3code) `oxlint-plugin-t3code/rules/no-manual-effect-runtime-in-tests.ts` | Via webproai |
| `tools/oxlint/anti-slop/` | [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop) at `c44ef22`, MIT | Vendored; see `UPSTREAM.md` there |
| `scripts/oxlint-plugin-patterns.ts`, parts of `scripts/oxlint-plugin-boundaries.ts` | [foldkit/foldkit](https://github.com/foldkit/foldkit) `packages/oxlint-plugin-foldkit` at `95fed7f`, MIT | Rule ideas, via webproai |
| `skills/rat-stack-mode/` router and adapted principles | pstack by Lauren Tan, MIT (`skills/rat-stack-mode/LICENSE-pstack`) | Via webproai |
