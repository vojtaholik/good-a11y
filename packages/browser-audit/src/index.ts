import { launch } from "@cloudflare/puppeteer";
import type { BrowserWorker } from "@cloudflare/puppeteer";
import { vetUrl } from "@good-a11y/core";

import type { OnClose } from "./browser-session.js";
import { KEEP_ALIVE_MS, sessionOn } from "./puppeteer-session.js";
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

export type { SessionOptions } from "./puppeteer-session.js";

export {
  KEEP_ALIVE_MS,
  NAVIGATION_TIMEOUT_MS,
  VIEWPORT,
  sessionOn,
} from "./puppeteer-session.js";

export type * from "./session-browser.js";

export interface BrowserRunOptions {
  readonly emptySubmits: boolean;
}

export const puppeteerSession = (
  binding: BrowserWorker,
  { emptySubmits }: BrowserRunOptions
) =>
  sessionOn(launch.bind(undefined, binding, { keep_alive: KEEP_ALIVE_MS }), {
    emptySubmits: () => emptySubmits,
    vet: vetUrl,
  });

export const browserRenderedAuditLayer = (
  binding: BrowserWorker,
  options: BrowserRunOptions,
  onClose?: OnClose
) => renderedAuditLayer(puppeteerSession(binding, options), vetUrl, onClose);
