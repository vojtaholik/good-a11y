import { blank, single } from "../check.js";
import type { Check } from "../check.js";

export const documentTitle: Check = {
  evaluate: ({ title }) =>
    single(
      "document-title",
      blank(title),
      title === null ? "no <title> element" : "<title> is empty"
    ),
  id: "document-title",
  title: "The page has a title",
  whatFails: "The page has no <title>, or the title is empty.",
};
