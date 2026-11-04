import { AXE_RULES, CheckIdSchema, PROBES } from "@eaa-check/core";
import { CHECK_GUIDES, GUIDES } from "@eaa-check/guides";
import { describe, expect, it } from "@effect/vitest";
import { Schema } from "effect";

const isCheckKey = (key: string): boolean =>
  Schema.is(CheckIdSchema)(key) ||
  (key.startsWith("axe:") &&
    (Object.hasOwn(PROBES, key.slice(4)) || AXE_RULES.has(key.slice(4))));

describe("the check-to-guide map", () => {
  it("names only checks the report can show", () => {
    expect(Object.keys(CHECK_GUIDES).filter((key) => !isCheckKey(key))).toEqual(
      []
    );
  });

  it("points only at guides that exist", () => {
    const ids = new Set(GUIDES.map((guide) => guide.id));

    expect(
      Object.values(CHECK_GUIDES)
        .flat()
        .filter((id) => !ids.has(id))
    ).toEqual([]);
  });
});
