import { NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { Effect, FileSystem } from "effect";

import { INLINE_LIMIT_BYTES, deliverText } from "../src/deliver.js";

it.layer(NodeServices.layer)("delivering guide text", (test) => {
  test.effect("prints text up to 9.5 KB inline", () =>
    Effect.gen(function* inline() {
      const text = "a".repeat(INLINE_LIMIT_BYTES);

      expect(yield* deliverText(text, "small")).toBe(text);
    })
  );

  test.effect("writes longer text to a temp file and returns its path", () =>
    Effect.gen(function* toFile() {
      const fileSystem = yield* FileSystem.FileSystem;
      const text = "é".repeat(INLINE_LIMIT_BYTES / 2 + 1);
      const file = yield* deliverText(text, "modal-dialog+form-errors");

      expect(file).toMatch(/good-a11y-.*modal-dialog\+form-errors\.md$/u);
      expect(yield* fileSystem.readFileString(file)).toBe(text);
    })
  );
});
