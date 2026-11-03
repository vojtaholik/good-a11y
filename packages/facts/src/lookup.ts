import type { VerifiedFact } from "./fact.js";
import { VERIFIED_FACTS } from "./ledger.generated.js";

const BY_ID = new Map(VERIFIED_FACTS.map((fact) => [fact.id, fact]));

export const isUsedBy = (fact: VerifiedFact, key: string): boolean =>
  fact.usedBy.split(/[\s,]+/u).includes(key);

export const verifiedUsedBy = (key: string): readonly VerifiedFact[] =>
  VERIFIED_FACTS.filter((fact) => isUsedBy(fact, key));

export const verifiedFact = (id: string): VerifiedFact | undefined =>
  BY_ID.get(id);
