import { describe, expect, it } from "@effect/vitest";

import { leftoverPids } from "../src/leftovers.js";

describe("finding what an agent left running", () => {
  it("names processes started from inside the run's directory, never the runner", () => {
    const ps = [
      "  200 node /private/var/folders/x/T/good-a11y-eval-abc/project/node_modules/.bin/vite --port 5179",
      "  201 node /Users/me/other/vite --port 5179",
      "  202 node /private/var/folders/x/T/good-a11y-eval-abcdef/project/vite.js",
      "    7 node /private/var/folders/x/T/good-a11y-eval-abc/runner.js",
    ].join("\n");

    expect(
      leftoverPids(
        ps,
        [
          "/var/folders/x/T/good-a11y-eval-abc",
          "/private/var/folders/x/T/good-a11y-eval-abc",
        ],
        7
      )
    ).toEqual([200]);
  });
});
