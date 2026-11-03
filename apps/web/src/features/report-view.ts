import type {
  Finding,
  FindingReference,
  Report,
  StateRef,
} from "@eaa-check/core/contracts";
import type { Html, HtmlBuilder } from "foldkit/html";

import { ScanState } from "../client/model.js";
import type { AppMessage, AppModel } from "../client/model.js";
import { flagOf } from "./flags.js";
import { homeRouter } from "./route.js";
import { styles } from "./styles.js";
import { sx } from "./sx.js";

const STATUS: Readonly<Record<Finding["status"], string>> = {
  fail: "Issue found",
  not_applicable: "Nothing to check",
  pass: "No issue found",
};

const KIND: Readonly<Record<FindingReference["kind"], string>> = {
  "en-reference": "EN 301 549",
  "en-upcoming": "EN 301 549, next version",
  wcag: "WCAG",
};

const stateView = (state: StateRef, h: HtmlBuilder<AppMessage>): Html => {
  const flag = flagOf(state.code);

  return h.span(
    [sx(h, styles.state)],
    [
      ...(flag === undefined
        ? []
        : [h.img([h.Src(flag), h.Alt(""), sx(h, styles.flag)])]),
      state.name,
    ]
  );
};

const statesView = (report: Report, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [],
    [
      h.p(
        [],
        report.applicability.applies.length === 0
          ? [
              "Member states where this applies: none confirmed yet from verified sources.",
            ]
          : [
              "Applies in: ",
              ...report.applicability.applies.map((state) =>
                stateView(state, h)
              ),
            ]
      ),
      ...(report.applicability.unknown.length === 0
        ? []
        : [
            h.p(
              [],
              [
                "Not known yet from verified sources: ",
                ...report.applicability.unknown.map((state) =>
                  stateView(state, h)
                ),
              ]
            ),
          ]),
    ]
  );

const findingView = (
  finding: Finding,
  report: Report,
  h: HtmlBuilder<AppMessage>
): Html =>
  h.section(
    [sx(h, styles.finding)],
    [
      h.h3([], [finding.title]),
      h.p(
        [],
        [
          h.span([sx(h, styles.status)], [STATUS[finding.status]]),
          finding.status === "fail"
            ? ` (${finding.failing} of ${finding.checked} checked)`
            : "",
        ]
      ),
      ...(finding.status === "fail" ? [h.p([], [finding.whatFails])] : []),
      ...(finding.samples.length === 0
        ? []
        : [
            h.ul(
              [],
              finding.samples.map((sample) =>
                h.li([], [h.code([sx(h, styles.sample)], [sample])])
              )
            ),
          ]),
      ...(finding.references.length === 0
        ? []
        : [
            h.ul(
              [],
              finding.references.map((reference) =>
                h.li([], [`${KIND[reference.kind]}: ${reference.text}`])
              )
            ),
          ]),
      ...(finding.status === "fail" ? [statesView(report, h)] : []),
    ]
  );

const requirementsView = (
  report: Report,
  h: HtmlBuilder<AppMessage>
): Html[] => [
  ...(report.reference.citation === null
    ? []
    : [h.p([], [report.reference.citation.text])]),
  ...(report.reference.requirements.length === 0
    ? []
    : [
        h.h2([], ["What the EAA requires"]),
        ...report.reference.requirements.map((requirement) =>
          h.p([], [requirement.text])
        ),
      ]),
];

const closingView = (report: Report, h: HtmlBuilder<AppMessage>): Html[] => [
  h.p([sx(h, styles.statement)], [report.statement.text]),
  h.aside([sx(h, styles.contact)], [h.p([], [report.contact.text])]),
];

const refusedView = (report: Report, h: HtmlBuilder<AppMessage>): Html[] => [
  h.p([sx(h, styles.headline)], [report.headline]),
  h.p([h.Role("status")], [report.outcomeDetail]),
  ...requirementsView(report, h),
  ...closingView(report, h),
];

const checkedView = (report: Report, h: HtmlBuilder<AppMessage>): Html[] => [
  h.p([sx(h, styles.headline)], [report.headline]),
  ...(report.coverage === null ? [] : [h.p([], [report.coverage.text])]),
  h.p([], [`Page: ${report.finalUrl ?? report.requestedUrl}`]),
  ...(report.outcome === "checked"
    ? []
    : [h.p([h.Role("status")], [report.outcomeDetail])]),
  ...(report.truncated
    ? [
        h.p(
          [],
          [
            "The page was larger than the size we read, so only its first part was checked.",
          ]
        ),
      ]
    : []),
  ...requirementsView(report, h),
  ...(report.reference.benchmark === null
    ? []
    : [h.p([], [report.reference.benchmark.text])]),
  ...report.findings.map((finding) => findingView(finding, report, h)),
  ...closingView(report, h),
];

const publishedView = (report: Report, h: HtmlBuilder<AppMessage>): Html[] =>
  report.outcome === "refused"
    ? refusedView(report, h)
    : checkedView(report, h);

export const reportView = (
  model: AppModel,
  slug: string,
  h: HtmlBuilder<AppMessage>
): Html =>
  h.main(
    [],
    [
      h.h1([], [`Report for ${slug}`]),
      ...ScanState.match<Html[]>(model.scan, {
        Idle: () => [],
        Loading: () => [h.p([h.Role("status")], ["Loading the report…"])],
        Running: ({ view }) => [
          h.p(
            [h.Role("status")],
            [
              view.stage === "queued"
                ? "The scan is queued…"
                : "Fetching and checking the page…",
            ]
          ),
        ],
        Settled: ({ view }) =>
          view.report === null
            ? [
                h.p([h.Role("alert")], [view.failure ?? "The scan failed."]),
                h.p([], [h.a([h.Href(homeRouter())], ["Start a new scan"])]),
              ]
            : publishedView(view.report, h),
        Unavailable: () => [
          h.p(
            [h.Role("alert")],
            ["The report could not be loaded. Reload the page to try again."]
          ),
        ],
        Unknown: () => [
          h.p([], [`There is no scan of ${slug} yet.`]),
          h.p([], [h.a([h.Href(homeRouter())], ["Start one"])]),
        ],
      }),
    ]
  );
