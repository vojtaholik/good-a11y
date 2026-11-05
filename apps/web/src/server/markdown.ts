import { formatLocalCheck } from "@good-a11y/core";
import {
  TEST_METHOD_NAMES,
  verifiedText,
  CONTACT_SHOWN,
} from "@good-a11y/core/contracts";
import type { Report, ScanView } from "@good-a11y/core/contracts";
import { guidesForCheck } from "@good-a11y/guides/check-guides";
import { GUIDES } from "@good-a11y/guides/data";
import { flowForCheck } from "@good-a11y/guides/flow-for-check";
import type { Guide } from "@good-a11y/guides/guide";
import { scenarioForCheck } from "@good-a11y/guides/scenario-for-check";
import { makeGuideIndex } from "@good-a11y/guides/search";
import { Array, Option } from "effect";

import { CLI, SKILL_PATH, agentPrompt } from "../features/agent-links.js";
import { CHECK_TABLE, checkTableSummary } from "../features/check-table.js";
import { LOCAL_CHECK } from "../features/check-view.js";
import {
  RETRIEVE,
  demoPath,
  guideMarkdownPath,
} from "../features/guide-view.js";
import { categoryName, guidesByCategory } from "../features/guides.js";
import { ABOUT, Blocks, ISSUES_URL, PRIVACY } from "../features/info-pages.js";
import type { InfoPage } from "../features/info-pages.js";
import {
  CHECK_DESCRIPTION,
  pageMetaOf,
  SITE_NAME,
} from "../features/page-meta.js";
import {
  AppRoute,
  aboutRouter,
  guideRouter,
  privacyRouter,
} from "../features/route.js";
import type { AppRouteState } from "../features/route.js";

const FRONTMATTER = /^---\n[\s\S]*?\n---\n+/u;

export const guideOf = (id: string): Option.Option<Guide> =>
  Array.findFirst(GUIDES, (guide) => guide.id === id);

const guideLines = (origin: string): string[] =>
  guidesByCategory().flatMap(([category, pages]) => [
    `### ${categoryName(category)}`,
    "",
    ...pages.map(
      (page) =>
        `- [${page.name}](${origin}${guideRouter({ guideId: page.id })}): ${page.description}`
    ),
    "",
  ]);

const homeMarkdown = (origin: string): string[] => [
  `For AI agents: ${agentPrompt(origin)}`,
  "",
  `# ${SITE_NAME}`,
  "",
  pageMetaOf(AppRoute.Home()).description,
  "",
  "## For agents",
  "",
  `Run every command as \`${CLI} <command>\`: \`search "<2-5 words>"\`, \`retrieve <id>\`, \`check <url>\` (localhost included), \`list\`.`,
  "",
  `- [The good-a11y skill](${origin}${SKILL_PATH}): when to use it and the search, retrieve, build and check loop.`,
  `- [llms.txt](${origin}/llms.txt)`,
  `- [Check a page](${origin}/check)`,
  "",
  "## Guides",
  "",
  ...guideLines(origin),
];

const criteriaLines = (guide: Guide): string[] => {
  const verified = Array.filter(
    guide.criteria.map(verifiedText),
    (text) => text !== null
  );

  return verified.length === 0
    ? []
    : [
        "## WCAG success criteria",
        "",
        ...verified.map(({ source, text }) => `- [${text}](${source})`),
        "",
      ];
};

export const guideMarkdown = (guide: Guide, origin: string): string[] => [
  guide.text.replace(FRONTMATTER, "").trimEnd(),
  "",
  ...criteriaLines(guide),
  "## Demo",
  "",
  `A working reference: ${origin}${demoPath(guide.id)}`,
  "",
  `Retrieve this guide: \`${RETRIEVE} ${guide.id}\``,
  "",
  ...flowForCheck(guide),
  ...scenarioForCheck(guide),
];

const checkSummaryLines = (): string[] => {
  const { columns, lead, newer, statement } = checkTableSummary(CHECK_TABLE);

  return [
    lead,
    "",
    ...columns.map((line) => `- ${line}`),
    "",
    newer,
    "",
    statement,
  ];
};

