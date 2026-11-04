# Expectations: focus-visible

1. For every element reached with Tab, a focus ring shows while it has keyboard focus: the computed `outline-style` is `auto` (the browser's own ring), or it is another style with `outline-width` of at least 2px, or a non-transparent `box-shadow` is present together with a transparent outline for forced colors.
2. The focused element's ring color (its outline, or its box-shadow when the outline is transparent) differs from the page background color it sits on (the outline is not transparent and not equal to the background).
3. After a mouse click on a `button`, the button draws no focus ring as defined in claim 1 (the ring is for keyboard focus only).
4. When an element receives focus by Tab or Shift+Tab, it is not entirely covered by sticky or fixed content such as a header, banner or toolbar: at least one of its centre and corner points shows the element itself.
5. No element in the page has an author style that sets `outline: none` on `:focus` without a `:focus-visible` replacement: every kind of control the Tab order reaches (links, buttons, inputs) shows the ring from claim 1.
