// @effect-diagnostics nodeBuiltinImport:off -- Resolves a binary in the user's cache for test and eval tooling, outside any Effect program.
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

import { Browser, computeExecutablePath } from "@puppeteer/browsers";

export const HEADLESS_SHELL_BUILD = "155.0.8059.79";

export const HEADLESS_SHELL_CACHE = path.join(homedir(), ".cache", "puppeteer");

export const headlessShellPath = (): string => {
  const executable = computeExecutablePath({
    browser: Browser.CHROMEHEADLESSSHELL,
    buildId: HEADLESS_SHELL_BUILD,
    cacheDir: HEADLESS_SHELL_CACHE,
  });

  if (!existsSync(executable)) {
    throw new Error(
      `chrome-headless-shell ${HEADLESS_SHELL_BUILD} is not installed at ${executable}. Run \`pnpm chrome:install\`.`
    );
  }

  return executable;
};
