// oxlint-disable-next-line typescript/triple-slash-reference -- A wildcard ambient module for ?raw imports cannot be imported; every package that typechecks this source needs the reference.
/// <reference path="./raw-text.d.ts" />
import { launch } from "@cloudflare/puppeteer";
import type { BrowserWorker } from "@cloudflare/puppeteer";
import { AXE_TAGS, SCANNER_USER_AGENT } from "@eaa-check/core";
import axeScript from "axe-core/axe.min.js?raw";
import { Effect } from "effect";

import { step } from "./browser-session.js";
import type { BrowserSession, LaunchSession } from "./browser-session.js";

export const VIEWPORT = { height: 800, width: 1280 } as const;

export const NAVIGATION_TIMEOUT_MS = 30_000;

const AXE_RUN = `axe.run(document, ${JSON.stringify({
  resultTypes: ["violations"],
  runOnly: { type: "tag", values: AXE_TAGS },
})}).then((results) => JSON.stringify(results))`;

export const puppeteerSession = (binding: BrowserWorker): LaunchSession =>
  Effect.gen(function* launchPuppeteer() {
    const browser = yield* step("browser", launch.bind(undefined, binding));

    const close = Effect.ignore(step("browser", browser.close.bind(browser)));

    const page = yield* step("browser", browser.newPage.bind(browser)).pipe(
      Effect.tapError(() => close)
    );

    const session: BrowserSession = {
      close,
      html: step("browser", page.content.bind(page)),
      open: (url) =>
        Effect.gen(function* openPage() {
          yield* step("browser", page.setViewport.bind(page, VIEWPORT));
          yield* step(
            "browser",
            page.setUserAgent.bind(page, SCANNER_USER_AGENT)
          );

          const response = yield* step(
            "browser",
            page.goto.bind(page, url, {
              timeout: NAVIGATION_TIMEOUT_MS,
              waitUntil: "load",
            })
          );

          return {
            headers: response?.headers() ?? {},
            status: response?.status() ?? null,
          };
        }),
      runAxe: step("audit", page.evaluate.bind(page, axeScript)).pipe(
        Effect.andThen(step("audit", page.evaluate.bind(page, AXE_RUN)))
      ),
    };

    return session;
  });
