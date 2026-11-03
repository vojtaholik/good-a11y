import { RenderedAuditFailed } from "@eaa-check/core";
import type { HeaderMap } from "@eaa-check/core";
import { Effect } from "effect";

export interface Landing {
  readonly headers: HeaderMap;
  readonly status: number | null;
}

export interface BrowserSession {
  readonly close: Effect.Effect<void>;
  readonly html: Effect.Effect<string, RenderedAuditFailed>;
  readonly open: (url: string) => Effect.Effect<Landing, RenderedAuditFailed>;
  readonly runAxe: Effect.Effect<unknown, RenderedAuditFailed>;
}

export type LaunchSession = Effect.Effect<BrowserSession, RenderedAuditFailed>;

export const step = <A>(
  kind: RenderedAuditFailed["kind"],
  run: () => Promise<A>
): Effect.Effect<A, RenderedAuditFailed> =>
  Effect.tryPromise({
    catch: (cause) =>
      new RenderedAuditFailed({
        detail: cause instanceof Error ? cause.message : String(cause),
        kind,
      }),
    // @effect-diagnostics-next-line asyncFunction:off -- Calls the bound puppeteer method with no argument, so tryPromise's abort signal never lands in an optional parameter such as setUserAgent's metadata.
    try: async () => await run(),
  });
