import { describe, expect, it } from "@effect/vitest";

import { GUIDES, makeGuideIndex } from "../src/index.js";
import { RETRIEVAL_BENCHMARK } from "./retrieval-benchmark.js";

const GATED_FROM_GUIDES = 15;

const MIN_HIT_AT_3 = 0.85;

describe("retrieval benchmark of agent queries", () => {
  const index = makeGuideIndex(GUIDES);

  const misses = RETRIEVAL_BENCHMARK.filter(
    ({ expected, query }) =>
      !index
        .search(query)
        .slice(0, 3)
        .some((hit) => hit.id === expected)
  );

  const hitAt3 = 1 - misses.length / RETRIEVAL_BENCHMARK.length;

  // @effect-diagnostics-next-line asyncFunction:off -- Vitest's annotate is the reporter's channel for the hit@3 figure, and it returns a Promise.
  it(`finds the expected guide in the top 3 for at least ${MIN_HIT_AT_3} of the queries once there are ${GATED_FROM_GUIDES} guides`, async ({
    annotate,
  }) => {
    await annotate(
      `hit@3 ${hitAt3.toFixed(3)} over ${RETRIEVAL_BENCHMARK.length} queries and ${GUIDES.length} guides; misses: ${misses.map(({ expected, query }) => `"${query}" -> ${expected}`).join(", ") || "none"}`
    );

    expect(RETRIEVAL_BENCHMARK).toHaveLength(40);

    if (GUIDES.length >= GATED_FROM_GUIDES) {
      expect(
        RETRIEVAL_BENCHMARK.filter(({ expected }) =>
          GUIDES.every((guide) => guide.id !== expected)
        )
      ).toEqual([]);
      expect(hitAt3).toBeGreaterThanOrEqual(MIN_HIT_AT_3);
    }
  });
});
