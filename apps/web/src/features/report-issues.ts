import { SAMPLE_SOURCE_LABELS, issuesOf } from "@eaa-check/core/contracts";
import type { Issue, IssueSample, Report } from "@eaa-check/core/contracts";
import { Schema } from "effect";
import type { Html, HtmlBuilder } from "foldkit/html";

import { CopyState, Message } from "../client/model.js";
import type { AppMessage, AppModel } from "../client/model.js";
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
    `found in the ${issue.sources.map((source) => SAMPLE_SOURCE_LABELS[source]).join(" and the ")}`,
  ]
    .filter((part) => part !== "")
    .join(", ");

const COPY_LABEL = "Copy fix prompt";

const COPIED_LABEL = "Copied";

const COPY_FAILED = "Copy failed, select the text below.";

const isCopied = (model: AppModel, issue: Issue): boolean =>
  Schema.is(CopyState.Copied)(model.copy) && model.copy.key === issue.key;

const failedText = (model: AppModel, issue: Issue): string | null =>
  Schema.is(CopyState.Failed)(model.copy) && model.copy.key === issue.key
    ? model.copy.text
    : null;

const copyButton = (
  model: AppModel,
  issue: Issue,
  h: HtmlBuilder<AppMessage>
): Html =>
  h.button(
    [
      h.Type("button"),
      sx(h, styles.copy),
      h.AriaDescribedBy(`issue-${issue.key}`),
      h.OnClick(Message.ClickedCopyFixPrompt({ key: issue.key })),
    ],
    [isCopied(model, issue) ? COPIED_LABEL : COPY_LABEL]
  );

const copyFallback = (
  model: AppModel,
  issue: Issue,
  h: HtmlBuilder<AppMessage>
): Html[] => {
  const text = failedText(model, issue);

  return text === null
    ? []
    : [
        h.details(
          [sx(h, styles.disclosure), h.Open(true)],
          [
            h.summary([sx(h, styles.summary)], [COPY_FAILED]),
            h.pre([sx(h, styles.prompt)], [text]),
          ]
        ),
      ];
};

const sampleView = (sample: IssueSample, h: HtmlBuilder<AppMessage>): Html =>
  h.li(
    [],
    [
      h.span([sx(h, styles.sampleTag)], [SAMPLE_SOURCE_LABELS[sample.source]]),
      h.code([sx(h, styles.sample)], [sample.text]),
    ]
  );

const issueCard = (
  model: AppModel,
  issue: Issue,
  h: HtmlBuilder<AppMessage>
): Html =>
  h.keyed("li")(
    issue.key,
    [sx(h, styles.card)],
    [
      h.h3(
        [h.Id(`issue-${issue.key}`), sx(h, styles.cardTitle)],
        [issue.title]
      ),
      h.p(
        [sx(h, styles.meta)],
        [
          h.span([sx(h, styles.count)], [countText(issue)]),
          `. ${metaText(issue)}`,
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
              issue.samples.map((sample) => sampleView(sample, h))
            ),
          ]),
      copyButton(model, issue, h),
      h.p(
        [h.AriaLive("polite"), sx(h, styles.visuallyHidden)],
        [isCopied(model, issue) ? "Fix prompt copied to the clipboard." : ""]
      ),
      ...copyFallback(model, issue, h),
      ...referenceList(issue.references, h),
    ]
  );

export const issuesSection = (
  model: AppModel,
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
              issues.map((issue) => issueCard(model, issue, h))
            ),
          ]
        ),
      ];
};
