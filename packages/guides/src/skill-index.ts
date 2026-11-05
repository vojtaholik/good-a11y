import type { Guide } from "./guide.js";

export const withGuideIndex = (
  skill: string,
  guides: readonly Guide[],
  guideUrl: (id: string) => string
): string =>
  [
    skill.trimEnd(),
    "",
    "## Guides",
    "",
    ...guides.map(
      (guide) => `- [${guide.id}](${guideUrl(guide.id)}): ${guide.description}`
    ),
    "",
  ].join("\n");
