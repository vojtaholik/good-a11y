# Expectations: image-alt

1. Every `img` element has an `alt` attribute.
2. No `alt` value looks like a file name (ends in .jpg, .png, .svg, .webp or .gif) or starts with "image of", "picture of" or "photo of" (case-insensitive).
3. Every link or button whose only content is an image has a non-empty accessible name.
4. In a card where image and title link to the same destination, there is a single link (no two adjacent links with the same `href`), and its accessible name is the title text.
5. Inline SVGs are either `aria-hidden="true"` or have role `img` with a non-empty accessible name.
6. A chart or diagram image is accompanied by its data as text (a `table` or list) in the same `figure` or immediately after it.
