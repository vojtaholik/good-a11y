---
name: Menu button
description: Build an accessible actions dropdown menu button with role menu, arrow keys and Escape, or a nav dropdown without it
criteria:
  - STD-SC-2.1.1
  - STD-SC-2.4.3
  - STD-SC-4.1.2
---

# Menu button

## When to use: action menu or navigation dropdown

Decide first which one you are building. The two look the same and need different markup.

- **Action menu** (a "More" or "..." button with Edit, Duplicate, Delete; a toolbar menu in an app): use `role="menu"` with `role="menuitem"` children and the full keyboard model below.
- **Navigation dropdown** (site header "Products" that opens a list of links): do not use `role="menu"`. Build a disclosure: a `<button aria-expanded>` that shows a plain list of links. Screen readers switch into an application mode for menus, and users expect arrow keys there; a list of links in a menu role breaks normal link reading and Tab.

Agents most often get this wrong by putting `role="menu"` on site navigation.

## Action menu markup

```html
<button
  type="button"
  id="actions-button"
  aria-haspopup="menu"
  aria-expanded="false"
  aria-controls="actions-menu"
>
  Actions
</button>
<ul id="actions-menu" role="menu" aria-labelledby="actions-button" hidden>
  <li role="menuitem" tabindex="-1">Edit</li>
  <li role="menuitem" tabindex="-1">Duplicate</li>
  <li role="menuitem" tabindex="-1">Delete</li>
</ul>
```

## Keyboard model

| Key | On the button | In the open menu |
| --- | --- | --- |
| Enter, Space, Arrow Down | Open, focus first item | Enter or Space activates the item and closes |
| Arrow Up | Open, focus last item | Previous item, wraps to last |
| Arrow Down |  | Next item, wraps to first |
| Home, End |  | First, last item |
| Escape |  | Close, focus the button |
| Tab |  | Close, let focus move on naturally |
| A letter |  | Optional: next item starting with it |

```js
const button = document.getElementById("actions-button");
const menu = document.getElementById("actions-menu");
const items = [...menu.querySelectorAll('[role="menuitem"]')];

function open(index) {
  menu.hidden = false;
  button.setAttribute("aria-expanded", "true");
  items.at(index).focus();
}
function close(returnFocus) {
  menu.hidden = true;
  button.setAttribute("aria-expanded", "false");
  if (returnFocus) button.focus();
}
button.addEventListener("click", () => (menu.hidden ? open(0) : close(true)));
button.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    open(0);
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();
    open(-1);
  }
});
menu.addEventListener("keydown", (e) => {
  const i = items.indexOf(document.activeElement);
  const moves = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: -1 };
  if (e.key in moves) {
    e.preventDefault();
    items.at(moves[e.key] % items.length).focus();
  }
  if (e.key === "Escape") close(true);
  if (e.key === "Tab") close(false);
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    activate(document.activeElement);
    close(true);
  }
});
menu.addEventListener("click", (e) => {
  if (e.target.role === "menuitem") {
    activate(e.target);
    close(true);
  }
});
document.addEventListener("pointerdown", (e) => {
  if (!menu.hidden && !menu.contains(e.target) && e.target !== button)
    close(false);
});
```

## DO

- Give menu items `tabindex="-1"` and move focus with `.focus()` (roving focus). Only one place in the menu takes focus at a time; Tab leaves the menu.
- Toggle `aria-expanded` on the button and `hidden` on the menu together.
- Name the menu with `aria-labelledby` pointing at the button.
- Use `menuitemcheckbox` or `menuitemradio` with `aria-checked` for toggles inside a menu ("Show grid").
- Close on Escape, on Tab, on item activation and on a click outside.

## DO NOT

- Do not use `role="menu"` for site navigation or for a list of links.
- Do not leave menu items in the Tab order (`tabindex="0"` on every item). Arrow keys move between items.
- Do not put buttons or links inside a `menuitem`; the item itself is the control. If you need real links, you are building navigation.
- Do not open the menu on hover only. Hover may open it for pointer users; the button must still open it on click and keyboard.
- Do not forget the button's own name. An icon-only "..." trigger needs `aria-label="More actions"`.

## React and frameworks

Keep focus logic in an effect that runs after the menu renders: calling `.focus()` in the same handler that sets `open` state fails because the items do not exist yet. Store item refs in an array, and the active index in state. A headless library that already implements this model (for example the menu from a maintained component library) is a better choice than a fresh one; check that it does not apply `role="menu"` to your navigation.

## What to verify

- Arrow Down on the button opens the menu with focus on the first item; Arrow Up on the button focuses the last.
- Arrow keys wrap; Home and End jump.
- Escape closes and focus is back on the button; `aria-expanded` is false.
- Tab from an open menu closes it.
- A screen reader announces "menu" and the item count on open.
