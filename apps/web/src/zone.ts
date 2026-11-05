import { adopt } from "alchemy/AdoptPolicy";
import * as Cloudflare from "alchemy/Cloudflare";
import { retain } from "alchemy/RemovalPolicy";

export const PRODUCTION_STAGE = "prod";

export const SITE_DOMAIN = "good-a11y.com";

export const GoodA11yZone = Cloudflare.Zone.Zone("GoodA11yZone", {
  name: SITE_DOMAIN,
}).pipe(adopt(true), retain());
