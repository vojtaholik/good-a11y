---
name: Tabs
description: Build accessible tabs with tablist, tab and tabpanel roles, roving tabindex and arrow key navigation
criteria:
  - STD-SC-1.3.1
  - STD-SC-2.1.1
  - STD-SC-4.1.2
---

# Tabs

## When to use

Tabs switch between panels of related content in place, one panel visible at a time: product details, specs and reviews; a settings page with sections. If each "tab" loads a different URL, it is navigation: use a `<nav>` with links and `aria-current="page"` on the active one, not tab roles. If several sections may be open at once, use an accordion.

## Markup

```html
<div role="tablist" aria-label="Product information">
  <button
    type="button"
    role="tab"
    id="tab-details"
    aria-selected="true"
    aria-controls="panel-details"
  >
    Details
  </button>
  <button
    type="button"
    role="tab"
    id="tab-specs"
    aria-selected="false"
    aria-controls="panel-specs"
    tabindex="-1"
  >
    Specs
  </button>
  <button
    type="button"
    role="tab"
    id="tab-reviews"
    aria-selected="false"
    aria-controls="panel-reviews"
    tabindex="-1"
  >
    Reviews
  </button>
</div>
<div
  role="tabpanel"
  id="panel-details"
  aria-labelledby="tab-details"
  tabindex="0"
>
  ...
</div>
<div
  role="tabpanel"
  id="panel-specs"
  aria-labelledby="tab-specs"
  tabindex="0"
  hidden
>
  ...
</div>
<div
  role="tabpanel"
  id="panel-reviews"
  aria-labelledby="tab-reviews"
  tabindex="0"
  hidden
>
  ...
</div>
```

## Keyboard: one Tab stop, arrows inside

The whole tab list is one stop in the Tab order. The selected tab has `tabindex="0"`, every other tab `tabindex="-1"` (roving tabindex). Tab from the tab list goes to the visible panel.

| Key | Action |
| --- | --- |
| Arrow Right / Arrow Left | Next / previous tab, wrapping. Use Up and Down for a vertical list (`aria-orientation="vertical"`) |
| Home / End | First / last tab |
| Enter / Space | Activate the focused tab (manual activation only) |

```js
const tabs = [...document.querySelectorAll('[role="tab"]')];

function select(tab) {
  for (const other of tabs) {
    const selected = other === tab;
    other.setAttribute("aria-selected", String(selected));
    other.tabIndex = selected ? 0 : -1;
    document.getElementById(other.getAttribute("aria-controls")).hidden =
      !selected;
  }
  tab.focus();
}

for (const tab of tabs) {
  tab.addEventListener("click", () => select(tab));
  tab.addEventListener("keydown", (e) => {
    const i = tabs.indexOf(tab);
    const target = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: -1 }[
      e.key
    ];
    if (target === undefined) return;
    e.preventDefault();
    select(tabs.at(target % tabs.length));
  });
}
```

This is automatic activation: arrows select as they move. Use it when panels are already in the page. When showing a panel is slow (a network fetch), use manual activation: arrows only move focus and `tabindex`, and Enter or Space selects.

## DO

- Put `role="tab"` on `<button>` elements so click and focus work without extra code.
- Keep `aria-selected` "true" on exactly one tab, and change it, `tabindex` and `hidden` together.
- Name the tab list with `aria-label` or `aria-labelledby` pointing at a nearby heading.
- Give a panel `tabindex="0"` when it has no focusable content, so keyboard users can reach and scroll it. Drop it when the panel starts with a link or field.
- Show the selected tab visually with more than color: a thick underline or a border.

## DO NOT

- Do not leave every tab at `tabindex="0"`. Users must Tab through all of them to reach the panel.
- Do not use `aria-current` or `aria-pressed` on tabs. Tabs use `aria-selected`.
- Do not use `aria-expanded` on tabs.
- Do not hide inactive panels with only `visibility` toggles on children or off-screen positioning; use `hidden` so their content leaves the Tab order.
- Do not wrap each tab in a `<li>` inside the tablist without giving the `<li>` `role="presentation"`; the list semantics get in the way of the tab roles.
- Do not use tab roles for page-level navigation.

## React and frameworks

Keep the selected index in state, and derive `aria-selected`, `tabIndex` and `hidden` from it in render. Move focus in the key handler by ref (`tabRefs.current[next].focus()`) after updating state; the tab elements already exist, so this works without an effect. Do not unmount inactive panels if they hold form input the user would lose; `hidden` keeps their state. Generate ids with `useId()`.

## What to verify

- Tab reaches the selected tab only, then the panel.
- Arrow keys move between tabs and wrap; Home and End work.
- The accessibility tree shows a tab list with names, one tab selected, and each panel named by its tab.
- Inactive panels are hidden from the tree.
