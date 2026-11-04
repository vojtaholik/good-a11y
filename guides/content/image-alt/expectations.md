# Expectations: image-alt

1. Every `img` element has an `alt` attribute.
2. No `alt` value looks like a file name (ends in .jpg, .png, .svg, .webp or .gif) or starts with "image of", "picture of" or "photo of" (case-insensitive).
3. Every link or button whose only content is an image has a non-empty accessible name.
4. Within a card (a list item or an article), no destination is linked twice: an image and a title that go to the same place share one link.
5. Inline SVGs are either `aria-hidden="true"` or have role `img` with a non-empty accessible name.
6. When the page shows a chart or diagram, its data values appear as text in a table or list.
