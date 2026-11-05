# good-a11y

Accessibility guides for coding agents, and a checker for the page the agent built. The guides cover the UI patterns agents most often get wrong, such as dialogs, forms, menus and route changes. The checker opens your page in your own Chrome, localhost included.

```bash
npx -y good-a11y@0.2.0 search "modal dialog focus"
npx -y good-a11y@0.2.0 retrieve modal-dialog
npx -y good-a11y@0.2.0 check http://localhost:5173
```

- `search` prints the best guides for a task as JSON.
- `retrieve` prints a guide's full text.
- `check` lists the page's issues against WCAG 2.1 Level AA, worst first, each with a fix prompt and its guide. `--flow` runs a guide's grader on your feature, and `--scenarios` replays tasks by keyboard.

Automated checks find only part of the issues WCAG covers, so a report is never a statement that a page is accessible or meets the law.

Needs Node 24.18 or later, and Chrome for `check`. Guides, the hosted checker and the agent skill: [good-a11y.com](https://good-a11y.com). Source: [github.com/vojtaholik/good-a11y](https://github.com/vojtaholik/good-a11y).
