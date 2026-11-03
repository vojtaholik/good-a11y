import { blank, single } from "../check.js";
import type { Check } from "../check.js";

export const documentTitle: Check = {
  evaluate: ({ title }) =>
    single(
      "document-title",
      blank(title),
      title === null ? "no <title> element" : "<title> is empty"
    ),
  howToFix: "Give the page a <title> with text in it.",
  id: "document-title",
  title: "The page has a title",
  whatFails: "The page has no <title>, or the title is empty.",
};
