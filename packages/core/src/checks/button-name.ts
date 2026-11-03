import { blank, counted } from "../check.js";
import type { Check } from "../check.js";

export const buttonName: Check = {
  evaluate: ({ buttons }) =>
    counted(
      "button-name",
      buttons,
      (button) => blank(button.text) && !button.labelled,
      (button) => button.snippet
    ),
  id: "button-name",
  title: "Buttons have a name",
  whatFails:
    "A button has no text, no image with alt text inside it, and no aria-label, aria-labelledby or title.",
};
