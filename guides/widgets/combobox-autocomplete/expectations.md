# Expectations: combobox-autocomplete

1. The text input has role `combobox`, an accessible name from a visible label, and `aria-expanded="false"` before typing.
2. Typing a letter that matches options shows an element with role `listbox` and sets `aria-expanded="true"` on the input.
3. Pressing Arrow Down keeps `document.activeElement` on the input and sets its `aria-activedescendant` to the id of an element with role `option` and `aria-selected="true"`.
4. Pressing Enter after highlighting an option puts that option's text in the input and sets `aria-expanded="false"`.
5. Pressing Escape with the list open hides the listbox and sets `aria-expanded="false"`, with focus still on the input.
6. After typing, an element with role `status` (or `aria-live`) that existed before typing contains the number of available results.
