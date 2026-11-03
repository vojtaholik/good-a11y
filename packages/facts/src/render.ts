import type { Fact, VerifiedFact } from "./fact.js";

export const verifiedOnly = (facts: readonly Fact[]): VerifiedFact[] =>
  facts.flatMap(
    ({
      claim,
      excerpt,
      field,
      file,
      id,
      retrieved,
      source,
      status,
      usedBy,
      value,
    }) =>
      status === "verified"
        ? [
            {
              claim,
              excerpt,
              field,
              file,
              id,
              retrieved,
              source,
              usedBy,
              value,
            },
          ]
        : []
  );

export const renderLedger = (facts: readonly Fact[]): string =>
  [
    'import type { VerifiedFact } from "./fact.js";',
    "",
    `export const VERIFIED_FACTS: readonly VerifiedFact[] = ${JSON.stringify(verifiedOnly(facts), null, 2)};`,
    "",
  ].join("\n");
