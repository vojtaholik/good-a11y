# Scenarios (`check <url> --scenarios <file>`)

Layers 3 and 4 of `docs/wcag3-and-scenarios.md`, approved by Vojta on 2026-11-05 (decision 31 of the eaa-checker brief). A scenario is a task a person must be able to finish by keyboard only on a local page: replayed from its keys, or, without keys, driven by a blind model. The local check counts the tasks that finish: **Task completion: N of M tasks finished with the keyboard and the accessibility tree only.**

```sh
npx -y github:vojtaholik/good-a11y check localhost:5173 --scenarios a11y-tasks.json
```

## The scenario file

One scenario, or an array:

```json
{
  "id": "checkout-keyboard",
  "goal": "Place an order for the Rain jacket.",
  "path": "/checkout",
  "inputs": { "name": "Jana Novakova" },
  "keys": [
    { "press": "Tab" },
    { "type": "name" },
    { "press": "Tab" },
    { "press": "Enter" }
  ],
  "success": {
    "path": "/order-placed",
    "present": [{ "role": "heading", "name": "Thank you" }]
  }
}
```

- `goal` is the task in a person's words. `path` is resolved against the checked URL.
- `keys` are the steps, optional: `{ "press": key }` with one of Tab, Shift+Tab, Enter, Space, Escape, the arrows, Home, End, PageUp, PageDown, or `{ "type": name }`, which types `inputs[name]` into the focused element. No clicks: a pointer step would hide the barrier the task measures.
- Without `keys` the scenario is driven (below). `budget` caps a driven run's keys, 60 by default, at most 200.
- `success` is decided by `reached` in `packages/core/src/scenario.ts`, a pure function of the landed path and the page's accessibility tree (Playwright's `ariaSnapshot`, read by `treeOf`): `path` must equal the landed path when given, every `present` target must be on the tree, and no `absent` target may be. A target is `{ role, name, exact? }` or `{ text }`, as in flows; there are no CSS targets, since a selector is not what a person perceives. `present` needs at least one target.

## How it runs

`playwrightScenarioAuditLayer` in `packages/graders`, the `ScenarioAudit` port's adapter, with the flow audit's browser (`packages/graders/src/browser.ts`): headless, 1280 x 800, a fresh context per scenario, other origins aborted, service workers blocked, private targets only. After each key it waits for the page to settle and evaluates `reached`; after the last key it polls for 2 seconds. A task is finished when `reached` holds. When it already holds before the first key, the scenario tests nothing and is reported as not finished with that reason. 60 seconds per scenario.

A scenario with keys has no model in it: every run is a replay and a finished task is a key sequence anyone can re-run.

## In the guides and the skill

Layer 5. Five guides whose feature is a task carry a `scenario.json` (`docs/guides.md`): confirm-before-purchase, sign-in-without-puzzles, form-errors-validation, redundant-entry and unprompted-popups. Each is that guide's task on its demo, with keys, and is rendered as the guide's "Scenario for check" section. Step 6 of `SKILL.md` asks an agent to write the task for its own page, keys included, and to fix the page when it does not finish. An agent writes keys: a replay is free, needs no model and runs the same in every sandbox. Driven mode is for grading the agent's build (the eval measurement, `docs/evals.md`) and for a person who asks for a model to try the task.

A replayed `type` presses one character every 50 ms, so a form is not filled faster than a person types it: a sign-in that rejects forms filled in under a second or two (a timing honeypot) still sees a person.

## Driven scenarios

A scenario without `keys` is driven by a model behind the `ScenarioDriver` port (`packages/core/src/scenario-driver.ts`). The model chooses keys only. It never decides success; `reached` does, in a replay without the model.

- Each turn the driver gets the goal, the input names (never their values), its own steps so far, the keys left, the landed path, the focused element's snapshot and the page's accessibility tree, fenced as data. `driverPrompt` builds that text, a pure function. It answers one of `press` with a key from the set above, `type` with an input name, or `give_up` with a reason (`DriverDecisionSchema`).
- A run stops when `reached` holds, when the model gives up, when the budget is spent, when the same page state (path, focus and tree) comes back 5 times (a trap or a dead key), when the driver fails, or after 15 minutes.
- 3 runs, concurrent, each in a fresh context. A run that reached the success condition is replayed from its keys in another fresh context without the model; it is confirmed when `reached` holds there. The task is finished when 2 of the 3 runs are confirmed (`statusOf`).
- The report names the driver's model, gives each run's outcome and key count, and quotes the keys of the first confirmed run so they can become the scenario's `keys`.

