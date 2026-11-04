---
name: Custom select vs native select
description: Style a dropdown select accessibly with native select, appearance base-select, or a select-only combobox when custom is required
criteria:
  - STD-SC-1.3.1
  - STD-SC-2.1.1
  - STD-SC-3.3.2
  - STD-SC-4.1.2
---

# Custom select vs native select

## When to use

The user picks one value from a list: country, size, sort order, quantity. The most common accessibility bug here is a "dropdown" rebuilt from `div`s to get a custom look, which then has no keyboard support, no label and no value for screen readers. Choose in this order.

## 1. Native select, styled

A `<select>` gives you the label association, keyboard (arrows, type to jump, Enter, Escape), the platform picker on phones, form submission and validation. Most of the look is styleable.

```html
<label for="size">Size</label>
<select id="size" name="size" required>
  <option value="">Choose a size</option>
  <option>S</option>
  <option>M</option>
  <option>L</option>
</select>
```

```css
select {
  appearance: none;
  font: inherit;
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  border: 2px solid currentColor;
  border-radius: 0.375rem;
  background: var(--bg) url("data:image/svg+xml,...") no-repeat right 0.75rem
    center / 1rem;
  color: inherit;
}
```

Keep a visible focus style; `appearance: none` does not remove it, but resets often do.

## 2. Customizable select, as an enhancement

Browsers that support it let you style the button and the open picker, and put rich content in options, while keeping native behavior:

```css
@supports (appearance: base-select) {
  select,
  select::picker(select) {
    appearance: base-select;
  }
  select::picker(select) {
    border: 2px solid currentColor;
    border-radius: 0.375rem;
  }
  option:checked {
    font-weight: 700;
  }
}
```

Browsers without support show the styled native select from step 1. Do not ship a JavaScript replacement to cover them.

## 3. Select-only combobox, only when the above cannot work

If the design truly needs something a select cannot hold, build the select-only combobox pattern: one focusable element with `role="combobox"`, a `role="listbox"` popup and `aria-activedescendant`.

```html
<span id="sort-label">Sort by</span>
<div
  role="combobox"
  tabindex="0"
  aria-labelledby="sort-label"
  aria-haspopup="listbox"
  aria-expanded="false"
  aria-controls="sort-list"
>
  Price, low to high
</div>
<ul role="listbox" id="sort-list" aria-labelledby="sort-label" hidden>
  <li role="option" id="sort-1" aria-selected="true">Price, low to high</li>
  <li role="option" id="sort-2" aria-selected="false">Price, high to low</li>
</ul>
```

Required keyboard: Enter, Space and Arrow Down open; arrows move the highlight; Home and End; typing a letter jumps; Enter selects and closes; Escape closes without change; Tab selects the highlight and moves on. Focus stays on the combobox. Also add a hidden input carrying the value if it is inside a form. That is a lot to maintain, which is why it is the last choice.

## DO

- Label every select with a visible `<label for>`.
- Use a first option like "Choose a size" with `value=""` plus `required` instead of a pre-selected value the user did not choose.
- Group long lists with `<optgroup label>`.
- Use radio buttons instead of a select for 2 to 5 options the user should compare; they show all choices at once.

## DO NOT

- Do not hide a native select with `display: none` and show a div dropdown on top; the label then points at nothing.
- Do not build options from `<button>` or `<a>` elements inside a div.
- Do not change the page or navigate on `change` of a select. Keyboard users fire `change` with each arrow press on some platforms; add an "Apply" button or act on submit.
- Do not use a select for navigation menus.

## React and frameworks

A controlled `<select value={size} onChange={...}>` keeps native behavior; use it before reaching for a component library dropdown. If you use a library select, check it renders a real `<select>` or the combobox pattern above with `aria-activedescendant`, and that its label prop produces a visible, associated label.

## What to verify

- Clicking the label focuses the select.
- With the select focused, arrow keys change the value and the accessibility tree reports the new value.
- The control's name equals its visible label.
- On a phone, the native picker opens.
