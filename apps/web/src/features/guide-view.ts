import { viewBlocks } from "@foldkit/markdown";
import { verifiedText } from "@good-a11y/core/contracts";
import * as stylex from "@stylexjs/stylex";
import { Array } from "effect";
import type { Html, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../client/message.js";
import { categoryName } from "./guides.js";
import type { GuidePage } from "./guides.js";
import { MAIN_ID } from "./landmarks.js";
import { sx } from "./sx.js";
import { colors } from "./tokens.stylex.js";

export const RETRIEVE = "npx -y github:vojtaholik/good-a11y retrieve";

export const demoPath = (id: string): string => `/guides/${id}/demo.html`;

const local = stylex.create({
  agents: {
    backgroundColor: colors["--sunken"],
    borderRadius: "0.375rem",
    marginBlock: "1.5rem",
    paddingBlock: "0.75rem",
    paddingInline: "1rem",
  },
  agentsCommand: {
    display: "block",
    marginBlockStart: "0.25rem",
    overflowWrap: "anywhere",
  },
  criteria: {
    marginBlock: "0.5rem 0",
    paddingInlineStart: "1.25rem",
  },
  demo: {
    blockSize: "28rem",
    borderColor: colors["--line"],
    borderRadius: "0.375rem",
    borderStyle: "solid",
    borderWidth: "1px",
    inlineSize: "100%",
    resize: "vertical",
  },
  eyebrow: {
    color: colors["--ink-muted"],
    fontSize: "0.875rem",
    marginBlock: "0 0.25rem",
  },
  lead: {
    fontSize: "1.125rem",
    marginBlock: "0.5rem 1.5rem",
  },
  sectionTitle: {
    fontSize: "1.125rem",
    marginBlock: "2rem 0.5rem",
  },
});

const criteriaView = (page: GuidePage, h: HtmlBuilder<AppMessage>): Html[] => {
  const verified = Array.filter(
    page.criteria.map(verifiedText),
    (text) => text !== null
  );

  return verified.length === 0
    ? []
    : [
        h.h2([sx(h, local.sectionTitle)], ["WCAG success criteria"]),
        h.ul(
          [sx(h, local.criteria)],
          verified.map(({ source, text }) =>
            h.li([], [h.a([h.Href(source)], [text])])
          )
        ),
      ];
};

export const guideView = (
  page: GuidePage,
  h: HtmlBuilder<AppMessage>
): Html => {
  const [title, ...rest] = viewBlocks(page.document);

  return h.main(
    [h.Id(MAIN_ID)],
    [
      h.p([sx(h, local.eyebrow)], [`Guide · ${categoryName(page.category)}`]),
      h.div([h.DataAttribute("prose", "")], title === undefined ? [] : [title]),
      h.p([sx(h, local.lead)], [page.description.replace(/\.?$/u, ".")]),
      h.div(
        [sx(h, local.agents)],
        [
          h.strong([], ["For agents"]),
          h.code([sx(h, local.agentsCommand)], [`${RETRIEVE} ${page.id}`]),
        ]
      ),
      h.h2([sx(h, local.sectionTitle)], ["Live demo"]),
      h.iframe([
        h.Src(demoPath(page.id)),
        h.Title(`${page.name} demo`),
        h.Sandbox("allow-scripts allow-forms"),
        h.Loading("lazy"),
        sx(h, local.demo),
      ]),
      ...criteriaView(page, h),
      h.div([h.DataAttribute("prose", "")], rest),
    ]
  );
};
