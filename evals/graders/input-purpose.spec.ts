// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { open, texts } from "./task.ts";

const fields = () =>
  texts("fields", [
    "First name=given-name",
    "Last name=family-name",
    "Email=email",
    "Phone=tel",
    "Street and number=street-address|address-line1",
    "City=address-level2",
    "Postal code=postal-code",
    "Country=country-name|country",
  ]).map((entry) => {
    const [label = "", tokens = ""] = entry.split("=");

    return { label, tokens: tokens.split("|") };
  });

const GROUPS = {
  address: [
    "street-address",
    "address-line1",
    "address-level2",
    "postal-code",
    "country-name",
    "country",
  ],
  contact: ["email", "tel"],
  name: ["name", "given-name", "family-name"],
};

const wrongTokens = async (
  page: Page,
  group: readonly string[]
): Promise<readonly string[]> => {
  const wanted = fields().filter((field) =>
    field.tokens.some((token) => group.includes(token))
  );

  expect(wanted.length, "the task names no field of this kind").toBeGreaterThan(
    0
  );

  const wrong: string[] = [];

  for (const { label, tokens } of wanted) {
    const field = page.getByLabel(label, { exact: false }).first();

    const given = ((await field.getAttribute("autocomplete")) ?? "")
      .trim()
      .toLowerCase()
      .split(/\s+/u);

    const token = given.at(-1) ?? "";

    if (!tokens.includes(token)) {
      wrong.push(
        `${label}: "${given.join(" ")}", wanted ${tokens.join(" or ")}`
      );
    }
  }

  return wrong;
};

test.beforeEach(async ({ page }) => {
  await open(page, "input-purpose");
});

test("E1 name fields carry their name tokens", async ({ page }) => {
  expect(await wrongTokens(page, GROUPS.name)).toEqual([]);
});

test("E2 the email and phone fields carry email and tel", async ({ page }) => {
  expect(await wrongTokens(page, GROUPS.contact)).toEqual([]);
});

test("E3 address fields carry their address tokens", async ({ page }) => {
  expect(await wrongTokens(page, GROUPS.address)).toEqual([]);
});
