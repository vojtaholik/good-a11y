# Expectations: form-errors-validation

1. Submitting the form with required fields empty does not navigate, and focus moves to an error summary (or, with no summary, to the first invalid field).
2. Every invalid field has `aria-invalid="true"` after the failed submit, and no field has it before the first submit.
3. Each invalid field's accessible description contains its visible error message text.
4. The error summary contains one link per error, and activating a link moves focus to the matching field.
5. Correcting a field and submitting again removes `aria-invalid` and the error message for that field.
6. The submit button stays enabled while the form has errors.
