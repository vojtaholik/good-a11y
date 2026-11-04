# Expectations: focus-visible

1. For every element reached with Tab, the computed `outline-style` is not `none` and `outline-width` is at least 2px while it has keyboard focus (or a non-transparent `box-shadow` is present together with a transparent outline for forced colors).
2. The focused element's outline color differs from the page background color it sits on (the outline is not transparent and not equal to the background).
3. After a mouse click on a `button`, the button does not match `:focus-visible`.
4. When an element receives focus by Tab or Shift+Tab, it is not entirely covered by sticky or fixed content such as a header, banner or toolbar: at least one of its centre and corner points shows the element itself.
5. No element in the page has an author style that sets `outline: none` on `:focus` without a `:focus-visible` replacement: the computed outline on keyboard focus is visible for links, buttons and inputs alike.
