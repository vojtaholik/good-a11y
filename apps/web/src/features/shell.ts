import * as stylex from "@stylexjs/stylex";
import { Option, Schema } from "effect";
import type { Html, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../client/message.js";
import type { AppModel } from "../client/model.js";
import { OUTLINE_DATA } from "../client/section-spy.js";
import { SKILL_URL_PATH } from "./agent-links.js";
import { categoryName, guidesByCategory } from "./guides.js";
import { wordmarkIcon } from "./icons.js";
import { MAIN_ID } from "./landmarks.js";
import type { OutlineItem, PageLayout } from "./outline.js";
import {
  AppRoute,
  aboutRouter,
  evalsRouter,
  checkRouter,
  guideRouter,
  homeRouter,
  privacyRouter,
} from "./route.js";
import type { AppRouteState } from "./route.js";
import { sx } from "./sx.js";
import { colors, font, layout, radius, size, space } from "./tokens.stylex.js";

export const GITHUB_URL = "https://github.com/vojtaholik/good-a11y";

export const LLMS_PATH = "/llms.txt";

export const HEADER_HEIGHT = "56px";

const WIDE = "@container (min-width: 768px)";

const WIDEST = "@container (min-width: 1024px)";

export const shell = stylex.create({
  brand: {
    alignItems: "center",
    color: colors["--ink"],
    display: "inline-flex",
    gap: "10px",
    minBlockSize: layout["--target"],
    textDecorationLine: "none",
  },
  center: {
    paddingBlock: `${space["--s6"]} 0`,
    paddingInline: { [WIDE]: space["--s6"], default: space["--s4"] },
  },
  count: {
    color: colors["--ink-muted"],
    fontFamily: font["--font-code"],
    fontSize: size["--size-xs"],
    marginInlineStart: "auto",
  },
  current: {
    borderInlineStartColor: colors["--ink"],
    color: colors["--ink"],
    fontWeight: 700,
  },
  disclosure: {
    borderBlockEndColor: colors["--line"],
    borderBlockEndStyle: "solid",
    borderBlockEndWidth: "1px",
    paddingInline: space["--s4"],
  },
  disclosureInContent: {
    backgroundColor: colors["--surface"],
    borderColor: colors["--line"],
    borderRadius: radius["--radius-lg"],
    borderStyle: "solid",
    borderWidth: "1px",
    display: { [WIDEST]: "none", default: "block" },
    marginBlockEnd: space["--s6"],
    paddingInline: space["--s4"],
  },
  disclosureSummary: {
    cursor: "pointer",
    display: "list-item",
    fontWeight: 700,
    paddingBlock: "10px",
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
    maxInlineSize: "1280px",
    paddingBlock: space["--s5"],
    paddingInline: space["--s4"],
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
  grid: {
    display: "grid",
    gridTemplateColumns: {
      [WIDE]: "232px minmax(0, 1fr)",
      [WIDEST]: "248px minmax(0, 1fr)",
      default: "minmax(0, 1fr)",
    },
    inlineSize: "100%",
    marginInline: "auto",
    maxInlineSize: "1280px",
  },
  gridRail: {
    gridTemplateColumns: {
      [WIDE]: "232px minmax(0, 1fr)",
      [WIDEST]: "248px minmax(0, 1fr) 232px",
      default: "minmax(0, 1fr)",
    },
  },
  groupLabel: {
    color: colors["--ink-muted"],
    fontFamily: font["--font-code"],
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.06em",
    marginBlock: `${space["--s4"]} ${space["--s1"]}`,
    paddingInlineStart: space["--s3"],
    textTransform: "uppercase",
  },
  header: {
    backgroundColor: colors["--bg"],
    borderBlockEndColor: colors["--line"],
    borderBlockEndStyle: "solid",
    borderBlockEndWidth: "1px",
    insetBlockStart: 0,
    position: { [WIDE]: "sticky", default: "static" },
    zIndex: 2,
  },
  headerInner: {
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    gap: { [WIDE]: space["--s4"], default: space["--s2"] },
    marginInline: "auto",
    maxInlineSize: "1280px",
    minBlockSize: HEADER_HEIGHT,
    paddingInline: space["--s4"],
  },
  list: {
    display: "grid",
    gap: "1px",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  mono: {
    fontFamily: font["--font-code"],
    fontSize: "0.9375rem",
  },
  nav: {
    display: "flex",
    flexGrow: 1,
  },
  navCurrent: {
    fontWeight: 800,
    textDecorationLine: "underline",
    textDecorationThickness: "3px",
    textUnderlineOffset: "8px",
  },
  navLink: {
    alignItems: "center",
    color: colors["--ink"],
    display: "inline-flex",
    minBlockSize: layout["--target"],
    paddingInline: { [WIDE]: "10px", default: "6px" },
    textDecorationLine: "none",
  },
  onlyNarrow: {
    display: { [WIDE]: "none", default: "block" },
  },
  pill: {
    alignItems: "center",
    borderColor: colors["--line"],
    borderRadius: radius["--radius-pill"],
    borderStyle: "solid",
    borderWidth: "1px",
    color: colors["--ink"],
    display: "inline-flex",
    fontFamily: font["--font-code"],
    fontSize: size["--size-xs"],
    minBlockSize: "32px",
    paddingInline: { [WIDE]: space["--s3"], default: space["--s2"] },
    textDecorationLine: "none",
    whiteSpace: "nowrap",
  },
  rail: {
    alignContent: "start",
    blockSize: `calc(100svh - ${HEADER_HEIGHT})`,
    display: { [WIDEST]: "grid", default: "none" },
    gap: space["--s6"],
    insetBlockStart: HEADER_HEIGHT,
    overflowY: "auto",
    paddingBlock: `${space["--s6"]} ${space["--s5"]}`,
    paddingInline: `${space["--s2"]} ${space["--s4"]}`,
    position: "sticky",
  },
  railLink: {
    borderInlineStartColor: "transparent",
    borderInlineStartStyle: "solid",
    borderInlineStartWidth: "3px",
    color: colors["--ink-muted"],
    display: "flex",
    fontSize: "0.875rem",
    gap: space["--s2"],
    lineHeight: 1.35,
    minBlockSize: layout["--target-min"],
    paddingBlock: "4px",
    paddingInlineStart: space["--s3"],
    textDecorationLine: "none",
  },
  railLinkDeep: {
    paddingInlineStart: space["--s6"],
  },
  railTitle: {
    color: colors["--ink-muted"],
    fontFamily: font["--font-code"],
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.06em",
    margin: `0 0 ${space["--s2"]}`,
    textTransform: "uppercase",
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
  side: {
    blockSize: `calc(100svh - ${HEADER_HEIGHT})`,
    borderInlineEndColor: colors["--line"],
    borderInlineEndStyle: "solid",
    borderInlineEndWidth: "1px",
    display: { [WIDE]: "block", default: "none" },
    insetBlockStart: HEADER_HEIGHT,
    overflowY: "auto",
    paddingBlock: `${space["--s4"]} ${space["--s6"]}`,
    paddingInline: `${space["--s3"]} ${space["--s3"]}`,
    position: "sticky",
  },
  sideLink: {
    alignItems: "center",
    borderInlineStartColor: "transparent",
    borderInlineStartStyle: "solid",
    borderInlineStartWidth: "3px",
    color: colors["--ink"],
    display: "flex",
    fontSize: "0.9375rem",
    gap: space["--s2"],
    lineHeight: 1.3,
    minBlockSize: "32px",
    paddingBlock: "4px",
    paddingInline: space["--s3"],
    textDecorationLine: "none",
  },
  skip: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors["--inverse"],
    borderRadius: radius["--radius-md"],
    color: colors["--on-inverse"],
    display: "inline-flex",
    fontWeight: 600,
    insetBlockStart: 0,
    insetInlineStart: 0,
    margin: { ":focus": space["--s2"], default: 0 },
    minBlockSize: layout["--target"],
    paddingInline: "18px",
    position: { ":focus": "static", default: "absolute" },
    textDecorationLine: "none",
    transform: { ":focus": "none", default: "translateY(-200%)" },
  },
  wide: {
    display: { "@container (max-width: 479px)": "none", default: null },
  },
  wideBlock: {
    display: { "@container (max-width: 479px)": "none", default: "contents" },
  },
  wordmark: {
    fontFamily: font["--font-code"],
    fontSize: { [WIDE]: size["--size-md"], default: size["--size-sm"] },
    fontWeight: 600,
  },
});

type Current = "page" | "true" | null;

const isGuide = (route: AppRouteState, id: string): boolean =>
  Schema.is(AppRoute.Guide)(route) && route.guideId === id;

const checkCurrent = (route: AppRouteState): Current =>
  AppRoute.match<Current>(route, {
    About: () => null,
    Check: () => "page",
    Contact: () => null,
    Evals: () => null,
    Guide: () => null,
    Home: () => null,
    NotFound: () => null,
    Privacy: () => null,
    Report: () => "true",
    Scan: () => "true",
  });

const navLink = (
  h: HtmlBuilder<AppMessage>,
  href: string,
  current: Current,
  label: readonly (Html | string)[]
): Html =>
  h.a(
    [
      h.Href(href),
      ...(current === null ? [] : [h.AriaCurrent(current)]),
      sx(h, shell.navLink, current === null ? null : shell.navCurrent),
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
              wordmarkIcon(h, 24),
              h.span([sx(h, shell.wordmark)], ["good-a11y"]),
            ]
          ),
          h.nav(
            [h.AriaLabel("Main"), sx(h, shell.nav)],
            [
              h.span(
                [sx(h, shell.wideBlock)],
                [navLink(h, `${homeRouter()}#guides`, null, ["Guides"])]
              ),
              navLink(h, checkRouter({}), checkCurrent(route), [
                "Check",
                h.span([sx(h, shell.wide)], [" a page"]),
              ]),
            ]
          ),
          h.a([h.Href(SKILL_URL_PATH), sx(h, shell.pill)], ["For agents"]),
        ]
      ),
    ]
  );

