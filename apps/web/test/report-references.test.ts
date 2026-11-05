import { describe, expect, it } from "@effect/vitest";
import type { FindingReference } from "@good-a11y/core/contracts";

import { byCriterion } from "../src/features/report-references.js";

const ref = (kind: FindingReference["kind"], factId: string) => ({
  factId,
  kind,
  source: `https://example.test/${factId}`,
  text: factId,
});

describe("finding references on the report page", () => {
  it("puts the WCAG 3 draft requirements on their own line after the WCAG 2 criteria", () => {
    const groups = byCriterion([
      ref("wcag", "STD-SC-1.3.1"),
      ref("en-reference", "STD-EN-9.1.3.1"),
      ref("wcag", "STD-SC-4.1.2"),
      ref("en-reference", "STD-EN-9.4.1.2"),
      ref("wcag3-draft", "STD-W3-INTERACTIVE-ELEMENT-NAMES-AVAILABLE-1"),
      ref("wcag3-draft", "STD-W3-ROLES-VALUES-STATES-PROPERTIES-AVAILABLE-2"),
    ]);

    expect(
      groups.map((group) => group.map((reference) => reference.kind))
    ).toEqual([
      ["wcag", "en-reference"],
      ["wcag", "en-reference"],
      ["wcag3-draft", "wcag3-draft"],
    ]);
  });
});
