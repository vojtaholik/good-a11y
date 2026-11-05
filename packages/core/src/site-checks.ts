import { Schema } from "effect";

import { criterion } from "./catalogue.js";
import { CheckStatusSchema, MAX_SAMPLES } from "./check.js";
import {
  FindingReferenceSchema,
  newerReferencesFor,
  referencesFor,
} from "./finding-reference.js";
import type { FindingReference } from "./finding-reference.js";
import type { Reference } from "./reference.js";
import type { PageSummary, SiteEvidence, SiteLink } from "./site-evidence.js";

export const SiteCheckIdSchema = Schema.Literals([
  "consistent-navigation",
  "consistent-identification",
  "consistent-help",
]);

export type SiteCheckId = typeof SiteCheckIdSchema.Type;

const Count = Schema.Int.check(Schema.isGreaterThanOrEqualTo(0));

export const SiteCheckResultSchema = Schema.Struct({
  checked: Count,
  failing: Count,
  id: SiteCheckIdSchema,
  samples: Schema.Array(Schema.String).check(Schema.isMaxLength(MAX_SAMPLES)),
  status: CheckStatusSchema,
});

export type SiteCheckResult = typeof SiteCheckResultSchema.Type;

export interface SiteCheck {
  readonly criterion: string;
  readonly evaluate: (summaries: readonly PageSummary[]) => SiteCheckResult;
  readonly howToFix: string;
  readonly id: SiteCheckId;
  readonly newer: boolean;
  readonly title: string;
  readonly whatFails: string;
}

export const MIN_SHARED_LINKS = 3;

const MAX_LISTED = 6;

interface Shared {
  readonly entered: readonly SiteLink[];
  readonly other: readonly SiteLink[];
  readonly url: string;
}

const onceOnly = (links: readonly SiteLink[]): readonly SiteLink[] => {
  const counts = new Map<string, number>();

  for (const link of links) {
    counts.set(link.href, (counts.get(link.href) ?? 0) + 1);
  }

  return links.filter((link) => counts.get(link.href) === 1);
};

const sharedOf = (entered: PageSummary, other: PageSummary): Shared | null => {
  const left = onceOnly(entered.navigation);

  const right = onceOnly(other.navigation);

  const leftHrefs = new Set(left.map((link) => link.href));

  const rightHrefs = new Set(right.map((link) => link.href));

  const shared = {
    entered: left.filter((link) => rightHrefs.has(link.href)),
    other: right.filter((link) => leftHrefs.has(link.href)),
    url: other.url,
  };

  return shared.entered.length >= MIN_SHARED_LINKS ? shared : null;
};

const comparedPairs = (
  summaries: readonly PageSummary[]
): readonly Shared[] => {
  const [entered, ...others] = summaries;

  return entered?.role === "entered"
    ? others.flatMap((other) => {
        const shared = sharedOf(entered, other);

        return shared === null ? [] : [shared];
      })
    : [];
};

const inOrder = ({ entered, other }: Shared): boolean =>
  entered.every((link, index) => other[index]?.href === link.href);

const pathOf = (url: string): string =>
  URL.canParse(url) ? new URL(url).pathname : url;

const listed = (links: readonly SiteLink[]): string =>
  links
    .slice(0, MAX_LISTED)
    .map((link) => (link.text === "" ? pathOf(link.href) : link.text))
    .join(", ") + (links.length > MAX_LISTED ? ", …" : "");

const resultOf = (
  id: SiteCheckId,
  checked: number,
  samples: readonly string[]
): SiteCheckResult => {
  if (checked === 0) {
    return { checked, failing: 0, id, samples: [], status: "not_applicable" };
  }

  return {
    checked,
    failing: samples.length,
    id,
    samples: samples.slice(0, MAX_SAMPLES),
    status: samples.length > 0 ? "fail" : "pass",
  };
};

export const consistentNavigation: SiteCheck = {
  criterion: "3.2.3",
  evaluate: (summaries) => {
    const pairs = comparedPairs(summaries);

    return resultOf(
      "consistent-navigation",
      pairs.length,
      pairs.flatMap((pair) =>
        inOrder(pair)
          ? []
          : [
              `${pathOf(pair.url)}: ${listed(pair.other)}; the page entered: ${listed(pair.entered)}`,
            ]
      )
    );
  },
  howToFix:
    "Keep the links that repeat in the header and navigation in the same order on every page.",
  id: "consistent-navigation",
  newer: false,
  title: "Navigation in the same order on every page",
  whatFails:
    "Navigation links that appear once on the page entered and once on another page of the site come in a different order.",
};

const DIGITS = /\d+/gu;

const SPACE = /\s+/gu;

const normalized = (text: string): string =>
  text.toLowerCase().replaceAll(DIGITS, "").replaceAll(SPACE, " ").trim();

const WORD = /[\p{L}\p{N}]+/gu;

const PREFIX = 4;

const wordsOf = (text: string): readonly string[] => text.match(WORD) ?? [];

const oneEditApart = (left: string, right: string): boolean => {
  if (Math.abs(left.length - right.length) > 1) {
    return false;
  }

  let start = 0;

  while (start < left.length && left[start] === right[start]) {
    start += 1;
  }

  return (
    left.slice(start + 1) === right.slice(start + 1) ||
    left.slice(start) === right.slice(start + 1) ||
    left.slice(start + 1) === right.slice(start)
  );
};

const sameWord = (left: string, right: string): boolean =>
  left.slice(0, PREFIX) === right.slice(0, PREFIX) ||
  (Math.min(left.length, right.length) > PREFIX && oneEditApart(left, right));

