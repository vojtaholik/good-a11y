import { env } from "cloudflare:workers";

import type { CallerLimit } from "./handler.js";

// @effect-diagnostics-next-line asyncFunction:off -- Cloudflare's rate limit binding returns a Promise.
export const callerLimit: CallerLimit = async (procedure, caller) => {
  const binding =
    procedure === "startScan" ? env.SCAN_LIMIT : env.MESSAGE_LIMIT;

  const { success } = await binding.limit({ key: caller });

  return success;
};
