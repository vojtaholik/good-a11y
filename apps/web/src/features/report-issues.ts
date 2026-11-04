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
import { copyIcon, crossIcon } from "./icons.js";
import { referenceChips } from "./report-references.js";
import { report as styles } from "./report-styles.js";
import { guideRouter } from "./route.js";
import { sx } from "./sx.js";

const shownText = (issue: Issue): string =>
  issue.samples.length < issue.failing
    ? `${issue.failing} failing, ${issue.samples.length} shown`
    : `${issue.failing} failing`;

const pillText = (issue: Issue): string =>
  issue.level === null ? "Issue found" : `Issue found · Level ${issue.level}`;

const guideLine = (issue: Issue, h: HtmlBuilder<AppMessage>): Html => {
  const pages = Array.getSomes(guidesForCheck(issue.key).map(guidePageOf));

  return h.p(
    [sx(h, styles.text)],
    pages.length === 0
      ? ["No guide for this yet"]
      : [
          "Fixed by ",
          ...Array.intersperse(
            pages.map((page) =>
              h.a(
                [
                  h.Href(guideRouter({ guideId: page.id })),
                  sx(h, styles.guideLink),
                ],
                [page.name]
              )
            ),
            ", "
          ),
        ]
  );
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
    [copyIcon(h), isCopied(model, issue) ? COPIED_LABEL : COPY_LABEL]
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

const sampleView = (
  sample: IssueSample,
  isMixed: boolean,
  h: HtmlBuilder<AppMessage>
): Html =>
  h.li(
    [],
    [
      ...(isMixed
        ? [
            h.span(
              [sx(h, styles.sampleTag)],
              [SAMPLE_SOURCE_LABELS[sample.source]]
            ),
          ]
        : []),
      h.pre([h.Tabindex(0), sx(h, styles.sample)], [h.code([], [sample.text])]),
    ]
  );

const samplesView = (issue: Issue, h: HtmlBuilder<AppMessage>): Html[] =>
  issue.samples.length === 0
    ? []
    : [
        h.div(
          [sx(h, styles.samples)],
          [
            h.h4(
              [sx(h, styles.label)],
              [
                "Failing elements ",
                h.span([sx(h, styles.labelCount)], [`· ${shownText(issue)}`]),
              ]
            ),
            h.ul(
              [sx(h, styles.samples)],
              issue.samples.map((sample) =>
                sampleView(sample, issue.sources.length > 1, h)
              )
            ),
          ]
        ),
      ];

const issueCard = (
  model: AppModel,
  issue: Issue,
  number: number,
  h: HtmlBuilder<AppMessage>
): Html =>
  h.keyed("li")(
    issue.key,
    [],
    [
      h.article(
        [sx(h, styles.card)],
        [
          h.div(
            [sx(h, styles.cardHead)],
            [
              h.h3(
                [h.Id(`issue-${issue.key}`), sx(h, styles.cardTitle)],
                [
                  h.span([sx(h, styles.cardNumber)], [`${number}.`]),
                  h.span([], [issue.title]),
                ]
              ),
              h.span([sx(h, styles.pill)], [crossIcon(h, 14), pillText(issue)]),
            ]
          ),
          ...referenceChips(issue.references, h),
          ...(issue.whatFails === null
            ? []
            : [h.p([sx(h, styles.text)], [issue.whatFails])]),
          ...(issue.howToFix === null
            ? []
            : [
                h.div(
                  [],
                  [
                    h.h4([sx(h, styles.label)], ["How to fix"]),
                    h.p([sx(h, styles.text)], [issue.howToFix]),
                  ]
                ),
              ]),
          ...samplesView(issue, h),
          h.div(
            [sx(h, styles.cardFoot)],
            [guideLine(issue, h), copyButton(model, issue, h)]
          ),
          h.p(
            [h.AriaLive("polite"), sx(h, styles.visuallyHidden)],
            [
              isCopied(model, issue)
                ? "Fix prompt copied to the clipboard."
                : "",
            ]
          ),
          ...copyFallback(model, issue, h),
        ]
      ),
    ]
  );

export const issuesSection = (
  model: AppModel,
  report: Report,
  h: HtmlBuilder<AppMessage>
): Html[] => {
  const { benchmark, newer } = issueGroupsOf(report);

  const cards = (issues: readonly Issue[], offset: number): Html =>
    h.ol(
      [sx(h, styles.samples)],
      issues.map((issue, index) =>
        issueCard(model, issue, offset + index + 1, h)
      )
    );

  return benchmark.length + newer.length === 0
    ? []
    : [
        h.section(
          [
            h.Id("issues"),
            sx(h, styles.section),
            h.AriaLabelledBy("issues-heading"),
          ],
          [
            h.div(
              [sx(h, styles.sectionHead)],
              [
                h.h2(
                  [h.Id("issues-heading"), sx(h, styles.sectionTitle)],
                  [`Issues (${benchmark.length + newer.length}), worst first`]
                ),
                h.p(
                  [sx(h, styles.meta)],
                  [
                    newer.length === 0
                      ? `${benchmark.length} counted`
                      : `${benchmark.length} counted · ${newer.length} against WCAG 2.2`,
                  ]
                ),
              ]
            ),
            ...(benchmark.length === 0 ? [] : [cards(benchmark, 0)]),
            ...(newer.length === 0
              ? []
              : [
                  h.h3([sx(h, styles.subTitle)], [NEWER_ISSUES_TITLE]),
                  cards(newer, benchmark.length),
                ]),
          ]
        ),
      ];
};
