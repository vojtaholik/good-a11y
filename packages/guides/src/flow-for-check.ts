import type { Guide } from "./guide.js";

export const FLOW_FOR_CHECK = "Flow for check";

export const flowForCheck = (guide: Guide): readonly string[] => {
  const where = { guide: guide.id, path: "/" };

  const example =
    guide.flow.length === 0
      ? where
      : {
          ...where,
          targets: Object.fromEntries(
            guide.flow.map(({ demo, key }) => [key, demo])
          ),
        };

  return [
    `## ${FLOW_FOR_CHECK}`,
    "",
    'After building this, describe where the feature lives in a flow file and run the local check with it: `check <url> --flow <file>`. The check runs this guide\'s grader on your running app and lists each expectation it failed. A flow is JSON with `guide`, `path` (resolved against the checked URL), `setup` (steps that reach the feature, each `{"click": <target>}` or `{"press": "Escape"}`), `requires` (targets that must be on the page) and `targets`. A target is `{"role": "button", "name": "Buy now"}` (add `"exact": false` or `"nth": 1` when needed), `{"text": "..."}` or `{"css": "..."}`.',
    "",
    ...(guide.flow.length === 0
      ? [
          "This guide's grader reads no targets: `path`, `setup` and `requires` are enough.",
          "",
        ]
      : [
          "The targets this guide's grader reads. A key you leave out takes the demo's value, so name every one for your app:",
          "",
          ...guide.flow.map(({ key, means }) => `- \`${key}\`: ${means}`),
          "",
        ]),
    "The flow for this guide's demo:",
    "",
    "```json",
    JSON.stringify(example, null, 2),
    "```",
    "",
  ];
};
