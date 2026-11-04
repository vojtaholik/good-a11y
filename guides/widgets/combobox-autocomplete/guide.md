---
name: Combobox and autocomplete
description: Build an accessible autocomplete, typeahead, searchable picker (country, city) or search suggestions input with role combobox, listbox and aria-activedescendant
criteria:
  - STD-SC-2.1.1
  - STD-SC-4.1.2
  - STD-SC-4.1.3
---

# Combobox and autocomplete

## When to use

A combobox is a text input with a popup list of suggestions the user can pick from with the keyboard: city search, tag picker, product search with suggestions. If the user must pick one of a short, fixed set and never types, use a native `<select>`. If the input only filters a results list already on the page, use a plain search input plus a status message with the result count.

## Markup (ARIA 1.2 pattern)

The input itself has `role="combobox"`. Do not wrap it in a `div role="combobox"`; that older pattern is not supported well.

```html
<label for="city">City</label>
<input
  id="city"
  type="text"
  role="combobox"
  autocomplete="off"
  aria-autocomplete="list"
  aria-expanded="false"
  aria-controls="city-list"
/>
<ul id="city-list" role="listbox" aria-label="Cities" hidden></ul>
<div id="city-status" role="status" class="visually-hidden"></div>
```

## Focus stays in the input

DOM focus never leaves the text field, so the user can keep typing. Arrow keys move a virtual highlight, which you expose with `aria-activedescendant` set to the highlighted option's id.

| Key        | Action                                             |
| ---------- | -------------------------------------------------- |
| Arrow Down | Open the list if closed; highlight the next option |
| Arrow Up   | Highlight the previous option                      |
| Enter      | Accept the highlighted option, close the list      |
| Escape     | Close the list; if already closed, clear the input |
| Tab        | Close the list, keep what is typed, move on        |
| Typing     | Filter options, reset the highlight                |

```js
function render(matches) {
  list.replaceChildren(
    ...matches.map((city, i) => {
      const li = document.createElement("li");
      li.id = `city-opt-${i}`;
      li.role = "option";
      li.setAttribute("aria-selected", "false");
      li.textContent = city;
      return li;
    })
  );
  const open = matches.length > 0;
  list.hidden = !open;
  input.setAttribute("aria-expanded", String(open));
  input.removeAttribute("aria-activedescendant");
  status.textContent =
    matches.length === 0
      ? "No cities found"
      : `${matches.length} cities available`;
}

function highlight(option) {
  for (const o of list.children)
    o.setAttribute("aria-selected", String(o === option));
  input.setAttribute("aria-activedescendant", option.id);
  option.scrollIntoView({ block: "nearest" });
}

list.addEventListener("pointerdown", (e) => e.preventDefault());
list.addEventListener("click", (e) => {
  if (e.target.role === "option") accept(e.target);
});
```

`pointerdown` with `preventDefault` keeps focus in the input when an option is clicked; without it the input blurs, your blur handler closes the list, and the click lands on nothing.

## DO

- Label the input with a visible `<label>`. The combobox's name comes from it.
- Keep `aria-expanded` true only while the listbox is visible, and update it every time the list opens or closes.
- Give each option a unique, stable id; clear `aria-activedescendant` when the highlighted option is removed.
- Mark the highlighted option `aria-selected="true"` and style it with more than color.
- Announce the number of results through a status region that exists in the page before the first keystroke. Debounce it so it does not speak on every letter.
- Set `autocomplete="off"` so the browser's own autofill popup does not cover yours. Keep a real `autocomplete` token instead when the field is personal data, such as an address line, and skip the custom list.

## DO NOT

- Do not move DOM focus into the list with `.focus()` on options. The user loses the caret and screen readers leave the edit field.
- Do not make options `<button>` or `<a>` elements or give them `tabindex="0"`. They are options, reached by arrows.
- Do not select the first option automatically on Enter unless it is visibly highlighted and announced (`aria-autocomplete="both"` with inline completion).
- Do not open the list on focus with content the user did not ask for; open on typing or Arrow Down.
- Do not use a listbox for rich, interactive results (rows with buttons). That is a grid, a different pattern.

## React and frameworks

Derive `aria-activedescendant` from the active index in state, and build option ids from `useId()` plus the index. Re-rendering the option list with new keys on every keystroke can make screen readers lose the active option; keep keys tied to the item value. The `onBlur` close bug above is the most common failure: prevent default on the list's `onPointerDown`.

## What to verify

- Focus stays on the input during all arrow navigation; the caret is still there.
- The accessibility tree shows a combobox, expanded true or false matching the screen, and the active option announced as you arrow.
- Enter puts the option text in the input and closes the list; Escape closes it.
- A screen reader hears the result count after typing pauses.
