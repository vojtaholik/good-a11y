import { SafeFetch } from "@eaa-check/core";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer } from "effect";

import { isPublicAddress, nodeHopTransportLayer } from "../src/node.js";

const REFUSED = [
  "127.0.0.1",
  "10.1.2.3",
  "172.16.0.1",
  "192.168.1.1",
  "169.254.169.254",
  "100.64.0.1",
  "0.0.0.0",
  "224.0.0.1",
  "255.255.255.255",
  "::1",
  "::",
  "fe80::1",
  "fd00::1",
  "ff02::1",
  "::ffff:127.0.0.1",
  "::ffff:7f00:1",
  "::ffff:a9fe:a9fe",
  "64:ff9b::a9fe:a9fe",
  "2002:7f00:1::",
];

const ALLOWED = [
  "93.184.215.14",
  "1.1.1.1",
  "2606:4700::1111",
  "::ffff:1.1.1.1",
];

describe("the Node hop transport", () => {
  it.each(REFUSED)("refuses the address %s", (address) => {
    expect(isPublicAddress(address)).toBe(false);
  });

  it.each(ALLOWED)("allows the public address %s", (address) => {
    expect(isPublicAddress(address)).toBe(true);
  });

  it.effect(
    "refuses a public name that resolves to loopback, before it connects",
    () =>
      Effect.gen(function* refusesLoopback() {
        const result = yield* SafeFetch.use((safeFetch) =>
          safeFetch.fetch("https://localtest.me/", {
            maxBytes: 1000,
            userAgent: "test-agent",
          })
        );

        expect(result).toMatchObject({ ok: false, reason: "forbidden_host" });
      }).pipe(
        Effect.provide(
          SafeFetch.layer.pipe(Layer.provide(nodeHopTransportLayer))
        )
      ),
    20_000
  );
});
