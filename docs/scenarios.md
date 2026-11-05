# Scenarios (`check <url> --scenarios <file>`)

Layer 3 of `docs/wcag3-and-scenarios.md`, approved by Vojta on 2026-11-05 (decision 31 of the eaa-checker brief). A scenario is a task a person must be able to finish, replayed by keyboard only on a local page. The local check counts the tasks that finish: **Task completion: N of M tasks finished with the keyboard and the accessibility tree only.**

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
- `keys` are the steps: `{ "press": key }` with one of Tab, Shift+Tab, Enter, Space, Escape, the arrows, Home, End, PageUp, PageDown, or `{ "type": name }`, which types `inputs[name]` into the focused element. No clicks: a pointer step would hide the barrier the task measures.
- `success` is decided by `reached` in `packages/core/src/scenario.ts`, a pure function of the landed path and the page's accessibility tree (Playwright's `ariaSnapshot`, read by `treeOf`): `path` must equal the landed path when given, every `present` target must be on the tree, and no `absent` target may be. A target is `{ role, name, exact? }` or `{ text }`, as in flows; there are no CSS targets, since a selector is not what a person perceives. `present` needs at least one target.

## How it runs

`playwrightScenarioAuditLayer` in `packages/graders`, the `ScenarioAudit` port's adapter, with the flow audit's browser (`packages/graders/src/browser.ts`): headless, 1280 x 800, a fresh context per scenario, other origins aborted, service workers blocked, private targets only. After each key it waits for the page to settle and evaluates `reached`; after the last key it polls for 2 seconds. A task is finished when `reached` holds. When it already holds before the first key, the scenario tests nothing and is reported as not finished with that reason. 60 seconds per scenario.

There is no model in this layer: the keys come from the file, so every run is a replay and a finished task is a key sequence anyone can re-run. The blind model driver is layer 4.

## In the report

A section "Tasks" after the flows: the headline, a fixed label (how it ran, that it is not a WCAG or EAA result, not issues, not in the verdict), then each task: finished after how many keys, or not finished with the focused element's snapshot quoted as data. `--json` adds `tasks` beside `flows`. Tasks never count as issues and never change the verdict (`AGENTS.md`, project law).
