---
name: Input purpose and autofill
description: Give name, email, phone, address, payment and account fields the exact autocomplete tokens so browsers, password managers and assistive tools fill and label them, also on a confirm email field and when asked to turn autofill off
criteria:
  - STD-SC-1.3.5
---

# Input purpose and autofill

## When to use

Every field that asks for something about the user: name, email, phone, delivery or billing address, birthday, card details, username, password, one-time code. Checkout, sign-up, account, contact and booking forms. This applies when you add a field and when you touch a form that already has such fields: add the tokens to the existing fields too.

## The rule agents break: the purpose is invisible

A field labelled "City" looks finished. Nothing on screen shows that the browser does not know what it is for. Without `autocomplete`, autofill guesses or offers nothing, people with motor or memory impairments type everything again, and tools that add icons or plain-language hints to known fields skip it. The label is for people; the token is for the machine. Every field about the user needs both.

```html
<form>
  <h2>Contact</h2>
  <label for="given">First name</label>
  <input id="given" name="given" autocomplete="given-name" />
  <label for="family">Last name</label>
  <input id="family" name="family" autocomplete="family-name" />
  <label for="email">Email</label>
  <input id="email" name="email" type="email" autocomplete="email" />
  <label for="phone">Phone</label>
  <input id="phone" name="phone" type="tel" autocomplete="tel" />

  <h2>Delivery address</h2>
  <label for="street">Street and number</label>
  <input id="street" name="street" autocomplete="shipping address-line1" />
  <label for="city">City</label>
  <input id="city" name="city" autocomplete="shipping address-level2" />
  <label for="postal">Postal code</label>
  <input id="postal" name="postal" autocomplete="shipping postal-code" />
  <label for="country">Country</label>
  <input id="country" name="country" autocomplete="shipping country-name" />
</form>
```

## The tokens

Use these exact values. A made-up value (`phone`, `zip`, `city`, `firstname`) is ignored.

| Field | Token |
| --- | --- |
| Full name in one field | `name` |
| First name, last name | `given-name`, `family-name` |
| Email | `email` |
| Phone | `tel` |
| Street and number in one `input` | `address-line1` |
| Second address line | `address-line2` |
| The whole street address in a `textarea` | `street-address` |
| City | `address-level2` |
| Region or state | `address-level1` |
| Postal code | `postal-code` |
| Country typed as a name | `country-name` |
| Country as a code (a `select` with `CZ`, `SK` values) | `country` |
| Company | `organization` |
| Birthday | `bday`, or `bday-day`, `bday-month`, `bday-year` |
| Card | `cc-name`, `cc-number`, `cc-exp`, `cc-csc` |
| Account | `username`, `current-password`, `new-password` |
| Code sent by SMS or email | `one-time-code` |

- When a form has both a delivery and a billing address, prefix each: `shipping address-line1`, `billing address-line1`. The prefix goes before the field token, and `section-<name>` may go before that.
- A field that is about someone else (a gift recipient) still takes the address tokens, inside its own `section-recipient` prefix, so autofill keeps the two apart.
- `autocomplete="off"` only on fields that are not about the user: search, coupon code, quantity, a captcha.

## The second rule agents break: turning autofill off on request

"Stop the browser filling old addresses" is not a reason for `autocomplete="off"` on the address fields. It takes the purpose away for everyone, and the people who need autofill most lose it. Keep every token, even when the request asks for less. If stale saved entries are the problem, the user removes them in the browser's saved addresses. Say in your reply that the tokens stay and why.

## The third rule agents break: confirm fields

A "Confirm email" or "Repeat password" field is where agents most often switch autofill off or block paste, to make the person type it twice. It shuts out exactly the people autofill and paste are for: someone who types slowly, uses voice input or a switch, or keeps the address in a password manager. Give the confirm field the same token as the field it confirms (`email`, or `new-password` for a new password), and never stop paste or drop into it. A typo check still works: it compares the two values on blur or on submit.

The WCAG 3 Working Draft of 10 September 2026 states this as core requirement 2.9.1.1 "Automated entry allowed": automated input of personal information from user agents, third-party tools, or paste is not prevented. WCAG 3 is a draft, not law or a standard yet; a confirm field built this way also meets WCAG 2.2 success criterion 1.3.5.

```html
<label for="email">Email</label>
<input id="email" type="email" autocomplete="email" />
<label for="email-confirm">Confirm email</label>
<input id="email-confirm" type="email" autocomplete="email" />
```

## DO

- Match the token to the label. A field labelled "Last name" gets `family-name`, never `name`.
- Split names only when the request asks for it. One "Full name" field with `name` is better for people whose names do not split into two parts.
- Keep `type` right alongside the token: `type="email"` with `email`, `type="tel"` with `tel`.
- Put `autocomplete` on the `input`, `select` or `textarea`, not on a wrapper. Pass it through when a component library renders the input.

## DO NOT

- Do not set `autocomplete="off"` on a whole checkout form to stop browser suggestions.
- Do not give two fields in one section the same token, except a confirm field, which repeats the token of the field it confirms.
- Do not block paste, drop or autofill on any personal-data field, a confirm field included: no `onpaste` that cancels, no `autocomplete="off"`.
- Do not count on browsers guessing the purpose from `name` or `id` attributes such as `name="email"`. A guess is not a declared purpose.

## React and frameworks

The prop is `autoComplete` in React (`autoComplete="shipping postal-code"`); lowercase `autocomplete` also renders but is easy to drop in typed props. Form libraries and design-system `Input` components often omit it from their props: check the rendered HTML. Build the tokens from one map so a field and its token stay together:

```jsx
const FIELDS = [
  { id: "street", label: "Street and number", token: "address-line1" },
  { id: "city", label: "City", token: "address-level2" },
  { id: "postal", label: "Postal code", token: "postal-code" },
  { id: "country", label: "Country", token: "country-name" },
];

function Address({ section }) {
  return FIELDS.map(({ id, label, token }) => (
    <div className="field" key={id}>
      <label htmlFor={`${section}-${id}`}>{label}</label>
      <input
        id={`${section}-${id}`}
        name={`${section}-${id}`}
        autoComplete={`${section} ${token}`}
      />
    </div>
  ));
}
```

Call it with `section="shipping"` or `section="billing"`.

## What to verify

- In the rendered HTML, every name, contact, address, payment and account field has an `autocomplete` token from the table, matching its label.
- In a browser with a saved address, focusing the first field offers to fill the whole form, and the values land in the right fields.
