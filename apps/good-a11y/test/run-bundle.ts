// @effect-diagnostics nodeBuiltinImport:off -- The e2e tests run the committed bundle as a child process, as npx does.
import { spawn } from "node:child_process";

import { headlessShellPath } from "@good-a11y/browser-audit/headless-shell";
import { Effect } from "effect";

import { BUNDLE_PATH } from "../scripts/bundle-options.ts";

export interface Run {
  readonly status: number | null;
  readonly stderr: string;
  readonly stdout: string;
}

export const runBundle = (arguments_: readonly string[]) =>
  Effect.callback<Run>((resume) => {
    const child = spawn(process.execPath, [BUNDLE_PATH, ...arguments_], {
      env: { ...process.env, GOOD_A11Y_CHROME: headlessShellPath() },
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("close", (status) => {
      resume(Effect.succeed({ status, stderr, stdout }));
    });
  });
