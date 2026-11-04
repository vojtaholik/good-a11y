---
name: Redundant entry
description: Never make people type the same details twice in one process; prefill or offer "same as delivery address" for billing, invoice and later steps
criteria:
  - STD-SC22-3.3.7
---

# Redundant entry

## When to use

Any process that asks for the same information twice: a billing address after a delivery address, an invoice contact after the booking contact, a later step of a multi-step form that asks again for a name or email given earlier, a review step that makes the user re-enter details to change one. Also when the site already knows the value, such as the signed-in user's email.

## The rule agents break: the second copy starts empty

A request like "add a billing address with the same four fields" produces four empty fields. It looks complete and it works, so nothing on screen says it is wrong. For someone who types slowly, uses a switch or voice control, or struggles with memory, every repeated field is work and a chance for a mistake. Information the user already gave in the same process must be either filled in for them or offered to select. Retyping is allowed only when it is essential, when it is needed for security (a password confirmed by typing it again), or when the earlier value is no longer valid.

## Billing same as delivery

Add one checkbox, checked by default, and show the billing fields only when it is unchecked. The checkbox is a real `input type="checkbox"` with a visible label inside a `fieldset` whose `legend` names the section.

```html
<fieldset>
  <legend>Billing address</legend>
  <label>
    <input type="checkbox" id="same" checked />
    Same as delivery address
  </label>
  <div id="billing" hidden>
    <label for="billing-street">Street and number</label>
    <input
      id="billing-street"
      name="billing-street"
      autocomplete="billing address-line1"
    />
    <label for="billing-city">City</label>
    <input
      id="billing-city"
      name="billing-city"
      autocomplete="billing address-level2"
    />
  </div>
</fieldset>
```

```js
const same = document.getElementById("same");
const billing = document.getElementById("billing");

same.addEventListener("change", () => {
  billing.hidden = same.checked;
});
```

When the form is sent with the box checked, use the delivery values for billing on submit, so the two never drift apart. When it is unchecked, the billing fields are empty or hold the delivery values, and every one stays editable.

## Later steps of the same process

Carry what the user entered forward. When step 2 asks for a name and email that step 1 already has, fill step 2's fields with those values and let the user change them, or offer a "Use my details from step 1" checkbox or button that does. Keep the values when the user goes back a step and forward again.

```js
continueButton.addEventListener("click", () => {
  invoiceName.value ||= yourName.value;
  invoiceEmail.value ||= yourEmail.value;
  showStep(2);
});
```

## DO

- Fill from what the user typed in this process; do not invent values.
- Keep prefilled fields as ordinary editable fields with their own labels. Never make them read-only.
- Offer a choice when there are several earlier values, such as "Ship to: Home address / Work address" as radio buttons in a `fieldset`.
- Give the repeated fields their own autocomplete prefix (`billing`) so autofill keeps the two addresses apart.

## DO NOT

- Do not ask for an email twice to "confirm" it. That is not a security need; show the value back on the review step instead.
- Do not clear entered data when validation fails or when the user goes back a step.
- Do not hide the billing fields with no way to enter a different address.

## React and frameworks

Keep one state object for the whole process and derive the repeated section from it.

```jsx
const [sameAsDelivery, setSameAsDelivery] = useState(true);

<fieldset>
  <legend>Billing address</legend>
  <label>
    <input
      type="checkbox"
      checked={sameAsDelivery}
      onChange={(event) => setSameAsDelivery(event.target.checked)}
    />
    Same as delivery address
  </label>
  {sameAsDelivery ? null : <Address section="billing" />}
</fieldset>;
```

On submit: `const billing = sameAsDelivery ? delivery : billingFields;`. In a multi-step form, keep each step's values in the parent so unmounting a step does not lose them.

## What to verify

- Fill the first address, reach the second: it is filled, hidden behind a checked "same as" choice, or one control fills it.
- Choose a different billing address: the fields appear, empty or prefilled, and every one can be changed.
- Go back a step and forward: nothing typed is lost.
