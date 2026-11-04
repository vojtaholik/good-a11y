import * as stylex from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../client/message.js";
import type { AppModel } from "../client/model.js";
import { AGENT_COMMAND, SKILL_PATH } from "./agent-links.js";
import { commandBlock } from "./command-block.js";
import { categoryName, guidesByCategory } from "./guides.js";
import { MAIN_ID } from "./landmarks.js";
import { guideRouter } from "./route.js";
import { scanForm } from "./scan-form.js";
import { LLMS_PATH } from "./shell.js";
import { sx } from "./sx.js";
import { colors, font, layout, radius } from "./tokens.stylex.js";

const SECTION_HEADING = "clamp(1.75rem, 1cqi + 1.375rem, 2.25rem)";

const home = stylex.create({
  agentLink: {
    alignItems: "center",
    color: colors["--on-inverse"],
    display: "inline-flex",
    fontWeight: 600,
    minBlockSize: layout["--target"],
    textUnderlineOffset: "4px",
  },
  agentLinks: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px 20px",
    margin: 0,
  },
  agentNote: {
    alignItems: "center",
    color: colors["--on-inverse-muted"],
    display: "inline-flex",
  },
  agents: {
    backgroundColor: colors["--inverse"],
    color: colors["--on-inverse"],
  },
  agentsInner: {
    alignItems: "center",
    boxSizing: "content-box",
    display: "flex",
    flexWrap: "wrap",
    gap: "24px 64px",
    marginInline: "auto",
    maxInlineSize: layout["--page"],
    paddingBlock: "clamp(40px, 5cqi, 72px)",
    paddingInline: layout["--gutter"],
  },
  agentsIntro: {
    color: colors["--on-inverse-muted"],
    margin: 0,
    maxInlineSize: "46ch",
  },
  agentsText: {
    display: "flex",
    flexBasis: "300px",
    flexDirection: "column",
    flexGrow: 1,
    gap: "12px",
    minInlineSize: 0,
  },
  agentsTool: {
    display: "flex",
    flexBasis: "560px",
    flexDirection: "column",
    flexGrow: 2,
    gap: "14px",
    minInlineSize: 0,
  },
  category: {
    borderBlockEndColor: colors["--line"],
    borderBlockEndStyle: "solid",
    borderBlockEndWidth: "1px",
    color: colors["--ink-muted"],
    fontSize: "0.875rem",
    fontWeight: 600,
    letterSpacing: "0.06em",
    margin: 0,
    paddingBlockEnd: "8px",
    textTransform: "uppercase",
  },
  categoryCount: {
    fontWeight: 400,
  },
  categoryGroup: {
    breakInside: "avoid",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    paddingBlockEnd: "40px",
  },
  checkCard: {
    backgroundColor: colors["--surface"],
    borderColor: colors["--line"],
    borderRadius: radius["--radius-lg"],
    borderStyle: "solid",
    borderWidth: "1px",
    display: "flex",
    flexBasis: "400px",
    flexDirection: "column",
    flexGrow: 1,
    gap: "10px",
    minInlineSize: 0,
    padding: "clamp(20px, 2cqi, 28px)",
  },
  checkHeading: {
    fontSize: "1.375rem",
    fontWeight: 800,
    lineHeight: 1.3,
    margin: 0,
  },
  guide: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  guideDescription: {
    color: colors["--ink-muted"],
    fontSize: "0.9375rem",
    lineHeight: 1.5,
    margin: 0,
  },
  guideLink: {
    alignSelf: "flex-start",
    color: colors["--accent"],
    fontSize: "1.125rem",
    fontWeight: 600,
    lineHeight: 1.35,
    textDecorationThickness: "1px",
    textUnderlineOffset: "4px",
  },
  guideList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  guides: {
    boxSizing: "content-box",
    display: "flex",
    flexDirection: "column",
    gap: "32px",
    marginInline: "auto",
    maxInlineSize: layout["--page"],
    paddingBlock: "clamp(48px, 6cqi, 88px)",
    paddingInline: layout["--gutter"],
  },
  guidesColumns: {
    columnGap: "56px",
    columns: "300px 3",
  },
  guidesCount: {
    color: colors["--ink-muted"],
    margin: 0,
  },
  guidesHead: {
    alignItems: "baseline",
    display: "flex",
    flexWrap: "wrap",
    gap: "8px 24px",
    justifyContent: "space-between",
  },
  hero: {
    alignItems: "flex-end",
    boxSizing: "content-box",
    display: "flex",
    flexWrap: "wrap",
    gap: "40px 64px",
    marginInline: "auto",
    maxInlineSize: layout["--page"],
    paddingBlock: "clamp(40px, 6cqi, 96px) clamp(40px, 5cqi, 72px)",
    paddingInline: layout["--gutter"],
  },
  heroText: {
    display: "flex",
    flexBasis: "520px",
    flexDirection: "column",
    flexGrow: 1,
    gap: "20px",
    minInlineSize: 0,
  },
  lead: {
    color: colors["--ink-muted"],
    fontSize: "clamp(1.125rem, 0.4cqi + 1rem, 1.3125rem)",
    lineHeight: 1.55,
    margin: 0,
    maxInlineSize: "56ch",
  },
  mono: {
    fontFamily: font["--font-code"],
    fontWeight: 400,
  },
  note: {
    color: colors["--ink-muted"],
    fontSize: "0.9375rem",
    margin: 0,
  },
  sectionHeading: {
    fontSize: SECTION_HEADING,
    fontWeight: 800,
    lineHeight: 1.15,
    margin: 0,
  },
  title: {
    fontSize: "clamp(2.25rem, 2.8cqi + 1.375rem, 3.75rem)",
    fontWeight: 800,
    letterSpacing: "-0.025em",
    lineHeight: 1.05,
    margin: 0,
    maxInlineSize: "14ch",
  },
});

