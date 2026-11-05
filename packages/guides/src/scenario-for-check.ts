import type { Guide } from "./guide.js";

export const SCENARIO_FOR_CHECK = "Scenario for check";

export const scenarioForCheck = (guide: Guide): readonly string[] =>
  guide.scenario === null
    ? []
    : [
        `## ${SCENARIO_FOR_CHECK}`,
        "",
        "This feature is a task a person has to finish. After building it, write the task as a scenario for your page, add it to `a11y-tasks.json` (one array), and run the local check with it: `check <url> --scenarios a11y-tasks.json`. The check opens the page with no pointer, presses your keys, and counts the task as finished when its success condition holds in the accessibility tree. A task that does not finish is a barrier: fix the page, never the keys.",
        "",
        'A scenario is JSON with `id`, `goal` (the task in a person\'s words), `path` (resolved against the checked URL), `inputs` (named values), `keys` and `success`. A key is `{"press": "Tab"}` (also Shift+Tab, Enter, Space, Escape, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Home, End, PageUp, PageDown) or `{"type": "<input name>"}`, which types that input into the focused field. Write the keys a keyboard user would press on your page, in order. `success` has `path` (where the page ends up, optional), `present` (at least one target that appears only once the task is done) and `absent` (targets that must be gone). A target is `{"role": "heading", "name": "Thank you"}` (add `"exact": false` for part of the name) or `{"text": "..."}`; there are no CSS targets.',
        "",
        "The scenario for this guide's demo:",
        "",
        "```json",
        JSON.stringify(guide.scenario, null, 2),
        "```",
        "",
      ];