const sideLink = (
  h: HtmlBuilder<AppMessage>,
  href: string,
  current: "location" | "page" | null,
  label: string,
  count: number | null = null
): Html =>
  h.a(
    [
      h.Href(href),
      ...(current === null ? [] : [h.AriaCurrent(current)]),
      sx(h, shell.sideLink, current === null ? null : shell.current),
    ],
    [
      h.span([], [label]),
      ...(count === null
        ? []
        : [h.span([sx(h, shell.count)], [String(count)])]),
    ]
  );

const guidesNav = (
  route: AppRouteState,
  idPrefix: string,
  h: HtmlBuilder<AppMessage>
): Html =>
  h.nav(
    [h.AriaLabel("Guides")],
    [
      ...guidesByCategory().flatMap(([category, pages]) => [
        h.p(
          [h.Id(`${idPrefix}-${category}`), sx(h, shell.groupLabel)],
          [categoryName(category)]
        ),
        h.ul(
          [h.AriaLabelledBy(`${idPrefix}-${category}`), sx(h, shell.list)],
          pages.map((page) =>
            h.keyed("li")(
              page.id,
              [],
              [
                sideLink(
                  h,
                  guideRouter({ guideId: page.id }),
                  isGuide(route, page.id) ? "page" : null,
                  page.name
                ),
              ]
            )
          )
        ),
      ]),
      h.p([sx(h, shell.groupLabel)], ["good-a11y"]),
      h.ul(
        [sx(h, shell.list)],
        [
          h.li(
            [],
            [
              sideLink(
                h,
                checkRouter({}),
                Schema.is(AppRoute.Check)(route) ? "page" : null,
                "Check a page"
              ),
            ]
          ),
          h.li(
            [],
            [
              sideLink(
                h,
                aboutRouter(),
                Schema.is(AppRoute.About)(route) ? "page" : null,
                "About"
              ),
            ]
          ),
        ]
      ),
    ]
  );

