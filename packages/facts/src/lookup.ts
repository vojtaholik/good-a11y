import type { VerifiedFact } from "./fact.js";
import { VERIFIED_FACTS } from "./ledger.generated.js";

const BY_ID = new Map(VERIFIED_FACTS.map((fact) => [fact.id, fact]));

export const verifiedFact = (id: string): VerifiedFact | undefined =>
  BY_ID.get(id);
