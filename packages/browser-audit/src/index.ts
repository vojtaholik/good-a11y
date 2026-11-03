import type { BrowserWorker } from "@cloudflare/puppeteer";

import type { OnClose } from "./browser-session.js";
import { puppeteerSession } from "./puppeteer-session.js";
import { renderedAuditLayer } from "./rendered-audit.js";

export type {
  BrowserSession,
  Landing,
  LaunchSession,
  OnClose,
} from "./browser-session.js";

export { landedOn, navigationAllowed } from "./browser-session.js";

export {
  HARD_TIMEOUT,
  SETTLE,
  renderedAuditLayer,
  renderedAuditWith,
} from "./rendered-audit.js";

export {
  KEEP_ALIVE_MS,
  NAVIGATION_TIMEOUT_MS,
  VIEWPORT,
  puppeteerSession,
} from "./puppeteer-session.js";

export const browserRenderedAuditLayer = (
  binding: BrowserWorker,
  onClose?: OnClose
) => renderedAuditLayer(puppeteerSession(binding), onClose);
