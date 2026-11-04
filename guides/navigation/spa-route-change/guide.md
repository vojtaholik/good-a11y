---
name: Route change in single-page apps
description: Manage focus, page title and announcements on client-side route changes in a React, Vue or SPA router
criteria:
  - STD-SC-2.4.2
  - STD-SC-2.4.3
  - STD-SC-4.1.3
---

# Route change in single-page apps

## When to use

Any app where a link click swaps the view with JavaScript instead of loading a new document: React Router, Next.js client navigation, Vue Router, SvelteKit, Astro view transitions, a hand-rolled `pushState` router. A full page load resets focus to the top and makes screen readers read the new title. A client-side swap does neither: focus stays on a link that may no longer exist, the title is stale, and a blind user hears nothing.

## What every route change must do

1. Set `document.title` to the new page's title ("Journal - Acme"). Page first, site second.
2. Move focus to the new page's `<h1>`, which has `tabindex="-1"`. Screen readers read it, and the next Tab starts inside the new content.
3. Scroll to the top for a new page; restore the saved scroll position on Back and Forward.
4. Leave focus alone for changes that are not a new page: a filter, sort or tab that only updates the query string.

```js
async function navigate(url, { push = true } = {}) {
  const view = await loadView(url);
  outlet.replaceChildren(view.content);
  document.title = `${view.title} - Acme`;
  if (push) history.pushState({}, "", url);
  for (const link of nav.querySelectorAll("a")) {
    if (link.pathname === new URL(url, location.href).pathname)
      link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  const heading = outlet.querySelector("h1");
  heading.tabIndex = -1;
  heading.focus();
  window.scrollTo(0, 0);
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-route]");
  if (
    !link ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.button !== 0
  )
    return;
  event.preventDefault();
  navigate(link.href);
});

window.addEventListener("popstate", () =>
  navigate(location.href, { push: false })
);
```

```css
h1:focus {
  outline: none;
}
```

Suppressing the outline on the focused `h1` is fine: it is not a control, and the user did not Tab to it.

## Focus target choices

- **The `h1`** of the new view (preferred). It is the shortest useful announcement and puts the user right at the content.
- **The `main` element** with `tabindex="-1"`, when views have no reliable `h1`. Screen readers may read the whole main region.
- **A visually hidden live region** saying "Navigated to Journal", as an addition when focus cannot be moved, such as when the user is typing in a global search box that triggers the route. Create the region once at app start.

Do not focus the `<body>` or the skip link; that throws the user back to the top of the header on every navigation.

## DO

- Do not move focus on the initial page load. The browser already handles that.
- Keep links as real `<a href>` elements so they can be opened in a new tab and announced as links; intercept only plain left clicks.
- Update `aria-current="page"` on the navigation.
- Show a loading state for slow routes in a status region ("Loading journal"), and move focus only after the new content is in the DOM.
- For a 404 or error route, set a title and `h1` that say so, and focus that `h1`.

## DO NOT

- Do not use `<div onclick>` or `<button>` for navigation that changes the URL.
- Do not rely on `autofocus` inside route components; it fires on mount, including the first load, and is ignored in some browsers.
- Do not announce every route change with `role="alert"`.
- Do not forget the title. A tab bar full of "Acme" makes history and tab switching useless to everyone.

## React and frameworks

Run the focus and title code in an effect keyed on the location (`useEffect(() => {...}, [location.pathname])`), and skip the first run with a ref. Next.js App Router announces route changes through its own live region and sets titles from `metadata`, but does not move focus; add the `h1` focus in a client component that watches `usePathname()`. React Router's `ScrollRestoration` handles scroll; it does not handle focus. Vue Router: use `router.afterEach` with `nextTick` before focusing.

## What to verify

- After clicking a route link with the keyboard, focus is on the new `h1` and the next Tab is inside the new content, not in the header.
- `document.title` changes on every route and names the page.
- Back and Forward update content, title and focus the same way.
- Changing a filter does not steal focus from the filter control.
