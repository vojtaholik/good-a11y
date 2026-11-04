import { NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { Effect, FileSystem, Path } from "effect";

import { readGuides, renderGuides } from "../src/index.js";

it.layer(NodeServices.layer)("the repo's guides", (test) => {
  test.effect(
    "match the generated index; run `pnpm guides` after a guide changes",
    () =>
      Effect.gen(function* generatedIsCurrent() {
        const fileSystem = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;

        const guides = yield* readGuides(
          path.resolve(import.meta.dirname, "../../..")
        );

        const generated = yield* fileSystem.readFileString(
          path.resolve(import.meta.dirname, "../src/guides.generated.ts")
        );

        expect(generated).toBe(renderGuides(guides));
      })
  );
});
