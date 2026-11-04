import { encodeDocument } from "@foldkit/markdown";
import { parseMarkdown } from "@foldkit/markdown/vite";
import { GUIDES } from "@good-a11y/guides/data";
import type { Guide } from "@good-a11y/guides/guide";
import type { Nodes } from "mdast";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import type { Plugin } from "vite";

export const GUIDE_PAGES_MODULE = "virtual:guide-pages";

const RESOLVED = `\0${GUIDE_PAGES_MODULE}`;

const FRONTMATTER = /^---\n[\s\S]*?\n---\n/u;

const directives = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkDirective);

const directiveOffsets = (node: Nodes): number[] => [
  ...(node.type === "textDirective" && node.position?.start.offset !== undefined
    ? [node.position.start.offset]
    : []),
  ...("children" in node ? node.children.flatMap(directiveOffsets) : []),
];

export const proseOf = (text: string): string => {
  const body = text.replace(FRONTMATTER, "");
  let escaped = body;

  for (const offset of directiveOffsets(directives.parse(body)).toSorted(
    (left, right) => right - left
  )) {
    escaped = `${escaped.slice(0, offset)}\\${escaped.slice(offset)}`;
  }

  return escaped;
};

const pageOf = (guide: Guide) => ({
  category: guide.category,
  criteria: guide.criteria,
  description: guide.description,
  document: encodeDocument(parseMarkdown(proseOf(guide.text))),
  id: guide.id,
  name: guide.name,
});

export const guidePages = (): Plugin => ({
  load: (id) =>
    id === RESOLVED
      ? `export default ${JSON.stringify(GUIDES.map(pageOf))};`
      : undefined,
  name: "good-a11y-guide-pages",
  resolveId: (id) => (id === GUIDE_PAGES_MODULE ? RESOLVED : undefined),
});
