// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import type { Page } from "@playwright/test";

export const focusedIsSeen = async (page: Page): Promise<boolean> =>
  await page.evaluate(() => {
    const node = document.activeElement;

    if (!(node instanceof HTMLElement) || node === document.body) {
      return true;
    }

    if (
      !node.checkVisibility({ opacityProperty: true, visibilityProperty: true })
    ) {
      return false;
    }

    const box = node.getBoundingClientRect();

    if (box.width < 1 || box.height < 1) {
      return false;
    }

    for (
      let parent = node.parentElement;
      parent !== null;
      parent = parent.parentElement
    ) {
      const style = getComputedStyle(parent);

      if (style.overflow === "visible") {
        continue;
      }

      const clip = parent.getBoundingClientRect();

      if (
        clip.width < 1 ||
        clip.height < 1 ||
        box.bottom <= clip.top ||
        box.top >= clip.bottom ||
        box.right <= clip.left ||
        box.left >= clip.right
      ) {
        return false;
      }
    }

    return true;
  });
