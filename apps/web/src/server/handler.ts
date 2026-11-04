import { Result, Schema } from "effect";

import type { BackendFetch } from "./rpc.js";

export const isRpcPath = (pathname: string): boolean =>
  pathname === "/rpc" || pathname.startsWith("/rpc/");

export const LIMITED_PROCEDURES = ["startScan", "sendMessage"] as const;

export type LimitedProcedure = (typeof LIMITED_PROCEDURES)[number];

export const CALLER_HEADER = "x-eaa-caller";

export type CallerLimit = (
  procedure: LimitedProcedure,
  caller: string
) => Promise<boolean>;

const RpcMessage = Schema.Struct({
  headers: Schema.optional(
    Schema.Array(Schema.Tuple([Schema.String, Schema.String]))
  ),
  tag: Schema.optional(Schema.String),
});

const RpcMessages = Schema.Array(RpcMessage);

const decodeMessages = Schema.decodeUnknownResult(
  Schema.fromJsonString(Schema.Union([RpcMessages, RpcMessage]))
);

const isLimited = (tag: string | undefined): tag is LimitedProcedure =>
  LIMITED_PROCEDURES.some((procedure) => procedure === tag);

export interface RpcBody {
  readonly procedures: readonly LimitedProcedure[];
  readonly setsCaller: boolean;
}

export const readRpcBody = (body: string): RpcBody | null => {
  const decoded = decodeMessages(body);

  if (Result.isFailure(decoded)) {
    return null;
  }

  const messages = Schema.is(RpcMessages)(decoded.success)
    ? decoded.success
    : [decoded.success];

  return {
    procedures: messages.flatMap(({ tag }) => (isLimited(tag) ? [tag] : [])),
    setsCaller: messages.some(({ headers = [] }) =>
      headers.some(([name]) => name.toLowerCase() === CALLER_HEADER)
    ),
  };
};

export const limitedProcedures = (body: string): readonly LimitedProcedure[] =>
  readRpcBody(body)?.procedures ?? [];

export const UNREADABLE_RPC =
  "The request could not be read as an RPC call, or it sets a header only the site may set.";

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

export const RPC_METHOD_ONLY = "The RPC endpoint takes POST only.";

export const websiteHandler =
  (rpc: BackendFetch, pages: BackendFetch, allow: CallerLimit): BackendFetch =>
  // @effect-diagnostics-next-line asyncFunction:off -- A Worker fetch handler is a Promise boundary.
  async (request) => {
    if (!isRpcPath(new URL(request.url).pathname)) {
      return await pages(request);
    }

    if (request.method !== "POST") {
      return new Response(RPC_METHOD_ONLY, {
        headers: { allow: "POST" },
        status: 405,
      });
    }

    const body = readRpcBody(await request.clone().text());

    if (body === null || body.setsCaller) {
      return new Response(UNREADABLE_RPC, { status: 400 });
    }

    const { procedures } = body;

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
