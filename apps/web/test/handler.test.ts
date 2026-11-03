import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";

import {
  CALLER_HEADER,
  RPC_METHOD_ONLY,
  UNREADABLE_RPC,
  TOO_MANY,
  callerKey,
  limitedProcedures,
  websiteHandler,
} from "../src/server/handler.js";
import type { LimitedProcedure } from "../src/server/handler.js";

const rpcBody = (tag: string) =>
  JSON.stringify({
    headers: [],
    id: "1",
    payload: { url: "https://www.example.com/" },
    tag,
  });

const rpcRequest = (tag: string, ip = "203.0.113.7") =>
  new Request("https://eaa.example/rpc", {
    body: rpcBody(tag),
    headers: { "cf-connecting-ip": ip },
    method: "POST",
  });

const handlerWith = (budget: number) => {
  const seen: [LimitedProcedure, string][] = [];
  const forwarded: (string | null)[] = [];
  const used = new Map<string, number>();

  const handle = websiteHandler(
    // @effect-diagnostics-next-line asyncFunction:off -- The fakes stand in for Promise-returning Worker bindings.
    async (request) => {
      forwarded.push(request.headers.get(CALLER_HEADER));

      return await Promise.resolve(new Response("rpc"));
    },
    // @effect-diagnostics-next-line asyncFunction:off -- The fakes stand in for Promise-returning Worker bindings.
    async () => await Promise.resolve(new Response("asset")),
    // @effect-diagnostics-next-line asyncFunction:off -- The fakes stand in for Promise-returning Worker bindings.
    async (procedure, caller) => {
      const count = (used.get(`${procedure}:${caller}`) ?? 0) + 1;

      seen.push([procedure, caller]);
      used.set(`${procedure}:${caller}`, count);

      return await Promise.resolve(count <= budget);
    }
  );

  const respond = (request: Request) =>
    // @effect-diagnostics-next-line asyncFunction:off -- The handler under test is a Promise boundary.
    Effect.promise(async () => await handle(request));

  const text = (request: Request) =>
    respond(request).pipe(
      Effect.flatMap((response) =>
        // @effect-diagnostics-next-line asyncFunction:off -- Response.text is a Promise boundary.
        Effect.promise(async () => await response.text())
      )
    );

  return { forwarded, respond, seen, text };
};

describe("per-caller limits in the website Worker", () => {
  it("reads which limited procedures an RPC body calls", () => {
    expect(limitedProcedures(rpcBody("startScan"))).toEqual(["startScan"]);
    expect(
      limitedProcedures(`[${rpcBody("sendMessage")},${rpcBody("getScan")}]`)
    ).toEqual(["sendMessage"]);
    expect(limitedProcedures(rpcBody("getScan"))).toEqual([]);
    expect(limitedProcedures("not json")).toEqual([]);
  });

  it.effect(
    "answers 429 once one address passes its limit, and lets another address through",
    () =>
      Effect.gen(function* limitsOneAddress() {
        const { respond, seen, text } = handlerWith(2);

        const statuses = yield* Effect.forEach(
          ["203.0.113.7", "203.0.113.7", "203.0.113.7", "198.51.100.1"],
          (ip) =>
            respond(rpcRequest("startScan", ip)).pipe(
              Effect.map((response) => response.status)
            )
        );

        expect(statuses).toEqual([200, 200, 429, 200]);
        expect(yield* text(rpcRequest("startScan"))).toBe(TOO_MANY);
        expect(seen[0]).toEqual(["startScan", "203.0.113.7"]);
      })
  );

  it.effect("does not count reading a scan or loading the page", () =>
    Effect.gen(function* countsOnlyLimited() {
      const { respond, seen, text } = handlerWith(0);

      const read = yield* respond(rpcRequest("getScan"));

      expect(read.status).toBe(200);
      expect(yield* text(new Request("https://eaa.example/"))).toBe("asset");
      expect(seen).toEqual([]);
    })
  );

  it.effect("refuses every method other than POST on the RPC path", () =>
    Effect.gen(function* refusesMethods() {
      const { respond, seen, text } = handlerWith(100);

      const put = new Request("https://eaa.example/rpc", {
        body: rpcBody("startScan"),
        method: "PUT",
      });

      const refused = yield* respond(put);

      expect(refused.status).toBe(405);
      expect(
        yield* text(new Request("https://eaa.example/rpc", { method: "GET" }))
      ).toBe(RPC_METHOD_ONLY);
      expect(seen).toEqual([]);
    })
  );

  it("keys an IPv6 caller by its /64 and an IPv4 caller by its address", () => {
    expect(callerKey("203.0.113.7")).toBe("203.0.113.7");
    expect(callerKey("2001:db8:1:2:aaaa:bbbb:cccc:dddd")).toBe(
      "2001:db8:1:2::/64"
    );
    expect(callerKey("2001:DB8:1:2::1")).toBe("2001:db8:1:2::/64");
    expect(callerKey("2001:db8::1")).toBe("2001:db8:0:0::/64");
    expect(callerKey("2001:0db8:0001:0002:0:0:0:9")).toBe("2001:db8:1:2::/64");
  });

  it.effect(
    "tells the scanner who called, overriding any header the visitor sent",
    () =>
      Effect.gen(function* forwardsCaller() {
        const { forwarded, respond } = handlerWith(100);

        const spoofed = new Request("https://eaa.example/rpc", {
          body: rpcBody("startScan"),
          headers: {
            "cf-connecting-ip": "2001:db8:1:2::99",
            [CALLER_HEADER]: "someone-else",
          },
          method: "POST",
        });

        yield* respond(spoofed);

        expect(forwarded).toEqual(["2001:db8:1:2::/64"]);
      })
  );

  it.effect(
    "refuses a message that sets the caller header itself, and a body it cannot read",
    () =>
      Effect.gen(function* refusesSpoofedMessage() {
        const { forwarded, respond, seen, text } = handlerWith(100);

        const spoofed = new Request("https://eaa.example/rpc", {
          body: JSON.stringify({
            headers: [["X-EAA-Caller", "victim"]],
            id: "1",
            payload: { url: "https://www.example.com/" },
            tag: "startScan",
          }),
          headers: { "cf-connecting-ip": "203.0.113.7" },
          method: "POST",
        });

        const refused = yield* respond(spoofed);

        expect(refused.status).toBe(400);
        expect(
          yield* text(
            new Request("https://eaa.example/rpc", {
              body: "not json",
              method: "POST",
            })
          )
        ).toBe(UNREADABLE_RPC);
        expect([forwarded, seen]).toEqual([[], []]);
      })
  );
});
