import { describe, expect, it } from "@effect/vitest";
import { Option } from "effect";
import { fromString } from "foldkit/url";

import {
  AppRoute,
  checkRouter,
  parseRoute,
  reportSlugOf,
  scanRouter,
} from "../src/features/route.js";
import { init } from "../src/features/update.js";

const routeOf = (href: string) =>
  Option.map(fromString(href), parseRoute).pipe(Option.getOrThrow);

describe("report routes", () => {
  it("reads the scan ID from a shared report link", () => {
    expect(routeOf("https://eaa.example/check/shop.example/1793-abc")).toEqual(
      AppRoute.Scan({ scanId: "1793-abc", slug: "shop.example" })
    );
  });

  it("builds the link a visitor lands on after starting a scan", () => {
    const href = scanRouter({ scanId: "1793-abc", slug: "shop.example" });

    expect(routeOf(`https://eaa.example${href}`)).toEqual(
      AppRoute.Scan({ scanId: "1793-abc", slug: "shop.example" })
    );
  });

  it("keeps the host-only link for the newest scan of a site", () => {
    expect(routeOf("https://eaa.example/check/shop.example")).toEqual(
      AppRoute.Report({ slug: "shop.example" })
    );
  });

  it("names the site of either report route", () => {
    expect(
      [
        AppRoute.Report({ slug: "Shop.example" }),
        AppRoute.Scan({ scanId: "x", slug: "shop.example" }),
        AppRoute.Check({}),
      ].map(reportSlugOf)
    ).toEqual([
      Option.some("shop.example"),
      Option.some("shop.example"),
      Option.none(),
    ]);
  });
});

const FLAGS = { maybeScan: Option.none(), origin: "https://eaa.example" };

describe("the check page", () => {
  it("fills the address field from the link a failed report gives", () => {
    const href = `https://eaa.example${checkRouter({ url: "https://shop.example/a?b=1" })}`;

    expect(routeOf(href)).toEqual(
      AppRoute.Check({ url: "https://shop.example/a?b=1" })
    );
    expect(
      Option.map(fromString(href), (url) => init(FLAGS, url).model.url).pipe(
        Option.getOrThrow
      )
    ).toBe("https://shop.example/a?b=1");
  });

  it("starts with an empty field without the parameter", () => {
    expect(routeOf("https://eaa.example/check")).toEqual(AppRoute.Check({}));
  });
});

describe("the guide pages", () => {
  it("reads the guide ID from its address", () => {
    expect(routeOf("https://eaa.example/dialog-modal")).toEqual(
      AppRoute.Guide({ guideId: "dialog-modal" })
    );
    expect(routeOf("https://eaa.example/")).toEqual(AppRoute.Home());
  });
});
