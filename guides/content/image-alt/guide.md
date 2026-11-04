---
name: Image alt text decisions
description: Decide alt text for images, decorative images, image links, logos, icons, charts and inline SVG
criteria:
  - STD-SC-1.1.1
  - STD-SC-2.4.4
---

# Image alt text decisions

## When to use

Every `<img>`, `<svg>`, `<picture>`, `<input type="image">`, `<area>` and CSS background image that carries meaning. The failure agents make is rarely a missing `alt`; it is a wrong one: "image of a product", a filename, a duplicate of the text next to it, or a description where the image is a link that needs a destination.

## Decide by the image's job

Ask what the image does on this page, then pick one:

| The image is | alt | Example |
| --- | --- | --- |
| Decorative, or its meaning is already in nearby text | `alt=""` | A hero photo of a trail above an article titled "Trail running" |
| Informative | What it shows that matters here, in a sentence or less | `alt="Moss green trail shoe, side view, with a deep lug sole"` |
| The only content of a link or button | Where it goes or what it does | `alt="Acme home"` for a logo link, `alt="Search"` |
| Text in an image | The same text | `alt="Autumn sale, 30% off jackets"` |
| Complex (chart, diagram, map) | A short summary, plus the full data as text nearby | `alt="Sales rose each quarter of 2026, see table below"` |

The same photo can need different alt text on different pages. A product photo on its product page is informative; the same photo inside a card whose link already says the product name is decorative.

## Common cases

```html
<a href="/">
  <img src="logo.svg" alt="Acme home" />
</a>

<a href="/products/trail-shoe" class="card">
  <img src="trail-shoe.jpg" alt="" />
  <h3>Trail running shoe</h3>
</a>

<figure>
  <img src="q-sales.png" alt="Bar chart: sales rose each quarter of 2026." />
  <figcaption>Quarterly sales, 2026.</figcaption>
  <table>
    <thead>
      <tr>
        <th scope="col">Quarter</th>
        <th scope="col">Sales (EUR)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Q1</td>
        <td>400</td>
      </tr>
      <tr>
        <td>Q2</td>
        <td>600</td>
      </tr>
      <tr>
        <td>Q3</td>
        <td>850</td>
      </tr>
      <tr>
        <td>Q4</td>
        <td>1,100</td>
      </tr>
    </tbody>
  </table>
</figure>

<svg role="img" aria-labelledby="rating-title" viewBox="0 0 100 20">
  <title id="rating-title">Rated 4 out of 5</title>
  ...
</svg>

<svg aria-hidden="true" focusable="false">...</svg>
```

In the card, one link wraps image and heading and the image is `alt=""`, so the link's name is the heading. Two separate links (image and title) to the same place double the Tab stops and the announcement.

## DO

- Always include the `alt` attribute. Without it, screen readers often read the file name.
- Use `alt=""` (empty, no space) for decorative images; they are then skipped entirely.
- Keep informative alt short and specific to why the image is there. Mention color, text or detail only when it matters to the page (color matters on a product page).
- For inline SVG with meaning, use `role="img"` and name it with `aria-label` or a `<title>` referenced by `aria-labelledby`. For decorative SVG, `aria-hidden="true"`.
- For CSS background images that carry meaning, add the meaning as real text (visually hidden if needed), or use an `<img>`.
- For a chart, put every data value in a real `<table>` or list next to it, even a three-bar chart, and keep the alt to a one-line summary. Values packed into the alt, an SVG `<title>` or a figcaption sentence are hard to compare one by one; a table or list lets screen reader users move value by value.

## DO NOT

- Do not start with "Image of", "Picture of" or "Photo of"; screen readers already say "image". Say "Photo:" only when the medium matters, such as in a gallery of paintings and photos.
- Do not use the file name, a product SKU or "logo" alone as alt.
- Do not repeat the caption or adjacent heading in alt; make one of them carry it.
- Do not put keywords for search engines in alt.
- Do not give a decorative image `alt` text and `role="presentation"` together; `alt=""` is enough.
- Do not use `title` instead of `alt`.

## React and frameworks

JSX and image components (`next/image` and similar) require `alt` as a prop; pass `alt=""` for decorative images instead of omitting it to silence a lint rule. When alt comes from a CMS, give editors a separate "decorative" checkbox that outputs `alt=""`, and do not fall back to the file name or the product name blindly. SVG icon components should default to `aria-hidden="true"` and only take a name when used alone.

## What to verify

- Every `img` has an `alt` attribute; decorative ones are empty.
- Image-only links and buttons have names that say where they go or what they do.
- No alt text is a file name, starts with "image of", or repeats adjacent text.
- Informative SVGs are exposed as images with a name; decorative ones are hidden.
- Each chart's data is available as text.
