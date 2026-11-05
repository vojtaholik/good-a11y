import Calibrator from "@good-a11y/scanner/calibrator";
import Canary, { CANARY_STAGE } from "@good-a11y/scanner/canary";
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Drizzle from "alchemy/Drizzle";
import { Stack } from "alchemy/Stack";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { Website } from "../web/src/website.js";
import { GoodA11yZone, PRODUCTION_STAGE } from "../web/src/zone.js";

export default Alchemy.Stack(
  "GoodA11y",
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

    const zone = yield* GoodA11yZone;

    const onTheDomain = yield* Stack.useSync(
      ({ stage }) => stage === PRODUCTION_STAGE
    );

    if (onTheDomain) {
      yield* Cloudflare.Zone.Setting("AlwaysHttps", {
        settingId: "always_use_https",
        value: "on",
        zoneId: zone.zoneId,
      });

      yield* Cloudflare.BotManagement.BotManagement("AgentsWelcome", {
        aiBotsProtection: "disabled",
        crawlerProtection: "disabled",
        fightMode: false,
        isRobotsTxtManaged: false,
        zoneId: zone.zoneId,
      });
    }

    if ((yield* Alchemy.Stage) === CANARY_STAGE) {
      const canary = yield* Canary;

      return {
        canaryUrl: canary.url,
        nameServers: zone.nameServers,
        siteUrl: website.url,
      };
    }

    return { nameServers: zone.nameServers, siteUrl: website.url };
  })
);
