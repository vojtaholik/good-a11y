import { counted } from "../check.js";
import type { Check } from "../check.js";

export const frameTitle: Check = {
  evaluate: ({ frames }) =>
    counted(
      "frame-title",
      frames,
      (frame) => !frame.labelled,
      (frame) => frame.snippet
    ),
  howToFix: "Give each frame a title attribute.",
  id: "frame-title",
  title: "Frames have a title",
  whatFails:
    "An <iframe> or <frame> has no title, aria-label or aria-labelledby.",
};
