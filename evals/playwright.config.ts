import { defineConfig } from "@playwright/test";

export default defineConfig({
  forbidOnly: true,
  fullyParallel: true,
  reporter: [["list"]],
  testDir: "graders",
  timeout: 15_000,
  use: {
    channel: "chrome",
    headless: true,
    viewport: { height: 800, width: 1280 },
  },
});
