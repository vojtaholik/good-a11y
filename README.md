# eaa-check

A checker that scans one public web page and reports how it stands against the European Accessibility Act (Directive (EU) 2019/882) and EN 301 549 (WCAG for web content), with the EU member states where each finding applies. Built on [rat-stack](https://github.com/joelhooks/rat-stack) the way `webproai` is: Effect `4.0.0`, XState `6.0.0-alpha.63` with `@xstate/effect` `0.1.0-alpha.6` (layer 2), and Alchemy for the cloud (layer 2).

`AGENTS.md` is the repo law. `VISION.md` says what the product is for. `.brain/` holds the working brief and its decisions. `research/facts/` is the facts ledger every legal and normative claim comes from.

Automated checks find only part of the issues WCAG covers. A report from this tool is never a statement that a site meets the law; a manual review is needed.

## Where this stands

Built in layers, each on top of a working one.

1. CLI scan, deterministic checks, report mapped to WCAG and EN 301 549 from the ledger. **Done** (`docs/layer-1.md`).
2. The scan as an XState machine inside a Cloudflare Workflow, on a non-production stage.
3. A bare page: paste a URL, read the report.

## Set up

```sh
nvm use
pnpm install
pnpm turbo run check test build
```

Node `24.18.0` and pnpm `11.3.0` are required.

## Try the CLI

```sh
pnpm cli scan example.com
pnpm cli scan example.com --json
```

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm check` | Typecheck, check formatting, and run type-aware linting |
| `pnpm fix` | Apply Oxfmt and safe Oxlint fixes |
| `pnpm test` | Run the Vitest suite once |
| `pnpm build` | Compile package outputs |
| `pnpm facts` | Regenerate the verified facts data from the ledger |
| `pnpm turbo run check test build` | The gate. Run it before claiming a change is ready |

## License

MIT
