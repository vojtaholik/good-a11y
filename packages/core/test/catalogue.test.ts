import { NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { readLedger } from "@good-a11y/facts";
import { Effect, Path } from "effect";

import { CATALOGUE, catalogueIds } from "../src/index.js";

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

  test.effect("maps every check to at least one success criterion", () =>
    Effect.sync(() => {
      for (const entry of CATALOGUE) {
        expect(entry.criteria.length).toBeGreaterThan(0);
      }
    })
  );
});
