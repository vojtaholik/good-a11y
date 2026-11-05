// @effect-diagnostics asyncFunction:off -- Playwright is a Promise API; each browser step is a plain async function the Effect test awaits.
import { describe, expect, it } from "@effect/vitest";
import { headlessShellPath } from "@good-a11y/browser-audit/headless-shell";
import { chromium } from "@playwright/test";
import type { Browser, Page } from "@playwright/test";
import { Effect } from "effect";

import { PAGES, siteServer } from "./site-server.js";

const EXTERNAL = "External page stand-in";

const browser = Effect.acquireRelease(
  Effect.promise(
    async () => await chromium.launch({ executablePath: headlessShellPath() })
  ),
  (opened) =>
    Effect.promise(async () => {
      await opened.close();
    })
);

const hydrated = async (page: Page) => {
  await page.waitForLoadState("networkidle");
  await page.waitForFunction(
    () =>
      document.querySelector("[data-foldkit-app]") === null &&
      !Object.hasOwn(document.body.dataset, "foldkitRefused")
  );
};

const openPage = async (opened: Browser, url: string) => {
  const page = await opened.newPage();

  await page.route(
    (target) => target.hostname !== "127.0.0.1",
    async (route) => {
      await route.fulfill({
        body: EXTERNAL,
        contentType: "text/plain",
        status: 200,
      });
    }
  );
  await page.goto(url);
  await hydrated(page);

  return page;
};

const linksOn = async (opened: Browser, url: string) => {
  const page = await openPage(opened, url);

  const hrefs = await page.$$eval("a[href]", (anchors) =>
    anchors.map((anchor) => anchor.getAttribute("href") ?? "")
  );

  await page.close();

  return hrefs.filter(
    (href) =>
      !href.startsWith("#") && new URL(href, url).protocol.startsWith("http")
  );
};

const textAt = async (opened: Browser, url: string) => {
  const page = await opened.newPage();

  await page.route(
    (target) => target.hostname !== "127.0.0.1",
    async (route) => {
      await route.fulfill({
        body: EXTERNAL,
        contentType: "text/plain",
        status: 200,
      });
    }
  );
  await page.goto(url);
  await page.waitForLoadState("load");

  const text = await page.evaluate(() => document.body.textContent.trim());

  await page.close();

  return text.slice(0, 400);
};

const textAfterClick = async (
  opened: Browser,
  from: string,
  href: string,
  expected: string
) => {
  const page = await openPage(opened, from);
  const link = page.locator(`a[href="${href}"]`).first();

  await link.scrollIntoViewIfNeeded();
  await Promise.all([
    page.waitForURL((url) => url.href === new URL(href, from).href),
    link.click(),
  ]);
  await page
    .waitForFunction(
      (text) => document.body.textContent.trim().slice(0, 400) === text,
      expected,
      { timeout: 5000 }
    )
    .catch(() => null);

  const text = await page.evaluate(() => document.body.textContent.trim());

  await page.close();

  return text.slice(0, 400);
};

describe("every link on our own built pages", () => {
  it.live(
    "lands on what the address serves when clicked in Chrome",
    () =>
      Effect.gen(function* clicksLinks() {
        const port = yield* siteServer;
        const opened = yield* browser;
        const origin = `http://127.0.0.1:${port}`;

        const firstSeen = new Map<string, string>();

        for (const path of PAGES) {
          const hrefs = yield* Effect.promise(
            async () => await linksOn(opened, `${origin}${path}`)
          );

          for (const href of hrefs) {
            if (!firstSeen.has(href)) {
              firstSeen.set(href, `${origin}${path}`);
            }
          }
        }

        const results: {
          clicked: string;
          direct: string;
          href: string;
          matches: boolean;
        }[] = [];

        for (const [href, from] of firstSeen) {
          const target = new URL(href, from).href;

          const direct = yield* Effect.promise(
            async () => await textAt(opened, target)
          );

          const clicked = yield* Effect.promise(
            async () =>
              await textAfterClick(opened, from, href, direct).catch(
                (error: unknown) =>
                  `click failed: ${String(error).slice(0, 120)}`
              )
          );

          results.push({
            clicked: clicked.slice(0, 80),
            direct: direct.slice(0, 80),
            href,
            matches: clicked === direct,
          });
        }

        expect(firstSeen.size).toBeGreaterThan(PAGES.length);
        expect([...firstSeen.keys()]).toEqual(
          expect.arrayContaining([
            "/llms.txt",
            "/skills/good-a11y/SKILL.md",
            "/focus-visible/demo.html",
            "https://github.com/vojtaholik/good-a11y",
          ])
        );
        expect(results.filter((result) => !result.matches)).toEqual([]);
      }).pipe(Effect.scoped),
    600_000
  );
});
