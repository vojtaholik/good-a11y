import { STATE_PROFILES, VERIFIED_FACTS, factsOfState } from "@eaa-check/facts";
import type {
  ProfileField,
  StateProfile,
  VerifiedFact,
} from "@eaa-check/facts";
import { Schema } from "effect";

import { SourcedSchema, verifiedText } from "./reference.js";
import type { Sourced } from "./reference.js";

export const ProfileLineSchema = Schema.Struct({
  label: Schema.String,
  values: Schema.Array(SourcedSchema),
});

export type ProfileLine = typeof ProfileLineSchema.Type;

export const StateRefSchema = Schema.Struct({
  code: Schema.String,
  factIds: Schema.Array(Schema.String),
  name: Schema.String,
  profile: Schema.Array(ProfileLineSchema),
  reason: Schema.NullOr(Schema.String),
});

export type StateRef = typeof StateRefSchema.Type;

export const ApplicabilitySchema = Schema.Struct({
  applies: Schema.Array(StateRefSchema),
  exemption: Schema.NullOr(SourcedSchema),
  unknown: Schema.Array(StateRefSchema),
});

export type Applicability = typeof ApplicabilitySchema.Type;

const ECOMMERCE_IN_SCOPE = "yes";

export const MICROENTERPRISE_FACT = "EU-MICRO-1";

export const PROFILE_LABELS: readonly (readonly [ProfileField, string])[] = [
  ["transposing-law", "Transposing law"],
  ["scope-ecommerce", "E-commerce services in scope"],
  ["applies-from", "Applies from"],
  ["authority", "Enforcement body"],
  ["penalties", "Penalties"],
  ["microenterprise-exemption", "Microenterprise exemption"],
];

export const UNKNOWN_VALUE = "Unknown";

const isUnknown = (fact: VerifiedFact): boolean =>
  fact.value.trim().toLowerCase() === "unknown";

const profileLines = (
  facts: readonly VerifiedFact[],
  profile: StateProfile
): ProfileLine[] => {
  const own = factsOfState(facts, profile.code);

  return PROFILE_LABELS.map(([field, label]) => {
    const ofField = own.filter((fact) => fact.field === field);
    const known = ofField.filter((fact) => !isUnknown(fact));

    return {
      label,
      values: (known.length > 0 ? known : ofField).map((fact) => ({
        factId: fact.id,
        source: fact.source,
        text: isUnknown(fact) ? UNKNOWN_VALUE : fact.value,
      })),
    };
  });
};

const unknownReason = (profile: StateProfile): string => {
  const law = profile.fields["transposing-law"];
  const ecommerce = profile.fields["scope-ecommerce"];

  if (!law.known) {
    return "No verified source yet for its transposing law.";
  }

  if (!ecommerce.known) {
    return "No verified source yet on whether e-commerce services are in scope.";
  }

  return `E-commerce scope is recorded as "${ecommerce.value}", not a plain yes.`;
};

const appliesIn = (profile: StateProfile): readonly string[] | undefined => {
  const law = profile.fields["transposing-law"];
  const ecommerce = profile.fields["scope-ecommerce"];

  return law.known &&
    ecommerce.known &&
    ecommerce.value.trim().toLowerCase() === ECOMMERCE_IN_SCOPE
    ? [law.factId, ecommerce.factId]
    : undefined;
};

export const applicabilityFrom = (
  profiles: readonly StateProfile[],
  exemption: Sourced | null,
  facts: readonly VerifiedFact[] = []
): Applicability => {
  const applies: StateRef[] = [];
  const unknown: StateRef[] = [];

  for (const profile of profiles) {
    const factIds = appliesIn(profile);

    const state = {
      code: profile.code,
      name: profile.name,
      profile: profileLines(facts, profile),
    };

    if (factIds === undefined) {
      unknown.push({ ...state, factIds: [], reason: unknownReason(profile) });
    } else {
      applies.push({ ...state, factIds, reason: null });
    }
  }

  return { applies, exemption, unknown };
};

export const APPLICABILITY: Applicability = applicabilityFrom(
  STATE_PROFILES,
  verifiedText(MICROENTERPRISE_FACT),
  VERIFIED_FACTS
);
