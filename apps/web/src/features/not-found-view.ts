import * as stylex from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../client/message.js";
import { buttons } from "./controls.js";
import { MAIN_ID } from "./landmarks.js";
import { checkRouter, homeRouter } from "./route.js";
import { sx } from "./sx.js";
import { colors, font, layout } from "./tokens.stylex.js";

const missing = stylex.create({
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    margin: 0,
  },
  code: {
    color: colors["--ink-muted"],
    fontFamily: font["--font-code"],
    fontSize: "0.9375rem",
    margin: 0,
  },
  lead: {
    fontSize: "1.0625rem",
    lineHeight: 1.7,
    margin: 0,
    maxInlineSize: "60ch",
  },
  main: {
    boxSizing: "content-box",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    marginInline: "auto",
    maxInlineSize: layout["--page"],
    paddingBlock: "clamp(48px, 6cqi, 88px)",
    paddingInline: layout["--gutter"],
  },
  title: {
    fontSize: "clamp(2.25rem, 2.8cqi + 1.375rem, 3.75rem)",
    fontWeight: 800,
    letterSpacing: "-0.025em",
    lineHeight: 1.05,
    margin: 0,
    maxInlineSize: "17ch",
  },
});

export const notFoundView = (h: HtmlBuilder<AppMessage>): Html =>
  h.main(
    [h.Id(MAIN_ID), sx(h, missing.main)],
    [
      h.p([sx(h, missing.code)], ["404"]),
      h.h1([sx(h, missing.title)], ["This page does not exist"]),
      h.p(
        [sx(h, missing.lead)],
        [
          "The address may be mistyped, or the page moved. Every guide is listed on the home page.",
        ]
      ),
      h.p(
        [sx(h, missing.actions)],
        [
          h.a(
            [
              h.Href(`${homeRouter()}#guides`),
              sx(h, buttons.base, buttons.primary),
            ],
            ["Back to all guides"]
          ),
          h.a(
            [h.Href(checkRouter({})), sx(h, buttons.base, buttons.secondary)],
            ["Check a page"]
          ),
        ]
      ),
    ]
  );
