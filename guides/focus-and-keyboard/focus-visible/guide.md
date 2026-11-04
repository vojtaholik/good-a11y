---
name: Visible focus styles
description: Style a visible keyboard focus indicator with focus-visible and outline that is never removed or hidden under sticky headers
criteria:
  - STD-SC-1.4.11
  - STD-SC-2.4.7
  - STD-SC22-2.4.11
---

# Visible focus styles

## When to use

Every interactive element on every page: links, buttons, inputs, custom widgets. Keyboard users need to see where they are. The usual failure is a CSS reset or a design request ("remove the blue ring") that sets `outline: none` with nothing in its place.

## A global focus style

```css
:root {
  --focus: #0b57d0;
}
@media (prefers-color-scheme: dark) {
  :root {
    --focus: #8ab4f8;
  }
}

:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 2px;
}

html {
  scroll-padding-top: 5rem;
}
```

- `:focus-visible` shows the ring for keyboard focus and hides it for mouse clicks on buttons. Text inputs show it on click too, which is correct.
- `outline` follows border radius in current browsers, does not change layout, and stays visible in Windows forced colors mode. `box-shadow` rings disappear in forced colors; if you use one, add `outline: 2px solid transparent` as well so forced colors draws it.
- `outline-offset` keeps the ring off the element's own border, so it contrasts with the page background instead of the button fill.
- `scroll-padding-top` equal to a sticky header's height stops focused elements from scrolling under the header.

## Contrast of the indicator

The ring must stand out against what is next to it: aim for 3:1 against the background it sits on. One brand color rarely works on both light and dark sections. For mixed backgrounds use a two-tone ring:

```css
:focus-visible {
  outline: 3px solid #ffffff;
  box-shadow: 0 0 0 6px #1a1a1a;
}
```

## Not hidden by sticky or fixed content

A focused element must not be fully covered by a sticky header, a cookie banner, a chat button or a bottom bar. Fixes: `scroll-padding-top` and `scroll-padding-bottom` on `html` sized to the sticky elements; make cookie banners modal or move them out of the way; never let a fixed footer cover the last form field.

## DO

- Put the focus style in your base stylesheet, before components, so every element has it by default.
- Keep custom widgets focusable where they should be (`tabindex="0"` on a widget root, roving `tabindex` inside composites) so they get the same ring.
- For components with dark fills, set a per-component focus color that contrasts with the surrounding background.
- Check that the ring is not clipped by `overflow: hidden` on a parent; use a negative `outline-offset` inside clipped containers (cards, carousels).

## DO NOT

- Do not write `*:focus { outline: none }`, `button:focus { outline: 0 }` or Tailwind `outline-none` / `focus:outline-none` without a `focus-visible:` replacement.
- Do not signal focus only by a color change of text or background with low contrast; a 1 px color shift is not visible.
- Do not use `:focus-within` as the only focus style for a composite; the focused child still needs its own.
- Do not remove the ring because "it looks odd on click"; `:focus-visible` already solves that.

## React and frameworks

Component libraries and CSS resets (Tailwind preflight, some normalize variants) keep or remove outlines differently; check one button, one link and one input after adding them. In Tailwind, use `focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700`, not `focus:ring` alone. In CSS-in-JS, put the focus rule in the global style, not per component, so nothing ships without it.

## What to verify

- Tab through the whole page: every stop shows a ring you can see from a normal viewing distance, in light and dark mode.
- Clicking a button with the mouse does not leave a ring; clicking into a text field does.
- Tab to elements just below a sticky header and just above a fixed footer: each one is fully in view.
- In Windows high contrast or forced colors emulation, the ring is still drawn.
