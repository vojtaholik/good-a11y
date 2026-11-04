import { describe, expect, it } from "@effect/vitest";
import {
  JUDGED_CHECKS,
  MAX_ELEMENTS_PER_KIND,
  pickPages,
  questionsOf,
  runChecks,
  summaryOf,
} from "@good-a11y/core";

import { readPage } from "../src/index.js";

const HTML_CAP = 2_000_000;

const BUDGET_CPU_MS = 1500;

const cpuMillis = (work: () => void): number => {
  const before = process.threadCpuUsage();

  work();

  const spent = process.threadCpuUsage(before);

  return (spent.user + spent.system) / 1000;
};

const withinBudget = (work: () => void): boolean =>
  cpuMillis(work) < BUDGET_CPU_MS || cpuMillis(work) < BUDGET_CPU_MS;

const repeated = (unit: string): string =>
  unit.repeat(Math.floor(HTML_CAP / unit.length));

const HOSTILE_UNITS = [
  "<div>",
  "</span>",
  "<a href=x>",
  "<a href=x><div>",
  "<button><span>",
  "<label for=a>",
  "<img src=x>",
  "<input>",
  "<svg><title>",
  "<div hidden>",
  "<p>",
  "<li><a href=x>",
  "<h2>",
  "<td><p><a href=x>",
  "<title>",
  "<meta name=viewport content=x>",
  '<a href="',
  "<!--",
  "&amp;",
  "<nav>",
  "<main><header>",
  "<section><footer><a href=/contact>",
  '<div role="navigation"><a href="/p/1">',
  '<div itemtype="https://schema.org/Product">',
  '<script type="application/ld+json">{"@type":["',
  '"@type":"Product",',
  "1 000 ",
  "9,99",
  "<span>1</span>",
  "€ 1",
  '<p lang="en">',
];

describe("hostile input at the size cap", () => {
  it.each(HOSTILE_UNITS)(
    "reads and judges %s repeated in linear time",
    (unit) => {
      const html = repeated(unit);

      expect(
        withinBudget(() => {
          const evidence = readPage(html);

          runChecks(evidence);
          questionsOf(JUDGED_CHECKS, {
            entered: evidence,
            rendered: null,
            statement: evidence,
          });
          pickPages("https://shop.example/", evidence.links);
          summaryOf("entered", "https://shop.example/", evidence);
        })
      ).toBe(true);
    }
  );

  it("keeps at most the declared number of elements of a kind and says it stopped", () => {
    const evidence = readPage(repeated("<img src=x>"));

    expect(evidence.images.length).toBe(MAX_ELEMENTS_PER_KIND);
    expect(evidence.truncated).toBe(true);
  });

  it("never throws on broken markup", () => {
    for (const html of [
      "<",
      "<a",
      "<a href",
      "</",
      "<svg><a href=x>",
      "<html lang",
    ]) {
      expect(() => runChecks(readPage(html))).not.toThrow();
    }
  });
});
