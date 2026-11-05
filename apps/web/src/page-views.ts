import * as Alchemy from "alchemy";
import { adopt } from "alchemy/AdoptPolicy";
import * as Cloudflare from "alchemy/Cloudflare";
import { Stack } from "alchemy/Stack";
import { Effect } from "effect";

import { GoodA11yZone, PRODUCTION_STAGE } from "./zone.js";

const NOT_MEASURED = "";

export const pageViewsToken = Effect.gen(function* pageViewsToken() {
  const onTheDomain = yield* Stack.useSync(
    ({ stage }) => stage === PRODUCTION_STAGE
  );

  if ((yield* Alchemy.ALCHEMY_DEV) || !onTheDomain) {
    return NOT_MEASURED;
  }

  const zone = yield* GoodA11yZone;

  const site = yield* Cloudflare.Rum.Site("PageViews", {
    autoInstall: false,
    zoneTag: zone.zoneId,
  }).pipe(adopt(true));

  return site.siteToken;
});
