// @effect-diagnostics nodeBuiltinImport:off -- Build-time Vite config code: it reads the working tree through git before any Effect runtime exists.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

const git = (...arguments_: readonly string[]): string =>
  execFileSync("git", arguments_, { encoding: "utf-8" });

export const sourceBuildId = (): string =>
  createHash("sha256")
    .update(git("rev-parse", "HEAD"))
    .update(git("diff", "HEAD"))
    .update(git("ls-files", "--others", "--exclude-standard"))
    .digest("hex")
    .slice(0, 16);
