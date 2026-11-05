import { describe, expect, it } from "@effect/vitest";

import {
  REFERENCE,
  SITE_CHECKS,
  runSiteChecks,
  summaryOf,
} from "../src/index.js";
import type { LinkEvidence, PageEvidence, PageSummary } from "../src/index.js";

const ORIGIN = "https://shop.example";

type Place = LinkEvidence["landmark"];

const link = (
  href: string,
  text: string,
  landmark: Place = "nav",
  language = false
): LinkEvidence => ({
  context: "",
  href,
  labelled: text !== "",
  landmark,
  language,
  snippet: `<a href="${href}">${text}</a>`,
  text,
});

const evidenceOf = (links: readonly LinkEvidence[]): PageEvidence => ({
  buttons: [],
  controls: [],
  frames: [],
  headings: [],
  images: [],
  labelTargets: [],
  labels: [],
  lang: "en",
  links,
  passages: [],
  prices: [],
  refreshes: [],
  search: false,
  structuredTypes: [],
  textSample: "",
  title: "Shop",
  truncated: false,
  viewports: [],
});

const page = (
  role: PageSummary["role"],
  path: string,
  links: readonly LinkEvidence[]
): PageSummary => summaryOf(role, `${ORIGIN}${path}`, evidenceOf(links));

const statusOf = (summaries: readonly PageSummary[]) =>
  Object.fromEntries(
    SITE_CHECKS.map((check) => [check.id, check.evaluate(summaries).status])
  );

const MENU = [
  link("/shop", "Shop"),
  link("/sale", "Sale"),
  link("/about", "About us"),
  link("/blog", "Blog"),
];

describe("cross-page checks: the round 6 false positives pass", () => {
  it("bbc.co.uk: a skip link and a logo share the home address with Home", () => {
    const header = (self: string) => [
      link("#main-heading", "Skip to content", "header"),
      link("/", "BBC homepage", "header"),
      link(self, "Skip to content", "header"),
      link("/", "Home"),
      link("/news", "News"),
      link("/sport", "Sport"),
      link("/weather", "Weather"),
      link("/iplayer", "iPlayer"),
    ];

    expect(
      statusOf([
        page("entered", "/", header("/#main-heading")),
        page("contact", "/news", header("/news#main-heading")),
      ])
    ).toEqual({
      "consistent-help": "not_applicable",
      "consistent-identification": "pass",
      "consistent-navigation": "pass",
    });
  });

  it("ikea.com: a logo link present on one page only points to an address its menu reaches later", () => {
    expect(
      statusOf([
        page("entered", "/", [
          link("/stories", "IKEA", "header"),
          link("/products", "Products"),
          link("/rooms", "Rooms"),
          link("/stories", "Stories"),
          link("/jobs", "Jobs"),
          link("/newsroom", "Newsroom"),
        ]),
        page("product", "/p/chair", [
          link("/products", "Products"),
          link("/rooms", "Rooms"),
          link("/stories", "Stories"),
          link("/jobs", "Jobs"),
          link("/newsroom", "Newsroom"),
        ]),
      ])["consistent-navigation"]
    ).toBe("pass");
  });

  it("w3.org/WAI: the home page leaves out its own entry and has a same-page skip link", () => {
    const menu = [
      link("#main", "Skip to Content", "header"),
      link("/WAI/", "WAI homepage", "header"),
      link("/WAI/standards/", "Standards"),
      link("/WAI/fundamentals/", "Fundamentals"),
      link("/WAI/planning/", "Planning"),
      link("/WAI/design/", "Design"),
    ];

    expect(
      statusOf([
        page("entered", "/WAI/", menu),
        page("statement", "/WAI/about/", [
          ...menu.slice(0, 2),
          link("/WAI/", "Home"),
          ...menu.slice(2),
        ]),
      ])
    ).toMatchObject({
      "consistent-identification": "pass",
      "consistent-navigation": "pass",
    });
  });

  it("bbc.co.uk: Accessibility Help among page-local links keeps its place after the shared menu", () => {
    expect(
      statusOf([
        page("entered", "/", [
          ...MENU,
          link("/story/1", "A story", "main"),
          link("/help", "Accessibility Help", "footer"),
        ]),
        page("contact", "/news", [
          ...MENU,
          link("/story/2", "Another story", "main"),
          link("/story/3", "A third story", "main"),
          link("/help", "Accessibility Help", "footer"),
        ]),
      ])["consistent-help"]
    ).toBe("pass");
  });
});

