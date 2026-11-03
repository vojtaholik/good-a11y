// @effect-diagnostics nodeBuiltinImport:off -- The test builds compressed bodies with node:zlib.
import { brotliCompressSync, gzipSync } from "node:zlib";

import { TransportFailure } from "@eaa-check/core";
import type { HopResponse } from "@eaa-check/core";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Stream } from "effect";

import { decompressed } from "../src/decompress.js";

const HTML = '<!doctype html><html lang="cs"><title>Seznam</title></html>';

const responseOf = (
  body: Uint8Array,
  encoding: string | null
): HopResponse => ({
  body: Stream.make(body),
  headers: encoding === null ? {} : { "content-encoding": encoding },
  status: 200,
});

const textOf = (response: HopResponse) =>
  Stream.runCollect(decompressed(response).body).pipe(
    Effect.map((chunks) => Buffer.concat([...chunks]).toString("utf-8"))
  );

describe("decompressed", () => {
  it.effect("reads a gzip body the server sent unasked", () =>
    Effect.gen(function* gzip() {
      expect(yield* textOf(responseOf(gzipSync(HTML), "gzip"))).toBe(HTML);
    })
  );

  it.effect("reads a brotli body", () =>
    Effect.gen(function* brotli() {
      expect(yield* textOf(responseOf(brotliCompressSync(HTML), "br"))).toBe(
        HTML
      );
    })
  );

  it.effect("passes a plain body through", () =>
    Effect.gen(function* plain() {
      expect(yield* textOf(responseOf(Buffer.from(HTML), null))).toBe(HTML);
    })
  );

  it.effect("fails with a named transport failure on a broken body", () =>
    Effect.gen(function* broken() {
      const error = yield* Effect.flip(
        textOf(responseOf(Buffer.from("not gzip"), "gzip"))
      );

      expect(error).toBeInstanceOf(TransportFailure);
    })
  );

  it.effect("fails on an encoding it does not know", () =>
    Effect.gen(function* unknown() {
      const error = yield* Effect.flip(
        textOf(responseOf(Buffer.from(HTML), "compress"))
      );

      expect(error.detail).toContain("compress");
    })
  );
});
