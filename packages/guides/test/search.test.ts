import { NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { Effect, Result } from "effect";

import { makeGuideIndex, readGuides } from "../src/index.js";

const fixtureIndex = readGuides(`${import.meta.dirname}/fixtures`).pipe(
  Effect.map(makeGuideIndex)
);

it.layer(NodeServices.layer)("searching and retrieving guides", (test) => {
  test.effect("ranks the guide whose name and headings match first", () =>
    Effect.gen(function* ranks() {
      const index = yield* fixtureIndex;

      expect(index.search("dialog focus escape")[0]).toEqual({
        description:
          "Open a modal dialog that traps focus, closes on Escape and returns focus to its trigger",
        id: "modal-dialog",
      });
      expect(index.search("error summary")[0]?.id).toBe("form-errors");
    })
  );

  test.effect("returns nothing when no word scores", () =>
    Effect.gen(function* nothing() {
      const index = yield* fixtureIndex;

      expect(index.search("kubernetes")).toEqual([]);
    })
  );

  test.effect("lists every guide with its description", () =>
    Effect.gen(function* lists() {
      const index = yield* fixtureIndex;

      expect(index.list().map((hit) => hit.id)).toEqual([
        "form-errors",
        "modal-dialog",
      ]);
    })
  );

  test.effect(
    "retrieves guides by id in the order asked, and names an unknown id",
    () =>
      Effect.gen(function* retrieves() {
        const index = yield* fixtureIndex;
        const found = index.retrieve(["modal-dialog", "form-errors"]);

        expect(
          Result.isSuccess(found) ? found.success.map((guide) => guide.id) : []
        ).toEqual(["modal-dialog", "form-errors"]);

        const missing = index.retrieve(["form-errors", "carousel"]);

        expect(Result.isFailure(missing) ? missing.failure.id : "").toBe(
          "carousel"
        );
      })
  );
});
