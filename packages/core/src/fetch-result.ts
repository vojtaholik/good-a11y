import { Schema } from "effect";

import { ChallengeSystemSchema } from "./challenge.js";

export const FetchFailureReasonSchema = Schema.Literals([
  "invalid_url",
  "forbidden_host",
  "blocked",
  "timeout",
  "too_many_redirects",
  "redirect_loop",
  "bad_redirect",
  "dns",
  "tls",
  "connection",
  "network",
]);

export type FetchFailureReason = typeof FetchFailureReasonSchema.Type;

const HttpStatus = Schema.Int.check(
  Schema.isBetween({ maximum: 999, minimum: 100 })
);

const Count = Schema.Int.check(Schema.isGreaterThanOrEqualTo(0));

const HeaderName = Schema.String.check(
  Schema.isPattern(/^[\w!#$%&'*+.^`|~-]+$/u)
);

export const RedirectSchema = Schema.Struct({
  from: Schema.String,
  status: HttpStatus,
  to: Schema.String,
});

export type Redirect = typeof RedirectSchema.Type;

export const FetchSuccessSchema = Schema.Struct({
  body: Schema.String,
  bodyBytes: Schema.optionalKey(Count),
  charset: Schema.optionalKey(Schema.String),
  contentType: Schema.String,
  durationMs: Count,
  finalUrl: Schema.String,
  headers: Schema.Record(HeaderName, Schema.String),
  observedAt: Schema.String,
  ok: Schema.Literal(true),
  redirects: Schema.Array(RedirectSchema),
  requestedUrl: Schema.String,
  status: HttpStatus,
  truncated: Schema.Boolean,
});

export type FetchSuccess = typeof FetchSuccessSchema.Type;

export const FetchFailureSchema = Schema.Struct({
  cause: Schema.optionalKey(Schema.String),
  challenge: Schema.optionalKey(ChallengeSystemSchema),
  detail: Schema.String,
  observedAt: Schema.String,
  ok: Schema.Literal(false),
  reason: FetchFailureReasonSchema,
  redirects: Schema.Array(RedirectSchema),
  requestedUrl: Schema.String,
  status: Schema.optionalKey(HttpStatus),
});

export type FetchFailure = typeof FetchFailureSchema.Type;

export const FetchResultSchema = Schema.Union([
  FetchSuccessSchema,
  FetchFailureSchema,
]);

export type FetchResult = typeof FetchResultSchema.Type;