const agree = (left: string, right: string): boolean => {
  if (left.includes(right) || right.includes(left)) {
    return true;
  }

  const leftWords = wordsOf(left);

  const rightWords = wordsOf(right);

  const [fewer, more] =
    leftWords.length <= rightWords.length
      ? [leftWords, rightWords]
      : [rightWords, leftWords];

  const matched = fewer.filter((word) =>
    more.some((other) => sameWord(word, other))
  ).length;

  return matched * 2 > more.length;
};

export const consistentIdentification: SiteCheck = {
  criterion: "3.2.4",
  evaluate: (summaries) => {
    const named = comparedPairs(summaries).flatMap((pair) => {
      const there = new Map(
        pair.other.map((link) => [link.href, normalized(link.text)])
      );

      return pair.entered.flatMap((link) => {
        const here = normalized(link.text);

        const other = there.get(link.href) ?? "";

        return here === "" || other === ""
          ? []
          : [{ here, link, other, url: pair.url }];
      });
    });

    return resultOf(
      "consistent-identification",
      named.length,
      named.flatMap(({ here, link, other, url }) =>
        agree(here, other)
          ? []
          : [
              `${pathOf(link.href)} is "${here}" on the page entered and "${other}" on ${pathOf(url)}`,
            ]
      )
    );
  },
  howToFix:
    "Give a navigation link to the same page the same name on every page.",
  id: "consistent-identification",
  newer: false,
  title: "The same link has the same name on every page",
  whatFails:
    "A navigation link to the same address has a different name on another page of the site.",
};

const placeOf = (help: SiteLink, around: readonly SiteLink[]): number =>
  around.filter((link) => link.position < help.position).length;

const helpPairs = (summaries: readonly PageSummary[]) => {
  const [entered, ...others] = summaries;

  if (entered?.role !== "entered") {
    return [];
  }

  return others.flatMap((other) => {
    const shared = sharedOf(entered, other);

    if (shared === null || !inOrder(shared)) {
      return [];
    }

    const theirs = new Map(other.help.map((link) => [link.href, link]));

    const helpHrefs = new Set([
      ...entered.help.map((link) => link.href),
      ...other.help.map((link) => link.href),
    ]);

    const around = {
      entered: shared.entered.filter((link) => !helpHrefs.has(link.href)),
      other: shared.other.filter((link) => !helpHrefs.has(link.href)),
    };

    return around.entered.length < MIN_SHARED_LINKS
      ? []
      : entered.help.flatMap((help) => {
          const there = theirs.get(help.href);

          return there === undefined
            ? []
            : [
                {
                  help,
                  here: placeOf(help, around.entered),
                  there: placeOf(there, around.other),
                  url: other.url,
                },
              ];
        });
  });
};

export const consistentHelp: SiteCheck = {
  criterion: "3.2.6",
  evaluate: (summaries) => {
    const placed = helpPairs(summaries);

    return resultOf(
      "consistent-help",
      placed.length,
      placed.flatMap(({ help, here, there, url }) =>
        here === there
          ? []
          : [
              `${help.text === "" ? pathOf(help.href) : `"${help.text}"`} comes after ${here} shared navigation links on the page entered and after ${there} on ${pathOf(url)}`,
            ]
      )
    );
  },
  howToFix:
    "Put the contact and help links that repeat across pages in the same place relative to the rest of the page on every page.",
  id: "consistent-help",
  newer: true,
  title: "Help in the same place on every page",
  whatFails:
    "A contact or help link that appears on several pages sits in a different place relative to the navigation links they share.",
};

export const SITE_CHECKS: readonly SiteCheck[] = [
  consistentNavigation,
  consistentIdentification,
  consistentHelp,
];

export const SiteFindingSchema = Schema.Struct({
  ...SiteCheckResultSchema.fields,
  howToFix: Schema.String,
  references: Schema.Array(FindingReferenceSchema),
  title: Schema.String,
  whatFails: Schema.String,
});

export type SiteFinding = typeof SiteFindingSchema.Type;

const referencesOfSite = (
  check: SiteCheck,
  reference: Reference
): FindingReference[] =>
  check.newer
    ? newerReferencesFor(`STD-SC22-${check.criterion}`)
    : referencesFor([criterion(check.criterion)], reference);

const TRAILING_SLASH = /\/+$/u;

const placeOfUrl = (url: string): string =>
  URL.canParse(url)
    ? `${new URL(url).host}${new URL(url).pathname.replace(TRAILING_SLASH, "")}`
    : url;

export const comparableSummaries = (
  evidence: SiteEvidence
): readonly PageSummary[] => {
  const landedWhereLinked = new Set(
    evidence.pages.flatMap((page) =>
      page.outcome === "read" &&
      placeOfUrl(page.url) === placeOfUrl(page.finalUrl)
        ? [page.finalUrl]
        : []
    )
  );

  return evidence.summaries.filter(
    (summary) =>
      summary.role === "entered" || landedWhereLinked.has(summary.url)
  );
};

export const runSiteChecks = (
  evidence: SiteEvidence,
  reference: Reference
): readonly SiteFinding[] =>
  SITE_CHECKS.flatMap((check) => {
    const references = referencesOfSite(check, reference);

    return references.length === 0
      ? []
      : [
          {
            ...check.evaluate(comparableSummaries(evidence)),
            howToFix: check.howToFix,
            references,
            title: check.title,
            whatFails: check.whatFails,
          },
        ];
  });