const counted = (count: number, one: string, many: string): string =>
  `${count} ${count === 1 ? one : many}`;

const heroView = (model: AppModel, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [sx(h, home.hero)],
    [
      h.div(
        [sx(h, home.heroText)],
        [
          h.h1([sx(h, home.title)], ["Accessibility guides for coding agents"]),
          h.p(
            [sx(h, home.lead)],
            [
              "Your agent reads a short guide before it builds a UI pattern, so the first version already works with a keyboard and a screen reader. Each guide has a working demo. The checker opens one page in a browser and lists what it finds, worst first, with the WCAG criterion and the guide that fixes each issue.",
            ]
          ),
        ]
      ),
      h.section(
        [h.AriaLabelledBy("check-heading"), sx(h, home.checkCard)],
        [
          h.h2(
            [h.Id("check-heading"), sx(h, home.checkHeading)],
            ["Check one page"]
          ),
          scanForm(model, h),
          h.p([sx(h, home.note)], ["Takes 20 to 90 seconds."]),
        ]
      ),
    ]
  );

const agentsView = (model: AppModel, h: HtmlBuilder<AppMessage>): Html =>
  h.section(
    [h.AriaLabelledBy("agents-heading"), sx(h, home.agents)],
    [
      h.div(
        [sx(h, home.agentsInner)],
        [
          h.div(
            [sx(h, home.agentsText)],
            [
              h.h2(
                [h.Id("agents-heading"), sx(h, home.sectionHeading)],
                ["For agents"]
              ),
              h.p(
                [sx(h, home.agentsIntro)],
                [
                  "Give your agent this command. It searches the guides by pattern and reads the match as Markdown, before it writes the component.",
                ]
              ),
            ]
          ),
          h.div(
            [sx(h, home.agentsTool)],
            [
              commandBlock(model, AGENT_COMMAND, "inverse", h),
              h.p(
                [sx(h, home.agentLinks)],
                [
                  h.a(
                    [h.Href(SKILL_PATH), sx(h, home.agentLink)],
                    ["Read the skill"]
                  ),
                  h.a(
                    [h.Href(LLMS_PATH), sx(h, home.agentLink, home.mono)],
                    ["llms.txt"]
                  ),
                  h.span(
                    [sx(h, home.agentNote)],
                    ["Every page here is also served as Markdown."]
                  ),
                ]
              ),
            ]
          ),
        ]
      ),
    ]
  );

const guidesView = (h: HtmlBuilder<AppMessage>): Html => {
  const groups = guidesByCategory().toSorted(
    ([, left], [, right]) => right.length - left.length
  );

  const total = groups.reduce((sum, [, pages]) => sum + pages.length, 0);

  return h.section(
    [h.AriaLabelledBy("guides"), sx(h, home.guides)],
    [
      h.div(
        [sx(h, home.guidesHead)],
        [
          h.h2([h.Id("guides"), sx(h, home.sectionHeading)], ["Guides"]),
          h.p(
            [sx(h, home.guidesCount)],
            [
              `${counted(total, "guide", "guides")} in ${counted(groups.length, "category", "categories")}`,
            ]
          ),
        ]
      ),
      h.div(
        [sx(h, home.guidesColumns)],
        groups.map(([category, pages]) =>
          h.keyed("div")(
            category,
            [sx(h, home.categoryGroup)],
            [
              h.h3(
                [sx(h, home.category)],
                [
                  categoryName(category),
                  " ",
                  h.span(
                    [sx(h, home.categoryCount)],
                    [`· ${counted(pages.length, "guide", "guides")}`]
                  ),
                ]
              ),
              h.ul(
                [sx(h, home.guideList)],
                pages.map((page) =>
                  h.keyed("li")(
                    page.id,
                    [sx(h, home.guide)],
                    [
                      h.a(
                        [
                          h.Href(guideRouter({ guideId: page.id })),
                          sx(h, home.guideLink),
                        ],
                        [page.name]
                      ),
                      h.p([sx(h, home.guideDescription)], [page.description]),
                    ]
                  )
                )
              ),
            ]
          )
        )
      ),
    ]
  );
};

export const homeView = (model: AppModel, h: HtmlBuilder<AppMessage>): Html =>
  h.main(
    [h.Id(MAIN_ID)],
    [heroView(model, h), agentsView(model, h), guidesView(h)]
  );
