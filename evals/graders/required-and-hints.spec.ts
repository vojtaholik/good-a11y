// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; this package holds no Effect code.
import { expect, test } from "@playwright/test";

import { targetUrl } from "./demo.ts";

test.beforeEach(async ({ page }) => {
  await page.goto(targetUrl("required-and-hints"));
});

test("E1 every field is named by its visible label", async ({ page }) => {
  const labels = await page
    .locator("label[for]")
    .evaluateAll((nodes) =>
      nodes.map((node) => node.textContent?.trim() ?? "")
    );

  expect(labels.length).toBeGreaterThan(0);

  for (const label of labels) {
    await expect(
      page.getByRole("textbox", { exact: true, name: label })
    ).toBeVisible();
  }
});

test("E2 required fields carry the required state", async ({ page }) => {
  for (const name of ["Full name", "Email address", "Phone number"]) {
    await expect(page.getByLabel(name)).toHaveJSProperty("required", true);
  }

  await expect(page.getByLabel("Company (optional)")).toHaveJSProperty(
    "required",
    false
  );
});

test("E3 hints are part of the description", async ({ page }) => {
  await expect(page.getByLabel("Phone number")).toHaveAccessibleDescription(
    /country code/u
  );
  await expect(page.getByLabel("Email address")).toHaveAccessibleDescription(
    /receipt/u
  );
});

test("E4 radios are grouped under their question", async ({ page }) => {
  const group = page.getByRole("group", { name: "Delivery speed" });
  await expect(group).toBeVisible();
  await expect(group.getByRole("radio")).toHaveCount(2);
});

test("E5 personal fields use autocomplete tokens", async ({ page }) => {
  await expect(page.getByLabel("Full name")).toHaveAttribute(
    "autocomplete",
    "name"
  );
  await expect(page.getByLabel("Email address")).toHaveAttribute(
    "autocomplete",
    "email"
  );
  await expect(page.getByLabel("Phone number")).toHaveAttribute(
    "autocomplete",
    "tel"
  );
});

test("E6 clicking a label focuses its field", async ({ page }) => {
  await page.locator('label[for="postal"]').click();
  await expect(page.getByLabel("Postal code")).toBeFocused();
});
