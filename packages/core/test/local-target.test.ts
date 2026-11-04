import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, Result } from "effect";

import {
  HopTransport,
  isPrivateTarget,
  LocalHopTransport,
  SafeFetch,
  parseLocalTarget,
  parseScanTarget,
  vetLocalUrl,
} from "../src/index.js";
import type { HopRequest, VettedUrl } from "../src/index.js";
import { html, redirectTo, scriptedOpen } from "./support.js";
import type { Site } from "./support.js";

const localFetch = (
  site: Site,
  requests: HopRequest<VettedUrl>[],
  url: string
) =>
  SafeFetch.use((safeFetch) =>
    safeFetch.fetch(url, { userAgent: "test-agent" })
  ).pipe(
    Effect.provide(
      SafeFetch.localLayer.pipe(
        Layer.provide(
          Layer.succeed(
            LocalHopTransport,
            LocalHopTransport.of({ open: scriptedOpen(site, requests) })
          )
        )
      )
    )
  );

describe("the local check's target", () => {
  it.effect.each([
    { typed: "localhost:5173", url: "http://localhost:5173/" },
    { typed: "localhost:3000/cart?x=1", url: "http://localhost:3000/cart?x=1" },
    { typed: "127.0.0.1:8080", url: "http://127.0.0.1:8080/" },
    { typed: "app.localhost", url: "http://app.localhost/" },
    { typed: "devbox:4000", url: "http://devbox:4000/" },
    { typed: "[::1]:3000", url: "http://[::1]:3000/" },
    { typed: "example.com", url: "https://example.com/" },
    { typed: "https://localhost:8443/", url: "https://localhost:8443/" },
  ])("reads $typed as $url", ({ typed, url }) =>
    Effect.sync(() => {
      expect(Result.getOrThrow(parseLocalTarget(typed)).url).toBe(url);
    })
  );

  it.effect("still refuses what no browser should be sent to", () =>
    Effect.sync(() => {
      expect(Result.isFailure(vetLocalUrl("file:///etc/passwd"))).toBe(true);
      expect(Result.isFailure(vetLocalUrl("http://user:pw@localhost/"))).toBe(
        true
      );
      expect(Result.isFailure(parseLocalTarget("ftp://localhost/"))).toBe(true);
    })
  );

  it.effect("leaves the public scanner's vetting as strict as before", () =>
    Effect.sync(() => {
      expect(Result.isFailure(parseScanTarget("localhost:5173"))).toBe(true);
      expect(Result.isFailure(parseScanTarget("127.0.0.1"))).toBe(true);
    })
  );

  it.effect("follows a redirect between local addresses", () =>
    Effect.gen(function* followsLocalRedirect() {
      const requests: HopRequest<VettedUrl>[] = [];

      const result = yield* localFetch(
        (url) =>
          url === "http://localhost:5173/"
            ? redirectTo("http://127.0.0.1:5173/home")
            : html("<p>home</p>"),
        requests,
        "http://localhost:5173/"
      );

      expect(result.ok).toBe(true);
      expect(requests.map((request) => request.url)).toStrictEqual([
        "http://localhost:5173/",
        "http://127.0.0.1:5173/home",
      ]);
    })
  );
});

describe("the hosted transport's type", () => {
  it.effect("accepts only a PublicUrl, never a LocalUrl", () =>
    Effect.sync(() => {
      const local = Result.getOrThrow(vetLocalUrl("http://localhost:5173/"));

      const transport = HopTransport.of({
        open: scriptedOpen(() => html(""), []),
      });

      // @ts-expect-error -- HopTransport.open takes a PublicUrl; a LocalUrl from vetLocalUrl must not type-check here.
      const refused = () => transport.open({ headers: {}, url: local });

      expect(refused).toBeTypeOf("function");
    })
  );
});

describe("a target on the user's own machine or network", () => {
  it.effect.each([
    { private: true, url: "http://localhost:5173/" },
    { private: true, url: "http://app.localhost/" },
    { private: true, url: "http://127.0.0.1:8080/" },
    { private: true, url: "http://192.168.1.20/" },
    { private: true, url: "http://10.0.0.5/" },
    { private: true, url: "http://172.20.0.2/" },
    { private: true, url: "http://[::1]:3000/" },
    { private: true, url: "http://devbox:4000/" },
    { private: false, url: "http://172.32.0.1/" },
    { private: false, url: "http://8.8.8.8/" },
    { private: false, url: "https://example.com/" },
    { private: false, url: "https://localhost.example.com/" },
  ])("is $private for $url", ({ private: expected, url }) =>
    Effect.sync(() => {
      expect(isPrivateTarget(url)).toBe(expected);
    })
  );
});