const indexNav = (
  model: AppModel,
  items: readonly OutlineItem[],
  h: HtmlBuilder<AppMessage>
): Html =>
  h.nav(
    [h.AriaLabel("Report sections"), h.DataAttribute(OUTLINE_DATA, "")],
    [
      h.p([sx(h, shell.groupLabel)], ["This report"]),
      h.ul(
        [sx(h, shell.list)],
        items.map(({ count, id, label }) =>
          h.keyed("li")(
            id,
            [],
            [
              sideLink(
                h,
                `#${id}`,
                Option.contains(model.section, id) ? "location" : null,
                label,
                count
              ),
            ]
          )
        )
      ),
    ]
  );

const sideContent = (
  model: AppModel,
  page: PageLayout,
  idPrefix: string,
  h: HtmlBuilder<AppMessage>
): Html =>
  page.index === null
    ? guidesNav(model.route, idPrefix, h)
    : indexNav(model, page.index, h);

const outlineNav = (
  model: AppModel,
  outline: readonly OutlineItem[],
  h: HtmlBuilder<AppMessage>
): Html =>
  h.nav(
    [h.AriaLabel("On this page"), h.DataAttribute(OUTLINE_DATA, "")],
    [
      h.ul(
        [sx(h, shell.list)],
        outline.map(({ id, label, level }) => {
          const isCurrent = Option.contains(model.section, id);

          return h.keyed("li")(
            id,
            [],
            [
              h.a(
                [
                  h.Href(`#${id}`),
                  ...(isCurrent ? [h.AriaCurrent("location")] : []),
                  sx(
                    h,
                    shell.railLink,
                    level === 3 ? shell.railLinkDeep : null,
                    isCurrent ? shell.current : null
                  ),
                ],
                [label]
              ),
            ]
          );
        })
      ),
    ]
  );

