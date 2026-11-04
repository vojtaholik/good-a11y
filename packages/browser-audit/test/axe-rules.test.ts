import { describe, expect, it } from "@effect/vitest";
import { AXE_CORE_VERSION, AXE_RULES, AXE_TAGS } from "@good-a11y/core";
import axe from "axe-core";

const SC_TAG = /^wcag(?<principle>\d)(?<guideline>\d)(?<criterion>\d+)$/u;

const NOT_RUN = new Set(["deprecated", "experimental"]);

const running = axe
  .getRules([...AXE_TAGS])
  .filter(({ tags }) => !tags.some((tag) => NOT_RUN.has(tag)));

const criteriaOf = (tags: readonly string[]): string[] =>
  tags.flatMap((tag) => {
    const groups = SC_TAG.exec(tag)?.groups;

    return groups === undefined
      ? []
      : [`${groups.principle}.${groups.guideline}.${groups.criterion}`];
  });

describe("the axe rule table in core", () => {
  it("names the installed axe-core version", () => {
    expect(axe.version).toBe(AXE_CORE_VERSION);
  });

  it("lists every rule the rendered audit runs, with its success criteria", () => {
    expect(
      Object.fromEntries(
        running.map(({ ruleId, tags }) => [ruleId, criteriaOf(tags)])
      )
    ).toEqual(
      Object.fromEntries(
        [...AXE_RULES].map(([rule, { criteria }]) => [rule, [...criteria]])
      )
    );
  });
});
