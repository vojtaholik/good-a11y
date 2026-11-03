import { describe, expect, it } from "@effect/vitest";
import { Option } from "effect";
import { fromString } from "foldkit/url";

import {
  AppRoute,
  parseRoute,
  reportSlugOf,
  scanRouter,
} from "../src/features/route.js";

const routeOf = (href: string) =>
  Option.map(fromString(href), parseRoute).pipe(Option.getOrThrow);

describe("report routes", () => {
  it("reads the scan ID from a shared report link", () => {
    expect(routeOf("https://eaa.example/report/shop.example/1793-abc")).toEqual(
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
    expect(routeOf("https://eaa.example/report/shop.example")).toEqual(
      AppRoute.Report({ slug: "shop.example" })
    );
  });

  it("names the site of either report route", () => {
    expect(
      [
        AppRoute.Report({ slug: "Shop.example" }),
        AppRoute.Scan({ scanId: "x", slug: "shop.example" }),
        AppRoute.Checks(),
      ].map(reportSlugOf)
    ).toEqual([
      Option.some("shop.example"),
      Option.some("shop.example"),
      Option.none(),
    ]);
  });
});
