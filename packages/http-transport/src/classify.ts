import { TransportFailure } from "@good-a11y/core";
import { Option, Schema } from "effect";
import type { HttpClientError } from "effect/http";

import { NOT_PUBLIC_CODE } from "./public-lookup.js";

const RuntimeFailure = Schema.Struct({
  cause: Schema.optional(
    Schema.Struct({
      code: Schema.optional(Schema.String),
      message: Schema.optional(Schema.String),
    })
  ),
  code: Schema.optional(Schema.String),
  message: Schema.optional(Schema.String),
});

const decodeRuntimeFailure = Schema.decodeUnknownOption(RuntimeFailure);

const DNS_CODES = new Set(["EAI_AGAIN", "ENOTFOUND"]);

const CONNECTION_CODES = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "EPIPE",
  "ETIMEDOUT",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_SOCKET",
]);

const TLS_CODE =
  /^(?:CERT_|DEPTH_ZERO_|ERR_SSL_|ERR_TLS_|SELF_SIGNED_|UNABLE_TO_)/u;

const kindOf = (code: string | undefined): TransportFailure["kind"] => {
  if (code === undefined) {
    return "unknown";
  }

  if (code === NOT_PUBLIC_CODE) {
    return "not_public";
  }

  if (DNS_CODES.has(code)) {
    return "dns";
  }

  if (CONNECTION_CODES.has(code)) {
    return "connection";
  }

  return TLS_CODE.test(code) ? "tls" : "unknown";
};

export const toTransportFailure = (
  error: HttpClientError.HttpClientError
): TransportFailure => {
  const runtime = Option.getOrUndefined(
    decodeRuntimeFailure(error.reason.cause)
  );

  const detail = [
    error.reason._tag,
    runtime?.message,
    runtime?.cause?.code,
    runtime?.cause?.message,
    runtime?.code,
  ]
    .filter((part) => part !== undefined)
    .join(": ");

  return new TransportFailure({
    detail,
    kind: kindOf(runtime?.cause?.code ?? runtime?.code),
  });
};
