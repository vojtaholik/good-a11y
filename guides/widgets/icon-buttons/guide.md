---
name: Icon-only buttons
description: Give icon-only buttons and SVG icon links an accessible name, toggle state with aria-pressed and a big enough target
criteria:
  - STD-SC-1.1.1
  - STD-SC-2.5.3
  - STD-SC-4.1.2
  - STD-SC22-2.5.8
---

# Icon-only buttons

## When to use

Any control that shows only an icon: close (X), search (magnifier), menu (hamburger), favourite (heart), play, delete (trash), social links. Without a name, a screen reader says "button" and nothing else, and voice control users cannot say what to click.

## Name the control, hide the icon

```html
<button type="button" class="icon-button" aria-label="Close">
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" />
  </svg>
</button>
```

Or, with text that also shows when CSS fails:

```html
<button type="button" class="icon-button">
  <svg aria-hidden="true" focusable="false">...</svg>
  <span class="visually-hidden">Close</span>
</button>
```

```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
```

The name describes the action or destination, not the picture: "Search", not "Magnifying glass"; "Remove Rain jacket from cart", not "Trash icon".

## Repeated icons need distinct names

A list with a trash icon on each row has ten buttons called "Delete". Add the item: `aria-label="Delete Rain jacket"`, or reference the row title with `aria-labelledby="delete-3 item-3-title"` where `delete-3` is the button's own id holding the word "Delete".

## Toggle buttons

For a button that turns something on and off (favourite, mute, bold), keep the name fixed and expose the state with `aria-pressed`:

```html
<button type="button" aria-pressed="false" aria-label="Favourite">
  <svg aria-hidden="true" focusable="false">...</svg>
</button>
```

Toggle `aria-pressed` between "true" and "false" on click, and change the icon (outline to filled) for sighted users. Either change the name ("Mute" to "Unmute") or use `aria-pressed`, never both; "Unmute, pressed" contradicts itself.

## DO

- Use a real `<button>` for actions and `<a href>` for navigation; put the name on that element.
- Add `aria-hidden="true"` to decorative SVGs and icon font elements inside named controls, so the icon's own title or glyph is not read.
- Make the target at least 24 by 24 CSS pixels, or keep 24 px of spacing around a smaller one. 44 by 44 is better for touch.
- When there is visible text next to the icon, use that text as the name, and if you add `aria-label`, start it with the same words, so voice users can say what they see.
- Show a tooltip with the same text on hover and focus for sighted users who do not know the icon; it helps, but it does not replace the name.

## DO NOT

- Do not rely on `title` alone for the name. It is not shown on touch or keyboard focus and is announced inconsistently.
- Do not put `aria-label` on the `<svg>` and leave the button unnamed; name the button.
- Do not use an `<img>` icon without `alt` inside a button; give it `alt="Close"` or make it `alt=""` and name the button.
- Do not use a `div` or `span` with a click handler as an icon button.
- Do not use `aria-label` on an element that already has visible text that differs from it.

## React and frameworks

Icon components from libraries often render an `<svg>` without `aria-hidden`, and some add a `<title>` you did not ask for. Pass `aria-hidden` through, and require an accessible name in your `IconButton` component's props (a required `label` prop), so the type system catches unnamed buttons. In JSX the attribute is `aria-label` and `aria-pressed={pressed}` (boolean renders as "true"/"false").

## What to verify

- Every button and link in the accessibility tree has a non-empty name that says what it does.
- Repeated icon buttons in a list have distinct names.
- Toggle buttons report pressed state, and the name stays the same when toggled.
- Each icon target is at least 24 by 24 CSS pixels.
