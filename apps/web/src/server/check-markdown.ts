import { parseScanTarget, slugOf } from "@good-a11y/core";
import { ScanUnavailable } from "@good-a11y/core/contracts";
import type {
  DailyCapReached,
  ScanTargetRejected,
  ScanView,
} from "@good-a11y/core/contracts";
import { Effect, Option, Result } from "effect";

import { ScanApi } from "../client/scan-api.js";
import { CLI } from "../features/agent-links.js";
import { reportRouter } from "../features/route.js";
import type { CallerLimit } from "./handler.js";
import { TOO_MANY } from "./handler.js";
import { CHECK_PATH, reportText } from "./markdown.js";
import { backendApi } from "./read-scan.js";
import type { BackendFetch } from "./rpc.js";

export const POLL_SECONDS = 10;

export const RATE_LIMIT_SECONDS = 60;

export interface CheckAnswer {
  readonly body: string;
  readonly retryAfter: number | null;
  readonly status: number;
}

const answer = (
  lines: readonly string[],
  status = 200,
  retryAfter: number | null = null
): CheckAnswer => ({ body: [...lines, ""].join("\n"), retryAfter, status });

export const checkAddress = (origin: string, input: string): string =>
  `${origin}${CHECK_PATH}?url=${encodeURIComponent(input)}`;

export const checkUsage = (origin: string): CheckAnswer =>
  answer(
    [
      "# Check a public page",
      "",
      `Add the page's address: ${checkAddress(origin, "example.com")}`,
      "",
      `The first fetch starts a scan. Fetch the same address again until the report is there. For localhost or a page behind a login, run \`${CLI} check <url>\` on your own machine.`,
    ],
    400
  );

const isRunning = (scan: ScanView): boolean =>
  scan.stage === "queued" || scan.stage === "scanning";

const running = (origin: string, input: string, scan: ScanView) =>
  answer(
    [
      `# Checking ${scan.url}`,
      "",
      `The scan is ${scan.stage}. Fetch this same URL again in ${POLL_SECONDS} seconds: ${checkAddress(origin, input)}`,
    ],
    200,
    POLL_SECONDS
  );

const settled = (origin: string, input: string, scan: ScanView) => {
  if (scan.report !== null) {
    return answer([
      reportText(scan.report, origin),
      "",
      `The same report as a page: ${origin}${reportRouter({ slug: scan.slug })}`,
    ]);
  }

  return isRunning(scan)
    ? running(origin, input, scan)
    : answer([
        `# The check of ${scan.url} failed`,
        "",
        scan.failure ?? "The scan stopped without a report.",
        "",
        `Fetch ${checkAddress(origin, input)} again later to start a new scan.`,
      ]);
};

const rejected = (error: ScanTargetRejected): CheckAnswer =>
  answer(["# Cannot check this address", "", error.message], 400);

const capReached = (error: DailyCapReached): CheckAnswer =>
  answer(["# Daily cap reached", "", error.message], 429);

const unavailable = (): CheckAnswer =>
  answer(
    [
      "# The checker is unavailable",
      "",
      new ScanUnavailable({ operation: "startScan" }).message,
    ],
    503,
    RATE_LIMIT_SECONDS
  );

export const checkPage = (
  backend: BackendFetch,
  allow: CallerLimit,
  caller: string,
  origin: string,
  input: string
): Effect.Effect<CheckAnswer> => {
  const target = parseScanTarget(input);

  if (Result.isFailure(target)) {
    return Effect.succeed(rejected(target.failure));
  }

  const slug = slugOf(target.success.url);

  return Effect.gen(function* checkOnce() {
    const api = yield* ScanApi;

    const newest = yield* api.getScan({ slug }).pipe(Effect.option);

    if (
      Option.isSome(newest) &&
      newest.value.url === target.success.url &&
      isRunning(newest.value)
    ) {
      return running(origin, input, newest.value);
    }

    const allowed = yield* Effect.promise(
      // @effect-diagnostics-next-line asyncFunction:off -- CallerLimit is a Promise boundary to Cloudflare's rate limit binding.
      async () => await allow("startScan", caller)
    );

    if (!allowed) {
      return answer(
        ["# Too many checks", "", TOO_MANY],
        429,
        RATE_LIMIT_SECONDS
      );
    }

    const started = yield* api.startScan({ url: input });

    const scan = yield* api.getScan({
      scanId: started.scanId,
      slug: started.slug,
    });

    return settled(origin, input, scan);
  }).pipe(
    Effect.provide(backendApi(backend, caller)),
    Effect.catchTags({
      DailyCapReached: (error) => Effect.succeed(capReached(error)),
      ScanTargetRejected: (error) => Effect.succeed(rejected(error)),
    }),
    Effect.catchCause(() => Effect.succeed(unavailable()))
  );
};
