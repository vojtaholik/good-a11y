// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import type { Page } from "@playwright/test";

export const LIVE =
  '[role="status"], [role="alert"], [role="log"], [aria-live="polite"], [aria-live="assertive"]';

export const markLiveRegions = async (page: Page): Promise<number> =>
  await page.evaluate((selector) => {
    const regions = [...document.querySelectorAll<HTMLElement>(selector)];

    for (const region of regions) {
      region.dataset.graderLive = "before";
    }

    return regions.length;
  }, LIVE);

export const liveTexts = async (page: Page): Promise<readonly string[]> =>
  await page.evaluate(() =>
    [...document.querySelectorAll('[data-grader-live="before"]')].map(
      (region) => region.textContent?.trim() ?? ""
    )
  );
