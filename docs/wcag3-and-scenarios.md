# WCAG 3 and the scenario score

Design note by wcag3 for Vojta, 2026-11-05. Proposal only: no product code changes until Vojta decides. Facts are in `research/facts/wcag3.md`, all `unverified` until a verifier passes them, so none of them reaches product text yet.

Two asks: build for WCAG 3 without dropping WCAG 2.1 AA, and add a score made of tasks a person must be able to finish, run by an agent against the page.

## WCAG 3 in our terms

- **Status.** The newest draft is the W3C Working Draft of 10 September 2026 (STD-WCAG3-1). W3C says it is a work in progress (STD-WCAG3-2) with several years of work left (STD-WCAG3-3). WCAG 3 does not deprecate WCAG 2 (STD-WCAG3-4). Our benchmark stays WCAG 2.1 Level AA through EN 301 549 (STD-EN-5); WCAG 3 is shown beside it, labelled as a draft, and never drives the verdict.
- **Provisions.** Three types: core requirements, which must be met to conform (STD-WCAG3-6); supplemental requirements, which are not required (STD-WCAG3-7); assertions, statements about an organization's practices (STD-WCAG3-8). A scope conforms when all core requirements are met (STD-WCAG3-9). One conformance level, built on WCAG 2.2 A and AA (STD-WCAG3-23). WCAG 2.2 AA content meets most, not all, of it (STD-WCAG3-5).
- **Levels became reporting tiers** (STD-WCAG3-10), informative and exploratory (STD-WCAG3-11): 1 Avoid physical harm, 2 Foundational access, 3 Conformance, then Bronze, Silver, Gold with TBD counts (STD-WCAG3-12). Tiers come from tags on core requirements: Physical Harm, Risk, Barrier ("can prevent someone with a disability from proceeding"), Friction ("can hinder") (STD-WCAG3-13). Our reading: no requirement in this draft carries a tag yet, so nobody can compute a tier today. That is an observation, not a fact.
- **No score.** Scoring is an alternative proposal in an editor's note (STD-WCAG3-14). The draft also suggests counts or percentages between tiers (STD-WCAG3-15) and says a failure's severity depends on where it happens, including its role in a process (STD-WCAG3-16).
- **Tests and assertions.** A test evaluates a method (STD-WCAG3-17); a method counts only when accessibility supported, and the default support set is not defined yet (STD-WCAG3-22). Assertions are attributed claims about practice; a checker cannot test them, so we never show them as met or unmet.
- **Processes.** A process is a series of views to complete an activity (STD-WCAG3-18); a user need is the end goal of a process (STD-WCAG3-19). A claim can be scoped to processes and must then include every step (STD-WCAG3-20, STD-WCAG3-21). This is where scenarios attach.
- **Conformance is not compliance** (STD-WCAG3-24), and meeting WCAG 2 AA or WCAG 3 core alone "is not enough" (STD-WCAG3-25). Both support our report rules and the reason for a task score.

### Our checks against the draft

| Check | WCAG 2 SC (code, unchanged) | WCAG 3 draft requirement (ledger) |
| --- | --- | --- |
| html-lang | 3.1.1 | STD-W3-HUMAN-LANGUAGE-DETECTABLE-1 (core) |
| document-title, title-generic | 2.4.2 | STD-W3-PAGE-VIEW-TITLE-AVAILABLE-1 (core) |
| image-alt | 1.1.1 | STD-W3-IMAGE-ALTERNATIVES-AVAILABLE-1 (core) |
| alt-placeholder | 1.1.1 | STD-W3-IMAGE-ALTERNATIVES-EQUIVALENT-1 (core) |
| form-labels, link-name, button-name | 1.3.1, 2.4.4, 4.1.2 | STD-W3-INTERACTIVE-ELEMENT-NAMES-AVAILABLE-1, STD-W3-ROLES-VALUES-STATES-PROPERTIES-AVAILABLE-2 (core) |
| meta-viewport-zoom | 1.4.4 | STD-W3-TEXT-SIZE-ADJUSTABLE-1 (core) |
| meta-refresh | 2.2.1 | STD-W3-TIMEOUT-ADJUSTABLE-1 (supplemental: Level A in WCAG 2, not core in this draft) |
| frame-title | 4.1.2 | none: no developing requirement covers frame titles |
| autocomplete-valid | 1.3.5 | none: autocomplete appears only inside the "Error prevention review" assertion |

