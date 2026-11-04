// @effect-diagnostics nodeBuiltinImport:off -- zlib decoders are Node Duplex streams; NodeStream.pipeThroughDuplex takes that type.
import type { Transform } from "node:stream";
import {
  createBrotliDecompress,
  createGunzip,
  createInflate,
  createZstdDecompress,
} from "node:zlib";

import { NodeStream } from "@effect/platform-node";
import { TransportFailure } from "@good-a11y/core";
import type { HopResponse } from "@good-a11y/core";
import { Stream } from "effect";

const DECODERS = new Map<string, () => Transform>([
  ["br", createBrotliDecompress],
  ["deflate", createInflate],
  ["gzip", createGunzip],
  ["x-gzip", createGunzip],
  ["zstd", createZstdDecompress],
]);

const failed = (detail: string) =>
  new TransportFailure({ detail, kind: "unknown" });

const encodingsOf = (response: HopResponse): readonly string[] =>
  (response.headers["content-encoding"] ?? "")
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter((part) => part !== "" && part !== "identity");

export const decompressed = (response: HopResponse): HopResponse => {
  const encodings = encodingsOf(response);
  const unknown = encodings.find((encoding) => !DECODERS.has(encoding));

  if (unknown !== undefined) {
    return {
      ...response,
      body: Stream.fail(
        failed(
          `The server sent the body in an encoding it may not use: ${unknown}.`
        )
      ),
    };
  }

  let { body } = response;

  for (const encoding of encodings.toReversed()) {
    body = NodeStream.pipeThroughDuplex(body, {
      evaluate: DECODERS.get(encoding) ?? createGunzip,
      onError: () => failed(`The ${encoding} body could not be decompressed.`),
    });
  }

  return { ...response, body };
};
