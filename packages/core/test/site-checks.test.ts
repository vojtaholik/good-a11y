import { describe, expect, it } from "@effect/vitest";

import {
  consistentHelp,
  consistentIdentification,
  consistentNavigation,
} from "../src/site-checks.js";
import type { PageSummary, SiteLink } from "../src/site-evidence.js";

const link = (text: string, path: string, position: number): SiteLink => ({
  href: `https://shop.example${path}`,
  landmark: "nav",
  position,
  text,
});

const NAV = [
  link("Home", "/", 0),
  link("Women", "/women", 1),
  link("Men", "/men", 2),
  link("Sale", "/sale", 3),
];

const page = (
  path: string,
  navigation: readonly SiteLink[],
  help: readonly SiteLink[] = []
): PageSummary => ({
  help,
  linkCount: navigation.length + help.length,
  names: [],
  navigation,
  role: path === "/" ? "entered" : "contact",
  search: false,
  sitemap: false,
  structuredTypes: [],
  truncated: false,
  url: `https://shop.example${path}`,
});

const reordered = [NAV[0], NAV[2], NAV[1], NAV[3]].flatMap((item, index) =>
  item === undefined ? [] : [{ ...item, position: index }]
);

describe("consistent navigation (3.2.3)", () => {
  it("finds no failure when the shared navigation links keep their order, even with extra links between them", () => {
    const result = consistentNavigation.evaluate([
      page("/", NAV),
      page("/contact", [
        ...NAV.slice(0, 2),
        link("New", "/new", 2),
        ...NAV.slice(2).map((item) => ({
          ...item,
          position: item.position + 1,
        })),
      ]),
    ]);

    expect(result.status).toBe("pass");
  });

  it("fails when another page shows the shared links in a different order, and names the page", () => {
    const result = consistentNavigation.evaluate([
      page("/", NAV),
      page("/contact", reordered),
    ]);

    expect(result.status).toBe("fail");
    expect(result.samples[0]).toContain("/contact: Home, Men, Women, Sale");
  });

  it("ignores a repeat of a link, such as a logo and a Home link to the same address", () => {
    const result = consistentNavigation.evaluate([
      page("/", NAV),
      page("/contact", [
        link("Shop", "/", 0),
        ...NAV.map((item) => ({ ...item, position: item.position + 1 })),
      ]),
    ]);

    expect(result.status).toBe("pass");
  });

  it("has nothing to check with one page or too few shared links", () => {
    expect(consistentNavigation.evaluate([page("/", NAV)]).status).toBe(
      "not_applicable"
    );
    expect(
      consistentNavigation.evaluate([
        page("/", NAV),
        page("/contact", NAV.slice(0, 2)),
      ]).status
    ).toBe("not_applicable");
  });
});

describe("consistent identification (3.2.4)", () => {
  it("fails when a navigation link to the same address has an unrelated name on another page", () => {
    const result = consistentIdentification.evaluate([
      page("/", NAV),
      page(
        "/contact",
        [NAV[0], NAV[1], NAV[2], link("Outlet", "/sale", 3)].flatMap((item) =>
          item === undefined ? [] : [item]
        )
      ),
    ]);

    expect(result.status).toBe("fail");
    expect(result.samples).toEqual([
      '/sale is "sale" on the page entered and "outlet" on /contact',
    ]);
  });

  it("accepts counts and added words such as a current-page marker", () => {
    const result = consistentIdentification.evaluate([
      page("/", [...NAV, link("Cart (0)", "/cart", 4)]),
      page("/contact", [
        ...NAV.slice(0, 3),
        link("Sale current page", "/sale", 3),
        link("Cart (2)", "/cart", 4),
      ]),
    ]);

    expect(result.status).toBe("pass");
  });
});

describe("consistent help (3.2.6)", () => {
  const help = (position: number) => [link("Contact us", "/contact", position)];

  it("finds no failure when the help link keeps its place among the navigation", () => {
    expect(
      consistentHelp.evaluate([
        page("/", NAV, help(9)),
        page("/sale", NAV, help(12)),
      ]).status
    ).toBe("pass");
  });

  it("fails when the help link moves from after the navigation to before it", () => {
    const result = consistentHelp.evaluate([
      page("/", NAV, help(9)),
      page(
        "/sale",
        NAV.map((item) => ({ ...item, position: item.position + 1 })),
        help(0)
      ),
    ]);

    expect(result.status).toBe("fail");
    expect(result.samples[0]).toContain("/contact");
  });

  it("does not blame help for a navigation that changed order", () => {
    expect(
      consistentHelp.evaluate([
        page("/", NAV, help(9)),
        page("/sale", reordered, help(9)),
      ]).status
    ).toBe("pass");
  });

  it("has nothing to check when no help link repeats", () => {
    expect(
      consistentHelp.evaluate([page("/", NAV, help(9)), page("/sale", NAV)])
        .status
    ).toBe("not_applicable");
  });
});
