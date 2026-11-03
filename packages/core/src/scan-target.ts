import { Result, Schema } from "effect";

import { vetUrl } from "./public-url.js";
import { ScanTargetRejected } from "./scan-target-rejected.js";

export const ScanTargetSchema = Schema.Struct({
  schemeGuessed: Schema.Boolean,
  url: Schema.String,
});

export type ScanTarget = typeof ScanTargetSchema.Type;

const HAS_SCHEME = /^[a-z][a-z\d+.-]*:\/\//iu;

export const parseScanTarget = (
  input: string
): Result.Result<ScanTarget, ScanTargetRejected> => {
  const typed = input.trim();
  const schemeGuessed = !HAS_SCHEME.test(typed);
  const vetted = vetUrl(schemeGuessed ? `https://${typed}` : typed);

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
