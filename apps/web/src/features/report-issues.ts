import { issuesOf } from "@eaa-check/core/contracts";
import type { Issue, Report } from "@eaa-check/core/contracts";
import type { Html, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../client/model.js";
import { referenceList } from "./report-references.js";
import { report as styles } from "./report-styles.js";
import { sx } from "./sx.js";

const countText = (issue: Issue): string =>
  issue.checked === null
    ? `${issue.failing} ${issue.failing === 1 ? "element" : "elements"} failing`
    : `${issue.failing} of ${issue.checked} failing`;

const metaText = (issue: Issue): string =>
  [
    issue.level === null ? "" : `WCAG Level ${issue.level}`,
    issue.method === "rendered" ? "found in the rendered page" : "",
  ]
    .filter((part) => part !== "")
    .join(", ");

const issueCard = (issue: Issue, h: HtmlBuilder<AppMessage>): Html =>
  h.li(
    [sx(h, styles.card)],
    [
      h.h3([sx(h, styles.cardTitle)], [issue.title]),
      h.p(
        [sx(h, styles.meta)],
        [
          h.span([sx(h, styles.count)], [countText(issue)]),
          ...(metaText(issue) === "" ? [] : [`. ${metaText(issue)}`]),
        ]
      ),
      ...(issue.whatFails === null
        ? []
        : [h.p([sx(h, styles.text)], [issue.whatFails])]),
      ...(issue.howToFix === null
        ? []
        : [
            h.p(
              [sx(h, styles.text)],
              [h.strong([], ["How to fix: "]), issue.howToFix]
            ),
          ]),
      ...(issue.samples.length === 0
        ? []
        : [
            h.ul(
              [sx(h, styles.samples), h.AriaLabel("Failing elements")],
              issue.samples.map((sample) =>
                h.li([], [h.code([sx(h, styles.sample)], [sample])])
              )
            ),
          ]),
      ...(issue.helpUrl === null
        ? []
        : [
            h.p(
              [sx(h, styles.text)],
              [
                h.a(
                  [h.Href(issue.helpUrl), sx(h, styles.link)],
                  [
                    `Deque University guidance on ${issue.key.replace("axe:", "")}`,
                  ]
                ),
              ]
            ),
          ]),
      ...referenceList(issue.references, h),
    ]
  );

export const issuesSection = (
  report: Report,
  h: HtmlBuilder<AppMessage>
): Html[] => {
  const issues = issuesOf(report);

  return issues.length === 0
    ? []
    : [
        h.section(
          [sx(h, styles.section), h.AriaLabelledBy("issues")],
          [
            h.h2(
              [h.Id("issues"), sx(h, styles.sectionTitle)],
              [`Issues (${issues.length}), worst first`]
            ),
            h.ol(
              [sx(h, styles.samples)],
              issues.map((issue) => issueCard(issue, h))
            ),
          ]
        ),
      ];
};
