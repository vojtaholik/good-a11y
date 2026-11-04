# Expectations: tabs

1. The tabs sit in an element with role `tablist` that has an accessible name; each tab has role `tab`.
2. Exactly one tab has `aria-selected="true"`, and only that tab has `tabindex="0"`; the others have `tabindex="-1"`.
3. With focus on the selected tab, pressing Arrow Right moves focus to the next tab; on the last tab it wraps to the first.
4. Pressing Home focuses the first tab and End focuses the last.
5. Each visible panel has role `tabpanel` and its accessible name equals the selected tab's name; panels of unselected tabs are not visible.
6. Pressing Tab from the selected tab moves focus into or onto the visible panel, never to another tab.
