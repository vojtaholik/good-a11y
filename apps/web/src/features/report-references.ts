import { NEWER_VERSION_LABEL } from "@eaa-check/core/contracts";
import type { FindingReference } from "@eaa-check/core/contracts";
import type { Html, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../client/model.js";
import { report as styles } from "./report-styles.js";
import { sx } from "./sx.js";

type Child = Html | string;

const KIND: Readonly<Record<FindingReference["kind"], string>> = {
  "en-newer": NEWER_VERSION_LABEL,
  "en-reference": "EN 301 549",
  wcag: "WCAG 2.1",
};

export const byCriterion = (
  references: readonly FindingReference[]
): readonly (readonly FindingReference[])[] => {
  const groups: FindingReference[][] = [];

  for (const reference of references) {
    const last = groups.at(-1);

    if (reference.kind === "wcag" || last === undefined) {
      groups.push([reference]);
    } else {
      last.push(reference);
    }
  }

  return groups;
};

const referenceLink = (
  reference: FindingReference,
  h: HtmlBuilder<AppMessage>
): Child[] => [
  `${KIND[reference.kind]}: `,
  h.a([h.Href(reference.source), sx(h, styles.link)], [reference.text]),
];

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
              group.flatMap((reference, index) => [
                ...(index === 0 ? [] : ["; "]),
                ...referenceLink(reference, h),
              ])
            )
          )
        ),
      ];
