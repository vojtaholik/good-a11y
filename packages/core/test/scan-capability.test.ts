import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer } from "effect";

import { PageReader, scanUrl } from "../src/index.js";
import type { HopRequest, PageEvidence } from "../src/index.js";
import { html, scriptedFetch } from "./support.js";
import type { Scripted } from "./support.js";

const evidenceOf = (body: string): PageEvidence => ({
  buttons: [],
  controls: [],
  frames: [],
  headings: [],
  images: [],
  labelTargets: [],
  labels: [],
  lang: "en",
  links:
    body === "Home"
      ? [
          {
            context: "",
            href: "/contact",
            labelled: false,
            landmark: "nav",
            language: false,
            snippet: '<a href="/contact">',
            text: "Contact",
          },
        ]
      : [],
  passages: [],
  prices: [],
  refreshes: [],
  search: false,
  structuredTypes: [],
  textSample: body,
  title: body,
  truncated: false,
  viewports: [],
});

const SITE = new Map<string, Scripted>([
  ["https://sunnybikes.eu/", html("Home")],
  ["https://sunnybikes.eu/contact", html("Contact")],
]);

describe("scanUrl", () => {
  it.effect("reads the other pages it picks and adds the site section", () =>
    Effect.gen(function* scansWithSite() {
      const requests: HopRequest[] = [];

      const report = yield* scanUrl("sunnybikes.eu").pipe(
        Effect.provide(
          Layer.merge(
            scriptedFetch((url) => SITE.get(url), requests),
            Layer.succeed(PageReader, PageReader.of({ read: evidenceOf }))
          )
        )
      );

      expect(
        report.site?.pages.map((page) => [page.role, page.outcome])
      ).toEqual([["contact", "read"]]);
      expect(requests.map((request) => request.url)).toEqual([
        "https://sunnybikes.eu/",
        "https://sunnybikes.eu/contact",
      ]);
    })
  );
});
