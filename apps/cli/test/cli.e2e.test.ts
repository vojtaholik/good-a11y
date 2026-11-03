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
    expect(result.stdout).toContain("scan");
  });

  it("describes the scan command and its address argument", () => {
    const result = runCli(["scan", "--help"]);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("example.com");
    expect(result.stdout).toContain("--json");
  });

  it("refuses a private address with the typed failure, exits one, and makes no request", () => {
    const result = runCli(["scan", "http://127.0.0.1/"]);

    expect(result.status).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain(
      "An IP address in place of a domain is not allowed."
    );
    expect(result.stderr).toContain('Cannot scan "http://127.0.0.1/"');
  });
});
