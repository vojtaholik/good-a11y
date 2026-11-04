---
name: Modal dialog
description: Build an accessible modal dialog or popup with focus trap, Escape to close and focus return
criteria:
  - STD-SC-2.1.1
  - STD-SC-2.1.2
  - STD-SC-2.4.3
  - STD-SC-4.1.2
---

# Modal dialog

## When to use

A modal dialog blocks the page until the user answers it: confirm a delete, edit an address, sign in. If the user can keep working with the page behind it, build a non-modal panel or a disclosure instead. Do not use a modal for a plain notice; use a status message.

## Use the native dialog element

`<dialog>` opened with `showModal()` gives you, with no extra code: the dialog role, the top layer above every z-index, a backdrop, Escape to close, and everything outside the dialog made inert (not clickable, not focusable, hidden from screen readers). Hand-rolled modals almost always miss one of these.

```html
<button type="button" id="open-delete">Delete project</button>

<dialog
  id="delete-dialog"
  aria-labelledby="delete-title"
  aria-describedby="delete-desc"
>
  <h2 id="delete-title">Delete this project?</h2>
  <p id="delete-desc">
    The project and its 12 files are removed. This cannot be undone.
  </p>
  <form method="dialog">
    <button value="cancel" autofocus>Cancel</button>
    <button value="delete">Delete</button>
  </form>
</dialog>
```

```js
const opener = document.getElementById("open-delete");
const dialog = document.getElementById("delete-dialog");

opener.addEventListener("click", () => dialog.showModal());

dialog.addEventListener("close", () => {
  if (dialog.returnValue === "delete") deleteProject();
  opener.focus();
});

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close("cancel");
});
```

`form method="dialog"` closes the dialog and sets `returnValue` from the pressed button, without a network request. Browsers return focus to the opener on close, but not when the opener was re-rendered or removed; the explicit `opener.focus()` covers that case.

## DO

- Open with `showModal()`. `show()` and the `open` attribute make a non-modal dialog: no inert background, no Escape.
- Name the dialog with `aria-labelledby` pointing at its visible heading. Add `aria-describedby` only for a short message the user must hear on open.
- Put initial focus on the first thing the user needs. For a destructive confirm, focus the safe button (Cancel). For a form, focus the first field. For long content, focus the heading with `tabindex="-1"` so the start is read first.
- Give every dialog a visible close or cancel control, as a real `<button>`.
- On close, move focus back to the control that opened it. If that control is gone (the row was deleted), focus the next logical element, such as the list heading.
- Lock page scroll while open (`body { overflow: hidden }` toggled on open and close) so the background does not move under the dialog.

## DO NOT

- Do not build a modal from a `div` with `role="dialog"` unless you also trap Tab, close on Escape, make the rest of the page `inert`, and restore focus. That is four things to get right; `<dialog>` does them.
- Do not put `aria-hidden="true"` on a container that holds the focused element or the dialog. Use `inert` on siblings if you must hide the background by hand.
- Do not add `aria-modal="true"` to a native `<dialog>` opened with `showModal()`; it is already modal. Add it only on a custom `role="dialog"`.
- Do not use `tabindex` values above 0 to force order inside the dialog. Order the DOM.
- Do not open a dialog on page load or on focus. Open it only from a user action.
- Do not close the dialog on outside click when it holds unsaved input; ask first or keep it open.

## React and frameworks

The most common bug: rendering `<dialog open>` from state. That is a non-modal dialog. Call the method in an effect instead:

```jsx
function Modal({ open, onClose, titleId, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog ref={ref} aria-labelledby={titleId} onClose={onClose}>
      {children}
    </dialog>
  );
}
```

Keep state in sync through `onClose`: Escape closes the dialog natively, and if React state still says `open`, the next open does nothing. Store the opener in a ref before opening if it may unmount.

## What to verify

- Tab and Shift+Tab reach only controls inside the dialog. With native `<dialog>`, Tab past the last control may go to the browser's own toolbar; that is expected. It must never land on page content behind the dialog.
- Escape closes it and focus lands on the opener.
- The accessibility tree shows a dialog with the heading text as its name.
- Content behind the dialog is not reachable with a screen reader's virtual cursor while it is open.
- At 400% zoom the dialog content scrolls inside the viewport and the close button stays reachable.