The adapter is `claudeDriverLayer` in `packages/graders/src/claude-driver.ts`: one `claude -p` call per turn, model `claude-sonnet-5-5`, from an empty temporary directory, with no tools (`--tools ""`), no user settings or memory (`--setting-sources project`), no MCP servers, no session saved, and the answer constrained by `--json-schema` to the decision schema, decoded from `structured_output`. The model sees only what the prompt carries: it cannot read the page's source, the screen or the files. It needs Claude Code on the PATH, signed in; without it each driven run reports that the driver could not be started. A turn costs about 3 seconds.

### What a driven run costs

One model call per key, per run, 3 runs per task: a driven task costs 3 × its keys in calls, up to 3 × `budget` (180 at the default 60). A call cost about $0.014 at `claude-sonnet-5-5` and took about 3 seconds in a test on a small page (2026-11-05); the tree is most of the prompt, so a larger page costs more per call. At that rate the calibration's shop checkout, 26 keys, was 78 calls, about $1.10, and about 1.5 minutes with the runs side by side. The search task took 8 keys: 24 calls, about $0.35. A trapped run stops after the same state comes back 5 times, so a barrier costs its keys up to the trap plus 4. The replays that confirm a run call no model. A scenario with keys calls no model at all. Like the rest of the local check it is fenced out of the hosted apps (`rat-stack-boundaries/no-local-mode-in-hosted-apps`).

## In the report

A section "Tasks" after the flows: the headline, a fixed label (how it ran, that it is not a WCAG or EAA result, not issues, not in the verdict), then each task: finished after how many keys, or not finished with the focused element's snapshot quoted as data; for a driven task the model, the confirmed runs out of 3 and each run's outcome. `--json` adds `tasks` beside `flows`. Tasks never count as issues and never change the verdict (`AGENTS.md`, project law).

## Calibration (2026-11-05, `claude-sonnet-5-5`)

Two driven scenarios: on the shop app (`evals/apps/shop`, built), "Buy the Rain jacket and place the order." from `/`, with six inputs (name, email, street, city, postal code, country), succeeding on `/order-placed` with the heading "Thank you". On the content app (`evals/apps/content`), "Search the stories for the word blisters." from `/`, input `query`, succeeding on `/search.html` with the text "1 result for blisters". The shop has no search and the content app has no checkout, so each app carries the one task it has. Each ran on the reference app and on a copy with a seeded keyboard trap. The trap is a capturing `keydown` listener that cancels Tab, Shift+Tab and Enter while focus is on `#email` (shop) or on either search field (content).

| App | Variant | Result | Runs |
| --- | --- | --- | --- |
| shop | reference | finished | 3 of 3 confirmed by replay, 26 keys each |
| shop | trap | not finished | 3 of 3 stopped stuck, focus on `textbox "Email"`, after 20 to 22 keys |
| content | reference | finished | 3 of 3 confirmed by replay, 8 keys each |
| content | trap | not finished | 3 of 3 stopped stuck, focus on `searchbox "Search": blisters`, after 11 keys |

No run gave up early, ran out of budget or failed on a driver error. The stuck rule, not the model, ended every trapped run.

## The eval measurement (layer 5)

The question: do guided agents finish more tasks when `SKILL.md` has the scenarios step? The shop tasks of the five guides carry a `scenarios` array in `evals/tasks/<guide>/shop.json`. Each is driven, with no keys, since every agent names its controls differently. The runner (`evals/run`, owned by the guides agent) grades each run with `check --json --scenarios` and records Task completion apart from `passed`; a driver error is never an unfinished task (`docs/evals.md`). The two variants differ only in the installed `SKILL.md` (`--skill`), from the same commit. Both install the same guides, with the "Scenario for check" sections. So this measures the step, with the sections present in both.

Before measuring, each scenario was run on one Claude guided shop build that already passes its grader, rebuilt from that run's `changes.patch` (2026-11-05, `claude-sonnet-5-5`). Otherwise the measurement would grade the scenario, not the agent:

| Task | Guided build | Result |
| --- | --- | --- |
| confirm-before-purchase | `l5-confirm-before-purchase-2`, run 3 | finished, 3 of 3 confirmed, 7 keys |
| sign-in-without-puzzles | `l5-sign-in-without-puzzles-2`, run 3 | finished, 3 of 3 confirmed, 11 keys |
| form-errors-validation | `url2-form-errors-validation`, run 2 | finished, 3 of 3 confirmed, 17 to 26 keys |
| redundant-entry | `l5-redundant-entry-r`, run 3 | finished, 3 of 3 confirmed, 18 keys |
| unprompted-popups | `m5-unprompted-popups-shop`, run 1 | finished, 3 of 3 confirmed, 25 keys |