describe("cross-page checks: what else they leave alone", () => {
  it("a contact page whose own menu entry is a self-link still compares on the rest", () => {
    const menu = [...MENU, link("/contact", "Contact")];

    expect(
      statusOf([page("entered", "/", menu), page("contact", "/contact", menu)])
    ).toMatchObject({
      "consistent-identification": "pass",
      "consistent-navigation": "pass",
    });
  });

  it("a desktop and a mobile menu repeating every link compare nothing twice", () => {
    expect(
      statusOf([
        page("entered", "/", [...MENU, ...MENU.toReversed()]),
        page("product", "/p/1", [...MENU, ...MENU]),
      ])["consistent-navigation"]
    ).toBe("not_applicable");
  });

  it("a cart count and a current-page marker are the same name", () => {
    expect(
      statusOf([
        page("entered", "/", [...MENU, link("/cart", "Cart 0")]),
        page("product", "/p/1", [
          link("/shop", "Shop, current page"),
          ...MENU.slice(1),
          link("/cart", "Cart 2"),
        ]),
      ])["consistent-identification"]
    ).toBe("pass");
  });

  it("language switchers and links to other sites in the menu are left out", () => {
    expect(
      statusOf([
        page("entered", "/", [
          link("/de/", "Deutsch", "header", true),
          link("/fr/", "Français", "header", true),
          ...MENU,
        ]),
        page("product", "/p/1", [
          link("/fr/", "Français", "header", true),
          link("/de/", "Deutsch", "header", true),
          ...MENU,
        ]),
      ])["consistent-navigation"]
    ).toBe("pass");
  });

  it("compares nothing without an entered page first", () => {
    expect(
      statusOf([page("product", "/p/1", MENU), page("contact", "/c", MENU)])
    ).toEqual({
      "consistent-help": "not_applicable",
      "consistent-identification": "not_applicable",
      "consistent-navigation": "not_applicable",
    });
  });
});

describe("cross-page checks: the vodafone.de false positives pass", () => {
  const named = (here: string, there: string) =>
    SITE_CHECKS[1]?.evaluate([
      page("entered", "/", [...MENU, link("/info", here)]),
      page("statement", "/a11y", [...MENU, link("/info", there)]),
    ]).status;

  it("a one-letter typo and a gender-inclusive spelling are the same name", () => {
    expect(named("Infos & Services", "Infos & Sevices")).toBe("pass");
    expect(
      named(
        "Informationen für CallYa-Kund:innen",
        "Informationen für CallYa Kunden"
      )
    ).toBe("pass");
  });

  it("another word for the same thing is not", () => {
    expect(named("Search", "Find")).toBe("fail");
    expect(named("Mobile phones", "Mobile accessories")).toBe("fail");
  });

  it("a page the link redirected elsewhere, such as a captcha wall, is not compared", () => {
    const [entered, walled] = [
      page("entered", "/", MENU),
      page("sign_in", "/cprx/captcha", MENU.toReversed()),
    ];

    const statuses = (finalUrl: string) =>
      runSiteChecks(
        {
          pages: [
            {
              checks: [],
              finalUrl,
              httpStatus: 200,
              outcome: "read",
              role: "sign_in",
              url: `${ORIGIN}/login/`,
            },
          ],
          summaries: [entered, { ...walled, url: finalUrl }].flatMap((item) =>
            item === undefined ? [] : [item]
          ),
        },
        REFERENCE
      ).map((finding) => finding.status);

    expect(statuses(`${ORIGIN}/cprx/captcha`)).toEqual([
      "not_applicable",
      "not_applicable",
      "not_applicable",
    ]);
    expect(statuses(`${ORIGIN}/login`)[0]).toBe("fail");
  });
});

describe("cross-page checks: real inconsistencies fail", () => {
  it("3.2.3: the shared menu in another order", () => {
    const result = SITE_CHECKS[0]?.evaluate([
      page("entered", "/", MENU),
      page(
        "product",
        "/p/1",
        [MENU[1], MENU[0], MENU[2], MENU[3]].flatMap((item) =>
          item === undefined ? [] : [item]
        )
      ),
    ]);

    expect(result?.status).toBe("fail");
    expect(result?.samples).toEqual([
      "/p/1: Sale, Shop, About us, Blog; the page entered: Shop, Sale, About us, Blog",
    ]);
  });

  it("3.2.4: the same address named differently", () => {
    const result = SITE_CHECKS[1]?.evaluate([
      page("entered", "/", [...MENU, link("/cart", "Cart")]),
      page("product", "/p/1", [...MENU, link("/cart", "Basket")]),
    ]);

    expect(result?.status).toBe("fail");
    expect(result?.samples).toEqual([
      '/cart is "cart" on the page entered and "basket" on /p/1',
    ]);
  });

  it("3.2.6: help before the menu on one page and after it on another", () => {
    const result = SITE_CHECKS[2]?.evaluate([
      page("entered", "/", [
        link("tel:+420123456789", "Call us", "header"),
        ...MENU,
      ]),
      page("product", "/p/1", [
        ...MENU,
        link("tel:+420123456789", "Call us", "footer"),
      ]),
    ]);

    expect(result?.status).toBe("fail");
    expect(result?.samples).toEqual([
      '"Call us" comes after 0 shared navigation links on the page entered and after 4 on /p/1',
    ]);
  });

  it("3.2.6 leaves help undecided when the menu itself is out of order", () => {
    expect(
      SITE_CHECKS[2]?.evaluate([
        page("entered", "/", [link("/help", "Help", "header"), ...MENU]),
        page("product", "/p/1", [
          ...MENU.toReversed(),
          link("/help", "Help", "footer"),
        ]),
      ]).status
    ).toBe("not_applicable");
  });

  it("3.2.3 and 3.2.4 carry their WCAG 2.1 references; 3.2.6 only its WCAG 2.2 one", () => {
    const findings = runSiteChecks(
      { pages: [], summaries: [page("entered", "/", MENU)] },
      REFERENCE
    );

    expect(
      findings.map((finding) => [
        finding.id,
        finding.references.map((reference) => reference.kind),
      ])
    ).toEqual([
      ["consistent-navigation", ["wcag", "en-reference"]],
      ["consistent-identification", ["wcag", "en-reference"]],
      ["consistent-help", ["wcag-newer"]],
    ]);
  });
});