const railView = (
  model: AppModel,
  page: PageLayout,
  h: HtmlBuilder<AppMessage>
): Html =>
  h.aside(
    [h.AriaLabel("Page outline"), sx(h, shell.rail)],
    [
      ...(page.outline.length === 0
        ? []
        : [
            h.div(
              [],
              [
                h.p([sx(h, shell.railTitle)], ["On this page"]),
                outlineNav(model, page.outline, h),
              ]
            ),
          ]),
      ...page.railExtra,
    ]
  );

const railDisclosure = (
  model: AppModel,
  page: PageLayout,
  h: HtmlBuilder<AppMessage>
): Html[] =>
  page.outline.length === 0
    ? []
    : [
        h.details(
          [sx(h, shell.disclosureInContent)],
          [
            h.summary([sx(h, shell.disclosureSummary)], ["On this page"]),
            outlineNav(model, page.outline, h),
            ...page.railExtra,
          ]
        ),
      ];

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
              h.a([h.Href(aboutRouter()), sx(h, shell.footerLink)], ["About"]),
              h.a([h.Href(evalsRouter()), sx(h, shell.footerLink)], ["Evals"]),
              h.a(
                [h.Href(privacyRouter()), sx(h, shell.footerLink)],
                ["Privacy"]
              ),
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
  model: AppModel,
  page: PageLayout,
  h: HtmlBuilder<AppMessage>
): Html => {
  const hasRail = page.outline.length > 0 || page.railExtra.length > 0;

  return h.div(
    [sx(h, shell.root)],
    [
      h.a([h.Href(`#${MAIN_ID}`), sx(h, shell.skip)], ["Skip to content"]),
      header(model.route, h),
      h.details(
        [sx(h, shell.disclosure, shell.onlyNarrow)],
        [
          h.summary(
            [sx(h, shell.disclosureSummary)],
            [page.index === null ? "Guides" : "Report sections"]
          ),
          sideContent(model, page, "narrow", h),
        ]
      ),
      h.div(
        [sx(h, shell.rootMain, shell.grid, hasRail ? shell.gridRail : null)],
        [
          h.div([sx(h, shell.side)], [sideContent(model, page, "side", h)]),
          h.div(
            [sx(h, shell.center)],
            [...railDisclosure(model, page, h), page.main]
          ),
          ...(hasRail ? [railView(model, page, h)] : []),
        ]
      ),
      footer(h),
    ]
  );
};
