# Task: writer (worktree ../ga-writer)

Read `_common-ga.md`, the guide format in decision 4, and the seed material: `gh api repos/badass-courses/a11y-agent/...` (`source/skills/a11y-agent/reference/*.md`, `source/skills/a11y-component/reference/*.md`, `tests/` rubrics) and the research report `research/reports/AI for accessibility conformance.md`. Write the first 15 guides into `guides/<category>/<slug>/` at the repo root, rewritten in your own words from W3C sources (WAI-ARIA APG, WCAG Understanding docs) and our verified facts, never copied from modern-web-guidance.

- Pick tasks where agents most likely get it wrong: dialog (modal), disclosure/accordion, menu button, tabs, combobox/autocomplete, form errors and validation, required/inline hints, skip link and landmarks, SPA route change focus and title, toast/status messages, icon-only buttons, custom select vs native, focus visible styles, reduced motion, images and alt decisions. Categories: forms, navigation, widgets, focus-and-keyboard, content, motion.
- `guide.md`: frontmatter `name`, `description` (one line an agent would search for), `criteria` (STD-SC IDs from `research/facts/standards.md`, verified only); body: when to use, DO / DO NOT, the minimal code (framework-neutral HTML/ARIA/JS, plus a short React note where agents usually err), what to verify; about 1-2k tokens, no links, teach only what an agent gets wrong.
- `demo.html`: a self-contained working reference that passes our checker (`pnpm cli scan` on a local file server, and `check` once it lands).
- `expectations.md`: 3-8 testable claims (keyboard, focus, ARIA state, names) a Playwright grader can assert.
Commit in batches of 5 once `packages/guides` validates them (coordinate with `guides`). Report counts to the lead.
