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

## Round 1 (2026-11-04)

Every task, both arms, 3 runs each. Claude Code (`--effort low`) from `full-1`, regraded on 1bdf5a3 after the grader fixes below, and `focus-1` for focus-visible on the trapped base apps. Codex (`model_reasoning_effort=low`) from `codex-clean-1`, a fresh run in its own HOME on 7e92a2b: the Codex runs in `full-1` read the user's personal skills from `~/.agents/skills` in all 180 runs and are void. Each cell is passes over graded runs, both apps together (6 runs). Ship rule per agent: unguided under 70 % and an uplift of at least 15 points.

| Guide | Claude unguided | Claude guided | Codex unguided | Codex guided | Ships for |
| --- | --- | --- | --- | --- | --- |
| form-errors-validation | 0/6 | 6/6 | 0/6 | 6/6 | both |
| skip-link-landmarks | 0/6 | 5/6 | 2/6 | 6/6 | both |
| menu-button | 4/6 | 6/6 | 1/6 | 6/6 | both |
| image-alt | 1/6 | 3/6, then 6/6 | 3/6 | 5/6, then 6/6 | both |
| status-messages-toast | 3/6 | 6/6 | 0/6 | 6/6 | both |
| tabs | 4/6 | 6/6 | 6/6 | 6/6 | Claude |
| focus-visible | 3/6 | 6/6 | 6/6 | 6/6 | Claude |
| combobox-autocomplete | 6/6 | 6/6 | 3/6 | 6/6 | Codex |
| disclosure-accordion | 5/6 | 6/6 | 3/6 | 5/6 | Codex |
| spa-route-change | 6/6 | 5/6 | 3/6 | 6/6 | Codex |
| reduced-motion | 6/6 | 6/6 | 6/6 | 6/6 | neither |
| custom-select | 6/6 | 6/6 | 6/6 | 6/6 | neither |
| dialog-modal | 6/6 | 6/6 | 6/6 | 6/6 | neither |
| icon-buttons | 6/6 | 6/6 | 6/6 | 6/6 | neither |
| required-and-hints | 6/6 | 6/6 | 6/6 | 6/6 | neither |

"then" is the guided rate after the guide change in 5e392bb, re-run on the guided arm only (3 runs per app); Codex compared against `codex-clean-1`. status-messages-toast is from `toast-2` (both arms) and `toast-2-v3` (guided, after the last guide change), on 114be2f: its prompts name no duration and its E5 counts a toast faded to `opacity: 0` as gone.

What round 1 changed:

- Graders and tasks (1bdf5a3). menu-button on the shop matched the trigger "Options" exactly, while every agent in both arms named it "Options for Rain jacket"; it now matches loosely. spa-route-change on the content app went to About, whose title does not hold its h1 and whose main has nothing to Tab to; it now goes to the Tatras article. The reduced-motion precheck missed sliders that keep every slide in the DOM; it now also sees transforms and animations change across the timer tick. menu-button, spa-route-change and reduced-motion looked weak only because of these.
- status-messages-toast: guided agents kept the prompt's 3 s (content) or 4 s (shop), and the grader's 5 s check then found the toast gone. The guide got a 6000 ms floor near the top. Claude followed it; Codex read it and kept the requested time on purpose ("retained your requested 4 seconds"), and a stronger wording did not change that. The content runs that passed did so only because their toast faded to `opacity: 0`, which E5 counted as visible. Both were fixed in the task (114be2f): the prompts name no duration, and E5 checks visibility with opacity. Re-run, guided Claude content toasts lasted 6 s but did not pause on hover; the guide now states the hover and focus pause in that same rule with a plain-JavaScript example, and both agents pass guided 6/6.
- image-alt: agents put the chart values in a figcaption sentence. The guide's chart example now carries its data table and says a sentence is not enough.
- Retrieval: the "guided runs that retrieved the guide" column read 4/6 for Claude on most tasks. The transcript reader missed the bundle when the agent held it in a shell variable (`G=.../good-a11y.mjs; node $G search`) and when Codex escaped quotes. Read correctly, Claude retrieved its guide in 94 of 95 guided runs and Codex in 90 of 90 (`codex-clean-1`). The skill and search needed no change.
- Codex runs in its own HOME with only its `auth.json`, so it sees its built-in skills and the installed good-a11y skill, nothing of the user's.
- Codex's `workspace-write` sandbox blocks binding a local port, so Codex cannot serve a page to run `check` against; its guided runs use the guides but not the checker.

## Layer 5, first guides (2026-11-04)

