import { NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { Effect, FileSystem, Path } from "effect";

import { readLedger, renderLedger } from "../src/index.js";

it.layer(NodeServices.layer)("the facts ledger", (test) => {
  test.effect(
    "parses as a whole, so a malformed entry anywhere fails the gate",
    () =>
      Effect.gen(function* parsesTheLedger() {
        const path = yield* Path.Path;

        const facts = yield* readLedger(
          path.resolve(import.meta.dirname, "../../..")
        );

        expect(facts.length).toBeGreaterThan(0);
      })
  );

  test.effect(
    "matches the generated data; run `pnpm facts` after the ledger changes",
    () =>
      Effect.gen(function* generatedIsCurrent() {
        const fileSystem = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;

        const facts = yield* readLedger(
          path.resolve(import.meta.dirname, "../../..")
        );

        const generated = yield* fileSystem.readFileString(
          path.resolve(import.meta.dirname, "../src/ledger.generated.ts")
        );

        expect(generated).toBe(renderLedger(facts));
      })
  );
});
