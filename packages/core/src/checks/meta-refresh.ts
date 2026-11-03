import { counted } from "../check.js";
import type { Check } from "../check.js";

const DELAY = /^\s*(?<delay>\d+(?:\.\d+)?)/u;

export const refreshesLater = (content: string): boolean => {
  const delay = Number(DELAY.exec(content)?.groups?.delay ?? "0");

  return delay > 0;
};

export const metaRefresh: Check = {
  evaluate: ({ refreshes }) =>
    counted(
      "meta-refresh",
      refreshes,
      refreshesLater,
      (content) => `<meta http-equiv="refresh" content="${content}">`
    ),
  id: "meta-refresh",
  title: "The page does not refresh or redirect on a timer",
  whatFails:
    "A refresh meta tag reloads or redirects the page after a delay. A delay of 0 is an instant redirect and passes.",
};
