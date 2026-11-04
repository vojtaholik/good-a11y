import { describe, expect, it } from "@effect/vitest";
import { Effect, Fiber, Layer, Schema, Stream } from "effect";
import { TestClock } from "effect/testing";

import { HopTransport, SafeFetch, looksBlocked } from "../src/index.js";
import type { HopRequest } from "../src/index.js";
import { html, redirectTo, scriptedFetch } from "./support.js";
import type { Scripted } from "./support.js";

const FORBIDDEN_TARGETS = [
  "http://169.254.169.254/latest/meta-data/",
  "http://localhost/admin",
  "http://[::1]/",
  "http://10.0.0.5/",
  "https://intranet.local/",
  "ftp://site0.cz/",
  // oxlint-disable-next-line no-script-url -- A redirect target the scanner must refuse; it is data here and never runs.
  "javascript:alert(1)",
  "//127.0.0.1/",
  "https://user:secret@site0.cz/",
  "https://site0.cz:8443/",
];

const MAX_NODES = 7;

const NodeIndex = Schema.Int.check(
  Schema.isBetween({ maximum: MAX_NODES - 1, minimum: 0 })
);

const Node = Schema.Union([
  Schema.Struct({ kind: Schema.Literal("answer") }),
  Schema.Struct({
    kind: Schema.Literal("redirect"),
    status: Schema.Literals([301, 302, 303, 307, 308]),
    style: Schema.Literals(["absolute", "protocol-relative"]),
    target: NodeIndex,
  }),
  Schema.Struct({
    forbidden: Schema.Literals(FORBIDDEN_TARGETS),
    kind: Schema.Literal("escape"),
  }),
]);

const Web = Schema.Struct({
  maxRedirects: Schema.Int.check(Schema.isBetween({ maximum: 6, minimum: 0 })),
  nodes: Schema.Array(Node).check(
    Schema.isMinLength(MAX_NODES),
    Schema.isMaxLength(MAX_NODES)
  ),
});

type GeneratedWeb = typeof Web.Type;

interface Walk {
  readonly outcome: string;
  readonly requested: readonly string[];
}

const urlOf = (index: number) => `https://site${index}.cz/`;

const locationOf = (node: GeneratedWeb["nodes"][number]): string => {
  if (node.kind === "escape") {
    return node.forbidden;
  }

  if (node.kind === "redirect") {
    return node.style === "absolute"
      ? urlOf(node.target)
      : `//site${node.target}.cz/`;
  }

  return "";
};

const walkModel = ({ maxRedirects, nodes }: GeneratedWeb): Walk => {
  const requested: string[] = [];
  let current = 0;

  for (let followed = 0; ; followed += 1) {
    if (requested.includes(urlOf(current))) {
      return { outcome: "redirect_loop", requested };
    }

    requested.push(urlOf(current));
    const node = nodes[current];

    if (node === undefined || node.kind === "answer") {
      return { outcome: urlOf(current), requested };
    }

    if (followed >= maxRedirects) {
      return { outcome: "too_many_redirects", requested };
    }

    if (node.kind === "escape") {
      return { outcome: "forbidden_host", requested };
    }

    current = node.target;
  }
};

const siteOf =
  ({ nodes }: GeneratedWeb) =>
  (url: string): Scripted | undefined => {
    const index = nodes.findIndex((_node, position) => urlOf(position) === url);
    const node = nodes[index];

    if (node === undefined) {
      return undefined;
    }

    return node.kind === "answer"
      ? html("<p>ok</p>")
      : redirectTo(
          locationOf(node),
          node.kind === "redirect" ? node.status : 302
        );
  };

const fetchWith = (
  site: (url: string) => Scripted | undefined,
  requests: HopRequest[],
  url = "https://site0.cz/",
  maxRedirects = 5
) =>
  SafeFetch.use((safeFetch) =>
    safeFetch.fetch(url, { maxRedirects, userAgent: "test-agent" })
  ).pipe(Effect.provide(scriptedFetch(site, requests)));

