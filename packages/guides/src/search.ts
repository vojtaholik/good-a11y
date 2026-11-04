import { Result, Schema } from "effect";
import MiniSearch from "minisearch";
import { stemmer } from "stemmer";

import type { Guide } from "./guide.js";

export class GuideNotFound extends Schema.TaggedError<GuideNotFound>()(
  "GuideNotFound",
  {
    id: Schema.String,
  }
) {
  override get message(): string {
    return `No guide with id "${this.id}". Run \`good-a11y list\` for every id, or \`good-a11y search "<2-5 words>"\`.`;
  }
}

export const SEARCH_LIMIT = 8;

export interface GuideHit {
  readonly description: string;
  readonly id: string;
}

interface SearchDocument {
  readonly description: string;
  readonly headings: string;
  readonly id: string;
  readonly name: string;
  readonly slug: string;
}

const hitOf = ({ description, id }: Guide): GuideHit => ({ description, id });

export const makeGuideIndex = (guides: readonly Guide[]) => {
  const byId = new Map(guides.map((guide) => [guide.id, guide]));

  const index = new MiniSearch<SearchDocument>({
    fields: ["slug", "name", "description", "headings"],
    idField: "id",
    processTerm: (term) => stemmer(term.toLowerCase()),
    searchOptions: {
      boost: { description: 2, name: 3, slug: 2 },
      combineWith: "OR",
      fuzzy: 0.2,
      prefix: true,
    },
  });

  index.addAll(
    guides.map((guide) => ({
      description: guide.description,
      headings: guide.headings.join("\n"),
      id: guide.id,
      name: guide.name,
      slug: guide.id.replaceAll("-", " "),
    }))
  );

  const search = (query: string): GuideHit[] =>
    index
      .search(query)
      .slice(0, SEARCH_LIMIT)
      .flatMap((result) => {
        const guide = byId.get(String(result.id));

        return guide === undefined ? [] : [hitOf(guide)];
      });

  const list = (): GuideHit[] => guides.map(hitOf);

  const retrieve = (
    ids: readonly string[]
  ): Result.Result<Guide[], GuideNotFound> => {
    const found: Guide[] = [];

    for (const id of ids) {
      const guide = byId.get(id);

      if (guide === undefined) {
        return Result.fail(new GuideNotFound({ id }));
      }

      found.push(guide);
    }

    return Result.succeed(found);
  };

  return { list, retrieve, search };
};

export type GuideIndex = ReturnType<typeof makeGuideIndex>;
