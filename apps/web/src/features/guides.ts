import { MarkdownDocument } from "@foldkit/markdown";
import type { Option } from "effect";
import { Array, Schema } from "effect";
import pages from "virtual:guide-pages";

export const GuidePageSchema = Schema.Struct({
  category: Schema.String,
  criteria: Schema.Array(Schema.String),
  description: Schema.String,
  document: MarkdownDocument,
  id: Schema.String,
  name: Schema.String,
});

export type GuidePage = typeof GuidePageSchema.Type;

export const GUIDE_PAGES: readonly GuidePage[] = Schema.decodeUnknownSync(
  Schema.Array(GuidePageSchema)
)(pages);

export const guidePageOf = (id: string): Option.Option<GuidePage> =>
  Array.findFirst(GUIDE_PAGES, (page) => page.id === id);

export const categoryName = (category: string): string => {
  const words = category.replaceAll("-", " ");

  return `${words.charAt(0).toUpperCase()}${words.slice(1)}`;
};

export const guidesByCategory = (): readonly (readonly [
  string,
  readonly GuidePage[],
])[] =>
  Object.entries(Array.groupBy(GUIDE_PAGES, (page) => page.category)).toSorted(
    ([left], [right]) => categoryName(left).localeCompare(categoryName(right))
  );
