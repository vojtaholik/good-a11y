import { Schema } from "effect";

export const FACT_FIELDS = [
  "transposing-law",
  "applies-from",
  "scope-products",
  "scope-services",
  "scope-ecommerce",
  "microenterprise-exemption",
  "disproportionate-burden",
  "authority",
  "penalties",
  "other",
] as const;

export const FactFieldSchema = Schema.Literals(FACT_FIELDS);

export type FactField = typeof FactFieldSchema.Type;

export const FactStatusSchema = Schema.Literals([
  "unverified",
  "verified",
  "rejected",
]);

export type FactStatus = typeof FactStatusSchema.Type;

export const FactIdSchema = Schema.String.check(
  Schema.isPattern(/^(?:[A-Z]{2}|EU|STD)-[A-Z\d]+(?:-[A-Z\d]+)*-[\d.]+$/u)
);

const Filled = Schema.String.check(Schema.isMinLength(1));

const PrimaryUrl = Schema.String.check(Schema.isPattern(/^https?:\/\/\S+$/u));

const IsoDate = Schema.String.check(Schema.isPattern(/^\d{4}-\d{2}-\d{2}$/u));

export const FactSchema = Schema.Struct({
  claim: Filled,
  excerpt: Filled,
  field: FactFieldSchema,
  file: Schema.String,
  id: FactIdSchema,
  retrieved: IsoDate,
  source: PrimaryUrl,
  status: FactStatusSchema,
  usedBy: Filled,
  value: Filled,
  verifierNote: Schema.String,
});

export type Fact = typeof FactSchema.Type;

export const VerifiedFactSchema = Schema.Struct({
  claim: Schema.String,
  excerpt: Schema.String,
  field: FactFieldSchema,
  file: Schema.String,
  id: Schema.String,
  retrieved: Schema.String,
  source: Schema.String,
  value: Schema.String,
});

export type VerifiedFact = typeof VerifiedFactSchema.Type;

export class MalformedFact extends Schema.TaggedError<MalformedFact>()(
  "MalformedFact",
  {
    file: Schema.String,
    heading: Schema.String,
    problem: Schema.String,
  }
) {
  override get message(): string {
    return `Malformed fact "${this.heading}" in research/facts/${this.file}: ${this.problem}. See research/facts/README.md for the format.`;
  }
}
