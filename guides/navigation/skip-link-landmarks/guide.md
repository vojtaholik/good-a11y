---
name: Skip link and landmarks
description: Add a skip to main content link and page landmarks (header, nav, main, footer) with correct labels and heading structure
criteria:
  - STD-SC-1.3.1
  - STD-SC-2.4.1
  - STD-SC-2.4.6
---

# Skip link and landmarks

## When to use

Every page layout. Keyboard users press Tab through every header link on every page unless a skip link lets them jump; screen reader users jump by landmark and by heading. Both come from the page shell, so fix them once in the layout component.

## The shell

```html
<body>
  <a class="skip-link" href="#main">Skip to main content</a>
  <header>
    <a href="/">Acme home</a>
    <nav aria-label="Main">
      <ul>
        <li><a href="/shop" aria-current="page">Shop</a></li>
        <li><a href="/journal">Journal</a></li>
      </ul>
    </nav>
  </header>
  <main id="main" tabindex="-1">
    <h1>Shop</h1>
    ...
  </main>
  <footer>
    <nav aria-label="Footer">...</nav>
  </footer>
</body>
```

```css
.skip-link {
  position: absolute;
  left: 0.5rem;
  top: 0.5rem;
  transform: translateY(-200%);
}
.skip-link:focus {
  transform: none;
}
main:focus {
  outline: none;
}
```

## Skip link

- Make it the first focusable element in the body, before the logo.
- Hide it off screen until focused, then show it fully, with readable contrast. Do not use `display: none` or `visibility: hidden`; those remove it from the Tab order.
- Point it at the `<main>` element's id. Give `main` `tabindex="-1"` so focus actually lands there in every browser and the next Tab continues inside main. Suppress the focus ring on `main` only, since it is not an interactive control.
- Keep the text plain: "Skip to main content".
- With a hash router, `href="#main"` changes the route. Handle the click instead: `event.preventDefault(); main.focus();`.

## Landmarks

- `header` directly in `body` is the banner; `footer` directly in `body` is the content info. Inside `article` or `section` they are not landmarks, which is fine.
- Exactly one `<main>` per page, not nested in another landmark.
- When there is more than one `<nav>`, give each a distinct `aria-label` ("Main", "Footer", "Breadcrumb"). Do not put the word "navigation" in the label; the role already says it.
- Use `<aside>` for content that stands apart (related links, a filter sidebar), and `<section aria-labelledby>` only for regions worth jumping to; an unnamed `section` is not a landmark.
- Search forms: wrap them in `<search>` (or `role="search"` on the form).
- Mark the current page link with `aria-current="page"`.

## Headings

- One `<h1>` per page naming the page's own content, not the site name.
- Do not skip levels going down (h2 then h4). Pick the level by structure, then style it any size.
- Headings describe the section under them. A card title is a heading if users would jump to it.

## DO NOT

- Do not add `role="navigation"`, `role="main"` or `role="banner"` to the elements that already have them.
- Do not wrap the whole page in `<main>` including header and footer.
- Do not make headings out of styled `div`s, and do not use heading tags for visual size alone (a "Sale!" badge is not an h2).
- Do not use `aria-label` on a `div` without a role to make it a region; it does nothing.
- Do not put the skip link inside the header's `nav`.

## React and frameworks

Put the skip link and `<main>` in the root layout, not in each page, and keep `main`'s id stable across routes. In Next.js, Remix and similar, the root layout renders once; the `href="#main"` approach works there as long as the router uses real paths. Hash routers need the click handler above.

## What to verify

- The first Tab on a fresh page shows the skip link; Enter moves focus into main, and the next Tab reaches the first control inside main.
- The accessibility tree shows banner, navigation landmarks with distinct names, one main, and content info.
- The heading outline starts at one h1 and does not skip levels.
