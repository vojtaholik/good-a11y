import type { BrowserWorker } from "@cloudflare/puppeteer";

import { puppeteerSession } from "./puppeteer-session.js";
import { renderedAuditLayer } from "./rendered-audit.js";

export type {
  BrowserSession,
  Landing,
  LaunchSession,
} from "./browser-session.js";

export {
  HARD_TIMEOUT,
  SETTLE,
  renderedAuditLayer,
  renderedAuditWith,
} from "./rendered-audit.js";

export {
  NAVIGATION_TIMEOUT_MS,
  VIEWPORT,
  puppeteerSession,
} from "./puppeteer-session.js";

export const browserRenderedAuditLayer = (binding: BrowserWorker) =>
  renderedAuditLayer(puppeteerSession(binding));