const checkMarkdown = (origin: string): string[] => [
  "# Check a page",
  "",
  CHECK_DESCRIPTION,
  "",
  `Check a page on your own machine, localhost included: \`${LOCAL_CHECK}\`. It runs the same checks in your own Chrome and prints the issues worst first, each with the guide that fixes it.`,
  "",
  "## What we check",
  "",
  ...checkSummaryLines(),
  "",
  ...CHECK_TABLE.flatMap(({ coverage, guides, local }) => [
    `### ${coverage.criterion.text}`,
    "",
    ...(coverage.tests.length === 0
      ? [`- Online check: not automated. ${coverage.note ?? ""}`.trim()]
      : coverage.tests.map(
          ({ method, titles }) =>
            `- Online check, ${TEST_METHOD_NAMES[method]}: ${titles.join("; ")}`
        )),
    `- Local check: ${local.length === 0 ? "nothing more than online." : `${local.join("; ")}.`}`,
    `- Guide: ${guides.length === 0 ? "no guide yet." : guides.map((guide) => `[${guide.name}](${origin}${guideMarkdownPath(guide.id)})`).join(", ")}`,
    "",
  ]),
];

export const reportText = (report: Report, origin: string): string =>
  formatLocalCheck(
    { flows: null, questions: [], renderProblem: null, report, tasks: null },
    { guideUrl: (id) => `${origin}/${id}.md`, guidesFor: guidesForCheck }
  );

const reportMarkdown = (
  origin: string,
  slug: string,
  maybeScan: Option.Option<ScanView>
): string[] =>
  Option.match(maybeScan, {
    onNone: () => [
      `# No report for ${slug}`,
      "",
      `No scan of ${slug} is stored. Start one at /check, or run \`${CLI} check ${slug}\`.`,
    ],
    onSome: (scan) =>
      scan.report === null
        ? [
            `# Report for ${slug}`,
            "",
            scan.failure ??
              `The scan is ${scan.stage}. Ask again in a few seconds.`,
          ]
        : [reportText(scan.report, origin)],
  });

const infoMarkdown = (page: InfoPage): string[] => [
  `# ${page.title}`,
  "",
  page.lead,
  ...page.sections.flatMap((section) => [
    "",
    `## ${section.heading}`,
    ...section.blocks.flatMap((block) => [
      "",
      Blocks.$match(block, {
        Link: ({ before, href, label }) => `${before} [${label}](${href}).`,
        List: ({ items }) => items.map((item) => `- ${item}`).join("\n"),
        Table: ({ head, rows }) =>
          [
            `| ${head.join(" | ")} |`,
            `| ${head.map(() => "---").join(" | ")} |`,
            ...rows.map((row) => `| ${row.join(" | ")} |`),
          ].join("\n"),
        Text: ({ text }) => text,
      }),
    ]),
  ]),
];

const notFoundMarkdown = (): string[] => [
  "# Page not found",
  "",
  "See /llms.txt for the pages on this site.",
];

export const pageMarkdown = (
  route: AppRouteState,
  origin: string,
  maybeScan: Option.Option<ScanView>
): string =>
  AppRoute.match<string[]>(route, {
    About: () => infoMarkdown(ABOUT),
    Check: () => checkMarkdown(origin),
    Contact: () =>
      CONTACT_SHOWN
        ? [
            "# Contact",
            "",
            `Questions about a guide or a report. For bugs, open an issue: ${ISSUES_URL}`,
          ]
        : notFoundMarkdown(),
    Guide: ({ guideId }) =>
      Option.match(guideOf(guideId), {
        onNone: notFoundMarkdown,
        onSome: (guide) => guideMarkdown(guide, origin),
      }),
    Home: () => homeMarkdown(origin),
    NotFound: notFoundMarkdown,
    Privacy: () => infoMarkdown(PRIVACY),
    Report: ({ slug }) => reportMarkdown(origin, slug, maybeScan),
    Scan: ({ slug }) => reportMarkdown(origin, slug, maybeScan),
  }).join("\n");

