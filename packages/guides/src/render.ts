import type { Guide } from "./guide.js";

export const renderGuides = (guides: readonly Guide[]): string =>
  [
    'import type { Guide } from "./guide.js";',
    "",
    `export const GUIDES: readonly Guide[] = ${JSON.stringify(guides, null, 2)};`,
    "",
  ].join("\n");
