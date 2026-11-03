import type { FactField, VerifiedFact } from "./fact.js";
import { VERIFIED_FACTS } from "./ledger.generated.js";
import { MEMBER_STATES } from "./member-states.js";
import type { StateCode } from "./member-states.js";

export type ProfileField = Exclude<FactField, "other">;

export const PROFILE_FIELDS: readonly ProfileField[] = [
  "transposing-law",
  "applies-from",
  "scope-products",
  "scope-services",
  "scope-ecommerce",
  "microenterprise-exemption",
  "disproportionate-burden",
  "authority",
  "penalties",
];

export type ProfileValue =
  | {
      readonly factId: string;
      readonly known: true;
      readonly source: string;
      readonly value: string;
    }
  | { readonly known: false };

export interface StateProfile {
  readonly code: StateCode;
  readonly fields: Readonly<Record<ProfileField, ProfileValue>>;
  readonly name: string;
}

const UNKNOWN: ProfileValue = { known: false };

const STATE_FILE = /^states\/(?<code>[a-z]{2})\.md$/u;

const stateOf = (fact: VerifiedFact): string | undefined =>
  STATE_FILE.exec(fact.file)?.groups?.code;

const valueOf = (
  facts: readonly VerifiedFact[],
  field: ProfileField
): ProfileValue => {
  const fact = facts.find(
    (candidate) => candidate.field === field && candidate.value !== "unknown"
  );

  return fact === undefined
    ? UNKNOWN
    : { factId: fact.id, known: true, source: fact.source, value: fact.value };
};

export const profileFrom = (
  facts: readonly VerifiedFact[],
  code: StateCode,
  name: string
): StateProfile => {
  const own = facts.filter((fact) => stateOf(fact) === code);

  return {
    code,
    fields: {
      "applies-from": valueOf(own, "applies-from"),
      authority: valueOf(own, "authority"),
      "disproportionate-burden": valueOf(own, "disproportionate-burden"),
      "microenterprise-exemption": valueOf(own, "microenterprise-exemption"),
      penalties: valueOf(own, "penalties"),
      "scope-ecommerce": valueOf(own, "scope-ecommerce"),
      "scope-products": valueOf(own, "scope-products"),
      "scope-services": valueOf(own, "scope-services"),
      "transposing-law": valueOf(own, "transposing-law"),
    },
    name,
  };
};

export const STATE_PROFILES: readonly StateProfile[] = MEMBER_STATES.map(
  ({ code, name }) => profileFrom(VERIFIED_FACTS, code, name)
);
