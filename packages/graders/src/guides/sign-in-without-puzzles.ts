// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; graders hold no Effect code.
import type { Flow } from "@good-a11y/core";
import { expect } from "playwright/test";
import type { Locator, Page } from "playwright/test";

import { text } from "../flow.js";
import { claim } from "../grader.js";
import type { Grader } from "../grader.js";

const OTHER_WAY =
  /email me|sign-in link|sign in link|login link|magic link|link by email|passkey|code by email|another way|without (?:the )?(?:letters|puzzle|code)/iu;

const HELPER =
  /fill (?:the |them |it |letters )?(?:in )?(?:for me)?|enter (?:them|the letters) for me|skip|solve for me/iu;

const HUMAN_BOX = /human|robot|not a bot/iu;

const HUMAN_PACE_MS = 3000;

const signIn = async (page: Page): Promise<void> => {
  await page.waitForTimeout(HUMAN_PACE_MS);
  await page
    .getByRole("button", { exact: true, name: "Sign in" })
    .first()
    .click();
  await page.waitForTimeout(500);
};

const signedIn = async (page: Page, flow: Flow): Promise<boolean> => {
  const shown = await page
    .getByText(text(flow, "signedIn"), { exact: false })
    .filter({ visible: true })
    .count();

  return shown > 0;
};

const emailField = (page: Page): Locator =>
  page
    .locator("main input[type=email]:visible")
    .or(page.getByLabel(/email/iu))
    .first();

const passwordField = (page: Page): Locator =>
  page
    .locator("main input[type=password]:visible")
    .or(page.locator("input[type=password]"))
    .first();

export const grader: Grader = {
  claims: [
    claim(1, "signing in needs no puzzle", async ({ page, flow }) => {
      await emailField(page).fill("jana@example.com");
      await passwordField(page).fill("trail-notes-2026");
      await signIn(page);

      if (await signedIn(page, flow)) {
        return;
      }

      for (const summary of await page
        .locator("details:not([open]) > summary")
        .filter({ visible: true })
        .all()) {
        await summary.click();
      }

      const helper = page
        .getByRole("button", { name: HELPER })
        .filter({ visible: true })
        .first();

      const humanBox = page
        .getByRole("checkbox", { checked: false, name: HUMAN_BOX })
        .filter({ visible: true })
        .first();

      if ((await humanBox.count()) > 0) {
        await humanBox.check();
        await signIn(page);

        if (await signedIn(page, flow)) {
          return;
        }
      }

      if ((await helper.count()) > 0) {
        await helper.click();
        await signIn(page);

        if (await signedIn(page, flow)) {
          return;
        }
      }

      const other = await page
        .getByRole("button", { name: OTHER_WAY })
        .or(page.getByRole("link", { name: OTHER_WAY }))
        .filter({ visible: true })
        .count();

      expect(
        other,
        "email and password are not enough, nothing does the check for the user, and no other way in is offered"
      ).toBeGreaterThan(0);
    }),

    claim(2, "password managers and paste work", async ({ page }) => {
      const email = emailField(page);
      const password = passwordField(page);

      expect(await email.getAttribute("autocomplete")).toMatch(
        /\b(?:username|email)\b/u
      );
      expect(await password.getAttribute("autocomplete")).toMatch(
        /\bcurrent-password\b/u
      );

      await page.evaluate(async () => {
        await navigator.clipboard.writeText("pasted-secret-1");
      });
      await password.focus();
      await page.keyboard.press("ControlOrMeta+V");
      expect(await password.inputValue()).toBe("pasted-secret-1");
    }),
  ],
  context: { permissions: ["clipboard-read", "clipboard-write"] },
  guide: "sign-in-without-puzzles",
};
