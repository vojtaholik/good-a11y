---
name: Form errors and validation
description: Show accessible form validation errors with aria-invalid, aria-describedby, an error summary and focus on submit
criteria:
  - STD-SC-1.3.1
  - STD-SC-3.3.1
  - STD-SC-3.3.3
  - STD-SC-4.1.3
---

# Form errors and validation

## When to use

Any form that can reject input: sign up, checkout, contact, settings. The user must learn that something failed, which field, and how to fix it, without seeing the screen and without using a mouse.

## The pattern

1. Validate on submit. Optionally validate a field again on blur after the user has left it once with a problem; never on every keystroke of a fresh field.
2. For each invalid field: set `aria-invalid="true"` and connect a visible error message with `aria-describedby`.
3. Above the form, show an error summary: a heading with the count and a list of links, one per error, each pointing at its field.
4. Move focus to the summary heading. One focus move announces the problem; the links let users jump to each field.
5. When a field becomes valid, remove `aria-invalid` and its message, and update the summary.

```html
<div id="error-summary" hidden>
  <h2 tabindex="-1">There are 2 problems with your details</h2>
  <ul></ul>
</div>

<form id="signup" novalidate>
  <label for="email">Email address</label>
  <input
    id="email"
    name="email"
    type="email"
    autocomplete="email"
    required
    aria-describedby="email-error"
  />
  <p id="email-error" class="error" hidden></p>
  <button>Create account</button>
</form>
```

```js
form.addEventListener("submit", (event) => {
  const errors = [];
  for (const field of form.elements) {
    if (!field.willValidate) continue;
    const message = messageFor(field);
    const errorEl = document.getElementById(`${field.id}-error`);
    if (message === null) field.removeAttribute("aria-invalid");
    else field.setAttribute("aria-invalid", "true");
    errorEl.hidden = message === null;
    errorEl.textContent = message ?? "";
    if (message !== null) errors.push({ id: field.id, message });
  }
  if (errors.length === 0) return;
  event.preventDefault();
  showSummary(errors);
  summary.querySelector("h2").focus();
});

summaryList.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;
  event.preventDefault();
  document.getElementById(link.hash.slice(1)).focus();
});
```

`messageFor(field)` returns a specific message from `field.validity` (`valueMissing`, `typeMismatch`, `tooShort`) or `null`. `novalidate` turns off the browser's bubbles so your messages are the only ones; keep `required`, `type` and `minlength` on the fields so the Constraint Validation API still does the checking.

## Write messages that fix the problem

- Say what is wrong and what to do: "Enter an email address like name@example.com", not "Invalid input".
- Name the field in the summary link text: "Email address: enter an email address like name@example.com".
- Keep the same text inline and in the summary.
- Prefix inline errors with a visible word or icon ("Error:"), so color is not the only signal. If you use an icon, it is decorative (`aria-hidden="true"`) and the text says "Error".

## DO

- Keep the submit button enabled. A disabled button tells no one why it is disabled and is skipped by Tab.
- Put the error message element in the page from the start (hidden) and keep its id stable, so `aria-describedby` always resolves.
- Keep the user's input. Never clear a field because it was invalid, except passwords if your policy requires it.
- Prefix the page `<title>` with "Error: " when a server-side validation reloads the page.
- For server errors after an async submit, show them the same way: inline, in the summary, focus the summary.

## DO NOT

- Do not show errors only with a red border or red text.
- Do not use `alert()` for validation.
- Do not put the error text only in a `title` attribute, a tooltip, or `placeholder`.
- Do not set `aria-invalid="true"` on fields before the user has submitted or left them.
- Do not use `role="alert"` on every inline message; when ten fields fail at once, the screen reader reads ten interruptions. Focusing the summary is the announcement.
- Do not move focus on blur validation. Only show the inline message.

## React and frameworks

Keep errors in state keyed by field name and render `aria-invalid={Boolean(errors.email) || undefined}` (React would render `aria-invalid="false"` for `false`, which is fine, but omitting it is cleaner). Focus the summary heading in an effect that runs when a submit attempt produced errors, since the summary is not in the DOM until that render. Form libraries often set `aria-invalid` but do not link the message: check that `aria-describedby` points at the rendered error id.

## What to verify

- Submit an empty form with the keyboard only: focus lands on the summary and a screen reader reads the count.
- Each summary link moves focus to its field.
- Each invalid field announces its label, "invalid", and its error message.
- Fixing a field and resubmitting removes its error everywhere.