Guides get the same treatment: sign-in-without-puzzles, redundant-entry, status-messages-toast, timeouts-and-warnings, image-alt and icon-buttons have `guides.<id>.wcag3` keys in the ledger.

## Catalogue model: WCAG 3 beside WCAG 2, in the ledger

WCAG 2 SC numbers are frozen in a Recommendation, so the catalogue keeps them in code (`criteria: ["3.1.1"]` to `STD-SC`, `STD-EN`, `STD-EN4`). Nothing there changes.

WCAG 3 requirement names and numbers move between drafts, so the mapping lives in the ledger. Each `STD-W3-*` fact's `used_by` names the checks and guides it relates to (`checks.html-lang.wcag3`, `guides.redundant-entry.wcag3`). Core reads it with the existing `verifiedUsedBy(key)` from `@good-a11y/facts`, the same way `requirements.ts` reads the EAA rows. A new draft is a ledger edit: add facts from the new dated URL with the same keys, reject the ones it replaces, run `pnpm facts`. No code changes.

- The fact's `value` is what the report shows ("2.7.2.1 Page/view title available (core requirement)"); code never parses it.
- The draft's date comes from STD-WCAG3-1 and labels the line: "WCAG 3 draft (W3C Working Draft, 10 September 2026)". Never "WCAG 3 conformance".
- Unverified means absent, as for every fact. Tests: every `checks.<id>.wcag3` key names a check in `CATALOGUE`; a rendered report shows no WCAG 3 line for an unverified fact.

## The scenario score

### A scenario

A task a person must be able to finish, written as data, in the shape of a flow (`docs/flows.md`):

```json
{
  "id": "checkout-keyboard",
  "goal": "Buy the Rain jacket and reach the order confirmation.",
  "path": "/",
  "inputs": { "name": "Jana Nováková", "email": "jana@example.com" },
  "success": {
    "url": "/order-placed",
    "present": [{ "role": "heading", "name": "Thank you", "exact": false }]
  },
  "budget": 60
}
```

- `goal` is the user need (STD-WCAG3-19) as one sentence a person would say. "Find a sign language interpreter in Brno" is a goal; the success is the heading "Interpreters in Brno" on a `/interpreters/` path.
- `success` is decided by a pure function in core, `reached(success, state)`, over the URL and the accessibility tree: `url` (exact or prefix), `present` and `absent` lists of `FlowTarget`s, the type `check --flow` already parses. No free text and no model in the condition.
- `inputs` are the only values the driver may type. `budget` is the most actions allowed.
- No `setup` clicks: the start must be a URL, because a pointer step would hide the barrier we measure.

**Who writes it.** The agent that built the feature, as with flows: it knows where checkout lives. Guides ship templates (confirm-before-purchase gives "buy one product"; sign-in-without-puzzles gives "sign in"). Later, the site owner on good-a11y.com. Never the driver: the one who runs a task must not choose what counts as done.

### How it runs

`check <url> --scenarios a11y-tasks.json`, local first, same browser posture as `--flow`: the user's Chrome through Playwright, headless, 1280 x 800, fresh context per run, other origins aborted, service workers blocked, private targets only.

The driver is a model in a clean context. It gets the goal, the inputs and three tools, nothing else:

- `snapshot()`: the page's accessibility tree as text (Playwright `ariaSnapshot()`), the focused element's role and name, and the URL.
- `press(key)`: one of Tab, Shift+Tab, Enter, Space, Escape, the arrows, Home, End, PageUp, PageDown.
- `type(input)`: types the named input into the focused element.

No click, no coordinates, no screenshot, no script, no navigation after the start. It never sees the code, so what the building agent knows cannot leak in. Locally it runs as a headless agent CLI subprocess, the way `evals/run/src/agents.ts` starts Claude and Codex; hosted, a Workers AI model under a daily budget in `packages/scan-store`, like the judged step.

### How it is graded

1. After every action the harness evaluates `reached`. The model never says "done"; the harness does.
2. A run passes when `reached` holds within the budget. It fails when the budget runs out or the same snapshot repeats 5 times.
3. **Replay.** A passing run's trace (its keys and typed inputs) is replayed in a fresh context with no model. The pass counts only when the replay reaches success too. A pass is then proof: a key sequence anyone can re-run.
4. A failure is evidence, not proof: the agent did not finish. The report says so and shows the last snapshot (as data) and the trace.

Replay and tests share one runner: a scripted driver that plays a fixed key list. Fixtures test `reached` and the runner with no model at all.

### The score