Picked by expected failure, not coverage (decision 14 of the good-a11y brief). Each candidate was first screened with a throwaway probe: one task, both agents, unguided, one run. Only a failure earns a guide.

Screen 1, 20 candidates: 18 passed for both agents (OTP code entry, custom date picker, dual price slider, drag reorder, info tooltip, sortable table, gift-wrap switch, colour swatches, photo drop zone, small quantity buttons, cookie notice, route tiles at 320 px and with text spacing, product gallery, checkout steps, load more, Slovak quote language, "Read more" link names, PDF link text). Checkout fields (autocomplete tokens) and billing address (redundant entry) failed both.

Screen 2, 9 candidates: label in name, character key shortcuts, sticky header over focus, consistent help and video captions passed both. Buy now (no confirm or cancel) and a letters puzzle at sign-in failed both. A cart hold with no warning and a swipe that cannot be called off failed Codex only.

The passes need no guide for now. Full graders for the passes most likely to hide a gap (date picker, dual slider, sortable table, drag reorder) are parked.

Every failure became a guide with tasks on both apps and a grader that passes on its `demo.html` and fails on the unchanged base apps and on the screen's unguided patches. Then the 3-run matrix, both arms:

| Guide | Claude unguided | Claude guided | Codex unguided | Codex guided | Ships for |
| --- | --- | --- | --- | --- | --- |
| input-purpose | 3/6 | 6/6 | 3/6 | 6/6 | both |
| redundant-entry | 3/6 | 6/6 | 0/6 | 6/6 | both |
| confirm-before-purchase | 2/6 | 5/6 | 0/6 | 6/6 | both |
| sign-in-without-puzzles | 1/6 | 6/6 | 1/6 | 6/6 | both |
| timeouts-and-warnings | 3/6 | 6/6 | 2/6 | 6/6 | both |
| swipe-and-drag | 6/6 | 6/6 | 4/6 | 6/6 | Codex |

Results in `evals/results/l5-<guide>`, regraded into `l5-<guide>-r` for the four whose grader was fixed after the run:

- redundant-entry typed a non-address string into `type=email` fields and left a required phone empty, so the content form's own validation stopped it before step 2. It now types valid values per field type and fills the rest of step 1.
- timeouts-and-warnings missed extend buttons named "Hold for 10 more minutes" and clicked an always-visible extend button at the start. It now looks for the control 25 seconds before the end and accepts "hold" and "more minutes".
- sign-in-without-puzzles counted only a way around the puzzle. A control that does the check for the user ("Fill letters for me", also inside a closed `details`) meets 3.3.8 too and now passes. Showing the letters as plain text does not.
- confirm-before-purchase treated page text that already held "booked" as a placed booking. It now compares with the count before the click.

confirm-before-purchase and sign-in-without-puzzles are from `l5-<guide>-2`: their first prompts asked for the violation ("orders straight away", "types the five letters"), and Codex followed the request over the guide, as with the toast duration in round 1. The prompts now state the goal ("without going through the cart and the checkout form", "add a check that the person signing in is human") and both guides were re-run, both arms. Two more grader fixes came out of it: sign-in submits at a person's pace, since Claude's honeypot rejects a form filled in under 1.5 s, and it accepts an "I am human" checkbox, which tests nothing; confirm-before-purchase counts only buttons that appear after the click, so the other cards' "Buy now" buttons are not taken for a confirm button. Claude's one guided miss labels its "Buy now" button "Buy Rain jacket now", so the name does not hold the visible text.

## Layer 5, screen 3 (2026-11-04)

15 candidates picked by decision 14, both agents, unguided, one run: link colour in text, field borders in a light restyle, a jump-to select, a new page's title, a phone map view, shake to undo, a one-line notice bar at 320 px, postal code and email error wording, endless scroll, a comment draft, language links, live search, image zoom on hover, a wishlist button in two places, rotating tips. Agents passed 11 for both. Two were probe errors: a static "your draft is saved" line is not a status message, and Codex built the live search on the home page. Field borders failed Codex and image zoom failed Claude, so both became guides:

| Guide | Claude unguided | Claude guided | Codex unguided | Codex guided | Ships for |
| --- | --- | --- | --- | --- | --- |
| hover-popups | 3/6 | 6/6 | 6/6 | 6/6 | Claude |
| non-text-contrast | 6/6 | 6/6 | 5/6 | 6/6 | neither, removed |

Codex's screen failure on field borders did not repeat over 3 runs (5/6 unguided), so non-text-contrast does not meet the rule and is not shipped. The guided arm of this matrix started on the old `SKILL.md` and some runs installed the new one (setup section added); the loop it describes is the same.
