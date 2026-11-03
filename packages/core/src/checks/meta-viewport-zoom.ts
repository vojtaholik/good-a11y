import { counted } from "../check.js";
import type { Check } from "../check.js";

const MIN_MAXIMUM_SCALE = 2;

const settingsOf = (content: string): Map<string, string> =>
  new Map(
    content
      .toLowerCase()
      .split(/[,;]/u)
      .map((part) => part.split("=").map((side) => side.trim()))
      .flatMap(([name, value]) =>
        name === undefined || value === undefined ? [] : [[name, value]]
      )
  );

export const blocksZoom = (content: string): boolean => {
  const settings = settingsOf(content);
  const scalable = settings.get("user-scalable");
  const written = settings.get("maximum-scale") ?? "";
  const maximum = written === "" ? Number.NaN : Number(written);

  return (
    scalable === "no" ||
    scalable === "0" ||
    (Number.isFinite(maximum) && maximum < MIN_MAXIMUM_SCALE)
  );
};

export const metaViewportZoom: Check = {
  evaluate: ({ viewports }) =>
    counted(
      "meta-viewport-zoom",
      viewports,
      blocksZoom,
      (content) => `<meta name="viewport" content="${content}">`
    ),
  howToFix:
    "Remove user-scalable=no and any maximum-scale below 2 from the viewport meta tag.",
  id: "meta-viewport-zoom",
  title: "Zoom is not blocked",
  whatFails:
    "The viewport meta tag sets user-scalable=no or a maximum-scale below 2.",
};
