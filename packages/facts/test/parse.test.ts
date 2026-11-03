import { describe, expect, it } from "@effect/vitest";
import { Result } from "effect";

import {
  BULLET_KEYS,
  parseLedger,
  parseLedgerFile,
  verifiedOnly,
} from "../src/index.js";

const fact = (
  id: string,
  overrides: Readonly<
    Partial<Record<(typeof BULLET_KEYS)[number], string>>
  > = {}
) => {
  const bullets = {
    claim: "Austria transposed the EAA with the BaFG.",
    excerpt: '"StF: BGBl. I Nr. 76/2023"',
    field: "transposing-law",
    retrieved: "2026-11-03",
    source: "https://www.ris.bka.gv.at/example",
    status: "verified",
    used_by: "states.at.law",
    value: "Barrierefreiheitsgesetz (BaFG)",
    verifier_note: "matches",
    ...overrides,
  };

  return [
    `### ${id}`,
    ...BULLET_KEYS.map((key) => `- ${key}: ${bullets[key] ?? ""}`.trimEnd()),
  ].join("\n");
};

const problemOf = (text: string) => {
  const parsed = parseLedgerFile("states/at.md", text);

  return Result.isFailure(parsed) ? parsed.failure.problem : undefined;
};

describe("parseLedgerFile", () => {
  it("reads every fact under a level-3 heading and ignores the prose around them", () => {
    const parsed = parseLedgerFile(
      "states/at.md",
      `# Austria\n\nSome prose.\n\n${fact("AT-LAW-1")}\n\n## Notes\n\nMore prose.\n\n${fact("AT-APPLIES-1", { field: "applies-from", value: "2025-06-28" })}\n`
    );

    expect(Result.isSuccess(parsed)).toBe(true);
    expect(Result.getOrThrow(parsed).map((entry) => entry.id)).toEqual([
      "AT-LAW-1",
      "AT-APPLIES-1",
    ]);
  });

  it("accepts an empty verifier note on an unverified fact", () => {
    expect(
      problemOf(fact("AT-LAW-1", { status: "unverified", verifier_note: "" }))
    ).toBeUndefined();
  });

  it.each([
    [
      "a bullet out of order",
      fact("AT-LAW-1").replace("- field:", "- fieldx:"),
    ],
    ["a missing bullet", fact("AT-LAW-1").replace(/- excerpt: .*\n/u, "")],
    ["an unknown status", fact("AT-LAW-1", { status: "approved" })],
    ["an unknown field", fact("AT-LAW-1", { field: "scope" })],
    ["a source that is no URL", fact("AT-LAW-1", { source: "RIS website" })],
    ["a date in another format", fact("AT-LAW-1", { retrieved: "3.11.2026" })],
    ["an empty claim", fact("AT-LAW-1", { claim: "" })],
    ["an ID outside the convention", fact("at-law-1")],
    [
      "a rejected fact without a reason",
      fact("AT-LAW-1", { status: "rejected", verifier_note: "" }),
    ],
    [
      "stray text inside the bullets",
      fact("AT-LAW-1").replace("- source:", "oops\n- source:"),
    ],
  ])("refuses %s", (_name, text) => {
    expect(problemOf(text)).toBeDefined();
  });
});

describe("parseLedger", () => {
  it("refuses one ID used twice across files", () => {
    const parsed = parseLedger([
      { file: "states/at.md", text: fact("AT-LAW-1") },
      { file: "states/de.md", text: fact("AT-LAW-1") },
    ]);

    expect(Result.isFailure(parsed)).toBe(true);
  });
});

describe("verifiedOnly", () => {
  it("keeps verified facts and drops unverified and rejected ones", () => {
    const facts = Result.getOrThrow(
      parseLedgerFile(
        "states/at.md",
        [
          fact("AT-LAW-1"),
          fact("AT-LAW-2", { status: "unverified" }),
          fact("AT-LAW-3", { status: "rejected", verifier_note: "no match" }),
        ].join("\n\n")
      )
    );

    expect(verifiedOnly(facts).map((entry) => entry.id)).toEqual(["AT-LAW-1"]);
  });
});
