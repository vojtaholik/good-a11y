import { CONTACT_SHOWN } from "@good-a11y/core/contracts";
import { Option, Schema } from "effect";

import { guidePageOf } from "./guides.js";
import { AppRoute } from "./route.js";
import type { AppRouteState } from "./route.js";

export const isMissing = (route: AppRouteState): boolean =>
  Schema.is(AppRoute.NotFound)(route) ||
  (!CONTACT_SHOWN && Schema.is(AppRoute.Contact)(route)) ||
  (Schema.is(AppRoute.Guide)(route) &&
    Option.isNone(guidePageOf(route.guideId)));
