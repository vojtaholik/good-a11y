import { Schema } from "effect";

import type { Criterion } from "./catalogue.js";
import { SourcedSchema, verifiedText } from "./reference.js";
import type { Reference } from "./reference.js";

export const ReferenceKindSchema = Schema.Literals([
  "wcag",
  "en-reference",
  "en-newer",
  "wcag-newer",
]);

export const FindingReferenceSchema = Schema.Struct({
  kind: ReferenceKindSchema,
  ...SourcedSchema.fields,
});

export type FindingReference = typeof FindingReferenceSchema.Type;

const withKind = (
  kind: FindingReference["kind"],
  id: string
): FindingReference[] => {
  const text = verifiedText(id);

  return text === null ? [] : [{ kind, ...text }];
};

export const referencesFor = (
  criteria: readonly Criterion[],
  reference: Reference
): FindingReference[] =>
  criteria.flatMap(({ en3, en4, sc }) => [
    ...withKind("wcag", sc),
    ...(reference.version === "V4.1.1"
      ? withKind("en-reference", en4)
      : [
          ...withKind("en-reference", en3),
          ...(reference.newerVersion === null ? [] : withKind("en-newer", en4)),
        ]),
  ]);

export const newerReferencesFor = (scFact: string): FindingReference[] =>
  withKind("wcag-newer", scFact);
