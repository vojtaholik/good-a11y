import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";

import { step } from "../src/browser-session.js";

describe("a browser step", () => {
  it.effect(
    "calls the bound puppeteer method with no extra argument, so an abort signal never lands in an optional parameter",
    () =>
      Effect.gen(function* passesNothing() {
        const received = yield* step(
          "browser",
          // @effect-diagnostics-next-line asyncFunction:off -- Stands in for a bound puppeteer method, which returns a Promise.
          async (...args: readonly []) => args.length // oxlint-disable-line require-await -- The stand-in only returns a Promise of the arguments it got.
        );

        expect(received).toBe(0);
      })
  );
});
