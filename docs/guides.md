# Guides

Layer 2 of good-a11y (brief decisions 4 to 7): the guide format, the index the site and the CLI read, the search, the `good-a11y` bin and the skill.

## The guide folder

A guide is `guides/<category>/<slug>/` at the repo root with three files:

- `guide.md`: the text an agent reads. YAML frontmatter, then Markdown.
- `demo.html`: a working reference page, the live specimen on the site.
- `expectations.md`: testable claims for the eval graders.
- `flow.json` (when the grader reads targets): each target key the grader reads, `{"<key>": {"means": "one line", "demo": <its value on demo.html>}}`. The grader takes a key's default from `demo` and throws on a key the file does not declare. The served guide and `retrieve` render it as the "Flow for check" section (`docs/flows.md`).

```yaml
---
name: Modal dialog
description: Build an accessible modal dialog with focus trap, Escape to close and focus return
criteria:
  - STD-SC-2.1.2
  - STD-SC-2.4.3
category: widgets
---
```

- `name` and `description` are one line each. Write the description as the words an agent would search for.
- `criteria` lists at least one WCAG success criterion as a fact ID, `STD-SC-x.y.z` or `STD-SC22-x.y.z`. Each must be a verified fact in `research/facts/standards.md`, read through `@good-a11y/facts`.
- `category` is optional and must equal the folder when given. The folder is the source.
- The guide id is the folder name. It is unique across categories, so `retrieve dialog-modal` needs no category.

`packages/guides` rejects a guide, naming the guide and the fix, when a file is missing, the frontmatter does not decode, a criterion is not a verified fact, `guide.md` is over 3,000 tokens (characters / 4), or `guide.md` has a link outside a fenced code block: a Markdown link, a reference link, a bare `http(s)://` URL or a `www.` address. A guide is self-contained; URLs inside code samples, such as an SVG namespace, are fine.

A guide may teach practice that no verified fact backs as a requirement, but it never cites one. `reduced-motion` teaches honouring `prefers-reduced-motion` and lists only `STD-SC-2.2.2` and `STD-SC-2.3.1`: the criterion about motion from interactions, WCAG 2.3.3, has no fact in the ledger (it is outside the A and AA set `research/facts/standards.md` covers), so the guide neither cites it nor states its level. A verified 2.3.3 fact would let the guide cite it.

Headings (`#` to `######` outside code) are indexed for search, so name sections by what an agent would look for.

## The generated index

`pnpm guides` reads every guide folder and writes `packages/guides/src/guides.generated.ts`: `GUIDES`, each with `id`, `category`, `name`, `description`, `criteria`, `headings`, `text` (the whole `guide.md`), `demo` and `expectations`. The site and the CLI import it from `@good-a11y/guides`; nothing reads the folders at run time. A test fails while it is stale. Never edit it by hand. `turbo.json` declares `guides/**` as an input of `@good-a11y/guides#test`.

## Search

`makeGuideIndex(GUIDES)` builds a MiniSearch index over the slug (dashes as spaces), name, description and headings, with a Porter stemmer (`stemmer`), prefix matching and fuzzy 0.2. Name counts three times, slug and description twice. `search` returns the best 8 as `{ id, description }`, and nothing when no term scores. `retrieve` returns the guides in the order asked and fails with `GuideNotFound` on an unknown id.

Keyword search is decision 5. `test/retrieval-benchmark.ts` holds 40 agent-style queries with the guide each should find; the benchmark test prints hit@3 and its misses, and fails under 0.85 once there are 15 guides. A miss there is the signal for better guide descriptions first, and for an embedding model only if those do not fix it.

## The `good-a11y` bin

`apps/good-a11y` is one `effect/cli` command, `good-a11y`, with a subcommand per file:

| Command | Prints |
| --- | --- |
| `search "<2-5 words>"` | JSON `[{ id, description }]`, top 8, `[]` when nothing matches |
| `retrieve "<id>[,<id>]"` | The guide text. Over 9.5 KB it writes a temp file and prints the path |
| `list` | JSON `[{ id, description }]` for every guide |
| `check <url>` | The local check, `docs/local-check.md` |

An unknown id prints the fix on stderr and exits 1.

It runs from GitHub with nothing published: `npx -y github:vojtaholik/good-a11y <command>`. npm handles a GitHub package by cloning it, installing the root dev dependencies and running `prepare`, about 35 seconds cold and cached after. No build runs: the root `package.json` points `bin` at `apps/good-a11y/bundle/good-a11y.mjs`, a single esbuild bundle of the CLI and its data, committed to the repo. `files` limits the installed package to that bundle and `skills/good-a11y`. `pnpm good-a11y:bundle` rebuilds it, and a test fails when the committed bundle differs from a fresh one, so a guide or source change without a rebundle fails the gate. Oxfmt and Oxlint skip it. Packages the bundle cannot carry, such as `puppeteer-core` for `check`, stay external and are root `dependencies`, which npm installs.

The guide commands are plain commands, not capabilities: they have one surface, they read only the generated index, and the site imports the same index directly. A second surface would make them a contract.

## The skill

`skills/good-a11y/SKILL.md` is hand-written and short: a mandatory trigger for UI work, trigger and do-not-trigger lists, the search, retrieve, build, check, fix loop, and the closing "Accessibility guidance used" section. `skills/good-a11y/README.md` holds the install lines; they work once the repo is public under its new name.
