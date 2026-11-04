---
name: Labels, required fields and hints
description: Label form inputs, mark required fields and attach hint text with label, required, aria-describedby and autocomplete
criteria:
  - STD-SC-1.3.1
  - STD-SC-1.3.5
  - STD-SC-1.4.1
  - STD-SC-3.3.2
---

# Labels, required fields and hints

## When to use

Every form field. Most form failures are not exotic widgets; they are a field with no real label, a required marker only in color, or a format hint that a screen reader never reads.

## The field

```html
<div class="field">
  <label for="phone">Phone number <span class="req">(required)</span></label>
  <p id="phone-hint" class="hint">
    We only call about your delivery. Include the country code, like +420.
  </p>
  <input
    id="phone"
    name="phone"
    type="tel"
    autocomplete="tel"
    required
    aria-describedby="phone-hint"
  />
</div>
```

- `<label for>` gives the input its accessible name and a bigger click target.
- The hint sits between label and input, so it is seen before typing, and `aria-describedby` makes screen readers read it after the name.
- `required` exposes the state to assistive technology and to the Constraint Validation API. The visible "(required)" text is for everyone else.
- `autocomplete="tel"` lets browsers and password managers fill it and tells assistive tools what the field is for.

## Required and optional

- If most fields are required, mark the few optional ones with "(optional)" in the label and say so once above the form. If most are optional, mark the required ones.
- If you use an asterisk, explain it above the form ("Fields marked * are required") and keep it in the label text. Hide the asterisk itself from screen readers only when `required` is set: `<span aria-hidden="true">*</span>`.
- Never signal required only with red text or a colored border.

## Group related controls

Radio buttons and checkboxes that answer one question go in a `<fieldset>` with a `<legend>` holding the question. Without it, a screen reader hears "Express, radio button" with no idea what is being asked.

```html
<fieldset>
  <legend>Delivery speed</legend>
  <label
    ><input type="radio" name="speed" value="standard" checked /> Standard, 3 to
    5 days</label
  >
  <label
    ><input type="radio" name="speed" value="express" /> Express, next
    day</label
  >
</fieldset>
```

Use the same for a date split into day, month and year fields, and for an address block.

## autocomplete tokens agents miss

Use the exact tokens: `name`, `given-name`, `family-name`, `email`, `tel`, `street-address`, `address-line1`, `address-level2` (city), `postal-code`, `country-name`, `organization`, `cc-name`, `cc-number`, `cc-exp`, `cc-csc`, `bday`, `username`, `current-password`, `new-password`, `one-time-code`. Prefix with `shipping` or `billing` when a form has both. Do not invent tokens (`autocomplete="phone"` is not valid; it is `tel`). Use `autocomplete="off"` only for fields that are not about the user, such as a search box or a coupon code.

## DO

- Keep labels visible at all times. A floating label that shrinks into the border is fine; one that disappears is not.
- Use the right `type`: `email`, `tel`, `url`, `number` only for quantities (not for card numbers or postal codes; use `inputmode="numeric"` with `type="text"` there).
- Put units and formats in the label or hint ("Weight in kg", "Date, for example 27 3 2026"), not only in the placeholder.
- Make the visible label text the start of the accessible name. If you add `aria-label`, it must contain the visible text.

## DO NOT

- Do not use `placeholder` as the label. It disappears on input, is often low contrast, and is not reliably announced as a name.
- Do not put the label in `aria-label` when a visible `<label>` could be used; visible labels help everyone.
- Do not wrap the hint inside the `<label>`; the whole hint then becomes the field's name. Link it with `aria-describedby`.
- Do not use `aria-required="true"` on a native input that can take `required`.
- Do not split one value into several inputs (code fields with one character each) unless each has its own label ("Digit 1 of 6").

## React and frameworks

`htmlFor`, not `for`. Generate ids with `useId()` and derive the hint id from it (`${id}-hint`) so `aria-describedby` always matches. Component libraries often render a label element that is not associated with the input; inspect the accessibility tree, not the screen. When a field has both a hint and an error, list both ids: `aria-describedby="phone-hint phone-error"`.

## What to verify

- Clicking each label focuses its field.
- The accessibility tree shows each input's name equal to its visible label, the hint as its description, and required where marked.
- Radio and checkbox groups announce their legend.
- Browser autofill offers the right values for name, email, address and phone fields.
