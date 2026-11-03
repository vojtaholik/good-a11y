# Task: verifier round 3: SC coverage plan (lead, 21:10 CET)

Read-only except the one output file. No questions; deadline ~00:20 CET, finish within 45 minutes.

Write `docs/sc-coverage-plan.md`: one row per WCAG 2.1 Level A and AA SC (all 50 `STD-SC-*` facts), plus the six WCAG 2.2 additions (`STD-SC22-*`). Columns: SC (fact ID), what the product checks today (static check id, axe rules from `packages/core` rendered mapping, or none), the best method we can add, one of:
- `static` (served HTML, deterministic),
- `rendered` (deterministic probe in the Browser Run session, e.g. reflow at 320 CSS px for 1.4.10, injected text-spacing CSS and overflow for 1.4.12, focus-visible by comparing computed outline/box-shadow before and after focus for 2.4.7, tab order reachability for 2.1.1/2.1.2, target size for 2.5.8, orientation lock for 1.3.4, 200% zoom for 1.4.4),
- `judged` (a typed yes/no or choice decision by TypeSafe Jev over text and/or a screenshot, e.g. alt text describes the image for 1.1.1, link text gives purpose for 2.4.4, headings and labels describe topic for 2.4.6, page language matches content for 3.1.1),
- `manual` (no reliable automated method),
and for added methods: exact signal, what counts as a fail, false-positive risk (low/med/high), priority (1 = add tonight). Be strict: mark `manual` when a method would be noisy. Ground the descriptions in the STD-SC excerpts. End with a short summary: counts per method, and the top 8 additions by value/accuracy. Send the lead the path.
