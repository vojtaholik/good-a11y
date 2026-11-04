// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { open, text } from "./task.ts";

const OTHER_WAY =
  /email me|sign-in link|sign in link|login link|magic link|link by email|passkey|code by email|another way|without (?:the )?(?:letters|puzzle|code)/iu;

const HELPER =
  /fill (?:the |them |it |letters )?(?:in )?(?:for me)?|enter (?:them|the letters) for me|skip|solve for me/iu;

const signIn = async (page: Page): Promise<void> => {
  await page
    .getByRole("button", { exact: true, name: "Sign in" })
    .first()
    .click();
  await page.waitForTimeout(500);
};

const signedIn = async (page: Page): Promise<boolean> => {
  const shown = await page
    .getByText(text("signedIn", "Welcome back"), { exact: false })
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

test.use({ permissions: ["clipboard-read", "clipboard-write"] });

test.beforeEach(async ({ page }) => {
  await open(page, "sign-in-without-puzzles");
});

test("E1 signing in needs no puzzle", async ({ page }) => {
  await emailField(page).fill("jana@example.com");
  await passwordField(page).fill("trail-notes-2026");
  await signIn(page);

  if (await signedIn(page)) {
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

  if ((await helper.count()) > 0) {
    await helper.click();
    await signIn(page);

    if (await signedIn(page)) {
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
});

test("E2 password managers and paste work", async ({ page }) => {
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
});
