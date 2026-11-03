import { counted } from "../check.js";
import type { Check } from "../check.js";

export const formLabels: Check = {
  evaluate: ({ controls, labelTargets }) => {
    const targets = new Set(labelTargets);

    return counted(
      "form-labels",
      controls,
      (control) =>
        !control.labelled &&
        !control.insideLabel &&
        (control.id === null || !targets.has(control.id)),
      (control) => control.snippet
    );
  },
  id: "form-labels",
  title: "Form fields have an accessible name",
  whatFails:
    "A text field, checkbox, radio button, select or text area has no <label>, aria-label, aria-labelledby, title or placeholder.",
};
