import { NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { readLedger } from "@good-a11y/facts";
import { Effect, Path } from "effect";

import { CATALOGUE, catalogueIds } from "../src/index.js";

const WCAG3_USE = /^checks\.(?<check>[a-z-]+)\.wcag3$/u;

it.layer(NodeServices.layer)("the check catalogue", (test) => {
  test.effect(
    "names only fact IDs that exist in the ledger, whatever their status",
    () =>
      Effect.gen(function* everyIdExists() {
        const path = yield* Path.Path;

        const facts = yield* readLedger(
          path.resolve(import.meta.dirname, "../../..")
        );

        const known = new Set(facts.map((fact) => fact.id));

        expect(catalogueIds().filter((id) => !known.has(id))).toEqual([]);
      })
  );

  test.effect(
    "has a check for every checks.<id>.wcag3 key in the ledger, whatever the fact's status",
    () =>
      Effect.gen(function* everyWcag3KeyNamesACheck() {
        const path = yield* Path.Path;

        const facts = yield* readLedger(
          path.resolve(import.meta.dirname, "../../..")
        );

        const checks = new Set<string>(CATALOGUE.map(({ check }) => check.id));

        const named = facts.flatMap((fact) =>
          fact.usedBy
            .split(/[\s,]+/u)
            .flatMap((key) => WCAG3_USE.exec(key)?.groups?.check ?? [])
        );

        expect(named.length).toBeGreaterThan(0);
        expect(named.filter((check) => !checks.has(check))).toEqual([]);
      })
  );

  test.effect("maps every check to at least one success criterion", () =>
    Effect.sync(() => {
      for (const entry of CATALOGUE) {
        expect(entry.criteria.length).toBeGreaterThan(0);
      }
    })
  );
});
