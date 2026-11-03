import { single } from "../check.js";
import type { Check } from "../check.js";

const LANGUAGE_TAG =
  /^(?:[a-z]{2,3}(?:-[a-z]{3}){0,3}(?:-[a-z]{4})?(?:-(?:[a-z]{2}|\d{3}))?(?:-(?:[a-z\d]{5,8}|\d[a-z\d]{3}))*(?:-[a-wyz\d](?:-[a-z\d]{2,8})+)*(?:-x(?:-[a-z\d]{1,8})+)?|x(?:-[a-z\d]{1,8})+|i-[a-z]{3,8})$/iu;

export const htmlLang: Check = {
  evaluate: ({ lang }) => {
    const value = lang?.trim() ?? "";

    return single(
      "html-lang",
      !LANGUAGE_TAG.test(value),
      lang === null ? "<html> has no lang attribute" : `<html lang="${value}">`
    );
  },
  howToFix:
    'Add a lang attribute with the page\'s language to the <html> element, for example lang="en".',
  id: "html-lang",
  title: "The page states its language",
  whatFails: `The <html> element has no lang attribute, or its value is not a well-formed BCP 47 language tag (for example "en" or "de-AT").`,
};
