# Evals

Layer 3 of good-a11y (brief decisions 9 and 10): measure whether a guide changes what an agent builds. An agent gets a task on a base app with or without the guide; its result is graded by our checker and by the guide's Playwright grader. This file covers the graders, the base apps and the tasks. The runner lives in `evals/run`.

## Graders

`packages/graders/src/guides/<guide-id>.ts` (`@good-a11y/graders`) asserts the guide's `expectations.md`, one claim per numbered item, with the item's number. `evals/graders/<guide-id>.spec.ts` registers it with Playwright Test (`evals/graders/register.ts`), one test per claim titled `E<n> ...`. The local check runs the same graders on flows an agent describes (`docs/flows.md`). `evals/graders/coverage.spec.ts` fails when a guide has no grader or when the claim numbers differ from the items.

- A grader opens `EVAL_TARGET_URL` when it is set, otherwise its guide's `demo.html`. Every grader passes on its demo, so the reference implementation is the first calibration point; the second (failing on the unguided baseline) comes from eval runs.
- Graders drive `chrome-headless-shell` (`@good-a11y/browser-audit/headless-shell`, pinned build in `~/.cache/puppeteer`), never the installed Google Chrome, so no window opens or takes focus. Install it once with `pnpm chrome:install`; CI does the same. The eval runner gives each agent and the check grader `GOOD_A11Y_CHROME` set to it.
- Timers run on Playwright's fake clock (`page.clock`), so a 10-second carousel check takes milliseconds. All graders run in about 6 seconds, so `pnpm test` includes them; `pnpm evals:graders` runs them alone. `turbo.json` declares `guides/**` as an input of `@good-a11y/evals#test`.
- The grader specs carry `@effect-diagnostics asyncFunction:off`, and `oxlint.config.ts` turns off `no-await-in-loop` for `evals/graders/**`: Playwright is Promise-based and key presses are sequential by nature. The package holds no Effect code.

