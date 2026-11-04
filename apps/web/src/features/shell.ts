import * as stylex from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../client/message.js";
import { wordmarkIcon } from "./icons.js";
import { MAIN_ID } from "./landmarks.js";
import { AppRoute, checkRouter, homeRouter } from "./route.js";
import type { AppRouteState } from "./route.js";
import { sx } from "./sx.js";
import { colors, font, layout, radius, size, space } from "./tokens.stylex.js";

export const GITHUB_URL = "https://github.com/vojtaholik/good-a11y";

export const LLMS_PATH = "/llms.txt";

export const shell = stylex.create({
  brand: {
    alignItems: "center",
    color: colors["--ink"],
    display: "inline-flex",
    gap: "10px",
    minBlockSize: layout["--target"],
    textDecorationLine: "none",
  },
  current: {
    fontWeight: 800,
    textDecorationLine: "underline",
    textDecorationThickness: "3px",
    textUnderlineOffset: "8px",
  },
  footer: {
    borderBlockStartColor: colors["--line"],
    borderBlockStartStyle: "solid",
    borderBlockStartWidth: "1px",
  },
  footerInner: {
    alignItems: "center",
    boxSizing: "content-box",
    display: "flex",
    flexWrap: "wrap",
    gap: `0 ${space["--s4"]}`,
    justifyContent: "space-between",
    marginInline: "auto",
    maxInlineSize: layout["--page"],
    paddingBlock: space["--s5"],
    paddingInline: layout["--gutter"],
  },
  footerLink: {
    alignItems: "center",
    color: colors["--ink"],
    display: "inline-flex",
    minBlockSize: layout["--target"],
    paddingInline: space["--s2"],
  },
  footerNav: {
    display: "flex",
    flexWrap: "wrap",
    gap: `0 ${space["--s1"]}`,
    marginInlineEnd: `calc(-1 * ${space["--s2"]})`,
  },
  footerNote: {
    color: colors["--ink-muted"],
    fontSize: "0.9375rem",
  },
  header: {
    borderBlockEndColor: colors["--line"],
    borderBlockEndStyle: "solid",
    borderBlockEndWidth: "1px",
  },
  headerInner: {
    alignItems: "center",
    boxSizing: "content-box",
    display: "flex",
    flexWrap: "wrap",
    gap: `0 ${space["--s4"]}`,
    justifyContent: "space-between",
    marginInline: "auto",
    maxInlineSize: layout["--page"],
    minBlockSize: "72px",
    paddingInline: layout["--gutter"],
  },
  mono: {
    fontFamily: font["--font-code"],
    fontSize: "0.9375rem",
  },
  nav: {
    display: "flex",
    marginInlineEnd: "-10px",
  },
  navLink: {
    alignItems: "center",
    color: colors["--ink"],
    display: "inline-flex",
    minBlockSize: layout["--target"],
    paddingInline: "10px",
    textDecorationLine: "none",
  },
  root: {
    backgroundColor: colors["--bg"],
    color: colors["--ink"],
    containerType: "inline-size",
    display: "flex",
    flexDirection: "column",
    minBlockSize: "100svh",
  },
  rootMain: {
    flexGrow: 1,
  },
  skip: {
    alignItems: "center",
    backgroundColor: colors["--inverse"],
    borderRadius: radius["--radius-md"],
    color: colors["--on-inverse"],
    display: "inline-flex",
    fontWeight: 600,
    insetBlockStart: space["--s2"],
    insetInlineStart: space["--s2"],
    minBlockSize: layout["--target"],
    paddingInline: "18px",
    position: "absolute",
    textDecorationLine: "none",
    transform: { ":focus": "none", default: "translateY(-200%)" },
    zIndex: 1,
  },
  wide: {
    display: { "@container (max-width: 479px)": "none", default: null },
  },
  wordmark: {
    fontFamily: font["--font-code"],
    fontSize: size["--size-md"],
    fontWeight: 600,
  },
});

const isGuidesRoute = (route: AppRouteState): boolean =>
  AppRoute.match<boolean>(route, {
    Check: () => false,
    Guide: () => true,
    Home: () => false,
    NotFound: () => false,
    Report: () => false,
    Scan: () => false,
  });

const isCheckRoute = (route: AppRouteState): boolean =>
  AppRoute.match<boolean>(route, {
    Check: () => true,
    Guide: () => false,
    Home: () => false,
    NotFound: () => false,
    Report: () => true,
    Scan: () => true,
  });

const navLink = (
  h: HtmlBuilder<AppMessage>,
  href: string,
  isCurrent: boolean,
  label: readonly (Html | string)[]
): Html =>
  h.a(
    [
      h.Href(href),
      ...(isCurrent ? [h.AriaCurrent("page")] : []),
      sx(h, shell.navLink, isCurrent ? shell.current : null),
    ],
    [h.span([], [...label])]
  );

const header = (route: AppRouteState, h: HtmlBuilder<AppMessage>): Html =>
  h.header(
    [sx(h, shell.header)],
    [
      h.div(
        [sx(h, shell.headerInner)],
        [
          h.a(
            [h.Href(homeRouter()), sx(h, shell.brand)],
            [
              wordmarkIcon(h, 26),
              h.span([sx(h, shell.wordmark)], ["good-a11y"]),
            ]
          ),
          h.nav(
            [h.AriaLabel("Main"), sx(h, shell.nav)],
            [
              navLink(h, `${homeRouter()}#guides`, isGuidesRoute(route), [
                "Guides",
              ]),
              navLink(h, checkRouter({}), isCheckRoute(route), [
                "Check",
                h.span([sx(h, shell.wide)], [" a page"]),
              ]),
            ]
          ),
        ]
      ),
    ]
  );

const footer = (h: HtmlBuilder<AppMessage>): Html =>
  h.footer(
    [sx(h, shell.footer)],
    [
      h.div(
        [sx(h, shell.footerInner)],
        [
          h.span(
            [sx(h, shell.footerNote)],
            ["good-a11y · accessibility guides for coding agents"]
          ),
          h.nav(
            [h.AriaLabel("Footer"), sx(h, shell.footerNav)],
            [
              h.a([h.Href(GITHUB_URL), sx(h, shell.footerLink)], ["GitHub"]),
              h.a(
                [h.Href(LLMS_PATH), sx(h, shell.footerLink, shell.mono)],
                ["llms.txt"]
              ),
            ]
          ),
        ]
      ),
    ]
  );

export const pageShell = (
  route: AppRouteState,
  main: Html,
  h: HtmlBuilder<AppMessage>
): Html =>
  h.div(
    [sx(h, shell.root)],
    [
      h.a([h.Href(`#${MAIN_ID}`), sx(h, shell.skip)], ["Skip to content"]),
      header(route, h),
      h.div([sx(h, shell.rootMain)], [main]),
      footer(h),
    ]
  );