Each task runs 3 times. A task is **finished** when at least 2 runs pass with a confirmed replay. The score is the count: **"4 of 5 tasks finished with the keyboard and the accessibility tree only."** Each task shows its runs ("2 of 3 runs"). No 0 to 100 number and no weights: WCAG 3 ties severity to context (STD-WCAG3-16), and the person who picks the tasks already expresses what matters.

### Against WCAG 3's own rating

The draft has no score (STD-WCAG3-14) and its tiers cannot be computed yet (STD-WCAG3-12, STD-WCAG3-13). A scenario is a process in its terms (STD-WCAG3-18, STD-WCAG3-20), and an unfinished task is what the Barrier tag describes: someone cannot proceed (STD-WCAG3-13). So the score reports process completion, close to the spirit of tier 2, and claims no tier. Keyboard only relates to STD-W3-KEYBOARD-OPERABLE-1 and WCAG 2 SC 2.1.1, as "relates to", never as a finding.

### In the report

A section "Tasks", after the flows. Headline: "Task completion: 4 of 5 tasks finished with the keyboard and the accessibility tree only." Fixed label beneath: run by an agent (model and version), finished when a fixed condition was met and a replay without the model confirmed it; this measures whether these tasks can be done this way, not conformance with WCAG or compliance with the EAA. Each unfinished task: goal, steps taken, last focused element, the snapshot excerpt quoted as data. Tasks never count as issues and never change the verdict. The disclaimer stays.

### What the task score cannot see

The accessibility tree hides visual barriers: contrast, a missing focus outline (the base apps' `:focus { outline: none; }` reset passes this driver), reflow, target size. A model guesses better or worse than a person does. A pass proves a keyboard path exists, not that it is easy. Checkout on a live site would place an order: hosted scenarios need a success condition that stops before an irreversible step, or a test mode the owner turns on.

## AGENTS.md project law that must change

- "Findings come from deterministic checks only ..." gains: a **task result** is a third kind of result, beside findings and judged observations. Its success is decided by a pure function of the scenario and the page state, and a pass is confirmed by a replay without the model. Tasks are never issues.
- "A **judged observation** is the one thing a model may produce" becomes two things: judged observations, and the actions of a scenario driver, which chooses keys only and never decides success.
- "The report never says 'compliant' or 'compliance score'" gains: the task score is labelled "Task completion" and counts tasks; it never says accessibility score, WCAG score or conformance, and it is not part of the verdict. The report test gets those phrases.
- "The catalogue names fact IDs, never text" gains: WCAG 3 draft mappings come from `checks.<id>.wcag3` keys of verified `STD-W3-*` facts, shown only beside the WCAG 2 criteria and labelled with the draft's date.
- The local-mode boundary (`rat-stack-boundaries/no-local-mode-in-hosted-apps`) covers the scenario runner and its driver until the hosted layer is signed off.
- Nouns gain **Scenario** (`a11y-tasks.json` beside the flow file; schema in `packages/core/src/scenario.ts`); `packages/graders` gains the runner. `VISION.md`'s "Nothing a model says changes a finding" holds, but a score is a change of what the product says, so it is Vojta's call under the amendment policy.

## Layers, smallest first

1. **Verify the facts.** A verifier passes or rejects the 37 facts in `wcag3.md`. Visible change: none. Each excerpt already matches the rendered draft or blog text.
2. **WCAG 3 beside WCAG 2.** `verifiedUsedBy("checks.<id>.wcag3")` in the catalogue, the draft line in the report, the two tests. Ships alone on the site and the CLI.
3. **Scripted scenarios.** `ScenarioSchema` and `reached` in core, the keyboard-only runner in `packages/graders`, `check --scenarios` with a scripted trace (`"keys": [...]`) that the writing agent supplies. No model; the trace is replayed and graded. Ships the "Tasks" section with "finished" or "not finished" per task, local only.
4. **Blind driver.** The model driver behind its own port (`ScenarioDriver`), 3 runs, replay confirmation, the count score. Calibrate on the base apps: checkout and search tasks on both, each finished on the reference implementation and unfinished on a seeded keyboard trap.
5. **Guides and the agent loop.** Templates in the guides that have a process, a step in `SKILL.md` after the flows, eval tasks that measure whether guided agents finish more scenarios.
6. **Hosted.** Public URLs through Browser Run, Workers AI as driver under a budget, scenarios written on the site, stop-before-irreversible required. Needs sign-off for the model budget and the boundary change.
