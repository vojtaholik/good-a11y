// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; graders hold no Effect code.
import { expect } from "playwright/test";

import { texts } from "../flow.js";
import { claim } from "../grader.js";
import type { Grader } from "../grader.js";

export const grader: Grader = {
  claims: [
    claim(1, "every img has an alt attribute", async ({ page }) => {
      await expect(page.locator("img:not([alt])")).toHaveCount(0);
    }),

    claim(2, "no alt is a file name or 'image of'", async ({ page }) => {
      const alts = await page
        .locator("img")
        .evaluateAll((images) =>
          images.map((image) => image.getAttribute("alt") ?? "")
        );

      for (const alt of alts) {
        expect(alt).not.toMatch(/\.(?:jpe?g|png|svg|webp|gif|avif)$/iu);
        expect(alt).not.toMatch(/^(?:image|picture|photo) of/iu);
      }
    }),

    claim(3, "image-only links and buttons are named", async ({ page }) => {
      const marked = await page.evaluate(() => {
        const controls = [
          ...document.querySelectorAll<HTMLElement>("a[href], button"),
        ].filter(
          (node) =>
            node.querySelector("img, svg") !== null &&
            [...node.querySelectorAll("*"), node].every(
              (part) =>
                ![...part.childNodes].some(
                  (child) =>
                    child.nodeType === Node.TEXT_NODE &&
                    (child.textContent?.trim() ?? "") !== "" &&
                    part.checkVisibility({
                      opacityProperty: true,
                      visibilityProperty: true,
                    })
                )
            )
        );

        for (const [index, node] of controls.entries()) {
          node.dataset.graderImageControl = String(index);
        }

        return controls.length;
      });

      for (let index = 0; index < marked; index += 1) {
        await expect(
          page.locator(`[data-grader-image-control="${index}"]`)
        ).toHaveAccessibleName(/\S/u);
      }
    }),

    claim(4, "a card links once to its destination", async ({ page }) => {
      const doubled = await page.evaluate(() => {
        const seen = new Map<Element, Set<string>>();
        let twice = 0;

        for (const link of document.querySelectorAll<HTMLAnchorElement>(
          "a[href]"
        )) {
          const card = link.closest("li, article");

          if (card === null) {
            continue;
          }

          const hrefs = seen.get(card) ?? new Set<string>();

          if (hrefs.has(link.href)) {
            twice += 1;
          }

          hrefs.add(link.href);
          seen.set(card, hrefs);
        }

        return twice;
      });

      expect(doubled).toBe(0);
    }),

    claim(5, "inline SVGs are hidden or named images", async ({ page }) => {
      const loose = await page.evaluate(
        () =>
          [...document.querySelectorAll("svg")].filter(
            (svg) =>
              svg.parentElement?.closest("svg") === null &&
              svg.getAttribute("aria-hidden") !== "true" &&
              svg.getAttribute("role") !== "img"
          ).length
      );

      expect(loose).toBe(0);

      for (const image of await page.locator("svg[role='img']").all()) {
        await expect(image).toHaveAccessibleName(/\S/u);
      }
    }),

    claim(6, "a chart has its data as text", async ({ page, flow }) => {
      const values = texts(flow, "chartData");

      if (values.length > 0) {
        const asText = await page.evaluate(() =>
          [...document.querySelectorAll("table, ul, ol, dl")]
            .map((node) => node.textContent ?? "")
            .join(" ")
        );

        for (const value of values) {
          expect(asText).toContain(value);
        }
      }
    }),
  ],
  guide: "image-alt",
};
