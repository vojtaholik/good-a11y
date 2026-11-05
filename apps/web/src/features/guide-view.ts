import { viewBlocks } from "@foldkit/markdown";
import type {
  Block,
  CodeBlock,
  MarkdownDocument,
  Views,
} from "@foldkit/markdown";
import { verifiedText } from "@good-a11y/core/contracts";
import * as stylex from "@stylexjs/stylex";
import { Array, Option, Predicate, Schema } from "effect";
import type { Html, HtmlBuilder } from "foldkit/html";

import { Message } from "../client/message.js";
import type { AppMessage } from "../client/message.js";
import { CopyState } from "../client/model.js";
import type { AppModel } from "../client/model.js";
import { CLI } from "./agent-links.js";
import { commandBlock } from "./command-block.js";
import { categoryId, categoryName } from "./guides.js";
import type { GuidePage } from "./guides.js";
import { checkIcon, crossIcon } from "./icons.js";
import { MAIN_ID } from "./landmarks.js";
import { item, uniqueIds } from "./outline.js";
import type { OutlineItem, PageLayout } from "./outline.js";
import { homeRouter } from "./route.js";
import { sx } from "./sx.js";
import { colors, font, layout, radius } from "./tokens.stylex.js";

export const RETRIEVE = `${CLI} retrieve`;

export const demoPath = (id: string): string => `/${id}/demo.html`;

export const guideMarkdownPath = (id: string): string => `/${id}.md`;

const DEMO_HEADING_ID = "live-demo";

const AGENTS_HEADING_ID = "for-agents";

const LANGUAGES = new Map([
  ["css", "CSS"],
  ["html", "HTML"],
  ["js", "JavaScript"],
  ["jsx", "JSX"],
  ["sh", "Shell"],
  ["ts", "TypeScript"],
  ["tsx", "TSX"],
  ["vue", "Vue"],
]);

