---
name: Modal dialog
description: Open a modal dialog that traps focus, closes on Escape and returns focus to its trigger
criteria:
  - STD-SC-2.1.2
  - STD-SC-2.4.3
  - STD-SC-4.1.2
---

# Modal dialog

## When to use

A task that blocks the page until the person answers.

## DO

- Use the native `<dialog>` element and open it with `showModal()`.
- Give it a name with `aria-labelledby` pointing at its heading.

## Focus on open and close

Move focus into the dialog on open and back to the trigger on close.

```html
<button type="button" id="open">Delete</button>
<dialog aria-labelledby="title"><h2 id="title">Delete file?</h2></dialog>
<a href="https://example.com">a link inside code is fine</a>
```
