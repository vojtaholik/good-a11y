import { describe, expect, it } from "@effect/vitest";
import { DEFAULT_MAX_BYTES, SafeFetch } from "@good-a11y/core";
import { Effect, Layer } from "effect";
import { FetchHttpClient } from "effect/http";

import { httpHopTransportLayer } from "../src/index.js";

interface Call {
  readonly headers: Headers;
  readonly redirect: RequestInit["redirect"];
  readonly url: string;
}

const recordingFetch =
  (calls: Call[], respond: (url: string) => Response | Error): typeof fetch =>
  // oxlint-disable-next-line typescript/promise-function-async -- A fetch double has to return a Promise, and the Effect diagnostics forbid async functions.
  (input, init) => {
    const url = input instanceof URL ? input.href : new Request(input).url;

    calls.push({
      headers: new Headers(init?.headers),
      redirect: init?.redirect,
      url,
    });

    const answer = respond(url);

    return answer instanceof Error
      ? Promise.reject(answer)
      : Promise.resolve(answer);
  };

const safeFetchOver = (fake: typeof fetch) =>
  SafeFetch.layer.pipe(
    Layer.provide(httpHopTransportLayer),
    Layer.provide(Layer.succeed(FetchHttpClient.Fetch, fake))
  );

const fetchHome = (fake: typeof fetch, maxBytes = DEFAULT_MAX_BYTES) =>
  SafeFetch.use((safeFetch) =>
    safeFetch.fetch("https://example.com/", {
      maxBytes,
      userAgent: "test-agent",
    })
  ).pipe(Effect.provide(safeFetchOver(fake)));

describe("the HTTP hop transport", () => {
  it.effect(
    "never lets the runtime follow a redirect, and sends no tracing headers",
    () =>
      Effect.gen(function* keepsRedirectsManual() {
        const calls: Call[] = [];

        const fake = recordingFetch(calls, (url) =>
          url === "https://example.com/"
            ? new Response(null, {
                headers: { location: "https://www.example.com/" },
                status: 301,
              })
            : new Response("<p>ok</p>", {
                headers: { "Content-Type": "text/html" },
              })
        );

        const result = yield* fetchHome(fake);

        expect(result).toMatchObject({
          contentType: "text/html",
          finalUrl: "https://www.example.com/",
          ok: true,
          status: 200,
        });
        expect(calls.map((call) => call.redirect)).toStrictEqual([
          "manual",
          "manual",
        ]);
        expect(
          calls.map((call) => call.headers.get("user-agent"))
        ).toStrictEqual(["test-agent", "test-agent"]);
        expect(
          calls
            .flatMap((call) => [...call.headers.keys()])
            .filter((name) =>
              /^(?:traceparent|tracestate|b3|x-b3-.*)$/u.test(name)
            )
        ).toStrictEqual([]);
      })
  );

  it.effect("cancels a body that never ends once the cap is reached", () =>
    Effect.gen(function* cancelsEndlessBody() {
      const state = { cancelled: false };

      const endless = new ReadableStream<Uint8Array>({
        cancel: () => {
          state.cancelled = true;
        },
        pull: (controller) => {
          controller.enqueue(new Uint8Array(64_000).fill(97));
        },
      });

      const result = yield* fetchHome(
        recordingFetch([], () => new Response(endless)),
        100_000
      );

      expect(result).toMatchObject({
        bodyBytes: 100_000,
        ok: true,
        truncated: true,
      });
      expect(state.cancelled).toBe(true);
    })
  );

  it.effect.each([
    ["ENOTFOUND", "dns"],
    ["ECONNREFUSED", "connection"],
    ["CERT_HAS_EXPIRED", "tls"],
    ["EPERM", "network"],
    ["SOMETHING_NEW", "network"],
  ] as const)(
    "reports the runtime's %s as a %s failure and keeps the code",
    ([code, reason]) =>
      Effect.gen(function* classifiesFailure() {
        const refused = Object.assign(new Error(`connect ${code}`), { code });

        const result = yield* fetchHome(
          recordingFetch(
            [],
            () => new TypeError("fetch failed", { cause: refused })
          )
        );

        expect(result).toMatchObject({ ok: false, reason });
        expect(result.ok ? "" : result.cause).toContain(code);
      })
  );
});
