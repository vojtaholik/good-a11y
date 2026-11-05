import { headlessShellPath } from "@good-a11y/browser-audit/headless-shell";
import { defineConfig } from "@playwright/test";

export default defineConfig({
  forbidOnly: true,
  fullyParallel: true,
  reporter: [["list"]],
  testDir: "graders",
  timeout: 15_000,
  use: {
    headless: true,
    launchOptions: { executablePath: headlessShellPath() },
    viewport: { height: 800, width: 1280 },
  },
});
