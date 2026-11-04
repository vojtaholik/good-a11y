import { Clock, Context, DateTime, Effect, Layer, Result } from "effect";
import type { Duration } from "effect";

import { decodeBody, readCapped } from "./body.js";
import type { CappedBody } from "./body.js";
import { challengeDetail, challengeIn } from "./challenge.js";
import type {
  FetchFailure,
  FetchFailureReason,
  FetchResult,
  Redirect,
} from "./fetch-result.js";
import { HopTransport } from "./hop-transport.js";
import type { HeaderMap, OpenHop } from "./hop-transport.js";
import { LocalHopTransport } from "./local-hop-transport.js";
import { vetLocalUrl, vetUrl } from "./public-url.js";
import type { UrlRejection, VettedUrl } from "./public-url.js";
import { looksBlocked, refusalDetail } from "./refusal.js";
import type { TransportFailure } from "./transport-failure.js";

export interface FetchOptions {
  readonly accept?: string;
  readonly maxBytes?: number;
  readonly maxRedirects?: number;
  readonly timeout?: Duration.Input;
  readonly userAgent: string;
}

interface Hop {
  readonly answer: (CappedBody & { readonly headers: HeaderMap }) | undefined;
  readonly location: string | undefined;
  readonly status: number;
}

export const DEFAULT_TIMEOUT: Duration.Input = "10 seconds";

export const DEFAULT_MAX_BYTES = 2_000_000;

export const DEFAULT_MAX_REDIRECTS = 5;

const DEFAULT_ACCEPT = "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5";

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

const TRANSPORT_REASONS = {
  connection: {
    detail: "The server refused or dropped the connection.",
    reason: "connection",
  },
  dns: { detail: "The domain was not found in DNS.", reason: "dns" },
  not_public: {
    detail: "The domain resolves to a private or reserved address.",
    reason: "forbidden_host",
  },
  sandboxed: {
    detail:
      "This process may not open network connections, so a sandbox around it, such as a coding agent's, is blocking them. Run the dev server and this check outside the sandbox.",
    reason: "network",
  },
  tls: {
    detail: "A secure (HTTPS) connection could not be made.",
    reason: "tls",
  },
  unknown: {
    detail: "The connection to the server failed.",
    reason: "network",
  },
} as const satisfies Record<
  TransportFailure["kind"],
  { readonly detail: string; readonly reason: FetchFailureReason }
>;

const safeFetchOn = <Url extends VettedUrl>(
  vet: (raw: string) => Result.Result<Url, UrlRejection>,
  open: OpenHop<Url>
) => {
  const takeHop = Effect.fnUntraced(function* takeHop(
    url: Url,
    headers: HeaderMap,
    maxBytes: number
  ) {
    const response = yield* open({ headers, url });
    const { location } = response.headers;

    if (REDIRECT_STATUSES.has(response.status) && location !== undefined) {
      const redirect: Hop = {
        answer: undefined,
        location,
        status: response.status,
      };

      return redirect;
    }

    const body = yield* readCapped(response.body, maxBytes);

    const answered: Hop = {
      answer: { ...body, headers: response.headers },
      location: undefined,
      status: response.status,
    };

    return answered;
  }, Effect.scoped);

  const fetch = Effect.fn("SafeFetch.fetch")(function* fetch(
    rawUrl: string,
    options: FetchOptions
  ) {
    const started = yield* Clock.currentTimeMillis;
    const observedAt = DateTime.formatIso(DateTime.makeUnsafe(started));
    const maxRedirects = options.maxRedirects ?? DEFAULT_MAX_REDIRECTS;
    const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
    const redirects: Redirect[] = [];

    const headers = {
      accept: options.accept ?? DEFAULT_ACCEPT,
      "accept-language": "en;q=0.9,*;q=0.5",
      "user-agent": options.userAgent,
    };

    const failed = (
      reason: FetchFailureReason,
      detail: string,
      extra?: Pick<FetchFailure, "cause" | "challenge" | "status">
    ): FetchResult => ({
      detail,
      observedAt,
      ok: false,
      reason,
      redirects: [...redirects],
      requestedUrl: rawUrl,
      ...extra,
    });

    const walk = Effect.gen(function* walk() {
      const visited = new Set<string>();
      let current = rawUrl;

      for (let hops = 0; hops <= maxRedirects; hops += 1) {
        const vetted = vet(current);

        if (Result.isFailure(vetted)) {
          return failed(
            hops === 0 ? "invalid_url" : "forbidden_host",
            vetted.failure.reason
          );
        }

        const url = vetted.success;

        if (visited.has(url)) {
          return failed("redirect_loop", `A redirect leads back to ${url}.`);
        }

        visited.add(url);

        const taken = yield* Effect.result(takeHop(url, headers, maxBytes));

        if (Result.isFailure(taken)) {
          const { detail, reason } = TRANSPORT_REASONS[taken.failure.kind];

          return failed(reason, detail, { cause: taken.failure.detail });
        }

        const { answer, location, status } = taken.success;

        if (answer === undefined) {
          if (location === undefined || !URL.canParse(location, url)) {
            return failed(
              "bad_redirect",
              "The server sent a redirect without a valid target address.",
              { status }
            );
          }

          const next = new URL(location, url).href;
          redirects.push({ from: url, status, to: next });
          current = next;
        } else {
          const contentType = answer.headers["content-type"] ?? "";
          const { charset, text } = decodeBody(contentType, answer.bytes);

          if (looksBlocked(status, answer.headers, text)) {
            const challenge = challengeIn(answer.headers, text);

            return challenge === undefined
              ? failed("blocked", refusalDetail(status), { status })
              : failed("blocked", challengeDetail(challenge, status), {
                  challenge,
                  status,
                });
          }

          const finished = yield* Clock.currentTimeMillis;

          const success: FetchResult = {
            body: text,
            bodyBytes: answer.bytes.byteLength,
            charset,
            contentType,
            durationMs: finished - started,
            finalUrl: url,
            headers: answer.headers,
            observedAt,
            ok: true,
            redirects: [...redirects],
            requestedUrl: rawUrl,
            status,
            truncated: answer.truncated,
          };

          return success;
        }
      }

      return failed(
        "too_many_redirects",
        `More than ${maxRedirects} redirects.`
      );
    });

    return yield* walk.pipe(
      Effect.timeoutOrElse({
        duration: options.timeout ?? DEFAULT_TIMEOUT,
        orElse: () =>
          Effect.succeed(
            failed("timeout", "The server did not answer in time.")
          ),
      })
    );
  });

  return { fetch } as const;
};

export class SafeFetch extends Context.Service<
  SafeFetch,
  {
    readonly fetch: (
      rawUrl: string,
      options: FetchOptions
    ) => Effect.Effect<FetchResult>;
  }
>()("@good-a11y/core/SafeFetch") {
  static readonly layer = Layer.effect(
    this,
    HopTransport.pipe(Effect.map(({ open }) => safeFetchOn(vetUrl, open)))
  );

  static readonly localLayer = Layer.effect(
    this,
    LocalHopTransport.pipe(
      Effect.map(({ open }) => safeFetchOn(vetLocalUrl, open))
    )
  );
}
