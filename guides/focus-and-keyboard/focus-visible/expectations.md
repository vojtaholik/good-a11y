# Expectations: focus-visible

1. For every element reached with Tab, the computed `outline-style` is not `none` and `outline-width` is at least 2px while it has keyboard focus (or a non-transparent `box-shadow` is present together with a transparent outline for forced colors).
2. The focused element's outline color differs from the page background color it sits on (the outline is not transparent and not equal to the background).
3. After a mouse click on a `button`, the button does not match `:focus-visible`.
4. When an element below a sticky header receives focus by Tab or Shift+Tab, its bounding box top is not above the sticky header's bottom edge (it is not covered by the header).
5. No element in the page has an author style that sets `outline: none` on `:focus` without a `:focus-visible` replacement: the computed outline on keyboard focus is visible for links, buttons and inputs alike.
