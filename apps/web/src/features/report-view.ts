import {
  CONTACT_SHOWN,
  METHOD_NAMES,
  verdictDetail,
  isTested,
  issueGroupsOf,
  quietChecksOf,
  quietSummary,
} from "@good-a11y/core/contracts";
import type { Finding, Report, Sourced } from "@good-a11y/core/contracts";
import { Option } from "effect";
import type { Html, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../client/message.js";
import { ScanState } from "../client/model.js";
import type { AppModel } from "../client/model.js";
import { contactView } from "./contact-view.js";
import { statusMessage } from "./controls.js";
import { crossIcon, infoIcon } from "./icons.js";
import { MAIN_ID } from "./landmarks.js";
import { checklistSection } from "./report-checklist.js";
import { issuesSection } from "./report-issues.js";
import { judgedSection } from "./report-judged.js";
import { siteSection } from "./report-site.js";
import { statesSection } from "./report-states.js";
import { report as local } from "./report-styles.js";
import { checkRouter } from "./route.js";
import { styles } from "./styles.js";
import { sx } from "./sx.js";

const QUIET: Readonly<Record<Exclude<Finding["status"], "fail">, string>> = {
  not_applicable: "Nothing to check",
  pass: "No issue found",
};

const scannedAt = (iso: string): string =>
  `${iso.slice(0, 16).replace("T", " at ")} UTC`;

const whyView = (report: Report, h: HtmlBuilder<AppMessage>): Html[] =>
  report.verdict?.kind === "fails" && report.verdict.fact !== null
    ? [
        h.p(
          [sx(h, local.meta)],
          [
            "Why: ",
            h.a(
              [h.Href(report.verdict.fact.source), sx(h, local.link)],
              [`WCAG 2.1 conformance: ${report.verdict.fact.text}`]
            ),
            ...(report.reference.benchmark === null
              ? []
              : [
                  "; ",
                  h.a(
                    [
                      h.Href(report.reference.benchmark.source),
                      sx(h, local.link),
                    ],
                    [`Reference benchmark: ${report.reference.benchmark.text}`]
                  ),
                ]),
          ]
        ),
      ]
    : [];

const verdictView = (report: Report, h: HtmlBuilder<AppMessage>): Html => {
  const fails = report.verdict?.kind === "fails";

  return h.section(
    [
      h.AriaLabelledBy("verdict-heading"),
      sx(h, local.verdict, fails ? local.verdictFails : local.verdictOpen),
    ],
    [
      h.h2([h.Id("verdict-heading"), sx(h, local.verdictTitle)], ["Verdict"]),
      h.p(
        [
          h.Role("status"),
          sx(
            h,
            local.verdictHeadline,
            fails ? local.verdictHeadlineFails : null
          ),
        ],
        [
          h.span(
            [sx(h, local.verdictIcon)],
            [fails ? crossIcon(h, 28) : infoIcon(h, 28)]
          ),
          h.span([], [report.headline]),
        ]
      ),
      ...(report.verdict === null
        ? []
        : [h.p([sx(h, local.text)], [verdictDetail(report.verdict)])]),
      ...whyView(report, h),
    ]
  );
};

const notesView = (report: Report, h: HtmlBuilder<AppMessage>): Html[] => [
  ...(report.rendered?.status === "skipped"
    ? [
        statusMessage(
          h,
          "note",
          `the rendered page check was skipped: ${report.rendered.reason}`
        ),
      ]
    : []),
  ...(report.outcome === "checked"
    ? []
    : [statusMessage(h, "note", report.outcomeDetail)]),
  ...(report.truncated
    ? [
        statusMessage(
          h,
          "note",
          "the page was larger than the size we read, so only its first part was checked."
        ),
      ]
    : []),
];

const metaRow = (
  term: string,
  value: readonly (Html | string)[],
  h: HtmlBuilder<AppMessage>,
  isMono = false
): Html[] => [
  h.dt([sx(h, local.metaTerm)], [term]),
  h.dd([sx(h, local.metaValue, isMono ? local.mono : null)], [...value]),
];

const issuesCounted = (count: number): string =>
  `${count} ${count === 1 ? "issue" : "issues"}`;

const issueCountLine = (report: Report): string => {
  const { benchmark, newer } = issueGroupsOf(report);

  const more =
    newer.length === 0 ? "" : ` ${newer.length} more against WCAG 2.2.`;

  return benchmark.length === 0
    ? `No issues on this page against WCAG 2.1 Level A and AA.${more}`
    : `${issuesCounted(benchmark.length)} on this page against WCAG 2.1 Level A and AA, worst first.${more}`;
};

const topView = (
  report: Report,
  slug: string,
  h: HtmlBuilder<AppMessage>
): Html =>
  h.div(
    [sx(h, local.head)],
    [
      h.div(
        [sx(h, local.intro)],
        [
          h.h1([sx(h, local.title)], [`Report for ${slug}`]),
          h.dl(
            [sx(h, local.metaList)],
            [
              ...metaRow(
                "Address",
                [report.finalUrl ?? report.requestedUrl],
                h,
                true
              ),
              ...metaRow(
                "Scanned",
                [
                  h.time(
                    [h.Attribute("datetime", report.scannedAt)],
                    [scannedAt(report.scannedAt)]
                  ),
                ],
                h
              ),
              ...(report.coverage === null
                ? []
                : metaRow(
                    "Checks run",
                    [METHOD_NAMES[report.coverage.method]],
                    h
                  )),
            ]
          ),
          ...(report.coverage === null
            ? []
            : [
                h.p([sx(h, local.headline)], [issueCountLine(report)]),
                h.p(
                  [sx(h, local.text)],
                  [
                    `${report.coverage.text} `,
                    h.a(
                      [
                        h.Href(`${checkRouter({})}#what-we-check`),
                        sx(h, local.link),
                      ],
                      ["What we check"]
                    ),
                  ]
                ),
              ]),
          ...notesView(report, h),
        ]
      ),
      verdictView(report, h),
    ]
  );

type Part = Readonly<{ content: readonly Html[]; id: string; label: string }>;

const navView = (parts: readonly Part[], h: HtmlBuilder<AppMessage>): Html =>
  h.nav(
    [h.AriaLabel("On this page"), sx(h, local.nav)],
    [
      h.p([sx(h, local.navTitle), h.AriaHidden(true)], ["On this page"]),
      ...parts.map(({ id, label }) =>
        h.a([h.Href(`#${id}`), sx(h, local.navLink)], [label])
      ),
    ]
  );

const quietView = (report: Report, h: HtmlBuilder<AppMessage>): Html[] => {
  const quiet = quietChecksOf(report);

  return quiet.length === 0
    ? []
    : [
        h.details(
          [h.Id("quiet"), sx(h, local.disclosure)],
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
  ...(CONTACT_SHOWN
    ? [h.aside([sx(h, styles.contact)], [h.p([], [report.contact.text])])]
    : []),
];

const partsOf = (
  model: AppModel,
  report: Report,
  h: HtmlBuilder<AppMessage>
): readonly Part[] =>
  (
    [
      {
        content: issuesSection(model, report, h),
        id: "issues",
        label: "Issues",
      },
      {
        content: judgedSection(report, h),
        id: "judged",
        label: "Judged by a model",
      },
      {
        content: [checklistSection(report, h)],
        id: "checklist",
        label: "Requirement checklist",
      },
      { content: siteSection(report, h), id: "site", label: "Other pages" },
      {
        content: [statesSection(report, h)],
        id: "states",
        label: "Where the EAA applies",
      },
      {
        content: quietView(report, h),
        id: "quiet",
        label: "Checks with no issue",
      },
      {
        content: [rulesView(report, h)],
        id: "rules",
        label: "About the rules",
      },
    ] satisfies Part[]
  ).filter(({ content }) => content.length > 0);

const publishedView = (
  model: AppModel,
  report: Report,
  slug: string,
  h: HtmlBuilder<AppMessage>
): Html[] => {
  const parts: readonly Part[] = isTested(report)
    ? partsOf(model, report, h)
    : [
        {
          content: [rulesView(report, h)],
          id: "rules",
          label: "About the rules",
        },
      ];

  return [
    topView(report, slug, h),
    h.div(
      [sx(h, local.body)],
      [
        navView(parts, h),
        h.div(
          [sx(h, local.column)],
          [
            ...parts.flatMap(({ content }) => content),
            ...closingView(report, h),
          ]
        ),
      ]
    ),
  ];
};

const pendingView = (
  slug: string,
  content: readonly Html[],
  h: HtmlBuilder<AppMessage>
): Html[] => [h.h1([sx(h, local.title)], [`Report for ${slug}`]), ...content];

const newScanLink = (
  url: string,
  label: string,
  h: HtmlBuilder<AppMessage>
): Html =>
  h.p([], [h.a([h.Href(checkRouter({ url })), sx(h, local.link)], [label])]);

export const reportView = (
  model: AppModel,
  slug: string,
  h: HtmlBuilder<AppMessage>
): Html =>
  h.main(
    [h.Id(MAIN_ID), sx(h, local.main)],
    ScanState.match<Html[]>(model.scan, {
      Idle: () => pendingView(slug, [], h),
      Loading: () =>
        pendingView(
          slug,
          [statusMessage(h, "progress", "loading the report…")],
          h
        ),
      Running: ({ view }) =>
        pendingView(
          slug,
          [
            statusMessage(
              h,
              "progress",
              view.stage === "queued"
                ? "the scan is queued…"
                : "fetching and checking the page…"
            ),
          ],
          h
        ),
      Settled: ({ view }) =>
        view.report === null
          ? pendingView(
              slug,
              [
                statusMessage(h, "error", view.failure ?? "the scan failed."),
                newScanLink(view.url, "Start a new scan", h),
              ],
              h
            )
          : [
              ...publishedView(model, view.report, slug, h),
              ...(CONTACT_SHOWN
                ? [
                    contactView(
                      model,
                      Option.some(
                        view.report.finalUrl ?? view.report.requestedUrl
                      ),
                      h
                    ),
                  ]
                : []),
            ],
      Unavailable: () =>
        pendingView(
          slug,
          [
            statusMessage(
              h,
              "error",
              "the report could not be loaded. Try again in a few minutes."
            ),
            newScanLink(slug, "Start a new scan", h),
          ],
          h
        ),
      Unknown: () =>
        pendingView(
          slug,
          [
            h.p([], [`There is no scan of ${slug} yet.`]),
            newScanLink(slug, "Start one", h),
          ],
          h
        ),
    })
  );
