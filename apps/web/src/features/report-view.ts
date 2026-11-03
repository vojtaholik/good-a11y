import {
  METHOD_NAMES,
  quietChecksOf,
  quietSummary,
} from "@eaa-check/core/contracts";
import type { Finding, Report, Sourced } from "@eaa-check/core/contracts";
import type { Html, HtmlBuilder } from "foldkit/html";

import { ScanState } from "../client/model.js";
import type { AppMessage, AppModel } from "../client/model.js";
import { contactView } from "./contact-view.js";
import { issuesSection } from "./report-issues.js";
import { statesSection } from "./report-states.js";
import { report as local } from "./report-styles.js";
import { homeRouter } from "./route.js";
import { styles } from "./styles.js";
import { sx } from "./sx.js";

const QUIET: Readonly<Record<Exclude<Finding["status"], "fail">, string>> = {
  not_applicable: "Nothing to check",
  pass: "No issue found",
};

const scannedAt = (iso: string): string =>
  iso.slice(0, 16).replace("T", " at ");

const topView = (report: Report, h: HtmlBuilder<AppMessage>): Html =>
  h.header(
    [sx(h, local.top)],
    [
      h.p(
        [sx(h, local.meta)],
        [`Page: ${report.finalUrl ?? report.requestedUrl}`]
      ),
      h.p(
        [sx(h, local.meta)],
        [
          "Scanned ",
          h.time(
            [h.Attribute("datetime", report.scannedAt)],
            [`${scannedAt(report.scannedAt)} UTC`]
          ),
          ...(report.coverage === null
            ? []
            : [`. Checks run: ${METHOD_NAMES[report.coverage.method]}.`]),
        ]
      ),
      h.p([sx(h, local.headline), h.Role("status")], [report.headline]),
      ...(report.coverage === null ? [] : [h.p([], [report.coverage.text])]),
      ...(report.rendered?.status === "skipped"
        ? [
            h.p(
              [sx(h, local.meta)],
              [`Rendered page check skipped: ${report.rendered.reason}`]
            ),
          ]
        : []),
      ...(report.outcome === "checked"
        ? []
        : [h.p([], [report.outcomeDetail])]),
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
    ]
  );

const quietView = (report: Report, h: HtmlBuilder<AppMessage>): Html[] => {
  const quiet = quietChecksOf(report);

  return quiet.length === 0
    ? []
    : [
        h.details(
          [sx(h, local.disclosure, local.section)],
          [
            h.summary([sx(h, local.summary)], [quietSummary(quiet)]),
            h.ul(
              [],
              quiet.map((finding) =>
                h.li(
                  [],
                  [
                    `${finding.title}: `,
                    finding.status === "pass"
                      ? QUIET.pass
                      : QUIET.not_applicable,
                  ]
                )
              )
            ),
          ]
        ),
      ];
};

const sourcedLine = (
  label: string,
  value: Sourced | null,
  h: HtmlBuilder<AppMessage>
): Html[] =>
  value === null
    ? []
    : [
        h.dt([sx(h, local.factTerm)], [label]),
        h.dd(
          [sx(h, local.factValue)],
          [h.a([h.Href(value.source), sx(h, local.link)], [value.text])]
        ),
      ];

const rulesView = (report: Report, h: HtmlBuilder<AppMessage>): Html => {
  const { benchmark, citation, newerVersion, requirements } = report.reference;

  return h.section(
    [sx(h, local.section), h.AriaLabelledBy("rules")],
    [
      h.h2([h.Id("rules"), sx(h, local.sectionTitle)], ["About the rules"]),
      h.dl(
        [],
        [
          ...requirements.flatMap((requirement) =>
            sourcedLine("What the EAA requires", requirement, h)
          ),
          ...sourcedLine("Reference benchmark", benchmark, h),
          ...sourcedLine(
            "Official Journal citation of EN 301 549 under the EAA",
            citation,
            h
          ),
          ...(newerVersion === null
            ? []
            : [
                h.dt([sx(h, local.factTerm)], ["Newer version"]),
                h.dd([sx(h, local.factValue)], [newerVersion.label]),
              ]),
        ]
      ),
    ]
  );
};

const closingView = (report: Report, h: HtmlBuilder<AppMessage>): Html[] => [
  h.p([sx(h, styles.statement)], [report.statement.text]),
  h.aside([sx(h, styles.contact)], [h.p([], [report.contact.text])]),
];

const publishedView = (report: Report, h: HtmlBuilder<AppMessage>): Html[] =>
  report.outcome === "checked"
    ? [
        topView(report, h),
        ...issuesSection(report, h),
        statesSection(report, h),
        ...quietView(report, h),
        rulesView(report, h),
        ...closingView(report, h),
      ]
    : [topView(report, h), rulesView(report, h), ...closingView(report, h)];

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
            : [
                ...publishedView(view.report, h),
                contactView(model, view.url, h),
              ],
        Unavailable: () => [
          h.p(
            [h.Role("alert")],
            [
              "The scan failed: the report could not be loaded. Try again in a few minutes.",
            ]
          ),
          h.p([], [h.a([h.Href(homeRouter())], ["Start a new scan"])]),
        ],
        Unknown: () => [
          h.p([], [`There is no scan of ${slug} yet.`]),
          h.p([], [h.a([h.Href(homeRouter())], ["Start one"])]),
        ],
      }),
    ]
  );
