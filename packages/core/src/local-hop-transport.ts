import { Context } from "effect";

import type { OpenHop } from "./hop-transport.js";
import type { VettedUrl } from "./public-url.js";

export class LocalHopTransport extends Context.Service<
  LocalHopTransport,
  { readonly open: OpenHop<VettedUrl> }
>()("@eaa-check/core/LocalHopTransport") {}
