import {
  DEFAULT_MAX_REDIRECTS,
  RenderedAuditFailed,
  vetUrl,
} from "@eaa-check/core";
import type { HeaderMap } from "@eaa-check/core";
import { Effect, Result } from "effect";

export interface Landing {
  readonly headers: HeaderMap;
  readonly status: number | null;
}

export interface BrowserSession {
  readonly close: Effect.Effect<void, RenderedAuditFailed>;
  readonly html: Effect.Effect<string, RenderedAuditFailed>;
  readonly open: (url: string) => Effect.Effect<Landing, RenderedAuditFailed>;
  readonly probe: Effect.Effect<string, RenderedAuditFailed>;
  readonly runAxe: Effect.Effect<unknown, RenderedAuditFailed>;
  readonly url: Effect.Effect<string>;
}

export const navigationAllowed = (url: string, redirects: number): boolean =>
  redirects <= DEFAULT_MAX_REDIRECTS && Result.isSuccess(vetUrl(url));

export const landedOn = (
  session: BrowserSession
): Effect.Effect<void, RenderedAuditFailed> =>
  session.url.pipe(
    Effect.flatMap((url) =>
      Result.isSuccess(vetUrl(url))
        ? Effect.void
        : Effect.fail(
            new RenderedAuditFailed({
              detail: `The browser ended up on ${url.slice(0, 200)}, which vetUrl refuses.`,
              kind: "navigation",
            })
          )
    )
  );

export type LaunchSession = Effect.Effect<BrowserSession, RenderedAuditFailed>;

export type OnClose = (closed: boolean) => Effect.Effect<void>;

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
