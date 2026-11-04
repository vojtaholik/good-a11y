---
name: Disclosure and accordion
description: Build an accessible show/hide toggle, FAQ accordion or expandable section with aria-expanded
criteria:
  - STD-SC-1.3.1
  - STD-SC-2.1.1
  - STD-SC-4.1.2
---

# Disclosure and accordion

## When to use

A disclosure is one button that shows and hides one region: "Show details", a "Read more", a filter group. An accordion is a stack of disclosures, each with a heading, often an FAQ. Neither is a tab list (one panel visible at a time, arrow keys between tabs) and neither is a menu.

## Simplest correct version: details and summary

For a single disclosure or an FAQ with no extra behavior, use `<details>` and `<summary>`. Keyboard, state announcement and find-in-page all work with no script.

```html
<details>
  <summary>What is the return policy?</summary>
  <p>Unused items can be returned within 30 days.</p>
</details>
```

Do not put a heading inside `<summary>` if you need heading navigation to work across screen readers; use the button pattern below instead. The `name` attribute (`<details name="faq">`) gives you an exclusive accordion where opening one closes the others.

## Button pattern for accordions with headings

When each section needs a real heading, or you need to control open state from code, wrap a `<button>` in the heading and point it at its panel.

```html
<h3>
  <button
    type="button"
    aria-expanded="false"
    aria-controls="ship-panel"
    id="ship-button"
  >
    Shipping
  </button>
</h3>
<div id="ship-panel" hidden>
  <p>Orders ship within two working days.</p>
</div>
```

```js
for (const button of document.querySelectorAll(
  "[aria-controls][aria-expanded]"
)) {
  const panel = document.getElementById(button.getAttribute("aria-controls"));
  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!open));
    panel.hidden = open;
  });
}
```

## DO

- Put `aria-expanded` on the button, and keep it in sync with the panel on every toggle, including toggles from code.
- Hide the closed panel with `hidden` (or `display: none`). Hidden content must be gone from the tab order and from the accessibility tree, not just collapsed to zero height.
- Use `hidden="until-found"` when users should still find closed content with the browser's find in page; listen for `beforematch` to set `aria-expanded="true"` when the browser opens it.
- Keep the button text the same in both states ("Shipping"); the expanded state is announced for you. If the text changes ("Show more" to "Show less"), do not also use `aria-expanded`.
- Wrap the button inside the heading (`h3 > button`), never the heading inside the button. A button's content is flattened; the heading role is lost.
- Show the state visually too: a chevron that rotates, with the icon `aria-hidden="true"`.

## DO NOT

- Do not put `aria-expanded` on the panel, or on a `div` with a click handler. It belongs on the focusable element that toggles.
- Do not use a `div` or `span` as the toggle. A `<button>` gives Enter, Space and focus for free.
- Do not add `role="region"` to every panel. It creates a landmark per panel; use it only for a few panels (about six or fewer) whose content is large, and name it with `aria-labelledby` pointing at its button.
- Do not hide panels with `opacity: 0`, `height: 0` with `overflow: hidden`, or by moving them off screen while links inside stay focusable.
- Do not require arrow keys. Arrow navigation between accordion headers is optional; Tab must always work.
- Do not use `role="button"` on a `summary`; it is already a button.

## React and frameworks

Derive both attributes from one state value so they cannot drift: `aria-expanded={open}` on the button and `hidden={!open}` on the panel. React renders a boolean `aria-expanded` as the strings "true" and "false", which is correct. Generate stable ids with `useId()` for `aria-controls`; never reuse a hardcoded id inside a list. If you animate height, keep the panel `hidden` once the closing animation ends, or links inside stay reachable.

## What to verify

- Tab reaches each toggle; Enter and Space both toggle it.
- The accessibility tree shows the toggle as a button with expanded true or false that matches what is on screen.
- With a panel closed, Tab skips every link and field inside it.
- Heading navigation in a screen reader lists each accordion section.
