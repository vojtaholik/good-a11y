---
name: Form errors
description: Show validation errors next to the field, announce them and move focus to the first one
criteria: [STD-SC-3.3.1, STD-SC-3.3.3]
category: forms
---

# Form errors

## Inline validation messages

Tie each message to its input with `aria-describedby` and set `aria-invalid`.

## Error summary on submit

List the errors at the top and move focus to the summary.