describe("SafeFetch redirects", () => {
  it.effect.prop(
    "walks any redirect graph like the reference walk, and never asks the transport for a forbidden address",
    { web: Web },
    ({ web }) =>
      Effect.gen(function* walksLikeTheModel() {
        const requests: HopRequest[] = [];
        const model = walkModel(web);

        const result = yield* fetchWith(
          siteOf(web),
          requests,
          urlOf(0),
          web.maxRedirects
        );

        expect(requests.map((request) => request.url)).toStrictEqual(
          model.requested
        );
        expect(result.ok ? result.finalUrl : result.reason).toBe(model.outcome);
        expect(requests.length).toBeLessThanOrEqual(web.maxRedirects + 1);

        if (result.ok) {
          expect(result.redirects).toHaveLength(model.requested.length - 1);
          expect(
            result.redirects.map((redirect) => redirect.from)
          ).toStrictEqual(model.requested.slice(0, -1));
        }
      }),
    { arbitrary: { runs: 1000 } }
  );

  it.effect(
    "refuses a forbidden first address without touching the network",
    () =>
      Effect.gen(function* refusesFirstAddress() {
        const requests: HopRequest[] = [];

        const result = yield* fetchWith(
          () => html("never"),
          requests,
          "http://169.254.169.254/latest/meta-data/"
        );

        expect(result).toMatchObject({ ok: false, reason: "invalid_url" });
        expect(requests).toHaveLength(0);
      })
  );

  it.effect("follows only the statuses a fetch client follows", () =>
    Effect.gen(function* followsFetchStatuses() {
      const requests: HopRequest[] = [];

      const result = yield* fetchWith(
        () => ({ headers: { location: "https://site1.cz/" }, status: 300 }),
        requests
      );

      expect(result).toMatchObject({ ok: true, status: 300 });
      expect(requests).toHaveLength(1);
    })
  );

  it.effect("names a redirect it cannot resolve", () =>
    Effect.gen(function* namesBadRedirect() {
      const result = yield* fetchWith(() => redirectTo("http://["), []);

      expect(result).toMatchObject({
        ok: false,
        reason: "bad_redirect",
        status: 302,
      });
    })
  );
});

describe("SafeFetch outcomes", () => {
  it.effect("sends the scanner's own headers on every hop", () =>
    Effect.gen(function* sendsHeaders() {
      const requests: HopRequest[] = [];

      yield* fetchWith(
        (url) =>
          url === "https://site0.cz/"
            ? redirectTo("https://site1.cz/")
            : html("<p>ok</p>"),
        requests
      );

      expect(
        requests.map((request) => request.headers["user-agent"])
      ).toStrictEqual(["test-agent", "test-agent"]);
    })
  );

  it.effect("gives up after the deadline and keeps the hops it made", () =>
    Effect.gen(function* timesOut() {
      const stalled = HopTransport.of({
        open: (request) =>
          request.url === "https://site0.cz/"
            ? Effect.succeed({
                body: Stream.empty,
                headers: { location: "https://site1.cz/" },
                status: 301,
              })
            : Effect.never,
      });

      const fiber = yield* SafeFetch.use((safeFetch) =>
        safeFetch.fetch("https://site0.cz/", { userAgent: "test-agent" })
      ).pipe(
        Effect.provide(
          SafeFetch.layer.pipe(
            Layer.provide(Layer.succeed(HopTransport, stalled))
          )
        ),
        Effect.forkChild
      );

      yield* TestClock.adjust("10 seconds");
      const result = yield* Fiber.join(fiber);

      expect(result).toMatchObject({
        ok: false,
        reason: "timeout",
        redirects: [{ from: "https://site0.cz/", to: "https://site1.cz/" }],
      });
    })
  );

  it.effect("turns a refusal into a typed failure that keeps the status", () =>
    Effect.gen(function* reportsRefusal() {
      const result = yield* fetchWith(
        () => ({ body: "Access denied", status: 403 }),
        []
      );

      expect(result).toMatchObject({
        ok: false,
        reason: "blocked",
        status: 403,
      });
    })
  );

  it.effect.each([
    ["dns", "dns"],
    ["tls", "tls"],
    ["connection", "connection"],
    ["unknown", "network"],
  ] as const)("reports a %s transport failure as %s", ([failure, reason]) =>
    Effect.gen(function* mapsTransportFailure() {
      const result = yield* fetchWith(() => ({ failure }), []);

      expect(result).toMatchObject({ cause: "scripted", ok: false, reason });
    })
  );

  it.effect("names a sandbox when the process may not open connections", () =>
    Effect.gen(function* sandboxedTransport() {
      const result = yield* fetchWith(() => ({ failure: "sandboxed" }), []);

      expect(result).toMatchObject({ ok: false, reason: "network" });
      expect(result.ok ? "" : result.detail).toContain(
        "Run the dev server and this check outside the sandbox"
      );
    })
  );
});

describe("looksBlocked", () => {
  it.prop(
    "calls 401, 403 and 429 a refusal whatever the page says",
    { body: Schema.String, status: Schema.Literals([401, 403, 429]) },
    ({ body, status }) => {
      expect(looksBlocked(status, {}, body)).toBe(true);
    }
  );

  it("reads the vendors' own challenge headers on any status", () => {
    expect(looksBlocked(200, { "cf-mitigated": "challenge" }, "")).toBe(true);
    expect(looksBlocked(202, { "x-amzn-waf-action": "challenge" }, "")).toBe(
      true
    );
  });

  it("does not call an ordinary 503 or 404 a refusal", () => {
    expect(looksBlocked(503, {}, "<h1>Údržba</h1>")).toBe(false);
    expect(looksBlocked(404, {}, "")).toBe(false);
    expect(looksBlocked(503, {}, "<title>Just a moment...</title>")).toBe(true);
  });
});
