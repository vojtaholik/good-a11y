import { Result, Schema } from "effect";

import { vetLocalUrl, vetUrl } from "./public-url.js";
import type { UrlVet } from "./public-url.js";
import { ScanTargetRejected } from "./scan-target-rejected.js";

export const ScanTargetSchema = Schema.Struct({
  schemeGuessed: Schema.Boolean,
  url: Schema.String,
});

export type ScanTarget = typeof ScanTargetSchema.Type;

const HAS_SCHEME = /^[a-z][a-z\d+.-]*:\/\//iu;

const LOCAL_HOST =
  /^(?:localhost|[^/:]+\.localhost|\d{1,3}(?:\.\d{1,3}){3}|\[[\da-f:.]+\]|[^/:.]+)(?::\d+)?(?:[/?#]|$)/iu;

const HAS_PORT = /^[^/]+:\d+(?:[/?#]|$)/u;

const targetOf = (
  input: string,
  vet: UrlVet,
  guessScheme: (typed: string) => string
): Result.Result<ScanTarget, ScanTargetRejected> => {
  const typed = input.trim();
  const schemeGuessed = !HAS_SCHEME.test(typed);

  const vetted = vet(
    schemeGuessed ? `${guessScheme(typed)}://${typed}` : typed
  );

  if (Result.isFailure(vetted)) {
    return Result.fail(
      new ScanTargetRejected({
        input,
        reason: vetted.failure.reason,
        rule: vetted.failure.rule,
      })
    );
  }

  return Result.succeed({ schemeGuessed, url: vetted.success });
};

export const parseScanTarget = (
  input: string
): Result.Result<ScanTarget, ScanTargetRejected> =>
  targetOf(input, vetUrl, () => "https");

export const parseLocalTarget = (
  input: string
): Result.Result<ScanTarget, ScanTargetRejected> =>
  targetOf(input, vetLocalUrl, (typed) =>
    LOCAL_HOST.test(typed) || HAS_PORT.test(typed) ? "http" : "https"
  );
