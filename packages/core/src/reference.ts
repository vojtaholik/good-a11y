import { VERIFIED_FACTS, isUsedBy, verifiedFact } from "@eaa-check/facts";
import type { VerifiedFact } from "@eaa-check/facts";
import { Schema } from "effect";

export const SourcedSchema = Schema.Struct({
  factId: Schema.String,
  source: Schema.String,
  text: Schema.String,
});

export type Sourced = typeof SourcedSchema.Type;

export const VersionSchema = Schema.Literals(["V3.2.1", "V4.1.1"]);

export type Version = typeof VersionSchema.Type;

export const ReferenceSchema = Schema.Struct({
  benchmark: Schema.NullOr(SourcedSchema),
  citation: Schema.NullOr(SourcedSchema),
  requirements: Schema.Array(SourcedSchema),
  version: VersionSchema,
});

export type Reference = typeof ReferenceSchema.Type;

export const CITED_VERSION_USE = "report.reference-standard";

export const NO_CITATION_FACT = "EU-HS-1";

export const LEGAL_REQUIREMENT_USE = "report.legal-requirement";

const BENCHMARK_FACTS: Readonly<Record<Version, string>> = {
  "V3.2.1": "STD-EN-5",
  "V4.1.1": "STD-EN-6",
};

export const sourced = (fact: VerifiedFact | undefined): Sourced | null =>
  fact === undefined
    ? null
    : { factId: fact.id, source: fact.source, text: fact.value };

export const referenceFrom = (facts: readonly VerifiedFact[]): Reference => {
  const cited = facts.find((fact) => isUsedBy(fact, CITED_VERSION_USE));

  const version: Version =
    cited !== undefined && cited.value.includes("V4.1.1") ? "V4.1.1" : "V3.2.1";

  const byId = new Map(facts.map((fact) => [fact.id, fact]));

  return {
    benchmark: sourced(byId.get(BENCHMARK_FACTS[version])),
    citation: sourced(cited ?? byId.get(NO_CITATION_FACT)),
    requirements: facts
      .filter((fact) => isUsedBy(fact, LEGAL_REQUIREMENT_USE))
      .toSorted((left, right) => left.id.localeCompare(right.id))
      .flatMap((fact) => {
        const text = sourced(fact);

        return text === null ? [] : [text];
      }),
    version,
  };
};

export const REFERENCE: Reference = referenceFrom(VERIFIED_FACTS);

export const verifiedText = (id: string): Sourced | null =>
  sourced(verifiedFact(id));
