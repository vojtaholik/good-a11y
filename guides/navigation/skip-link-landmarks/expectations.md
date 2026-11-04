# Expectations: skip-link-landmarks

1. The first Tab press from page load focuses a link whose accessible name starts with "Skip", and that link is visible (inside the viewport, non-zero size) while focused.
2. Activating the skip link moves focus to the `main` element or to an element inside it.
3. After activating the skip link, the next Tab press focuses an element inside `main`.
4. The page has exactly one `main` landmark, one `banner` and one `contentinfo` landmark.
5. When the page has more than one `navigation` landmark, each has a distinct accessible name.
6. The page has exactly one `h1`, and it is inside `main`.
