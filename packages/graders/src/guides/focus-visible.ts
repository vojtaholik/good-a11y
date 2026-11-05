// @effect-diagnostics asyncFunction:off -- Playwright drives the browser through Promise-based callbacks; graders hold no Effect code.
import { expect } from "playwright/test";

import { claim } from "../grader.js";
import type { Grader } from "../grader.js";

const ring = () => {
  const node = document.activeElement;

  if (!(node instanceof HTMLElement)) {
    return null;
  }

  const style = getComputedStyle(node);
  const width = Number(style.outlineWidth.replace("px", ""));

  const outlined =
    style.outlineStyle === "auto" ||
    (style.outlineStyle !== "none" && width >= 2);

  const shadowed =
    style.boxShadow !== "none" &&
    style.outlineStyle !== "none" &&
    style.outlineColor === "rgba(0, 0, 0, 0)";

  return {
    background: getComputedStyle(node.parentElement ?? document.body)
      .backgroundColor,
    color: shadowed
      ? (/rgba?\([^)]*\)/u.exec(style.boxShadow)?.[0] ?? "")
      : style.outlineColor,
    keyboard: node.matches(":focus-visible"),
    ringed: outlined || shadowed,
    tag: node.tagName,
  };
};

export const grader: Grader = {
  claims: [
    claim(1, "every Tab stop shows a focus ring", async ({ page }) => {
      const stops = await page.locator("a, button, input").count();

      for (let stop = 0; stop < stops; stop += 1) {
        await page.keyboard.press("Tab");
        const seen = await page.evaluate(ring);
        expect(seen?.keyboard).toBe(true);
        expect(seen?.ringed).toBe(true);
      }
    }),

    claim(2, "the outline color is not the background", async ({ page }) => {
      const stops = await page.locator("a, button, input").count();

      for (let stop = 0; stop < stops; stop += 1) {
        await page.keyboard.press("Tab");
        const seen = await page.evaluate(ring);
        expect(seen?.ringed).toBe(true);
        expect(seen?.color).not.toBe("rgba(0, 0, 0, 0)");
        expect(seen?.color).not.toBe(seen?.background);
      }
    }),

    claim(3, "a mouse click on a button shows no ring", async ({ page }) => {
      await page.getByRole("button").filter({ visible: true }).first().click();

      const seen = await page.evaluate(ring);
      expect(seen?.ringed).toBe(false);
    }),

    claim(
      4,
      "focus is never fully hidden under sticky content",
      async ({ page }) => {
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
        await page
          .locator("a[href], button, input, select, textarea")
          .filter({ visible: true })
          .last()
          .focus();

        for (let press = 0; press < 8; press += 1) {
          await page.keyboard.press("Shift+Tab");

          const hidden = await page.evaluate(() => {
            const node = document.activeElement;

            if (!(node instanceof HTMLElement) || node === document.body) {
              return false;
            }

            const box = node.getBoundingClientRect();

            const points = [
              [box.left + box.width / 2, box.top + box.height / 2],
              [box.left + 2, box.top + 2],
              [box.right - 2, box.top + 2],
              [box.left + 2, box.bottom - 2],
              [box.right - 2, box.bottom - 2],
            ];

            return points.every(([x = 0, y = 0]) => {
              const top = document.elementFromPoint(x, y);

              if (top === null || node.contains(top) || top.contains(node)) {
                return false;
              }

              for (
                let up: Element | null = top;
                up !== null;
                up = up.parentElement
              ) {
                const { position } = getComputedStyle(up);

                if (position === "fixed" || position === "sticky") {
                  return true;
                }
              }

              return false;
            });
          });

          expect(hidden).toBe(false);
        }
      }
    ),

    claim(
      5,
      "every kind of control reached shows the ring",
      async ({ page }) => {
        const reached = new Set<string>();
        const ringed = new Set<string>();
        const stops = await page.locator("a, button, input").count();

        for (let stop = 0; stop < stops; stop += 1) {
          await page.keyboard.press("Tab");
          const seen = await page.evaluate(ring);

          if (seen !== null) {
            reached.add(seen.tag);

            if (seen.ringed) {
              ringed.add(seen.tag);
            }
          }
        }

        expect(reached.size).toBeGreaterThan(0);
        expect([...ringed].toSorted()).toEqual([...reached].toSorted());
      }
    ),
  ],
  guide: "focus-visible",
};
