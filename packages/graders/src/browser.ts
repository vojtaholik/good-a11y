// @effect-diagnostics asyncFunction:off nodeBuiltinImport:off -- Playwright drives the browser through Promise-based callbacks; Effect wraps each call once, in attempt.
import { stripVTControlCharacters } from "node:util";

import { Effect, Schema } from "effect";
import { chromium } from "playwright";
import type { Browser, BrowserContext } from "playwright";

import type { ContextOptions } from "./grader.js";

export interface FlowChrome {
  readonly executablePath: string | null;
}

const DETAIL_CHARACTERS = 1500;

const BLOCKED_CHARACTERS = 200;

const CALL_LOG = /\n\s*Call log:/u;

const IN_PAGE = new Set(["about:", "blob:", "data:"]);

const detailOf = (raw: string): string => {
  const [message = raw] = stripVTControlCharacters(raw).split(CALL_LOG);

  return message.trim().slice(0, DETAIL_CHARACTERS);
};

export class BrowserStepFailed extends Schema.TaggedError<BrowserStepFailed>()(
  "BrowserStepFailed",
  { detail: Schema.String }
) {}

export const attempt = <A>(run: () => Promise<A>) =>
  Effect.tryPromise({
    catch: (thrown) =>
      new BrowserStepFailed({
        detail: detailOf(
          thrown instanceof Error ? thrown.message : String(thrown)
        ),
      }),
    try: run,
  });

export const contextFor = async (
  browser: Browser,
  origin: string,
  blocked: Set<string>,
  options: ContextOptions
): Promise<BrowserContext> => {
  const context = await browser.newContext({
    serviceWorkers: "block",
    viewport: { height: 800, width: 1280 },
    ...options,
  });

  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());

    if (IN_PAGE.has(url.protocol) || url.origin === origin) {
      await route.continue();

      return;
    }

    blocked.add(url.href.slice(0, BLOCKED_CHARACTERS));
    await route.abort("blockedbyclient");
  });

  return context;
};

export const withBrowser = <A, E, R>(
  chrome: FlowChrome,
  use: (browser: Browser) => Effect.Effect<A, E, R>
) =>
  Effect.acquireUseRelease(
    attempt(
      async () =>
        await chromium.launch({
          headless: true,
          ...(chrome.executablePath === null
            ? { channel: "chrome" }
            : { executablePath: chrome.executablePath }),
        })
    ),
    use,
    (browser) =>
      attempt(async () => {
        await browser.close();
      }).pipe(Effect.ignore)
  );
