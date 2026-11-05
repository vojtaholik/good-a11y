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
import { categoryName } from "./guides.js";
import type { GuidePage } from "./guides.js";
import { checkIcon, crossIcon } from "./icons.js";
import { MAIN_ID } from "./landmarks.js";
import { homeRouter } from "./route.js";
import { sx } from "./sx.js";
import { colors, font, layout, radius } from "./tokens.stylex.js";

export const RETRIEVE = `${CLI} retrieve`;

export const demoPath = (id: string): string => `/${id}/demo.html`;

export const referencePath = (id: string): string =>
  `/skills/good-a11y/references/${id}.md`;

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
    fontSize: "0.9375rem",
    margin: 0,
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
    paddingBlock: "clamp(32px, 4cqi, 64px) clamp(48px, 6cqi, 96px)",
    paddingInline: layout["--gutter"],
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
  h: HtmlBuilder<AppMessage>
): Partial<Views> => ({
  CodeBlock: codeBlockView(model, h),
  Table: (_table, headerRow, bodyRows) =>
    h.div(
      [sx(h, guide.tableWrap)],
      [h.table([], [h.thead([], [headerRow]), h.tbody([], [...bodyRows])])]
    ),
});

const blocksView = (
  blocks: readonly Block[],
  model: AppModel,
  h: HtmlBuilder<AppMessage>
): readonly Html[] =>
  viewBlocks({ blocks } satisfies MarkdownDocument, {
    views: viewsFor(model, h),
  });

const ruleView = (
  section: Section,
  isDo: boolean,
  model: AppModel,
  h: HtmlBuilder<AppMessage>
): Html =>
  h.section(
    [sx(h, guide.rule, isDo ? guide.do : guide.doNot)],
    [
      h.h2(
        [sx(h, guide.ruleHeading, isDo ? guide.doHeading : guide.doNotHeading)],
        [isDo ? checkIcon(h, 20) : crossIcon(h, 20), section.heading]
      ),
      ...blocksView(section.blocks.slice(1), model, h),
    ]
  );

const articleView = (
  page: GuidePage,
  model: AppModel,
  h: HtmlBuilder<AppMessage>
): Html => {
  const sections = sectionsOf(
    page.document.blocks.filter((block) => !isHeadingAt(block, 1))
  );

  const maybeDo = Array.findFirst(sections, (s) => s.heading === "DO");
  const maybeDoNot = Array.findFirst(sections, (s) => s.heading === "DO NOT");

  const rules = h.div(
    [sx(h, guide.rules)],
    [
      ...Option.toArray(maybeDo).map((s) => ruleView(s, true, model, h)),
      ...Option.toArray(maybeDoNot).map((s) => ruleView(s, false, model, h)),
    ]
  );

  return h.article(
    [h.DataAttribute("prose", ""), sx(h, guide.article)],
    sections.flatMap((section) => {
      if (section.heading === "DO NOT") {
        return [];
      }

      if (section.heading === "DO") {
        return [rules];
      }

      return blocksView(section.blocks, model, h);
    })
  );
};

const criteriaView = (page: GuidePage, h: HtmlBuilder<AppMessage>): Html[] => {
  const verified = Array.filter(
    page.criteria.map(verifiedText),
    (text) => text !== null
  );

  return verified.length === 0
    ? []
    : [
        h.section(
          [h.AriaLabelledBy("criteria-heading"), sx(h, guide.asideSection)],
          [
            h.h2(
              [h.Id("criteria-heading"), sx(h, guide.asideHeading)],
              ["WCAG success criteria"]
            ),
            h.ul(
              [sx(h, guide.chips)],
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

const asideView = (
  page: GuidePage,
  model: AppModel,
  h: HtmlBuilder<AppMessage>
): Html =>
  h.aside(
    [h.AriaLabel("Demo and references"), sx(h, guide.aside)],
    [
      h.section(
        [h.AriaLabelledBy("demo-heading"), sx(h, guide.demo)],
        [
          h.div(
            [sx(h, guide.demoHead)],
            [
              h.h2(
                [h.Id("demo-heading"), sx(h, guide.demoTitle)],
                ["Live demo"]
              ),
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
      ),
      ...criteriaView(page, h),
      h.section(
        [h.AriaLabelledBy("agents-heading"), sx(h, guide.asideSection)],
        [
          h.h2(
            [h.Id("agents-heading"), sx(h, guide.asideHeading)],
            ["For agents"]
          ),
          commandBlock(model, `${RETRIEVE} ${page.id}`, "compact", h),
          h.p(
            [sx(h, guide.agentNote)],
            [
              "This guide as Markdown: ",
              h.a(
                [h.Href(referencePath(page.id)), sx(h, guide.breadcrumbLink)],
                [h.code([], [referencePath(page.id)])]
              ),
            ]
          ),
        ]
      ),
    ]
  );

export const guideView = (
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
          h.nav(
            [h.AriaLabel("Breadcrumb")],
            [
              h.p(
                [sx(h, guide.breadcrumb)],
                [
                  h.a(
                    [
                      h.Href(`${homeRouter()}#guides`),
                      sx(h, guide.breadcrumbLink),
                    ],
                    ["Guides"]
                  ),
                  " ",
                  h.span([h.AriaHidden(true)], ["/"]),
                  " ",
                  categoryName(page.category),
                ]
              ),
            ]
          ),
          h.h1([sx(h, guide.title)], [page.name]),
          h.p([sx(h, guide.lead)], [page.description.replace(/\.?$/u, ".")]),
        ]
      ),
      h.div(
        [sx(h, guide.body)],
        [articleView(page, model, h), asideView(page, model, h)]
      ),
    ]
  );
