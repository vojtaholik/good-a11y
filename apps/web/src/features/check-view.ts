import * as stylex from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../client/message.js";
import type { AppModel } from "../client/model.js";
import { CLI } from "./agent-links.js";
import { checksView } from "./checks-view.js";
import { commandBlock } from "./command-block.js";
import { MAIN_ID } from "./landmarks.js";
import { scanForm } from "./scan-form.js";
import { sx } from "./sx.js";
import { colors, layout, radius } from "./tokens.stylex.js";

export const LOCAL_CHECK = `${CLI} check http://localhost:3000`;

const check = stylex.create({
  card: {
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
  cardHeading: {
    fontSize: "1.375rem",
    fontWeight: 800,
    lineHeight: 1.3,
    margin: 0,
  },
  hero: {
    alignItems: "flex-start",
    display: "flex",
    flexWrap: "wrap",
    gap: "32px 64px",
  },
  intro: {
    display: "flex",
    flexBasis: "480px",
    flexDirection: "column",
    flexGrow: 1,
    gap: "16px",
    minInlineSize: 0,
  },
  lead: {
    fontSize: "1.125rem",
    lineHeight: 1.65,
    margin: 0,
    maxInlineSize: "60ch",
  },
  main: {
    boxSizing: "content-box",
    display: "flex",
    flexDirection: "column",
    gap: "clamp(40px, 5cqi, 72px)",
    marginInline: "auto",
    maxInlineSize: layout["--page"],
    paddingBlock: "clamp(40px, 5cqi, 72px) clamp(48px, 6cqi, 96px)",
    paddingInline: layout["--gutter"],
  },
  muted: {
    color: colors["--ink-muted"],
  },
  note: {
    color: colors["--ink-muted"],
    fontSize: "0.9375rem",
    margin: 0,
  },
  title: {
    fontSize: "clamp(2.25rem, 2.4cqi + 1.5rem, 3.5rem)",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    lineHeight: 1.08,
    margin: 0,
  },
});

export const checkView = (model: AppModel, h: HtmlBuilder<AppMessage>): Html =>
  h.main(
    [h.Id(MAIN_ID), sx(h, check.main)],
    [
      h.div(
        [sx(h, check.hero)],
        [
          h.div(
            [sx(h, check.intro)],
            [
              h.h1([sx(h, check.title)], ["Check a page"]),
              h.p(
                [sx(h, check.lead)],
                [
                  "We fetch the page, check its HTML, then open it in a real browser and check what renders. You get a report at its own address, worst issues first, each with the guide that fixes it. One page per scan, plus up to four pages it links to. Automated checks find only part of the issues; a person reviews the rest.",
                ]
              ),
              h.p(
                [sx(h, check.lead, check.muted)],
                [
                  "For a page behind a login, or on your own machine, run the same check locally:",
                ]
              ),
              commandBlock(model, LOCAL_CHECK, "light", h),
            ]
          ),
          h.section(
            [h.AriaLabelledBy("check-heading"), sx(h, check.card)],
            [
              h.h2(
                [h.Id("check-heading"), sx(h, check.cardHeading)],
                ["Page to check"]
              ),
              scanForm(model, h),
              h.p([sx(h, check.note)], ["Takes 20 to 90 seconds."]),
            ]
          ),
        ]
      ),
      checksView(h),
    ]
  );
