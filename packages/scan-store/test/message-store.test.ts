import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";

import { MessageStore } from "../src/index.js";
import { localStores } from "./local-d1.js";

const message = {
  email: "owner@example.com",
  message: "Can you review this page?",
  url: "https://example.com/",
};

const keepAt = (id: string, receivedAt: number) =>
  MessageStore.use((store) =>
    store.keep({ dailyCap: 2, id, message, receivedAt })
  );

describe("MessageStore", () => {
  it.layer(localStores)((scoped) => {
    scoped.effect("keeps messages until the daily cap", () =>
      Effect.gen(function* capped() {
        expect(yield* keepAt("m1", 1000)).toBe("kept");
        expect(yield* keepAt("m2", 2000)).toBe("kept");
        expect(yield* keepAt("m3", 3000)).toBe("cap_reached");
      })
    );

    scoped.effect("keeps a resent message once without spending the cap", () =>
      Effect.gen(function* resent() {
        expect(yield* keepAt("m2", 4000)).toBe("kept");
      })
    );
  });
});
