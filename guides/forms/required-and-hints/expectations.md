# Expectations: required-and-hints

1. Every text input, select and textarea has an accessible name that matches (or starts with) its visible label text, and none relies on `placeholder` alone.
2. Fields shown as required have the `required` attribute (or `aria-required="true"` on a custom control), and the visible required marker is text, not color alone.
3. A field with a visible hint has that hint text in its accessible description.
4. Radio buttons that answer one question are inside a `fieldset` whose `legend` text is the group's accessible name.
5. Name, email and phone fields have the matching `autocomplete` tokens `name` (or `given-name`/`family-name`), `email` and `tel`.
6. Clicking a visible label moves focus to its field.
