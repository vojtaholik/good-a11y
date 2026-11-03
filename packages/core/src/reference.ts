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

export const NewerVersionSchema = Schema.Struct({
  factIds: Schema.Array(Schema.String),
  label: Schema.String,
});

export type NewerVersion = typeof NewerVersionSchema.Type;

export const ReferenceSchema = Schema.Struct({
  benchmark: Schema.NullOr(SourcedSchema),
  citation: Schema.NullOr(SourcedSchema),
  newerVersion: Schema.NullOr(NewerVersionSchema),
  requirements: Schema.Array(SourcedSchema),
  version: VersionSchema,
});

export type Reference = typeof ReferenceSchema.Type;

export const CITED_VERSION_USE = "report.reference-standard";

export const NO_CITATION_FACT = "EU-HS-1";

export const LEGAL_REQUIREMENT_USE = "report.legal-requirement";

export const NEWER_PUBLISHED_FACT = "STD-EN-3";

export const NEWER_VERSION_LABEL =
  "EN 301 549 V4.1.1 (published, not cited in the OJ)";

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

  const uncited =
    cited === undefined &&
    byId.has(NEWER_PUBLISHED_FACT) &&
    byId.has(NO_CITATION_FACT);

  return {
    benchmark: sourced(byId.get(BENCHMARK_FACTS[version])),
    citation: sourced(cited ?? byId.get(NO_CITATION_FACT)),
    newerVersion: uncited
      ? {
          factIds: [NEWER_PUBLISHED_FACT, NO_CITATION_FACT],
          label: NEWER_VERSION_LABEL,
        }
      : null,
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

export const NEWER_WCAG_FACT = "STD-EN-5";

export const newerWcagLabel = (): string =>
  verifiedText(NEWER_WCAG_FACT) === null
    ? "WCAG 2.2"
    : "WCAG 2.2 (newer than the reference benchmark)";
