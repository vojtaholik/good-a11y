// @effect-diagnostics nodeBuiltinImport:off -- Black-box tests of the built binary: they spawn dist/cli.js as a child process and assert on stdout, stderr, and exit codes. Node built-ins are the right tools at that boundary, so the Effect-native diagnostic is off here.
import { spawnSync } from "node:child_process";
import path from "node:path";

import { describe, expect, it } from "@effect/vitest";

const cliDir = path.resolve(import.meta.dirname, "..");

const repoRoot = path.resolve(cliDir, "../..");

const cliPath = path.join(cliDir, "dist", "cli.js");

const runCli = (arguments_: readonly string[]) =>
  spawnSync(process.execPath, [cliPath, ...arguments_], {
    cwd: repoRoot,
    encoding: "utf-8",
  });

describe("built CLI", () => {
  it("prints help and exits cleanly", () => {
    const result = runCli(["--help"]);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("USAGE");
    expect(result.stdout).toContain("eaa-check");
  });
});
