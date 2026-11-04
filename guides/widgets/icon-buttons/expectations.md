# Expectations: icon-buttons

1. Every `button` and `a[href]` that shows only an icon has a non-empty accessible name.
2. Icon buttons repeated per list item (such as remove buttons) have distinct accessible names.
3. SVG icons inside named buttons have `aria-hidden="true"`, so they add nothing to the name.
4. When the page has a toggle icon button (one that stays on or off, such as save or favourite), it exposes `aria-pressed`; activating it with Enter or Space flips the value and leaves the accessible name unchanged.
5. Each icon button's bounding box is at least 24 by 24 CSS pixels.
