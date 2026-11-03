import { blank, counted } from "../check.js";
import type { Check } from "../check.js";

export const linkName: Check = {
  evaluate: ({ links }) =>
    counted(
      "link-name",
      links,
      (link) => blank(link.text) && !link.labelled,
      (link) => link.snippet
    ),
  howToFix: "Give each link text, or an aria-label.",
  id: "link-name",
  title: "Links have a name",
  whatFails:
    "A link has no text, no image with alt text inside it, and no aria-label, aria-labelledby or title.",
};
