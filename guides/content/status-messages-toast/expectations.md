# Expectations: status-messages-toast

1. An element with role `status` (or `aria-live="polite"`) is in the DOM on page load, before any action.
2. Activating the action (for example "Add to cart") puts a message naming the result into that same pre-existing live region.
3. After the action, `document.activeElement` is still the control that was activated.
4. Success messages are not in an element with role `alert` or `aria-live="assertive"`.
5. A visible toast remains visible for at least 5 seconds, and stays visible while it has focus or is hovered. A toast faded to `opacity: 0` or set to `visibility: hidden` counts as hidden, even when its element stays in the page.
6. A toast close button has an accessible name.
