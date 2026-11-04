# Evals

Layer 3 of good-a11y (brief decisions 9 and 10): measure whether a guide changes what an agent builds. An agent gets a task on a base app with or without the guide; its result is graded by our checker and by the guide's Playwright grader. This file covers the graders, the base apps and the tasks. The runner lives in `evals/run`.

## Graders

`evals/graders/<guide-id>.spec.ts` asserts the guide's `expectations.md`, one test per numbered claim, titled `E<n> ...` with the claim's number. `evals/graders/coverage.spec.ts` fails when a guide has no grader or when the `E<n>` numbers differ from the claims.

- A grader opens `EVAL_TARGET_URL` when it is set, otherwise its guide's `demo.html`. Every grader passes on its demo, so the reference implementation is the first calibration point; the second (failing on the unguided baseline) comes from eval runs.
- Graders drive the system Chrome (`channel: "chrome"`), so nothing is downloaded on install. GitHub's Ubuntu runners ship Chrome.
- Timers run on Playwright's fake clock (`page.clock`), so a 10-second carousel check takes milliseconds. All graders run in about 6 seconds, so `pnpm test` includes them; `pnpm evals:graders` runs them alone. `turbo.json` declares `guides/**` as an input of `@good-a11y/evals#test`.
- The grader specs carry `@effect-diagnostics asyncFunction:off`, and `oxlint.config.ts` turns off `no-await-in-loop` for `evals/graders/**`: Playwright is Promise-based and key presses are sequential by nature. The package holds no Effect code.

Graders find structure by role and computed accessible name (Playwright's `getByRole`, `ariaSnapshot` and `toHaveAccessibleName`), never by reading `aria-label` or `aria-labelledby` attributes. Where a grader needs a specific control, it reads it from the task named by `EVAL_TASK` (`evals/graders/task.ts`) and falls back to its demo's names when `EVAL_TASK` is unset. A task's `targets` maps a grader's key to a `{ role, name }` or `{ text }` locator, a string, or a list of strings; `setup` lists clicks and key presses that bring the served app to the page under test (adding a product and opening the cart, say) before every test. `requires` lists elements the task's feature puts on the page (a role and name, a text, or a `{ css }` selector); when one is missing after setup, every test fails with "The task's feature is missing", so a grader never passes a page where the feature was not built. A target can also be `{ css }`. The keys each grader reads are the `target`, `text` and `texts` calls in its spec.

A correct reduced-motion page looks the same as a page with no motion, so `reduced-motion` also checks first, without reduced motion, that the page scrolls smoothly, runs an animation or changes on its own; otherwise all its tests fail. On the unchanged base apps every one of the 30 tasks fails at least one expectation.

## Base apps

Starting points that tasks modify, written the way a careful developer would write an ordinary app, with one deliberate trap: both stylesheets carry an old reset, `:focus { outline: none; }`, so neither app passes `focus-visible` before any change. A task whose unchanged base already passes its guide measures nothing. Apart from that trap, both pass our static checks, axe in light and dark mode, and the local `check` on every page; with it, the local `check` reports `axe:focus-visible` on every page, so a run's `guideFailing` (the failures that belong to its own guide) is what compares arms.

- `evals/apps/shop` (`@good-a11y/eval-shop`): React 19 and Vite 8, no router library. Product grid with a quick-view `<dialog>`, a cart with quantity buttons, a checkout form with no validation, an order-placed page. A small `pushState` router sets the title and nothing else. `pnpm build` then `pnpm preview` serves it on port 4173, and the history fallback serves every route. Product images sit in `public/products` unused, for the image task. Vite's built-in Oxc transform handles JSX, so there is no React plugin.
- `evals/apps/content`: static HTML and one stylesheet, served as is. Home with a story list, two articles (figures, a chart image, a quote, a list), About, and a search page whose script filters a fixed index. One header navigation, no skip link.

Oxlint skips `evals/apps/**`: the repo fence (no comments, Effect rules) is for product code, and the apps should look like ordinary projects to the agents that change them. Oxfmt still formats them, and the shop's `build` typechecks it.

## Tasks

`evals/tasks/<guide-id>/<app>.json`, two per guide, one per app:

```json
{
  "guide": "dialog-modal",
  "app": "shop",
  "path": "/",
  "prompt": "On the cart page, when a customer clicks \"Empty cart\", ask them to confirm first in a popup ... Make reasonable assumptions where a detail is missing and finish the whole change without asking questions.",
  "setup": [
    { "click": { "role": "button", "name": "Add to cart" } },
    { "click": { "role": "link", "name": "Cart (1)" } }
  ],
  "targets": {
    "opener": { "role": "button", "name": "Empty cart" },
    "close": { "role": "button", "name": "Keep items" }
  }
}
```

`path` is the page the grader opens on the served app. A prompt is what a product owner would ask for, fully specified: every name, label, route and line of copy the change needs, so an agent never has to stop and ask, and every prompt ends by telling the agent to make reasonable assumptions and finish without asking. The names in `targets` are the ones the prompt asks for. It never names the accessibility technique, ARIA, focus, labels, keyboards or screen readers. Where a realistic request pulls toward the failure (the focus-visible tasks ask for a flat restyle with a sticky header on top of the outline reset), that pull is the point.
