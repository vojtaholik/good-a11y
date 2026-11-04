import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer } from "effect";

import { PageReader, crawlSite, pickPages, summaryOf } from "../src/index.js";
import type { HopRequest, LinkEvidence, PageEvidence } from "../src/index.js";
import { html, redirectTo, scriptedFetch } from "./support.js";
import type { Scripted } from "./support.js";

const link = (
  text: string,
  href: string,
  landmark: LinkEvidence["landmark"] = null
): LinkEvidence => ({
  context: "",
  href,
  labelled: false,
  landmark,
  language: false,
  snippet: `<a href="${href}">`,
  text,
});

const evidenceWith = (
  links: readonly LinkEvidence[],
  more: Partial<PageEvidence> = {}
): PageEvidence => ({
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
  ...more,
});

describe("pickPages", () => {
  it("picks one page per role in a fixed order, same site only", () => {
    const picks = pickPages("https://www.shop.example/", [
      link("Home", "/"),
      link("Login", "https://accounts.other.example/login"),
      link("Přihlásit se", "/ucet"),
      link("Kontakt", "/kontakt#form"),
      link("Red bike", "/products/red-bike?ref=home"),
      link("Prohlášení o přístupnosti", "https://shop.example/pristupnost"),
      link("Contact again", "/contact"),
    ]);

    expect(picks).toEqual([
      { role: "statement", url: "https://shop.example/pristupnost" },
      { role: "contact", url: "https://www.shop.example/kontakt" },
      {
        role: "product",
        url: "https://www.shop.example/products/red-bike?ref=home",
      },
      { role: "sign_in", url: "https://www.shop.example/ucet" },
    ]);
  });

  it("recognises roles by path when the text says nothing", () => {
    expect(
      pickPages("https://shop.example/", [
        link("", "/de/barrierefreiheit"),
        link("Mein Konto", "/customer/account/login/"),
        link("Fahrrad", "/p/fahrrad-123"),
      ])
    ).toEqual([
      { role: "statement", url: "https://shop.example/de/barrierefreiheit" },
      { role: "product", url: "https://shop.example/p/fahrrad-123" },
      {
        role: "sign_in",
        url: "https://shop.example/customer/account/login/",
      },
    ]);
  });

  it("never picks the entered page, another scheme or a word inside a word", () => {
    expect(
      pickPages("https://shop.example/contact", [
        link("Contact", "/contact#top"),
        link("Contact", "mailto:hi@shop.example"),
        link("Contacts", "ftp://shop.example/contacts"),
        link("Recontactable", "/x"),
        link("Products", "/products"),
      ])
    ).toEqual([]);
  });

  it("answers nothing for an address that does not parse", () => {
    expect(pickPages("not a url", [link("Contact", "/contact")])).toEqual([]);
  });
});

describe("summaryOf", () => {
  it("collects navigation, help links, search, site map and names", () => {
    const summary = summaryOf(
      "entered",
      "https://shop.example/a/",
      evidenceWith(
        [
          link("Shop", "../shop#x", "nav"),
          link("Logo", "/", "header"),
          link("Red bike", "/p/red", "main"),
          link("Hilfe", "/hilfe", "footer"),
          link("Kontakt", "#main", "header"),
          link("Universal Credit", "/kontakt/universal-credit", "main"),
          link("Call us", "tel:+420123", "footer"),
          link("Sitemap", "/sitemap.xml", "footer"),
          link("", "/icon", "main"),
        ],
        {
          buttons: [{ labelled: false, snippet: "<button>", text: "Buy" }],
          search: true,
          structuredTypes: ["Product"],
        }
      )
    );

    expect(summary).toEqual({
      help: [
        {
          href: "https://shop.example/hilfe",
          landmark: "footer",
          position: 3,
          text: "Hilfe",
        },
        {
          href: "tel:+420123",
          landmark: "footer",
          position: 6,
          text: "Call us",
        },
      ],
      linkCount: 9,
      names: [
        { href: "https://shop.example/shop", kind: "link", text: "Shop" },
        { href: "https://shop.example/", kind: "link", text: "Logo" },
        { href: "https://shop.example/p/red", kind: "link", text: "Red bike" },
        { href: "https://shop.example/hilfe", kind: "link", text: "Hilfe" },
        { href: "https://shop.example/a/", kind: "link", text: "Kontakt" },
        {
          href: "https://shop.example/kontakt/universal-credit",
          kind: "link",
          text: "Universal Credit",
        },
        { href: "tel:+420123", kind: "link", text: "Call us" },
        {
          href: "https://shop.example/sitemap.xml",
          kind: "link",
          text: "Sitemap",
        },
        { href: null, kind: "button", text: "Buy" },
      ],
      navigation: [
        {
          href: "https://shop.example/shop",
          landmark: "nav",
          position: 0,
          text: "Shop",
        },
        {
          href: "https://shop.example/",
          landmark: "header",
          position: 1,
          text: "Logo",
        },
        {
          href: "https://shop.example/a/",
          landmark: "header",
          position: 4,
          text: "Kontakt",
        },
      ],
      role: "entered",
      search: true,
      sitemap: true,
      structuredTypes: ["Product"],
      truncated: false,
      url: "https://shop.example/a/",
    });
  });
});

const titled = (title: string): PageEvidence => evidenceWith([], { title });

const reader = Layer.succeed(PageReader, PageReader.of({ read: titled }));

const PDF: Scripted = {
  body: "%PDF",
  headers: { "content-type": "application/pdf" },
};

const SITE = new Map<string, Scripted>([
  ["https://sunnybikes.eu/accessibility", html("Statement")],
  ["https://sunnybikes.eu/contact", { status: 503 }],
  ["https://sunnybikes.eu/products/bike", PDF],
  ["https://sunnybikes.eu/login", redirectTo("https://id.othershop.eu/login")],
  ["https://id.othershop.eu/login", html("Sign in")],
]);

describe("crawlSite", () => {
  it.effect(
    "reads each picked page through SafeFetch and types every failure",
    () =>
      Effect.gen(function* crawlsFourPages() {
        const requests: HopRequest[] = [];

        const crawl = yield* crawlSite(
          "https://sunnybikes.eu/",
          evidenceWith([
            link("Accessibility", "/accessibility"),
            link("Contact", "/contact"),
            link("Bike", "/products/bike"),
            link("Log in", "/login"),
          ])
        ).pipe(
          Effect.provide(
            Layer.merge(
              scriptedFetch((url) => SITE.get(url), requests),
              reader
            )
          )
        );

        expect(
          crawl.site.pages.map((page) => [
            page.role,
            page.outcome,
            "reason" in page ? page.reason : null,
          ])
        ).toEqual([
          ["statement", "read", null],
          ["contact", "failed", "http_error"],
          ["product", "failed", "not_html"],
          ["sign_in", "failed", "off_site"],
        ]);
        expect(crawl.read.map(({ evidence }) => evidence.title)).toEqual([
          "Statement",
        ]);
        expect(
          crawl.site.summaries.map(({ role, url }) => [role, url])
        ).toEqual([
          ["entered", "https://sunnybikes.eu/"],
          ["statement", "https://sunnybikes.eu/accessibility"],
        ]);
        expect(requests).toHaveLength(5);
      })
  );
});
