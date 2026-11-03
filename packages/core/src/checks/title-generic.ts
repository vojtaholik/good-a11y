import { blank, single } from "../check.js";
import type { CheckResult, Check } from "../check.js";

const GENERIC = new Set([
  "document",
  "home",
  "home page",
  "homepage",
  "index",
  "index.htm",
  "index.html",
  "index.php",
  "new page",
  "page title",
  "react app",
  "title",
  "untitled",
  "untitled document",
  "untitled page",
  "vite app",
]);

const TRAILING = /[\s.:!-]+$/u;

const normalized = (title: string): string =>
  title.trim().replaceAll(/\s+/gu, " ").replace(TRAILING, "").toLowerCase();

const evaluate = ({ title }: { readonly title: string | null }): CheckResult =>
  title === null || blank(title)
    ? {
        checked: 0,
        failing: 0,
        id: "title-generic",
        samples: [],
        status: "not_applicable",
      }
    : single(
        "title-generic",
        GENERIC.has(normalized(title)),
        `<title>${title.trim()}</title>`
      );

export const titleGeneric: Check = {
  evaluate,
  howToFix:
    'Write a title that names the page and the site, for example "Running shoes | Example Shop".',
  id: "title-generic",
  title: "The page title is not a placeholder",
  whatFails:
    'The whole <title> is a placeholder or a generic word that does not say what the page is, such as "Home", "Untitled", "Document" or "index".',
};
