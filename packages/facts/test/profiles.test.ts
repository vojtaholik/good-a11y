import { describe, expect, it } from "@effect/vitest";

import {
  MEMBER_STATES,
  STATE_PROFILES,
  VERIFIED_FACTS,
  profileFrom,
} from "../src/index.js";
import type { VerifiedFact } from "../src/index.js";

const verified = (
  id: string,
  file: string,
  field: VerifiedFact["field"],
  value: string
): VerifiedFact => ({
  claim: "claim",
  excerpt: "excerpt",
  field,
  file,
  id,
  retrieved: "2026-11-03",
  source: `https://example.eu/${id}`,
  usedBy: "none",
  value,
});

describe("profileFrom", () => {
  const facts = [
    verified("AT-LAW-1", "states/at.md", "transposing-law", "BaFG"),
    verified("AT-PEN-1", "states/at.md", "penalties", "unknown"),
    verified("DE-LAW-1", "states/de.md", "transposing-law", "BFSG"),
  ];

  it("fills a field from the state's own verified fact, with its ID and source", () => {
    expect(
      profileFrom(facts, "at", "Austria").fields["transposing-law"]
    ).toEqual({
      factId: "AT-LAW-1",
      known: true,
      source: "https://example.eu/AT-LAW-1",
      value: "BaFG",
    });
  });

  it("leaves a field unknown when its verified value is unknown or it has no fact", () => {
    const profile = profileFrom(facts, "at", "Austria");

    expect(profile.fields.penalties).toEqual({ known: false });
    expect(profile.fields.authority).toEqual({ known: false });
  });

  it("never takes another state's fact", () => {
    expect(
      profileFrom(facts, "cz", "Czechia").fields["transposing-law"]
    ).toEqual({ known: false });
  });
});

describe("STATE_PROFILES", () => {
  it("has one profile per member state, built only from verified facts", () => {
    const ids = new Set(VERIFIED_FACTS.map((fact) => fact.id));

    expect(STATE_PROFILES.map((profile) => profile.code)).toEqual(
      MEMBER_STATES.map((state) => state.code)
    );

    for (const profile of STATE_PROFILES) {
      for (const value of Object.values(profile.fields)) {
        expect(value.known ? ids.has(value.factId) : true).toBe(true);
      }
    }
  });
});
