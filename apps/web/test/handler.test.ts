import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";

import {
  TOO_MANY,
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
  const used = new Map<string, number>();

  const handle = websiteHandler(
    // @effect-diagnostics-next-line asyncFunction:off -- The fakes stand in for Promise-returning Worker bindings.
    async () => await Promise.resolve(new Response("rpc")),
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

  return { respond, seen, text };
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
});
