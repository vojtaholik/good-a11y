import { newerWcagLabel } from "@good-a11y/core/contracts";
import type { FindingReference } from "@good-a11y/core/contracts";
import type { Html, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../client/message.js";
import { report as styles } from "./report-styles.js";
import { sx } from "./sx.js";

type Child = Html | string;

const SEPARATOR = " · ";

const LEVEL = /\(Level (?<level>AA?)\)/u;

const CLAUSE = / clause /u;

const shortText = (reference: FindingReference): string =>
  reference.text
    .replace(LEVEL, (_match, level: string) => `(${level})`)
    .replace(CLAUSE, " ");

const startsGroup = (reference: FindingReference): boolean =>
  reference.kind === "wcag" || reference.kind === "wcag-newer";

export const byCriterion = (
  references: readonly FindingReference[]
): readonly (readonly FindingReference[])[] => {
  const groups: FindingReference[][] = [];

  for (const reference of references) {
    const last = groups.at(-1);

    if (startsGroup(reference) || last === undefined) {
      groups.push([reference]);
    } else {
      last.push(reference);
    }
  }

  return groups;
};

const linked = (
  reference: FindingReference,
  h: HtmlBuilder<AppMessage>
): Html =>
  h.a([h.Href(reference.source), sx(h, styles.link)], [shortText(reference)]);

const mainLine = (
  group: readonly FindingReference[],
  h: HtmlBuilder<AppMessage>
): Child[] => {
  const main = group.filter((reference) => reference.kind !== "en-newer");

  const lead = main[0]?.kind === "wcag-newer" ? newerWcagLabel() : "WCAG 2.1";

  return [
    lead,
    ...main.flatMap((reference) => [SEPARATOR, linked(reference, h)]),
  ];
};

const newerLine = (
  group: readonly FindingReference[],
  h: HtmlBuilder<AppMessage>
): Html[] =>
  group.flatMap((reference) =>
    reference.kind === "en-newer"
      ? [
          h.span(
            [sx(h, styles.refNewer)],
            ["also ", linked(reference, h), ", published, not cited in the OJ"]
          ),
        ]
      : []
  );

export const referenceList = (
  references: readonly FindingReference[],
  h: HtmlBuilder<AppMessage>
): Html[] =>
  references.length === 0
    ? []
    : [
        h.ul(
          [sx(h, styles.refs), h.AriaLabel("References")],
          byCriterion(references).map((group) =>
            h.li(
              [],
              [
                h.span([], mainLine(group, h)),
                ...newerLine(group, h).flatMap((line) => [h.br([]), line]),
              ]
            )
          )
        ),
      ];

const chipText = (reference: FindingReference): string =>
  reference.kind === "en-newer"
    ? `${shortText(reference)}, not cited in the OJ`
    : reference.text.replace(CLAUSE, " ");

export const referenceChips = (
  references: readonly FindingReference[],
  h: HtmlBuilder<AppMessage>
): Html[] =>
  references.length === 0
    ? []
    : [
        h.ul(
          [sx(h, styles.chips), h.AriaLabel("References")],
          references.map((reference) =>
            h.li(
              [sx(h, styles.chip)],
              [
                h.a(
                  [h.Href(reference.source), sx(h, styles.link)],
                  [chipText(reference)]
                ),
              ]
            )
          )
        ),
      ];
