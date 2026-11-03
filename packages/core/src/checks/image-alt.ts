import { blank, counted } from "../check.js";
import type { Check } from "../check.js";
import type { ImageEvidence } from "../page-evidence.js";

const unnamed = (image: ImageEvidence): boolean =>
  image.kind === "img"
    ? image.alt === null && !image.labelled && !image.presentational
    : blank(image.alt) && !image.labelled;

export const imageAlt: Check = {
  evaluate: ({ images }) =>
    counted("image-alt", images, unnamed, (image) => image.snippet),
  id: "image-alt",
  title: "Images have a text alternative",
  whatFails:
    'An <img> has no alt attribute (alt="" marks a decorative image and passes), no aria-label or aria-labelledby, and no presentational role; or an image button has no text.',
};
