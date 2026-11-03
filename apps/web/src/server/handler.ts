import type { BackendFetch } from "./rpc.js";

export const isRpcPath = (pathname: string): boolean =>
  pathname === "/rpc" || pathname.startsWith("/rpc/");

export const websiteHandler =
  (rpc: BackendFetch, assets: BackendFetch): BackendFetch =>
  // @effect-diagnostics-next-line asyncFunction:off -- A Worker fetch handler is a Promise boundary.
  async (request) =>
    isRpcPath(new URL(request.url).pathname)
      ? await rpc(request)
      : await assets(request);
