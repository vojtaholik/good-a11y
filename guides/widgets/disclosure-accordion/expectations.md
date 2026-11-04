# Expectations: disclosure-accordion

1. The section toggle has role `button` and exposes `aria-expanded` as `false` while its panel is closed.
2. Pressing Enter on a focused toggle sets its `aria-expanded` to `true` and makes the content of the controlled panel visible.
3. Pressing Space on an expanded toggle sets `aria-expanded` to `false` and the content of the panel is no longer visible.
4. While a panel is closed, pressing Tab from its toggle never focuses an element that is not visible on screen (hidden, transparent, or clipped by a collapsed container).
5. Each toggle button sits inside a heading element, so the heading's accessible name equals the toggle's name.
