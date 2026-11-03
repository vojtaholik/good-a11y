import { single } from "../check.js";
import type { Check } from "../check.js";

const LANGUAGE_TAG = /^[a-z]{2,3}(?:-[a-z\d]{1,8})*$/iu;

export const htmlLang: Check = {
  evaluate: ({ lang }) => {
    const value = lang?.trim() ?? "";

    return single(
      "html-lang",
      !LANGUAGE_TAG.test(value),
      lang === null ? "<html> has no lang attribute" : `<html lang="${value}">`
    );
  },
  id: "html-lang",
  title: "The page states its language",
  whatFails:
    "The <html> element has no lang attribute, or its value is not a language tag.",
};
