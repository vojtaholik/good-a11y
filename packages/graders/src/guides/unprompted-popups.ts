// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; graders hold no Effect code.
import { expect } from "playwright/test";
import type { Locator, Page } from "playwright/test";

import { target } from "../flow.js";
import { claim } from "../grader.js";
import type { Graded, Grader } from "../grader.js";

const APPEARS_WITHIN_MS = 10_000;

const SETTLE_MS = 600;

const MAX_TABS = 12;

const CONTAINER =
  "dialog, aside, section, [role=dialog], [role=alertdialog], [role=region], [role=complementary], [popover]";

const CLOSE =
  /close|dismiss|no,? thanks|not now|maybe later|reject|decline|accept|got it|×|✕/iu;

const popupOf = (graded: Graded): Locator =>
  target(graded.page, graded.flow, "popup");

const focused = async (page: Page): Promise<string> =>
  await page.evaluate(() => {
    const active = document.activeElement;

    return active === null || active === document.body
      ? "body"
      : active.outerHTML.slice(0, 200);
  });

const shown = async (graded: Graded): Promise<void> => {
  await expect(
    popupOf(graded),
    "the popup did not appear within 10 seconds"
  ).toBeVisible({ timeout: APPEARS_WITHIN_MS });
  await graded.page.waitForTimeout(SETTLE_MS);
};

const tabToPageLink = async (graded: Graded): Promise<void> => {
  for (let tab = 0; tab < MAX_TABS; tab += 1) {
    await graded.page.keyboard.press("Tab");

    const popup = popupOf(graded);

    const onLink =
      (await popup.count()) === 0
        ? await graded.page.evaluate(
            () => document.activeElement?.tagName === "A"
          )
        : await popup.evaluate((element, container) => {
            const active = document.activeElement;
            const box = element.closest(container) ?? element.parentElement;

            return active?.tagName === "A" && !(box?.contains(active) ?? false);
          }, CONTAINER);

    if (onLink) {
      return;
    }
  }

  throw new Error("Tab reached no link in the page outside the popup.");
};

export const grader: Grader = {
  claims: [
    claim(1, "the popup does not move focus", async (graded) => {
      const { page } = graded;

      const already = await popupOf(graded)
        .isVisible()
        .catch(() => false);

      if (already) {
        await page.waitForTimeout(SETTLE_MS);
        expect(await focused(page), "focus moved when the page opened").toBe(
          "body"
        );

        return;
      }

      await tabToPageLink(graded);
      const before = await focused(page);

      await shown(graded);
      expect(await focused(page), "focus moved when the popup appeared").toBe(
        before
      );
    }),

    claim(2, "the page behind the popup is not blocked", async (graded) => {
      await shown(graded);

      const blocked = await popupOf(graded).evaluate((popup, container) => {
        const box = popup.closest(container) ?? popup.parentElement;
        const reasons: string[] = [];

        if (document.querySelector(":modal") !== null) {
          reasons.push("a modal dialog is open");
        }

        for (const element of document.querySelectorAll(
          "[inert], [aria-hidden=true]"
        )) {
          if (
            !(box?.contains(element) ?? false) &&
            element.querySelector("a[href], button, input, main, h1") !== null
          ) {
            reasons.push(`${element.tagName.toLowerCase()} is inert or hidden`);
          }
        }

        return reasons;
      }, CONTAINER);

      expect(blocked, "the page behind the popup is blocked").toEqual([]);
    }),

    claim(3, "the popup has a name and can be dismissed", async (graded) => {
      const { page } = graded;

      await shown(graded);

      const named = await popupOf(graded).evaluate((popup, container) => {
        const box = popup.closest(container);
        const ids = box?.getAttribute("aria-labelledby") ?? "";
        const label = box?.getAttribute("aria-label") ?? "";

        const byId = ids
          .split(/\s+/u)
          .map(
            (id) =>
              document.querySelector(`#${CSS.escape(id)}`)?.textContent ?? ""
          )
          .join("");

        return `${label}${byId}`.trim() !== "";
      }, CONTAINER);

      expect(named, "the popup has no accessible name").toBe(true);

      const close = popupOf(graded)
        .locator(
          `xpath=ancestor-or-self::*[self::dialog or self::aside or self::section or @role or @popover][1]`
        )
        .getByRole("button", { name: CLOSE })
        .first();

      await ((await close.count()) > 0
        ? close.click()
        : page.keyboard.press("Escape"));
      await expect(
        popupOf(graded),
        "neither a close button nor Escape hides the popup"
      ).toBeHidden({ timeout: 2000 });
    }),
  ],
  guide: "unprompted-popups",
  timeout: 30_000,
};
