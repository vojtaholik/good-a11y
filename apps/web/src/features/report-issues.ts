import {
  NEWER_ISSUES_TITLE,
  SAMPLE_SOURCE_LABELS,
  issueGroupsOf,
} from "@good-a11y/core/contracts";
import type { Issue, IssueSample, Report } from "@good-a11y/core/contracts";
import { guidesForCheck } from "@good-a11y/guides/check-guides";
import { Array, Schema } from "effect";
import type { Html, HtmlBuilder } from "foldkit/html";

import { Message } from "../client/message.js";
import type { AppMessage } from "../client/message.js";
import { CopyState } from "../client/model.js";
import type { AppModel } from "../client/model.js";
import { guidePageOf } from "./guides.js";
import { referenceList } from "./report-references.js";
import { report as styles } from "./report-styles.js";
import { guideRouter } from "./route.js";
import { sx } from "./sx.js";

const countText = (issue: Issue): string =>
  issue.checked === null
    ? `${issue.failing} ${issue.failing === 1 ? "element" : "elements"} failing`
    : `${issue.failing} of ${issue.checked} failing`;

const metaText = (issue: Issue): string => {
  const where = `in the ${issue.sources.map((source) => SAMPLE_SOURCE_LABELS[source]).join(" and the ")}`;

  return issue.level === null
    ? `Found ${where}`
    : `WCAG Level ${issue.level}, found ${where}`;
};

const guideLinks = (issue: Issue, h: HtmlBuilder<AppMessage>): Html[] => {
  const pages = Array.getSomes(guidesForCheck(issue.key).map(guidePageOf));

  return pages.length === 0
    ? []
    : [
        h.p(
          [sx(h, styles.text)],
          [
            h.strong([], [pages.length === 1 ? "Guide: " : "Guides: "]),
            ...Array.intersperse(
              pages.map((page) =>
                h.a([h.Href(guideRouter({ guideId: page.id }))], [page.name])
              ),
              ", "
            ),
          ]
        ),
      ];
};

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
      ...guideLinks(issue, h),
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
  const { benchmark, newer } = issueGroupsOf(report);

  const cards = (issues: readonly Issue[]): Html =>
    h.ol(
      [sx(h, styles.samples)],
      issues.map((issue) => issueCard(model, issue, h))
    );

  return benchmark.length + newer.length === 0
    ? []
    : [
        h.section(
          [sx(h, styles.section), h.AriaLabelledBy("issues")],
          [
            h.h2(
              [h.Id("issues"), sx(h, styles.sectionTitle)],
              [`Issues (${benchmark.length + newer.length}), worst first`]
            ),
            ...(benchmark.length === 0 ? [] : [cards(benchmark)]),
            ...(newer.length === 0
              ? []
              : [
                  h.h3([sx(h, styles.cardTitle)], [NEWER_ISSUES_TITLE]),
                  cards(newer),
                ]),
          ]
        ),
      ];
};