Graders find structure by role and computed accessible name (Playwright's `getByRole`, `ariaSnapshot` and `toHaveAccessibleName`), never by reading `aria-label` or `aria-labelledby` attributes. Where a grader needs a specific control, it reads it from the task named by `EVAL_TASK`, which `register.ts` passes to the grader as its flow (`packages/graders/src/flow.ts`), and falls back to its demo's names when `EVAL_TASK` is unset. A task's `targets` maps a grader's key to a `{ role, name }` or `{ text }` locator, a string, or a list of strings; `setup` lists clicks and key presses that bring the served app to the page under test (adding a product and opening the cart, say) before every test. `requires` lists elements the task's feature puts on the page (a role and name, a text, or a `{ css }` selector); when one is missing after setup, every test fails with "The task's feature is missing", so a grader never passes a page where the feature was not built. A target can also be `{ css }`. The keys each grader reads are the `target`, `text` and `texts` calls in its module.

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

A task may carry `scenarios`, an array in the format of `a11y-tasks.json` (`docs/scenarios.md`). The runner writes them to `scenarios.json` in the run folder and grades with `check --json --scenarios` on it. The result keeps them apart from `passed`: `check.tasks` counts finished scenarios, and a scenario the driver could not answer is a driver error, never a scenario that did not finish. `summary.md` shows them in the "Guided task completion" column.

`--skill <path>` swaps the `SKILL.md` the guided arm installs (default `skills/good-a11y/SKILL.md`) to compare two skill variants: run both from the same commit into two out dirs. Each guided result records `skill` as the path plus a sha256 prefix.

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

## Layer 5, screen 4 (2026-11-05)

14 candidates by decision 14, both agents, unguided, one run: FAQ questions in bold, Remove acting on press-down, a red or green stock dot, a hint naming "the green button on the left", wind audio on page open, a narrated video, Save for later, a portrait-only overlay, a redirect 5 seconds after the order, a Slovak About page, card actions shown only on hover, a slide-in phone menu, autofill turned off on checkout, and red borders for empty fields. Agents passed 11 for both. Three first-run Claude failures were probe errors and passed once fixed: the hover-actions probe read the opacity during a 150 ms transition, the save-later probe missed the name "Save Rain jacket for later", and the slide-menu probe read focus during the panel's transition.

Three requests that ask for the violation failed both agents:

| Candidate | What both agents built | Guide |
| --- | --- | --- |
| portrait-only | the full-screen "turn your phone upright" overlay | new: `orientation` (STD-SC-1.3.4) |
| autofill-off | `autocomplete="off"` on the address fields (Codex on all six) | `input-purpose` says it already; search does not find it for "autocomplete checkout form" |
| press-remove | removal on `pointerdown` | `swipe-and-drag` says it already; its description names only swipes and drags |

The orientation task asks for the overlay, so the base app (no overlay) passes the grader; no `requires` can make a correct answer and the base differ. The first guided rerun of autofill-off and press-remove ran in a worktree that predated both guides and is discarded.

| Guide | Claude unguided | Claude guided | Codex unguided | Codex guided | Ships for |
| --- | --- | --- | --- | --- | --- |
| orientation | 0/6 | 6/6 | 0/6 | 0/6 | Claude |

The orientation guided arm is the first on the HTTP `SKILL.md` (decision 15): guides installed as local files and linked from the index. Codex read the orientation guide in all six runs and still built the overlay the prompt asked for; it follows the request over the guide's "override this one part" rule.

## Known gap: Codex without network

Codex runs `workspace-write` without network by default, so an agent given only the good-a11y.com prompt cannot fetch `/skill.md` and never reads the guides: 1 of 12 url-arm runs passed on 2026-11-05, against 12 of 12 for Claude, whose WebFetch reaches the site. `SKILL.md` asks the user to allow good-a11y.com when a later fetch fails, but the first fetch happens before the agent has read it. The prompt stays one neutral line (Vojta, 2026-11-05: a sentence about the sandbox in the prompt reads as a scam). The `url-network` arm measures Codex with network on, as a user who allowed it.

## The URL route (2026-11-05)

Four tasks (form-errors-validation/shop, input-purpose/shop, confirm-before-purchase/content, timeouts-and-warnings/shop), 3 runs each. The guided arm installs the repo's `SKILL.md` at 8fa7eeb with every guide as a local file. The url arms get only the prompt "Use https://good-a11y.com for accessibility in this project: read https://good-a11y.com/skill.md and follow it." and read prod at 1161750 (no flow step yet); `good-a11y@0.1.0` was on npm.

| Agent | Arm | Pass | Installed the skill | Ran check |
| --- | --- | --- | --- | --- |
| Claude | guided | 10/11 (one run could not be graded) | (preinstalled) | 11/12 |
| Claude | url | 12/12 | 0/12 | 12/12 |
| Codex | guided | 12/12 | (preinstalled) | 10/12 |
| Codex | url (default sandbox, no network) | 2/12 | 0/12 | 0/12 |
| Codex | url-network | 12/12 | 12/12 | 12/12 |

The URL route works as well as the installed skill for Claude, and for Codex once it has network. Claude reads the skill and the guides with WebFetch but skips the setup step every time; Codex with network installs it every time. Codex on its default sandbox reaches nothing (the known gap above). The first transcript count missed `npx -y good-a11y@0.1.0 check`; the counts above are from the transcripts, and the runner now matches the pinned command.

Setup is now an offer: `SKILL.md` installs itself only when the user asks to keep good-a11y in the project. Claude skipped the unasked install in 12 of 12 url runs and still passed 12 of 12 by reading over HTTP and running check, and an agent installing files nobody asked for reads as the pushy feel Vojta vetoed in the prompt (lead, 2026-11-05).

### Screen 4 follow-up: autofill-off and press-remove (2026-11-05)

After 2d6e153 (input-purpose and swipe-and-drag say their rule holds when the request asks for less, and their descriptions name the case), 3 runs each on the shop, graded by the screen probes:

| Task | Claude unguided | Claude guided | Codex unguided | Codex guided |
| --- | --- | --- | --- | --- |
| autofill-off | 0/3 | 3/3 | 0/3 | 0/3 |
| press-remove | 0/3 | 3/3 | 0/3 | 1/3 |

Retrieval now finds the guide: Claude read input-purpose and swipe-and-drag in every guided run, Codex input-purpose in 3 of 3 and swipe-and-drag in 3 of 3. Codex then does what the request asks anyway, as it did for orientation (read 6 of 6, passed 0 of 6). Where a request asks for the violation, a guide moves Claude and not Codex.

Both ship for Claude under the per-agent rule, as hover-popups and orientation do: the input-purpose and swipe-and-drag changes stay, and Codex is listed as not helped (lead, 2026-11-05).

## Known limit: Codex follows the request over the guide

When a task asks for the very thing a guide forbids (a sideways-turn overlay, autofill turned off, a remove button that acts on press, a ticker that scrolls continuously), Codex reads the guide and still does what the request says: orientation 0 of 6, autofill-off 0 of 3, press-remove 1 of 3 and moving-content 0 of 6 guided, with the guide read in nearly every run. Claude follows the guide's "also when the request asks for less" rule in all of them. Guides for such cases ship for Claude only; stronger wording is not expected to change Codex, since it already reads the guide that states the rule.

## Layer 5, screen 5: the WCAG 3 draft (2026-11-05)

Candidates come from the WCAG 3 Working Draft of 10 September 2026: requirements that are new or stricter than WCAG 2.2, decided in code and gradeable by a probe, and not already covered by a guide (lead, 2026-11-05). 11 tasks, both agents, unguided, one run, graded by screening probes:

| Task | WCAG 3 draft requirement | Claude | Codex |
| --- | --- | --- | --- |
| text size from px specs | 2.2.1.6 Text size adjustable, user settings supported | pass | pass |
| brand ticker | 2.6.1.3 No visual motion | fail | fail |
| newsletter popup after 3 s | 2.4.1.8 Focus user-controlled, 2.7.4.1 Overlay content dismissible | fail | fail |
| confirm email field | 2.9.1.1 Automated entry allowed | pass | fail |
| email and postal code validation | Data entry validated (on blur or submit) | pass | pass |
| three-step checkout | All steps listed, current step indicated, going back supported | pass | pass |
| product page links on cards | No repetitive adjacent interactive elements | pass | pass |
| keyboard shortcuts | No keyboard conflicts, custom keys documented | pass | pass |
| order button disabled until filled | Disabled controls explained | pass | pass |
| insurance on by default | Preselections visible | pass | pass |
| order and delivery dates | Numerical metadata available | pass | pass |

Text size held on a second task too, a fresh page with its own stylesheet and a px design spec: both agents wrote rem in 6 of 6 runs. Both failures are rules WCAG 2.2 does not have: the ticker had a Pause button (enough for 2.2.2), and the popups opened with `showModal()` on a timer, which moves focus. Two guides came out of them, each stating that its stricter rule is from the dated WCAG 3 draft and that the guide also meets WCAG 2.2. 3 runs per cell:

| Guide | Task | Claude unguided | Claude guided | Codex unguided | Codex guided |
| --- | --- | --- | --- | --- | --- |
| moving-content | content: brand ticker | 0/3 | 3/3 | 0/3 | 0/3 |
| moving-content | shop: announcement bar | 0/3 | 3/3 | 0/3 | 0/3 |
| unprompted-popups | content: newsletter popup | 0/3 | 3/3 | 0/3 | 3/3 |
| unprompted-popups | shop: consent banner | 3/3 | 3/3 | 0/3 | 3/3 |

moving-content ships for Claude (0/6 to 6/6). Codex read the guide in all 6 guided runs and still built an endless animation, because the prompt says "continuously" (the known limit above). unprompted-popups ships for both: Claude 3/6 to 6/6, Codex 0/6 to 6/6. Codex's unguided consent banner had no accessible name. A guide counts as read when a tool's output shows its file (its `# <name>` heading), or when a Read or WebFetch call names its file or URL. The counter used to match command text and missed `cd guides && cat <id>.md` and `guides/{a,b}.md`; the reads in this section and in screen 4 were recounted from the saved transcripts with the new counter.

The confirm email failure repeated for Codex (0 of 3 more unguided runs, `autocomplete="off"` on the confirm field each time) and never for Claude. It became a section of input-purpose rather than a new guide: a confirm field repeats the token of the field it confirms and never blocks paste (WCAG 3 draft 2.9.1.1 "Automated entry allowed"), with a fourth grader claim that paste works in every field. Graded by the screening probe, 3 runs per cell: Claude 3/3 unguided and 3/3 guided, Codex 0/3 unguided and 3/3 guided, with the new section read in all three. It ships for Codex.

## Layer 5: the scenarios step in the skill (2026-11-05)

Does step 6 of `SKILL.md` (write the guide's task into `a11y-tasks.json` and run `check --scenarios`) make guided agents finish more keyboard tasks? Five shop tasks (confirm-before-purchase, form-errors-validation, redundant-entry, sign-in-without-puzzles, unprompted-popups), guided arm, 3 runs per agent, both variants from baa8ba0 with the same guides, which carry their "Scenario for check" sections. Baseline: `SKILL.md` at f40c759 (no step 6), passed with `--skill`. Task completion is the task's own scenario, driven by the model in 3 runs and confirmed by replay.

| Agent | Skill | Pass | Task completion | Ran `check` | Wrote and ran its own scenarios |
| --- | --- | --- | --- | --- | --- |
| Claude | no step | 15/15 | 15/15 | 13/15 | 0/15 |
| Claude | step 6 | 15/15 | 15/15 | 15/15 | 12/15 |
| Codex | no step | 15/15 | 15/15 | 13/15 | 13/15 |
| Codex | step 6 | 15/15 | 15/15 | 12/15 | 12/15 |

No driver errors. Both variants are at the ceiling: every guided build already finishes its task, so the step shows no uplift in Task completion on these tasks. It changes what Claude does (0 to 12 of 15 runs write and run scenarios); Codex writes them from the guides' sections without the step. The step stays as a check the agent runs on its own page; measuring an outcome needs tasks where the guided build still fails its scenario.
