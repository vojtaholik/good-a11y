# Expectations: dialog-modal

1. Activating the opener button shows an element with role `dialog` whose accessible name equals the dialog's visible heading text.
2. After opening, `document.activeElement` is inside the dialog.
3. While the dialog is open, pressing Tab 10 times never moves focus to a page element outside the dialog (focus leaving the document for browser chrome, seen as `document.body`, is allowed).
4. While the dialog is open, every element outside it is inert or hidden from the accessibility tree: an element behind the dialog cannot be focused with `.focus()`.
5. Pressing Escape closes the dialog (it is no longer in the accessibility tree) and focus returns to the opener.
6. Activating the dialog's cancel or close button closes it and focus returns to the opener.
