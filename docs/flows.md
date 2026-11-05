# Agent-directed flows (`check <url> --flow <file>`)

Built 2026-11-05 by writer for the lead. The rendered check sees one page as it loads. Some criteria are only seen by using the page: confirming a purchase (3.3.4), entering data again (3.3.7), signing in without a puzzle (3.3.8), dragging and swiping (2.5.1, 2.5.2, 2.5.7), time limits (2.2.1), status messages (4.1.3). The eval graders already test these, one test per claim of a guide's `expectations.md`. The agent that just built the feature knows where it lives, so it describes it in a flow, and the local check runs that guide's grader against the running app.

```sh
npx -y good-a11y@0.1.0 check localhost:5173 --flow a11y-flows.json
```

## The flow file

One flow, or an array of flows. A flow has the shape of an eval task (`evals/tasks/<guide>/<app>.json`) without the prompt:

```json
[
  {
    "guide": "confirm-before-purchase",
    "path": "/",
    "setup": [{ "click": { "role": "button", "name": "Open cart" } }],
    "requires": [{ "role": "button", "name": "Buy now", "exact": false }],
    "targets": {
      "buy": { "role": "button", "name": "Buy now", "exact": false },
      "placed": "Thank you"
    }
  }
]
```

- `guide` is a guide id. Every guide has a grader, so every guide can be named.
- `path` is resolved against the checked URL (default: the checked URL itself).
- `setup`, `requires` and `targets` mean what they mean for eval tasks (`docs/evals.md`). The keys a grader reads are declared in the guide's `flow.json` and shown, with an example flow for the demo, in the "Flow for check" section at the end of the served guide (`https://good-a11y.com/<guide>.md`) and of `retrieve <guide>`. A grader that reads an undeclared key throws, so the section cannot drift from the grader.

## One grader, two runners

`packages/graders` (`@good-a11y/graders`) holds the graders. Each guide is one module exporting a declarative grader: its guide id, its claims (`E<n>` with a title and a `run({ page, flow })`), and optional browser context options, a start step and a precheck. Graders take the flow as an argument; nothing reads a global task.

- **Evals** register each grader with Playwright Test (`evals/graders/<guide>.spec.ts` is one call). `EVAL_TASK` becomes the flow and `EVAL_TARGET_URL` or the demo is the page.
- **The local check** runs the same grader through `playwrightFlowAuditLayer`, the `FlowAudit` port's adapter in `packages/graders`. `expect` from `playwright/test` works outside the test runner and throws the grader's message, so a failed claim is a thrown error.

## What the check runs

- Only on a private target (`isPrivateTarget`: localhost, a private address or a one-label host). On a public URL the flows are skipped and the report says why. The hosted apps never import `@good-a11y/graders` or `playwright` (`rat-stack-boundaries/no-local-mode-in-hosted-apps`).
- The user's Chrome through Playwright (`channel: "chrome"`, or `--chrome <path>`), headless, 1280 x 800. Playwright is not bundled; the `good-a11y` package lists it next to puppeteer-core. It downloads no browser.
- A fresh browser context per claim, as Playwright Test gives each test. Every request whose origin is not the checked page's origin is aborted, as during the empty-submit probe, and service workers are blocked. The aborted URLs are listed in the result.
- A claim fails on a thrown error or on its timeout (the grader's, 15 seconds by default).

## In the report

A section "From the flows you described", after the issues and before the questions. Each failing claim is shown the way an issue is: the guide and claim, the criteria from the guide's verified facts, what failed (quoted as data), and the link to the guide that fixes it. Passing claims are listed in one line. `--json` adds `flows` beside the report fields.

Flow results are **not counted in the verdict**. A grader tests the guide's expectations, which can be stricter than the success criterion (a toast that stays at least 4 seconds, say), and its result depends on the targets the agent wrote. The verdict stays with the deterministic checks of the page itself.

## Agent loop

`skills/good-a11y/SKILL.md` (owned by guides) gets a step after the check: write a flow for each guide you used whose feature needs a user to act (the targets the guide's grader reads), run `check <url> --flow <file>`, and fix each failing claim with its guide.