const guide = stylex.create({
  agentNote: {
    color: colors["--ink-muted"],
    fontSize: "0.875rem",
    margin: 0,
  },
  article: {
    display: "flex",
    flexBasis: "600px",
    flexDirection: "column",
    flexGrow: 1,
    fontSize: "1.125rem",
    gap: "18px",
    lineHeight: 1.7,
    maxInlineSize: "70ch",
    minInlineSize: 0,
  },
  aside: {
    display: "flex",
    flexBasis: "340px",
    flexDirection: "column",
    flexGrow: 1,
    gap: "32px",
    minInlineSize: 0,
  },
  asideHeading: {
    fontSize: "1.25rem",
    fontWeight: 800,
    lineHeight: 1.3,
    margin: 0,
  },
  asideSection: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  body: {
    alignItems: "flex-start",
    display: "flex",
    flexWrap: "wrap",
    gap: "48px clamp(40px, 5cqi, 72px)",
  },
  breadcrumb: {
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.9375rem",
    gap: "4px 8px",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  breadcrumbLink: {
    color: colors["--accent"],
    textUnderlineOffset: "3px",
  },
  chip: {
    backgroundColor: colors["--accent-soft"],
    borderRadius: radius["--radius-sm"],
    fontFamily: font["--font-code"],
    fontSize: "0.875rem",
    paddingBlock: "4px",
    paddingInline: "10px",
  },
  chipLink: {
    color: colors["--accent"],
    textUnderlineOffset: "3px",
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  codeButton: {
    backgroundColor: colors["--surface"],
    borderColor: colors["--control"],
    borderRadius: "6px",
    borderStyle: "solid",
    borderWidth: "1px",
    color: colors["--ink"],
    cursor: "pointer",
    font: "inherit",
    fontWeight: 600,
    minBlockSize: "36px",
    minInlineSize: "44px",
    paddingInline: "12px",
  },
  codeCaption: {
    alignItems: "center",
    backgroundColor: colors["--sunken"],
    borderBlockEndColor: colors["--line"],
    borderBlockEndStyle: "solid",
    borderBlockEndWidth: "1px",
    display: "flex",
    fontSize: "0.875rem",
    fontWeight: 600,
    justifyContent: "space-between",
    paddingBlock: "4px",
    paddingInline: "14px 4px",
  },
  codeFigure: {
    backgroundColor: colors["--surface"],
    borderColor: colors["--control"],
    borderRadius: radius["--radius-md"],
    borderStyle: "solid",
    borderWidth: "1px",
    margin: 0,
    overflow: "clip",
  },
  codePre: {
    backgroundColor: colors["--surface"],
    color: colors["--ink"],
    fontFamily: font["--font-code"],
    fontSize: "0.9375rem",
    lineHeight: 1.6,
    margin: 0,
    overflowX: "auto",
    paddingBlock: "16px",
    paddingInline: "18px",
  },
  crumbMark: {
    color: colors["--ink-muted"],
    marginInlineEnd: "8px",
  },
  demo: {
    backgroundColor: colors["--surface"],
    borderColor: colors["--control"],
    borderRadius: radius["--radius-md"],
    borderStyle: "solid",
    borderWidth: "1px",
    overflow: "clip",
  },
  demoCaption: {
    borderBlockStartColor: colors["--line"],
    borderBlockStartStyle: "solid",
    borderBlockStartWidth: "1px",
    color: colors["--ink-muted"],
    fontSize: "0.875rem",
    margin: 0,
    paddingBlock: "10px",
    paddingInline: "16px",
  },
  demoFrame: {
    blockSize: "28rem",
    borderStyle: "none",
    display: "block",
    inlineSize: "100%",
    resize: "vertical",
  },
  demoHead: {
    alignItems: "center",
    backgroundColor: colors["--sunken"],
    borderBlockEndColor: colors["--line"],
    borderBlockEndStyle: "solid",
    borderBlockEndWidth: "1px",
    display: "flex",
    flexWrap: "wrap",
    gap: "4px 16px",
    justifyContent: "space-between",
    paddingInline: "16px 8px",
  },
  demoLink: {
    alignItems: "center",
    color: colors["--accent"],
    display: "inline-flex",
    fontSize: "0.9375rem",
    fontWeight: 600,
    minBlockSize: layout["--target"],
    paddingInline: "8px",
    textUnderlineOffset: "3px",
  },
  demoTitle: {
    fontSize: "1rem",
    fontWeight: 800,
    margin: 0,
  },
  do: {
    backgroundColor: colors["--ok-soft"],
    borderColor: colors["--ok"],
  },
  doHeading: {
    color: colors["--ok"],
  },
  doNot: {
    backgroundColor: colors["--issue-soft"],
    borderColor: colors["--issue"],
  },
  doNotHeading: {
    color: colors["--issue"],
  },
  intro: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxInlineSize: "72ch",
  },
  lead: {
    color: colors["--ink-muted"],
    fontSize: "clamp(1.125rem, 0.4cqi + 1rem, 1.3125rem)",
    lineHeight: 1.5,
    margin: 0,
  },
  main: {
    boxSizing: "content-box",
    display: "flex",
    flexDirection: "column",
    gap: "clamp(28px, 3cqi, 48px)",
    marginInline: "auto",
    maxInlineSize: "1280px",
    paddingBlock: "0 clamp(48px, 6cqi, 96px)",
  },
  railTitle: {
    color: colors["--ink-muted"],
    fontFamily: font["--font-code"],
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.06em",
    margin: 0,
    textTransform: "uppercase",
  },
  rule: {
    borderRadius: radius["--radius-md"],
    borderStyle: "solid",
    borderWidth: "1px",
    flexBasis: "280px",
    flexGrow: 1,
    fontSize: "1.0625rem",
    lineHeight: 1.55,
    minInlineSize: 0,
    paddingBlock: "18px",
    paddingInline: "20px",
  },
  ruleHeading: {
    alignItems: "center",
    display: "flex",
    fontSize: "1.125rem",
    fontWeight: 800,
    gap: "8px",
    margin: "0 0 10px",
  },
  rules: {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
  },
  tableWrap: {
    overflowX: "auto",
  },
  title: {
    fontSize: "clamp(2.25rem, 2.4cqi + 1.5rem, 3.5rem)",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    lineHeight: 1.08,
    margin: 0,
  },
});

type Section = Readonly<{
  blocks: readonly Block[];
  heading: string;
}>;

const isHeading = Predicate.isTagged("Heading");

const isText = Predicate.isTagged("Text");

const isHeadingAt = (block: Block, level: number): boolean =>
  isHeading(block) && block.level === level;

const headingText = (block: Block): string =>
  isHeading(block)
    ? block.content
        .map((inline) => (isText(inline) ? inline.value : ""))
        .join("")
        .trim()
    : "";

const sectionsOf = (blocks: readonly Block[]): readonly Section[] => {
  const sections: { blocks: Block[]; heading: string }[] = [];

  for (const block of blocks) {
    const last = sections.at(-1);

    if (isHeadingAt(block, 2) || last === undefined) {
      sections.push({ blocks: [block], heading: headingText(block) });
    } else {
      last.blocks.push(block);
    }
  }

  return sections;
};

const contentBlocks = (page: GuidePage): readonly Block[] =>
  page.document.blocks.filter((block) => !isHeadingAt(block, 1));

const outlineHeadings = (page: GuidePage): readonly Block[] =>
  contentBlocks(page).filter(
    (block) => isHeadingAt(block, 2) || isHeadingAt(block, 3)
  );

const headingIdsOf = (page: GuidePage): ReadonlyMap<Block, string> => {
  const headings = outlineHeadings(page);
  const ids = uniqueIds(headings.map(headingText));

  return new Map(headings.map((block, index) => [block, ids[index] ?? ""]));
};

export const guideOutline = (page: GuidePage): readonly OutlineItem[] => {
  const ids = headingIdsOf(page);

  return [
    ...outlineHeadings(page).map((block) =>
      item(
        ids.get(block) ?? "",
        headingText(block),
        isHeadingAt(block, 3) ? 3 : 2
      )
    ),
    item(DEMO_HEADING_ID, "Live demo"),
    item(AGENTS_HEADING_ID, "For agents"),
  ];
};

const isCopied = (model: AppModel, text: string): boolean =>
  Schema.is(CopyState.Copied)(model.copy) && model.copy.key === text;

const codeBlockView =
  (model: AppModel, h: HtmlBuilder<AppMessage>) =>
  (code: CodeBlock): Html => {
    const language = Option.match(code.maybeLanguage, {
      onNone: () => "Code",
      onSome: (name) => LANGUAGES.get(name) ?? name.toUpperCase(),
    });

    return h.figure(
      [sx(h, guide.codeFigure)],
      [
        h.figcaption(
          [sx(h, guide.codeCaption)],
          [
            language,
            h.button(
              [
                h.Type("button"),
                h.AriaLabel(
                  isCopied(model, code.value)
                    ? `${language} code copied`
                    : `Copy the ${language} code`
                ),
                h.OnClick(Message.ClickedCopyText({ text: code.value })),
                sx(h, guide.codeButton),
              ],
              [isCopied(model, code.value) ? "Copied" : "Copy"]
            ),
          ]
        ),
        h.pre(
          [h.Tabindex(0), sx(h, guide.codePre)],
          [h.code([], [code.value])]
        ),
      ]
    );
  };

const viewsFor = (
  model: AppModel,
  ids: ReadonlyMap<Block, string>,
  h: HtmlBuilder<AppMessage>
): Partial<Views> => ({
  CodeBlock: codeBlockView(model, h),
  Heading: (heading, content) => {
    const id = ids.get(heading);
    const attributes = id === undefined ? [] : [h.Id(id)];

    if (heading.level === 2) {
      return h.h2(attributes, [...content]);
    }

    return heading.level === 3
      ? h.h3(attributes, [...content])
      : h.h4(attributes, [...content]);
  },
  Table: (_table, headerRow, bodyRows) =>
    h.div(
      [sx(h, guide.tableWrap)],
      [h.table([], [h.thead([], [headerRow]), h.tbody([], [...bodyRows])])]
    ),
});

const blocksView = (
  blocks: readonly Block[],
  model: AppModel,
  ids: ReadonlyMap<Block, string>,
  h: HtmlBuilder<AppMessage>
): readonly Html[] =>
  viewBlocks({ blocks } satisfies MarkdownDocument, {
    views: viewsFor(model, ids, h),
  });

const ruleView = (
  section: Section,
  isDo: boolean,
  model: AppModel,
  ids: ReadonlyMap<Block, string>,
  h: HtmlBuilder<AppMessage>
): Html => {
  const [heading] = section.blocks;
  const id = heading === undefined ? undefined : ids.get(heading);

  return h.section(
    [sx(h, guide.rule, isDo ? guide.do : guide.doNot)],
    [
      h.h2(
        [
          ...(id === undefined ? [] : [h.Id(id)]),
          sx(h, guide.ruleHeading, isDo ? guide.doHeading : guide.doNotHeading),
        ],
        [isDo ? checkIcon(h, 20) : crossIcon(h, 20), section.heading]
      ),
      ...blocksView(section.blocks.slice(1), model, ids, h),
    ]
  );
};

const articleView = (
  page: GuidePage,
  model: AppModel,
  h: HtmlBuilder<AppMessage>
): Html => {
  const sections = sectionsOf(contentBlocks(page));
  const ids = headingIdsOf(page);

  const maybeDo = Array.findFirst(sections, (s) => s.heading === "DO");
  const maybeDoNot = Array.findFirst(sections, (s) => s.heading === "DO NOT");

  const rules = h.div(
    [sx(h, guide.rules)],
    [
      ...Option.toArray(maybeDo).map((s) => ruleView(s, true, model, ids, h)),
      ...Option.toArray(maybeDoNot).map((s) =>
        ruleView(s, false, model, ids, h)
      ),
    ]
  );

  const firstRule = sections.findIndex(
    (s) => s.heading === "DO" || s.heading === "DO NOT"
  );

  return h.article(
    [h.DataAttribute("prose", ""), sx(h, guide.article)],
    sections.flatMap((section, index) => {
      if (section.heading === "DO" || section.heading === "DO NOT") {
        return index === firstRule ? [rules] : [];
      }

      return blocksView(section.blocks, model, ids, h);
    })
  );
};

const criteriaRail = (page: GuidePage, h: HtmlBuilder<AppMessage>): Html[] => {
  const verified = Array.filter(
    page.criteria.map(verifiedText),
    (text) => text !== null
  );

  return verified.length === 0
    ? []
    : [
        h.div(
          [sx(h, guide.asideSection)],
          [
            h.p(
              [h.Id(`criteria-${page.id}`), sx(h, guide.railTitle)],
              ["WCAG success criteria"]
            ),
            h.ul(
              [h.AriaLabelledBy(`criteria-${page.id}`), sx(h, guide.chips)],
              verified.map(({ source, text }) =>
                h.li(
                  [sx(h, guide.chip)],
                  [h.a([h.Href(source), sx(h, guide.chipLink)], [text])]
                )
              )
            ),
          ]
        ),
      ];
};

const demoRail = (page: GuidePage, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [sx(h, guide.asideSection)],
    [
      h.p([sx(h, guide.railTitle)], ["Demo"]),
      h.a(
        [h.Href(demoPath(page.id)), sx(h, guide.demoLink)],
        ["Open the demo page"]
      ),
    ]
  );

const demoView = (page: GuidePage, h: HtmlBuilder<AppMessage>): Html =>
  h.section(
    [h.AriaLabelledBy(DEMO_HEADING_ID), sx(h, guide.demo)],
    [
      h.div(
        [sx(h, guide.demoHead)],
        [
          h.h2([h.Id(DEMO_HEADING_ID), sx(h, guide.demoTitle)], ["Live demo"]),
          h.a(
            [h.Href(demoPath(page.id)), sx(h, guide.demoLink)],
            ["Open the demo"]
          ),
        ]
      ),
      h.iframe([
        h.Src(demoPath(page.id)),
        h.Title(`${page.name} demo`),
        h.Sandbox("allow-scripts allow-forms"),
        h.Loading("lazy"),
        sx(h, guide.demoFrame),
      ]),
      h.p(
        [sx(h, guide.demoCaption)],
        [
          "The guide's own demo page in a sandboxed frame. Works with mouse and keyboard.",
        ]
      ),
    ]
  );

const agentsView = (
  page: GuidePage,
  model: AppModel,
  h: HtmlBuilder<AppMessage>
): Html =>
  h.section(
    [h.AriaLabelledBy(AGENTS_HEADING_ID), sx(h, guide.asideSection)],
    [
      h.h2(
        [h.Id(AGENTS_HEADING_ID), sx(h, guide.asideHeading)],
        ["For agents"]
      ),
      commandBlock(model, `${RETRIEVE} ${page.id}`, "compact", h),
      h.p(
        [sx(h, guide.agentNote)],
        [
          "This guide as Markdown: ",
          h.a(
            [h.Href(guideMarkdownPath(page.id)), sx(h, guide.breadcrumbLink)],
            [h.code([], [guideMarkdownPath(page.id)])]
          ),
        ]
      ),
    ]
  );

const breadcrumbView = (page: GuidePage, h: HtmlBuilder<AppMessage>): Html =>
  h.nav(
    [h.AriaLabel("Breadcrumb")],
    [
      h.ol(
        [sx(h, guide.breadcrumb)],
        [
          h.li(
            [],
            [
              h.a(
                [h.Href(`${homeRouter()}#guides`), sx(h, guide.breadcrumbLink)],
                ["Guides"]
              ),
            ]
          ),
          h.li(
            [],
            [
              h.span([h.AriaHidden(true), sx(h, guide.crumbMark)], ["/"]),
              h.a(
                [
                  h.Href(`${homeRouter()}#${categoryId(page.category)}`),
                  sx(h, guide.breadcrumbLink),
                ],
                [categoryName(page.category)]
              ),
            ]
          ),
          h.li(
            [],
            [
              h.span([h.AriaHidden(true), sx(h, guide.crumbMark)], ["/"]),
              h.span([h.AriaCurrent("page")], [page.name]),
            ]
          ),
        ]
      ),
    ]
  );

const guideMain = (
  page: GuidePage,
  model: AppModel,
  h: HtmlBuilder<AppMessage>
): Html =>
  h.main(
    [h.Id(MAIN_ID), sx(h, guide.main)],
    [
      h.div(
        [sx(h, guide.intro)],
        [
          breadcrumbView(page, h),
          h.h1([sx(h, guide.title)], [page.name]),
          h.p([sx(h, guide.lead)], [page.description.replace(/\.?$/u, ".")]),
        ]
      ),
      articleView(page, model, h),
      demoView(page, h),
      agentsView(page, model, h),
    ]
  );

export const guideView = (
  page: GuidePage,
  model: AppModel,
  h: HtmlBuilder<AppMessage>
): PageLayout => ({
  index: null,
  main: guideMain(page, model, h),
  outline: guideOutline(page),
  railExtra: [...criteriaRail(page, h), demoRail(page, h)],
});
