# Expectations: required-and-hints

1. Every visible text input, select and textarea is labelled by a visible `label` element or by `aria-labelledby` text; none relies on `placeholder` or `aria-label` alone.
2. Fields asked to be required have the `required` attribute (or `aria-required="true"` on a custom control), and the marking is in text: every required field's label says "required" or has an asterisk, or the optional fields' labels say "optional".
3. A field with a visible hint has that hint text in its accessible description.
4. Radio buttons that answer one question are inside a `fieldset` whose `legend` text is the group's accessible name.
5. Fields labelled as a name, an email address or a phone number have the `autocomplete` tokens `name` (or `given-name`/`family-name`), `email` and `tel`.
6. Clicking a visible label moves focus to its field.
