import { adopt } from "alchemy/AdoptPolicy";
import * as Cloudflare from "alchemy/Cloudflare";
import { retain } from "alchemy/RemovalPolicy";

import { SITE_DOMAIN } from "./website.js";

export const GoodA11yZone = Cloudflare.Zone.Zone("GoodA11yZone", {
  name: SITE_DOMAIN,
}).pipe(adopt(true), retain());
