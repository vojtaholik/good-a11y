import Calibrator from "@eaa-check/scanner/calibrator";
import Canary, { CANARY_STAGE } from "@eaa-check/scanner/canary";
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Drizzle from "alchemy/Drizzle";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { Website } from "../web/src/website.js";

export default Alchemy.Stack(
  "EaaCheck",
  {
    providers: Layer.mergeAll(Cloudflare.providers(), Drizzle.providers()),
    state: Cloudflare.state(),
  },
  Effect.gen(function* stack() {
    const website = yield* Website;

    if (yield* Alchemy.ALCHEMY_DEV) {
      const calibrator = yield* Calibrator;

      return { calibratorUrl: calibrator.url, siteUrl: website.url };
    }

    if ((yield* Alchemy.Stage) === CANARY_STAGE) {
      const canary = yield* Canary;

      return { canaryUrl: canary.url, siteUrl: website.url };
    }

    return { siteUrl: website.url };
  })
);
