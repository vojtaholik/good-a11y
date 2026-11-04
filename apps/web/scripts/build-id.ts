// @effect-diagnostics nodeBuiltinImport:off -- Build-time Vite config code: it reads the working tree through git before any Effect runtime exists.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { Plugin } from "vite";

const git = (...arguments_: readonly string[]): string =>
  execFileSync("git", arguments_, {
    encoding: "utf-8",
    maxBuffer: 256 * 1024 * 1024,
  });

export const sourceBuildId = (): string =>
  createHash("sha256")
    .update(git("rev-parse", "HEAD"))
    .update(git("diff", "HEAD"))
    .update(git("ls-files", "--others", "--exclude-standard"))
    .digest("hex")
    .slice(0, 16);

const BUILT_ID = `${import.meta.dirname}/../dist/build-id.txt`;

export const builtId = (): string =>
  existsSync(BUILT_ID) ? readFileSync(BUILT_ID, "utf-8").trim() : "test";

export const recordBuildId = (id: string): Plugin => ({
  apply: "build",
  closeBundle: () => {
    mkdirSync(path.dirname(BUILT_ID), { recursive: true });
    writeFileSync(BUILT_ID, id);
  },
  name: "good-a11y-build-id",
});
