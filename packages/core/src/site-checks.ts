import { Schema } from "effect";

import { CheckStatusSchema, MAX_SAMPLES } from "./check.js";
import type { CheckStatus } from "./check.js";
import type { PageSummary, SiteLink } from "./site-evidence.js";

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

interface Pair {
  readonly first: PageSummary;
  readonly other: PageSummary;
}

const pairsOf = (summaries: readonly PageSummary[]): readonly Pair[] => {
  const [first, ...others] = summaries;

  return first === undefined ? [] : others.map((other) => ({ first, other }));
};

const firstOccurrences = (links: readonly SiteLink[]): readonly SiteLink[] => {
  const seen = new Set<string>();

  return links.filter((link) => {
    if (seen.has(link.href)) {
      return false;
    }

    seen.add(link.href);

    return true;
  });
};

const shared = (
  left: readonly SiteLink[],
  right: readonly SiteLink[]
): readonly [readonly SiteLink[], readonly SiteLink[]] => {
  const leftHrefs = new Set(left.map((link) => link.href));

  const rightHrefs = new Set(right.map((link) => link.href));

  return [
    left.filter((link) => rightHrefs.has(link.href)),
    right.filter((link) => leftHrefs.has(link.href)),
  ];
};

const sameOrder = (
  left: readonly SiteLink[],
  right: readonly SiteLink[]
): boolean => left.every((link, index) => right[index]?.href === link.href);

const listed = (links: readonly SiteLink[]): string =>
  links
    .slice(0, MAX_LISTED)
    .map((link) => (link.text === "" ? link.href : link.text))
    .join(", ") + (links.length > MAX_LISTED ? ", …" : "");

const pathOf = (url: string): string =>
  URL.canParse(url) ? new URL(url).pathname : url;

const resultOf = (
  id: SiteCheckId,
  checked: number,
  samples: readonly string[]
): SiteCheckResult => {
  const failing: CheckStatus = samples.length > 0 ? "fail" : "pass";

  return {
    checked,
    failing: samples.length,
    id,
    samples: samples.slice(0, MAX_SAMPLES),
    status: checked === 0 ? "not_applicable" : failing,
  };
};

const orderCheck =
  (
    id: SiteCheckId,
    linksOf: (summary: PageSummary) => readonly SiteLink[],
    counts: (links: readonly SiteLink[]) => boolean
  ) =>
  (summaries: readonly PageSummary[]): SiteCheckResult => {
    const compared = pairsOf(summaries).flatMap(({ first, other }) => {
      const [left, right] = shared(
        firstOccurrences(linksOf(first)),
        firstOccurrences(linksOf(other))
      );

      return left.length >= MIN_SHARED_LINKS && counts(left)
        ? [{ left, other, right }]
        : [];
    });

    return resultOf(
      id,
      compared.length,
      compared.flatMap(({ left, other, right }) =>
        sameOrder(left, right)
          ? []
          : [
              `${pathOf(other.url)}: ${listed(right)}; the page entered: ${listed(left)}`,
            ]
      )
    );
  };

export const consistentNavigation: SiteCheck = {
  criterion: "3.2.3",
  evaluate: orderCheck(
    "consistent-navigation",
    (summary) => summary.navigation,
    () => true
  ),
  howToFix:
    "Keep the links that repeat in the header and navigation in the same order on every page.",
  id: "consistent-navigation",
  newer: false,
  title: "Navigation in the same order on every page",
  whatFails:
    "Navigation links that appear on the page entered and on another page of the site come in a different order.",
};

const firstPosition = (
  links: readonly SiteLink[]
): ReadonlyMap<string, number> => {
  const positions = new Map<string, number>();

  for (const link of links) {
    if (!positions.has(link.href)) {
      positions.set(link.href, link.position);
    }
  }

  return positions;
};

const before = (
  href: string,
  positions: ReadonlyMap<string, number>,
  around: readonly string[]
): string =>
  around
    .filter((other) => (positions.get(other) ?? 0) < (positions.get(href) ?? 0))
    .toSorted()
    .join(" ");

export const consistentHelp: SiteCheck = {
  criterion: "3.2.6",
  evaluate: (summaries) => {
    const compared = pairsOf(summaries).flatMap(({ first, other }) => {
      const firstHelp = firstPosition(first.help);

      const otherHelp = firstPosition(other.help);

      const help = [...firstHelp.keys()].filter((href) => otherHelp.has(href));

      const firstNav = firstPosition(first.navigation);

      const otherNav = firstPosition(other.navigation);

      const around = [...firstNav.keys()].filter(
        (href) => otherNav.has(href) && !firstHelp.has(href)
      );

      return help.length > 0 && around.length >= MIN_SHARED_LINKS
        ? [
            {
              around,
              first: new Map([...firstNav, ...firstHelp]),
              help,
              other,
              second: new Map([...otherNav, ...otherHelp]),
            },
          ]
        : [];
    });

    return resultOf(
      "consistent-help",
      compared.length,
      compared.flatMap(({ around, first, help, other, second }) =>
        help.flatMap((href) =>
          before(href, first, around) === before(href, second, around)
            ? []
            : [
                `${pathOf(href)} sits elsewhere among the navigation links on ${pathOf(other.url)} than on the page entered`,
              ]
        )
      )
    );
  },
  howToFix:
    "Put the contact and help links that repeat across pages in the same place relative to the rest of the page on every page.",
  id: "consistent-help",
  newer: true,
  title: "Help in the same place on every page",
  whatFails:
    "A contact or help link that appears on several pages sits in a different place among the navigation links.",
};

const DIGITS = /\d+/gu;

const SPACE = /\s+/gu;

const normalized = (text: string): string =>
  text.toLowerCase().replaceAll(DIGITS, "").replaceAll(SPACE, " ").trim();

const namesByHref = (
  links: readonly SiteLink[]
): ReadonlyMap<string, readonly string[]> => {
  const names = new Map<string, string[]>();

  for (const link of links) {
    const name = normalized(link.text);

    if (name !== "") {
      names.set(link.href, [...(names.get(link.href) ?? []), name]);
    }
  }

  return names;
};

const related = (left: string, right: string): boolean =>
  left.includes(right) || right.includes(left);

const agree = (left: readonly string[], right: readonly string[]): boolean =>
  left.some((name) => right.some((other) => related(name, other)));

export const consistentIdentification: SiteCheck = {
  criterion: "3.2.4",
  evaluate: (summaries) => {
    const compared = pairsOf(summaries).flatMap(({ first, other }) => {
      const left = namesByHref(first.navigation);

      const right = namesByHref(other.navigation);

      const common = [...left.keys()].filter((href) => right.has(href));

      return common.length >= MIN_SHARED_LINKS
        ? [{ common, left, other, right }]
        : [];
    });

    return resultOf(
      "consistent-identification",
      compared.length,
      compared.flatMap(({ common, left, other, right }) =>
        common.flatMap((href) => {
          const here = left.get(href) ?? [];

          const there = right.get(href) ?? [];

          return agree(here, there)
            ? []
            : [
                `${pathOf(href)} is "${here.join('" / "')}" on the page entered and "${there.join('" / "')}" on ${pathOf(other.url)}`,
              ];
        })
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

export const SITE_CHECKS: readonly SiteCheck[] = [
  consistentNavigation,
  consistentIdentification,
  consistentHelp,
];
