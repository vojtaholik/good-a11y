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

const IPV6_PREFIX_GROUPS = 4;

export const callerKey = (address: string): string => {
  if (!address.includes(":")) {
    return address;
  }

  const [head = "", tail = ""] = address.toLowerCase().split("::");
  const front = head === "" ? [] : head.split(":");
  const back = tail === "" ? [] : tail.split(":");

  const groups = address.includes("::")
    ? [
        ...front,
        ...Array.from({ length: 8 - front.length - back.length }, () => "0"),
        ...back,
      ]
    : front;

  return `${groups
    .slice(0, IPV6_PREFIX_GROUPS)
    .map((group) => group.replace(/^0+(?=.)/u, ""))
    .join(":")}::/64`;
};

const callerOf = (request: Request): string =>
  callerKey(request.headers.get("cf-connecting-ip") ?? "unknown");

export const CALLER_HEADER = "x-eaa-caller";

export const RPC_METHOD_ONLY = "The RPC endpoint takes POST only.";

export const websiteHandler =
  (rpc: BackendFetch, assets: BackendFetch, allow: CallerLimit): BackendFetch =>
  // @effect-diagnostics-next-line asyncFunction:off -- A Worker fetch handler is a Promise boundary.
  async (request) => {
    if (!isRpcPath(new URL(request.url).pathname)) {
      return await assets(request);
    }

    if (request.method !== "POST") {
      return new Response(RPC_METHOD_ONLY, {
        headers: { allow: "POST" },
        status: 405,
      });
    }

    const procedures = limitedProcedures(await request.clone().text());

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

    const forwarded = new Request(request);

    forwarded.headers.set(CALLER_HEADER, caller);

    return await rpc(forwarded);
  };
