import { VERIFIED_FACTS } from "@eaa-check/facts";
import type { VerifiedFact } from "@eaa-check/facts";
import { Schema } from "effect";

import { CATALOGUE, criteriaOf } from "./catalogue.js";
import type { CatalogueEntry } from "./catalogue.js";

export const MethodSchema = Schema.Literals([
  "static_html",
  "static_html_and_rendered",
  "rendered_page",
]);

export type Method = typeof MethodSchema.Type;

export const METHOD_NAMES: Readonly<Record<Method, string>> = {
  rendered_page: "rendered page only",
  static_html: "static HTML only",
  static_html_and_rendered: "static HTML + rendered page",
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

export interface Tested {
  readonly checks: number;
  readonly criteria: readonly string[];
}

export const testedBy = (catalogue: readonly CatalogueEntry[]): Tested => ({
  checks: catalogue.length,
  criteria: catalogue.flatMap(criteriaOf).map(({ sc }) => sc),
});

export const coverageFrom = (
  { checks, criteria: tested }: Tested,
  facts: readonly VerifiedFact[],
  method: Method
): Coverage => {
  const criteria = new Set(
    facts.flatMap((fact) => (WCAG21_CRITERION.test(fact.id) ? [fact.id] : []))
  );

  const touched = new Set(tested.filter((sc) => criteria.has(sc)));

  return {
    checks,
    criteria: touched.size,
    method,
    ofCriteria: criteria.size,
    text: `These ${checks} automated checks (${METHOD_NAMES[method]}) touch ${touched.size} of the ${criteria.size} WCAG 2.1 Level A and AA success criteria, and only partly. No issues found by them does not mean the page is accessible.`,
  };
};

export const STATIC_TESTED: Tested = testedBy(CATALOGUE);

export const STATIC_COVERAGE: Coverage = coverageFrom(
  STATIC_TESTED,
  VERIFIED_FACTS,
  "static_html"
);
