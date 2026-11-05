import { backend } from "./server/backend.js";
import { callerLimit } from "./server/caller-limit.js";
import { websiteHandler } from "./server/handler.js";
import type { BackendFetch } from "./server/rpc.js";
import { siteHandler } from "./server/site.js";

export default {
  // @effect-diagnostics-next-line asyncFunction:off -- Cloudflare's fetch entry requires a Promise response.
  fetch: async (
    request: Request,
    env: {
      readonly ASSETS: { readonly fetch: BackendFetch };
      readonly SITE_ORIGIN: string;
    }
  ) =>
    await websiteHandler(
      backend,
      siteHandler(
        backend,
        env.ASSETS.fetch.bind(env.ASSETS),
        new URL(env.SITE_ORIGIN).origin,
        callerLimit
      ),
      callerLimit
    )(request),
};
