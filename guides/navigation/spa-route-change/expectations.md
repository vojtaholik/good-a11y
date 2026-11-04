# Expectations: spa-route-change

1. Activating an in-app navigation link with the keyboard changes `document.title` to a value that contains the new view's `h1` text.
2. After the route change, `document.activeElement` is the new view's `h1` (or the `main` element), not `body` and not the activated link.
3. After the route change, the next Tab press focuses an element inside `main`.
4. The navigation link for the current view has `aria-current="page"` and no other navigation link has it.
5. Pressing the browser Back button restores the previous view and its `document.title`.
6. On initial page load, focus is not moved by script (`document.activeElement` is `body`).