export const GUIDE_MARKDOWN_PATH = /^\/(?<id>[a-z\d-]+)\.md$/u;

export const SEARCH_PATH = "/search.md";

export const CHECK_PATH = "/check.md";

const searchIndex = makeGuideIndex(GUIDES);

export const searchMarkdown = (query: string, origin: string): string => {
  const hits = searchIndex.search(query).flatMap(({ id }) =>
    Option.match(guideOf(id), {
      onNone: () => [],
      onSome: (guide) => [
        `- [${guide.name}](${origin}${guideMarkdownPath(guide.id)}) \`${guide.id}\`: ${guide.description}`,
      ],
    })
  );

  return [
    `# Guides for "${query}"`,
    "",
    ...(hits.length === 0
      ? [
          `No guide matches. Try other words, or read the list of every guide: ${origin}/llms.txt`,
        ]
      : [
          "Best match first. Read a guide before you build, and follow every DO and DO NOT.",
          "",
          ...hits,
        ]),
    "",
  ].join("\n");
};

export const SEARCH_USAGE = (origin: string): string =>
  [
    "# Search the guides",
    "",
    `Add the task in 2 to 5 words: ${origin}${SEARCH_PATH}?q=modal+dialog+focus`,
    "",
  ].join("\n");

export const llmsTxt = (origin: string): string =>
  [
    `# ${SITE_NAME}`,
    "",
    `> ${pageMetaOf(AppRoute.Home()).description}`,
    "",
    `Every page is also served as Markdown: send \`Accept: text/markdown\`, or add \`.md\` to a guide's address. Agents run the guides and the checker locally with \`${CLI}\`.`,
    "",
    "## When to use",
    "",
    "Use good-a11y before you write or change UI: forms and validation, dialogs and popovers, menus, tabs, accordions, comboboxes, custom selects, navigation and skip links, route changes in single-page apps, toasts and status messages, icon buttons, focus styles, motion and images, in any framework.",
    "",
    `1. \`${CLI} search "<2-5 words>"\` finds the guide for the task, for example \`search "modal dialog focus"\`.`,
    `2. \`${CLI} retrieve <id>\` prints it. Follow every DO and DO NOT while you build.`,
    `3. \`${CLI} check <url>\` checks your running page, localhost included, in your own Chrome. Fix each issue with the guide it names, then check again.`,
    "",
    "Do not use it for backend code, build configuration, or copy edits that add no markup.",
    "",
    "For styling, layout and modern CSS technique, use [good-css](https://good-css.com/llms.txt), the sibling site.",
    "",
    "## Agents",
    "",
    `- [good-a11y skill](${origin}${SKILL_PATH}): triggers and the search, retrieve, build and check loop`,
    `- [Search the guides](${origin}${SEARCH_PATH}?q=modal+dialog+focus): the best guides for a task in 2 to 5 words, as Markdown`,
    `- [Check a public page](${origin}${CHECK_PATH}?url=example.com): starts a scan, or reuses one from the last hour, and answers the report as Markdown. While it runs, fetch the same address again after the seconds in Retry-After`,
    `- [Check a page](${origin}/check): what the checker tests, per WCAG success criterion`,
    `- [About](${origin}${aboutRouter()}): who makes good-a11y and how the guides are tested`,
    `- [Privacy](${origin}${privacyRouter()}): what the checker stores and for how long`,
    "",
    "## Guides",
    "",
    ...GUIDES.map(
      (guide) =>
        `- [${guide.name}](${origin}${guideRouter({ guideId: guide.id })}): ${guide.description}`
    ),
    "",
  ].join("\n");

export const sitemapXml = (origin: string): string =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...[
      "/",
      "/check",
      aboutRouter(),
      privacyRouter(),
      ...GUIDES.map((guide) => guideRouter({ guideId: guide.id })),
    ].map((path) => `  <url><loc>${origin}${path}</loc></url>`),
    "</urlset>",
    "",
  ].join("\n");

export const robotsTxt = (origin: string): string =>
  ["User-agent: *", "Allow: /", "", `Sitemap: ${origin}/sitemap.xml`, ""].join(
    "\n"
  );
