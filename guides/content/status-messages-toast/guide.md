---
name: Status messages and toasts
description: Announce toasts, snackbars, "added to cart" and save confirmations to screen readers with role status, aria-live and no focus move
criteria:
  - STD-SC-2.2.1
  - STD-SC-4.1.3
---

# Status messages and toasts

## When to use

Any time the page changes as a result of an action without moving focus: "Added to cart", "Saved", "3 results", "Upload failed", a cart count update, a toast or snackbar. Sighted users see it; screen reader users hear nothing unless the text lands in a live region.

## The rule that agents break: the region must exist first

Screen readers watch live regions that are already in the page. Creating `<div role="status">` and filling it in the same tick is often not announced. Render the empty region at page load, then change only its text.

```html
<div id="status" role="status" class="visually-hidden"></div>
<div id="alerts" role="alert" class="visually-hidden"></div>
```

```js
const status = document.getElementById("status");

function announce(message) {
  status.textContent = "";
  setTimeout(() => {
    status.textContent = message;
  }, 50);
}

addButton.addEventListener("click", async () => {
  await addToCart(product);
  announce(`${product.name} added to cart. ${cart.count} items in cart.`);
});
```

Clearing and setting after a short delay makes the same message announce again when the user repeats the action.

## Polite or assertive

- `role="status"` (polite, atomic): confirmations, counts, progress. Waits until the screen reader is done speaking. Use this for almost everything.
- `role="alert"` (assertive): errors and warnings that need attention now, such as "Connection lost, changes are not saved". It interrupts. Use rarely.
- `aria-live="polite"` on any element works the same as `role="status"` without the role; add `aria-atomic="true"` if the whole region should be read, not only the changed part.

## Visible toasts

A visible toast and the live region can be the same element, but toasts are often animated, stacked and removed, which breaks announcements. The robust split: render the toast visually, and send its text to the persistent status region.

- Do not move focus to the toast. Focus stays where the user was working.
- Do not auto-dismiss in under about 5 seconds, and pause the timer while the toast is hovered or has focus. A user who needs longer to read must not lose the message.
- If the toast holds an action ("Undo"), that action must also be reachable some other way, or the toast must stay until dismissed. Keyboard users cannot reach a button that vanishes before they Tab to it.
- Give a close button an accessible name ("Dismiss").
- Do not put long or important content only in a toast; errors that block progress belong next to the field or at the top of the form.

## DO

- Keep messages short and complete on their own: "Rain jacket added to cart", not "Success!".
- Announce search and filter result counts after typing stops (debounce 300 to 500 ms).
- Put loading progress in a status region at milestones ("Uploading, 50%"), not every percent.
- Hide the status region visually with a visually-hidden class when the visible toast shows the same text, not with `display: none` or `hidden`, which silence it.

## DO NOT

- Do not add `aria-live` to large containers that re-render (a whole results list); everything in them gets read.
- Do not use `role="alert"` for success messages.
- Do not toggle a live region with `hidden` or `display: none` just before setting its text.
- Do not use `aria-live="assertive"` together with `role="status"`; pick one meaning.

## React and frameworks

Mount the live region once in the root layout and expose an `announce()` function through context, instead of rendering `<div role="status">` inside each toast component that mounts with its message. Toast libraries vary; check that the library keeps a persistent region, does not move focus, and pauses on hover and focus. Conditional rendering like `{message && <div role="status">{message}</div>}` is the classic bug: the region and its text appear together.

## What to verify

- With a screen reader on, trigger each action: the message is spoken once, without focus moving.
- Repeat the same action: the message is spoken again.
- The status region element is in the DOM before the first message.
- A toast stays while hovered or focused, and any action in it is also available elsewhere or the toast waits for dismissal.
