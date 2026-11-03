import { Result, Schema } from "effect";

import type { BackendFetch } from "./rpc.js";

export const isRpcPath = (pathname: string): boolean =>
  pathname === "/rpc" || pathname.startsWith("/rpc/");

export const LIMITED_PROCEDURES = ["startScan", "sendMessage"] as const;

export type LimitedProcedure = (typeof LIMITED_PROCEDURES)[number];

export type CallerLimit = (
  procedure: LimitedProcedure,
  caller: string
) => Promise<boolean>;

const RpcMessage = Schema.Struct({ tag: Schema.String });

const decodeMessages = Schema.decodeUnknownResult(
  Schema.fromJsonString(Schema.Union([RpcMessage, Schema.Array(RpcMessage)]))
);

const isLimited = (tag: string): tag is LimitedProcedure =>
  LIMITED_PROCEDURES.some((procedure) => procedure === tag);

export const limitedProcedures = (
  body: string
): readonly LimitedProcedure[] => {
  const decoded = decodeMessages(body);

  if (Result.isFailure(decoded)) {
    return [];
  }

  const messages: readonly (typeof RpcMessage.Type)[] =
    "tag" in decoded.success ? [decoded.success] : decoded.success;

  return messages.flatMap(({ tag }) => (isLimited(tag) ? [tag] : []));
};

export const TOO_MANY =
  "Too many requests from your address. Wait a minute and try again.";

const callerOf = (request: Request): string =>
  request.headers.get("cf-connecting-ip") ?? "unknown";

export const websiteHandler =
  (rpc: BackendFetch, assets: BackendFetch, allow: CallerLimit): BackendFetch =>
  // @effect-diagnostics-next-line asyncFunction:off -- A Worker fetch handler is a Promise boundary.
  async (request) => {
    if (!isRpcPath(new URL(request.url).pathname)) {
      return await assets(request);
    }

    const procedures =
      request.method === "POST"
        ? limitedProcedures(await request.clone().text())
        : [];

    const caller = callerOf(request);

    const allowed = await Promise.all(
      procedures.map(
        // @effect-diagnostics-next-line asyncFunction:off -- CallerLimit is a Promise boundary to Cloudflare's rate limit binding.
        async (procedure) => await allow(procedure, caller)
      )
    );

    if (allowed.includes(false)) {
      return new Response(TOO_MANY, { status: 429 });
    }

    return await rpc(request);
  };
