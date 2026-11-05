// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; graders hold no Effect code.
import type { Flow } from "@good-a11y/core";
import { expect } from "playwright/test";
import type { Page } from "playwright/test";

import { texts } from "../flow.js";
import { claim } from "../grader.js";
import type { Grader } from "../grader.js";

const fields = (flow: Flow) =>
  texts(flow, "fields").map((entry) => {
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
  group: readonly string[],
  flow: Flow
): Promise<readonly string[]> => {
  const wanted = fields(flow).filter((field) =>
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

export const grader: Grader = {
  claims: [
    claim(1, "name fields carry their name tokens", async ({ page, flow }) => {
      expect(await wrongTokens(page, GROUPS.name, flow)).toEqual([]);
    }),
    claim(
      2,
      "the email and phone fields carry email and tel",
      async ({ page, flow }) => {
        expect(await wrongTokens(page, GROUPS.contact, flow)).toEqual([]);
      }
    ),
    claim(
      3,
      "address fields carry their address tokens",
      async ({ page, flow }) => {
        expect(await wrongTokens(page, GROUPS.address, flow)).toEqual([]);
      }
    ),
    claim(
      4,
      "pasting into the fields is not blocked",
      async ({ page, flow }) => {
        const blocked: string[] = [];

        for (const { label } of fields(flow)) {
          const field = page.getByLabel(label, { exact: false }).first();

          if ((await field.count()) === 0) {
            continue;
          }

          const cancelled = await field.evaluate((element) => {
            const data = new DataTransfer();

            data.setData("text/plain", "pasted");

            return !element.dispatchEvent(
              new ClipboardEvent("paste", {
                bubbles: true,
                cancelable: true,
                clipboardData: data,
              })
            );
          });

          if (cancelled) {
            blocked.push(label);
          }
        }

        expect(blocked, "fields that block paste").toEqual([]);
      }
    ),
  ],
  guide: "input-purpose",
};
