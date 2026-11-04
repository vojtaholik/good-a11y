import { describe, expect, it } from "@effect/vitest";
import { VERIFIED_FACTS } from "@good-a11y/facts";

import {
  CATALOGUE,
  PROBES,
  SC_COVERAGE,
  SHOWN_JUDGED_CHECKS,
  scCoverageCounts,
  scCoverageFrom,
} from "../src/index.js";

const rowOf = (number: string) =>
  SC_COVERAGE.find((row) => row.number === number);

describe("the success-criterion coverage table", () => {
  it("has a row per verified WCAG 2.1 criterion and per WCAG 2.2 addition", () => {
    const { current, newer } = scCoverageCounts(SC_COVERAGE);

    expect([current.criteria, newer.criteria]).toEqual([50, 6]);
    expect(rowOf("4.1.1")?.newer).toBe(false);
    expect(rowOf("2.5.8")?.newer).toBe(true);
  });

  it("names each criterion by its verified fact", () => {
    const verified = new Map(VERIFIED_FACTS.map((fact) => [fact.id, fact]));

    for (const { criterion } of SC_COVERAGE) {
      expect(verified.get(criterion.factId)?.value).toBe(criterion.text);
    }
  });

  it("shows every static check, probe and shown model question under its criterion", () => {
    const listed = (method: string, number: string, title: string) =>
      rowOf(number)
        ?.tests.find((test) => test.method === method)
        ?.titles.includes(title);

    for (const { check, criteria } of CATALOGUE) {
      for (const number of criteria) {
        expect(listed("served_html", number, check.title)).toBe(true);
      }
    }

    for (const { criterion, title } of Object.values(PROBES)) {
      expect(listed("rendered_page", criterion, title)).toBe(true);
    }

    for (const { criteria, title } of SHOWN_JUDGED_CHECKS) {
      for (const number of criteria) {
        expect(listed("model", number, title)).toBe(true);
      }
    }
  });

  it("gives every untested criterion a reason a person reviews it", () => {
    const untested = SC_COVERAGE.filter(({ tests }) => tests.length === 0);

    expect(untested.length).toBeGreaterThan(0);
    expect(untested.every(({ note }) => note !== null && note !== "")).toBe(
      true
    );
  });

  it("leaves out a criterion whose fact is not verified", () => {
    const without = VERIFIED_FACTS.filter(({ id }) => id !== "STD-SC-1.1.1");

    expect(
      scCoverageFrom(without).some(({ number }) => number === "1.1.1")
    ).toBe(false);
  });

  it("does not list the dropped label-in-name rule as a test", () => {
    expect(rowOf("2.5.3")?.tests).toEqual([]);
  });
});
