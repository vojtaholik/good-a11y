import { VERIFIED_FACTS } from "@eaa-check/facts";
import type { VerifiedFact } from "@eaa-check/facts";
import { Schema } from "effect";

import { CATALOGUE, criteriaOf } from "./catalogue.js";
import type { CatalogueEntry } from "./catalogue.js";

export const MethodSchema = Schema.Literals(["static_html"]);

export type Method = typeof MethodSchema.Type;

export const METHOD_NAMES: Readonly<Record<Method, string>> = {
  static_html: "static HTML only",
};

const Count = Schema.Int.check(Schema.isGreaterThanOrEqualTo(0));

export const CoverageSchema = Schema.Struct({
  checks: Count,
  criteria: Count,
  method: MethodSchema,
  ofCriteria: Count,
  text: Schema.String,
});

export type Coverage = typeof CoverageSchema.Type;

const WCAG21_CRITERION = /^STD-SC-\d+\.\d+\.\d+$/u;

export const coverageFrom = (
  catalogue: readonly CatalogueEntry[],
  facts: readonly VerifiedFact[],
  method: Method
): Coverage => {
  const criteria = new Set(
    facts.flatMap((fact) => (WCAG21_CRITERION.test(fact.id) ? [fact.id] : []))
  );

  const touched = new Set(
    catalogue
      .flatMap(criteriaOf)
      .flatMap(({ sc }) => (criteria.has(sc) ? [sc] : []))
  );

  const checks = catalogue.length;

  return {
    checks,
    criteria: touched.size,
    method,
    ofCriteria: criteria.size,
    text: `These ${checks} automated checks (${METHOD_NAMES[method]}) touch ${touched.size} of the ${criteria.size} WCAG 2.1 Level A and AA success criteria, and only partly. No issues found by them does not mean the page is accessible.`,
  };
};

export const STATIC_COVERAGE: Coverage = coverageFrom(
  CATALOGUE,
  VERIFIED_FACTS,
  "static_html"
);
