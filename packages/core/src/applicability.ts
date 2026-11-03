import { STATE_PROFILES } from "@eaa-check/facts";
import type { StateProfile } from "@eaa-check/facts";
import { Schema } from "effect";

export const StateRefSchema = Schema.Struct({
  code: Schema.String,
  factIds: Schema.Array(Schema.String),
  name: Schema.String,
});

export type StateRef = typeof StateRefSchema.Type;

export const ApplicabilitySchema = Schema.Struct({
  applies: Schema.Array(StateRefSchema),
  unknown: Schema.Array(StateRefSchema),
});

export type Applicability = typeof ApplicabilitySchema.Type;

const ECOMMERCE_IN_SCOPE = "yes";

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
  profiles: readonly StateProfile[]
): Applicability => {
  const applies: StateRef[] = [];
  const unknown: StateRef[] = [];

  for (const profile of profiles) {
    const factIds = appliesIn(profile);

    if (factIds === undefined) {
      unknown.push({ code: profile.code, factIds: [], name: profile.name });
    } else {
      applies.push({ code: profile.code, factIds, name: profile.name });
    }
  }

  return { applies, unknown };
};

export const APPLICABILITY: Applicability = applicabilityFrom(STATE_PROFILES);
